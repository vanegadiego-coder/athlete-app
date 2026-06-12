'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import GymCycleCard from '@/components/gym/GymCycleCard';
import GymHistory from '@/components/gym/GymHistory';

const PLAN_START = new Date('2026-06-03T12:00:00');
const PLAN_START_CYCLE = 3;

function getCycleDay(date: Date): number {
  const diff = Math.round((date.getTime() - PLAN_START.getTime()) / 86400000);
  return ((PLAN_START_CYCLE - 1 + diff) % 4 + 4) % 4 + 1;
}

const CYCLE_DAYS = {
  1: { name: 'Pecho · Hombro · Triceps', canRun: true, runNote: 'Intervalos o Tempo en la manana' },
  2: { name: 'Espalda · Biceps · Core', canRun: true, runNote: 'Z2 suave opcional' },
  3: { name: 'Pierna · Movilidad', canRun: false, runNote: 'Sin correr — siempre' },
  4: { name: 'Descanso gym', canRun: true, runNote: 'Carrera larga obligatoria' },
};

const USER_ID = '00000000-0000-0000-0000-000000000001';

export default function GymPage() {
  const [todayLog, setTodayLog] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];
  const currentDay = getCycleDay(new Date());

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [todayRes, histRes] = await Promise.all([
        supabase.from('gym_log').select('*').eq('user_id', USER_ID).eq('date', today).single(),
        supabase.from('gym_log').select('*').eq('user_id', USER_ID).order('date', { ascending: false }).limit(20),
      ]);
      setTodayLog(todayRes.data || null);
      setHistory(histRes.data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  async function checkIn(attended: boolean) {
    setSaving(true);
    try {
      await supabase.from('gym_log').upsert({ user_id: USER_ID, date: today, cycle_day: currentDay, attended }, { onConflict: 'user_id,date' });
      setTodayLog({ attended, cycle_day: currentDay, date: today });
      await loadData();
    } catch (err) { console.error(err); }
    setSaving(false);
  }

  if (loading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><p className="text-zinc-600 text-sm">Cargando...</p></div>;
  }

  const day = CYCLE_DAYS[currentDay as keyof typeof CYCLE_DAYS];

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center gap-3">
          <a href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">←</a>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Gym</h1>
            <p className="text-xs text-zinc-500">Ciclo rotativo de 4 dias</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-5 space-y-3">
        <GymCycleCard
          currentDay={currentDay}
          dayInfo={day}
          todayLog={todayLog}
          onCheckIn={checkIn}
          saving={saving}
          today={today}
        />

        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map(d => (
            <div key={d} className={`rounded-xl py-3 text-center border transition-colors ${d === currentDay ? 'bg-white border-white text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>
              <p className="text-xs font-semibold">D{d}</p>
            </div>
          ))}
        </div>

        <GymHistory history={history} cycleDays={CYCLE_DAYS} />
      </div>
    </main>
  );
}
