'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import GymCycleCard from '@/components/gym/GymCycleCard';
import GymHistory from '@/components/gym/GymHistory';

const CYCLE_DAYS = {
  1: { name: 'Pecho / Hombro / Tríceps', emoji: '💪', canRun: true, runNote: 'Intervalos o Tempo en la mañana' },
  2: { name: 'Espalda / Bíceps / Core', emoji: '🔙', canRun: true, runNote: 'Z2 suave opcional en la mañana' },
  3: { name: 'Pierna / Movilidad', emoji: '🦵', canRun: false, runNote: '⛔ Sin correr — siempre' },
  4: { name: 'Descanso gym', emoji: '🏃', canRun: true, runNote: '✅ Carrera larga OBLIGATORIA' },
};

const USER_ID = '00000000-0000-0000-0000-000000000001';

export default function GymPage() {
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [todayLog, setTodayLog] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Get current cycle day
      const { data: cycleData } = await supabase
        .from('gym_cycle')
        .select('*')
        .eq('user_id', USER_ID)
        .single();

      if (cycleData) {
        setCurrentDay(cycleData.current_day);
      } else {
        // First time — initialize cycle at day 1
        await supabase.from('gym_cycle').insert({ user_id: USER_ID, current_day: 1 });
        setCurrentDay(1);
      }

      // Get today's log
      const { data: todayData } = await supabase
        .from('gym_log')
        .select('*')
        .eq('user_id', USER_ID)
        .eq('date', today)
        .single();

      setTodayLog(todayData);

      // Get last 10 sessions
      const { data: historyData } = await supabase
        .from('gym_log')
        .select('*')
        .eq('user_id', USER_ID)
        .order('date', { ascending: false })
        .limit(10);

      setHistory(historyData || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function checkIn(attended: boolean) {
    setSaving(true);
    const day = CYCLE_DAYS[currentDay as keyof typeof CYCLE_DAYS];

    try {
      // Save gym log for today
      const { error } = await supabase.from('gym_log').upsert({
        user_id: USER_ID,
        date: today,
        cycle_day: currentDay,
        attended,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,date' });

      if (error) throw error;

      // Advance cycle day
      const nextDay = (currentDay % 4) + 1;
      await supabase.from('gym_cycle').upsert({
        user_id: USER_ID,
        current_day: nextDay,
        last_updated: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      setCurrentDay(nextDay);
      setTodayLog({ attended, cycle_day: currentDay, date: today });
      await loadData();
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Cargando...</p>
      </div>
    );
  }

  const day = CYCLE_DAYS[currentDay as keyof typeof CYCLE_DAYS];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b-2 border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <a href="/" className="text-gray-400 hover:text-gray-600 text-xl">←</a>
          <div>
            <h1 className="text-xl font-bold text-gray-900">🏋️ Gym</h1>
            <p className="text-xs text-gray-500">Ciclo rotativo de 4 días</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <GymCycleCard
          currentDay={currentDay}
          dayInfo={day}
          todayLog={todayLog}
          onCheckIn={checkIn}
          saving={saving}
          today={today}
        />

        {/* Stats rápidas */}
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3,4].slice(0,3).map(d => (
            <div key={d} className={`rounded-lg p-3 text-center border-2 ${d === currentDay ? 'bg-purple-100 border-purple-400' : 'bg-white border-gray-200'}`}>
              <p className="text-xs text-gray-500">Día {d}</p>
              <p className="text-sm font-semibold text-gray-800">{CYCLE_DAYS[d as keyof typeof CYCLE_DAYS].emoji}</p>
            </div>
          ))}
          <div className={`rounded-lg p-3 text-center border-2 ${4 === currentDay ? 'bg-purple-100 border-purple-400' : 'bg-white border-gray-200'}`}>
            <p className="text-xs text-gray-500">Día 4</p>
            <p className="text-sm font-semibold text-gray-800">{CYCLE_DAYS[4].emoji}</p>
          </div>
        </div>

        <GymHistory history={history} cycleDays={CYCLE_DAYS} />
      </div>
    </main>
  );
}
