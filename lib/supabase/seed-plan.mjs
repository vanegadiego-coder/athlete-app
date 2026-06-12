// Run with: SUPABASE_URL=... SERVICE_KEY=... node lib/supabase/seed-plan.mjs
// Keys are in .env.local — do NOT hardcode them here
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const plan = JSON.parse(readFileSync(join(__dirname, 'plan_24_semanas.json'), 'utf8'));

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://yyuwkmaalvgarixcushs.supabase.co';
const SERVICE_KEY = process.env.SERVICE_KEY;
if (!SERVICE_KEY) { console.error('Set SERVICE_KEY env var (SUPABASE_SERVICE_ROLE_KEY from .env.local)'); process.exit(1); }

async function post(endpoint, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${endpoint}: ${text}`);
  return JSON.parse(text);
}

async function main() {
  console.log(`Seeding ${plan.semanas.length} weeks...`);

  for (const semana of plan.semanas) {
    const [planRow] = await post('training_plan', {
      week_number: semana.semana,
      block: semana.bloque,
      start_date: semana.fecha_inicio,
      end_date: semana.fecha_fin,
      total_km_target: semana.km_totales_objetivo,
      title: semana.titulo,
      is_deload: semana.descarga,
      milestone: semana.hito || null,
    });

    console.log(`  Week ${semana.semana}: ${semana.titulo} (id: ${planRow.id})`);

    for (const carrera of semana.carreras) {
      await post('training_runs', {
        week_number: semana.semana,
        cycle_day: carrera.dia_ciclo,
        type: carrera.tipo,
        duration_min: carrera.duracion_min,
        distance_km: carrera.distancia_km,
        description: carrera.descripcion,
        fc_target: carrera.fc_objetivo,
        is_optional: carrera.opcional,
      });
    }
    console.log(`    → ${semana.carreras.length} runs inserted`);
  }

  console.log('\n✅ Seed complete!');
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
