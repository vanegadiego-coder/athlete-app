'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import DayCalendar from '@/components/running/DayCalendar';
import LogRunForm from '@/components/running/LogRunForm';
import RunHistory from '@/components/running/RunHistory';

const USER_ID = '00000000-0000-0000-0000-000000000001';
const PLAN_START = new Date('2026-06-03');

function getCurrentWeek(): number {
  const diff = new Date().getTime() - PLAN_START.getTime();
  return Math.max(1, Math.min(Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1, 24));
}

export default function RunningPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [weekPlan, setWeekPlan] = useState<any>(null);
  const [gymCycleDay, setGymCycleDay] = useState<number>(1);
  const [showLogForm, setShowLogForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const currentWeek = getCurrentWeek();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [runsRes, planRes, cycleRes] = await Promise.all([
      supabase.from('runs_log').select('*').eq('user_id', USER_ID).order('date', { ascending: false }).limit(30),
      supabase.from('training_plan').select('*, training_runs(*)').eq('week_number', currentWeek).single(),
      supabase.from('gym_cycle').select('current_day').eq('user_id', USER_ID).single(),
    ]);
    setRuns(runsRes.data || []);
    setWeekPlan(planRes.data || null);
    if (cycleRes.data) setGymCycleDay(cycleRes.data.current_day);
    setLoading(false);
  }

  const totalKmAll = runs.reduce((s, r) => s + (r.distance_km || 0), 0);
  const runsWithHr = runs.filter(r => r.avg_hr);
  const avgBpm = runsWithHr.length > 0
    ? Math.round(runsWithHr.reduce((s, r) => s + r.avg_hr, 0) / runsWithHr.length)
    : 0;

  const todayRun = runs.find(r => r.date === today);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b-2 border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <a href="/" className="text-gray-400 hover:text-gray-600 text-xl">←</a>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">🏃 Running</h1>
            <p className="text-xs text-gray-500">Semana {currentWeek} de 24 · Plan 21K</p>
          </div>
          <button
            onClick={() => setShowLogForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition"
          >
            + Carrera
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {loading ? (
          <p className="text-center text-gray-500 py-8">Cargando...</p>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl border-2 border-gray-200 p-3 text-center">
                <p className="text-2xl font-black text-green-600">{totalKmAll.toFixed(0)}</p>
                <p className="text-xs text-gray-500 mt-0.5">km totales</p>
              </div>
              <div className="bg-white rounded-xl border-2 border-gray-200 p-3 text-center">
                <p className="text-2xl font-black text-red-500">{avgBpm || '—'}</p>
                <p className="text-xs text-gray-500 mt-0.5">BPM promedio</p>
              </div>
            </div>

            <DayCalendar
              week={currentWeek}
              weekPlan={weekPlan}
              gymCycleDay={gymCycleDay}
              today={today}
              loggedRuns={runs}
              onLogRun={() => setShowLogForm(true)}
            />

            <RunHistory runs={runs} />
          </>
        )}
      </div>

      {showLogForm && (
        <LogRunForm
          userId={USER_ID}
          weekNumber={currentWeek}
          onClose={() => setShowLogForm(false)}
          onSaved={() => { setShowLogForm(false); loadData(); }}
        />
      )}
    </main>
  );
}
