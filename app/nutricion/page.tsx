'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import MacroProgress from '@/components/nutricion/MacroProgress';
import MealList from '@/components/nutricion/MealList';
import AddMealForm from '@/components/nutricion/AddMealForm';
import SupplementTracker from '@/components/nutricion/SupplementTracker';
import BarChart from '@/components/shared/BarChart';

const USER_ID = '00000000-0000-0000-0000-000000000001';
const TARGET_CALORIES = 2200;
const TARGET_PROTEIN = 100;

const DAY_ES: Record<number, string> = { 0:'Do',1:'Lu',2:'Ma',3:'Mi',4:'Ju',5:'Vi',6:'Sa' };

export default function NutricionPage() {
  const [nutritionLog, setNutritionLog] = useState<any>(null);
  const [meals, setMeals] = useState<any[]>([]);
  const [supplements, setSupplements] = useState<any>(null);
  const [weekHistory, setWeekHistory] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    let { data: log } = await supabase.from('nutrition_log').select('*').eq('user_id', USER_ID).eq('date', today).single();
    if (!log) {
      const { data: newLog } = await supabase.from('nutrition_log')
        .insert({ user_id: USER_ID, date: today, calories: 0, protein_g: 0, carbs_g: 0, fats_g: 0 }).select().single();
      log = newLog;
    }
    setNutritionLog(log);

    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 6);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    const [mealsRes, suppRes, histRes] = await Promise.all([
      log ? supabase.from('meals').select('*').eq('nutrition_log_id', log.id) : Promise.resolve({ data: [] }),
      supabase.from('supplements_log').select('*').eq('user_id', USER_ID).eq('date', today).single(),
      supabase.from('nutrition_log').select('date,calories,protein_g').eq('user_id', USER_ID).gte('date', weekAgoStr).order('date'),
    ]);
    setMeals(mealsRes.data || []);
    setSupplements(suppRes.data || null);
    setWeekHistory(histRes.data || []);
    setLoading(false);
  }

  async function deleteMeal(id: string) {
    await supabase.from('meals').delete().eq('id', id);
    const { data: log } = await supabase.from('nutrition_log').select('id').eq('user_id', USER_ID).eq('date', today).single();
    if (!log) { await loadData(); return; }
    const { data: allMeals } = await supabase.from('meals').select('calories,protein_g,carbs_g,fats_g').eq('nutrition_log_id', log.id);
    await supabase.from('nutrition_log').update({
      calories: (allMeals || []).reduce((s: number, m: any) => s + (m.calories || 0), 0),
      protein_g: (allMeals || []).reduce((s: number, m: any) => s + (m.protein_g || 0), 0),
      carbs_g: (allMeals || []).reduce((s: number, m: any) => s + (m.carbs_g || 0), 0),
      fats_g: (allMeals || []).reduce((s: number, m: any) => s + (m.fats_g || 0), 0),
    }).eq('id', log.id);
    await loadData();
  }

  const calorieBars = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const entry = weekHistory.find(h => h.date === dateStr);
    return { label: DAY_ES[d.getDay()], value: entry?.calories || 0, isToday: dateStr === today };
  });

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center gap-3">
          <a href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">←</a>
          <div className="flex-1">
            <h1 className="text-lg font-semibold tracking-tight">Nutricion</h1>
            <p className="text-xs text-zinc-500 capitalize mt-0.5">{new Date().toLocaleDateString('es-PA', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <button onClick={() => setShowAddForm(true)} className="bg-white hover:bg-zinc-100 text-zinc-900 font-semibold py-2 px-4 rounded-xl text-sm transition-colors">
            + Comida
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-5 space-y-3">
        {loading ? (
          <p className="text-center text-zinc-600 py-12 text-sm">Cargando...</p>
        ) : (
          <>
            <MacroProgress
              calories={nutritionLog?.calories || 0}
              protein={nutritionLog?.protein_g || 0}
              carbs={nutritionLog?.carbs_g || 0}
              fat={nutritionLog?.fats_g || 0}
              targetCalories={TARGET_CALORIES}
              targetProtein={TARGET_PROTEIN}
            />

            {weekHistory.length > 0 && (
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Calorias — 7 dias</p>
                  <p className="text-xs text-zinc-600">Meta {TARGET_CALORIES}</p>
                </div>
                <BarChart bars={calorieBars} max={Math.max(TARGET_CALORIES * 1.1, ...calorieBars.map(b => b.value))} targetLine={TARGET_CALORIES} height={56} />
              </div>
            )}

            <SupplementTracker userId={USER_ID} date={today} supplements={supplements} onUpdate={loadData} />
            <MealList meals={meals} onDelete={deleteMeal} />
          </>
        )}
      </div>

      {showAddForm && nutritionLog && (
        <AddMealForm nutritionLogId={nutritionLog.id} onClose={() => setShowAddForm(false)} onSaved={() => { setShowAddForm(false); loadData(); }} />
      )}
    </main>
  );
}
