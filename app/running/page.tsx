'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import DayCalendar from '@/components/running/DayCalendar';
import LogRunForm from '@/components/running/LogRunForm';
import RunHistory from '@/components/running/RunHistory';

const USER_ID = '00000000-0000-0000-0000-000000000001';
const PLAN_START = new Date('2026-06-03T12:00:00');

function getCurrentWeek(): number {
  const diff = new Date().getTime() - PLAN_START.getTime();
  return Math.max(1, Math.min(Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1, 24));
}

export default function RunningPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [weekPlan, setWeekPlan] = useState<any>(null);
  const [showLogForm, setShowLogForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const currentWeek = getCurrentWeek();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [runsRes, planRes] = await Promise.all([
      supabase.from('runs_log').select('*').eq('user_id', USER_ID).order('date', { ascending: false }).limit(30),
      supabase.from('training_plan').select('*, training_runs(*)').eq('week_number', currentWeek).single(),
    ]);
    setRuns(runsRes.data || []);
    setWeekPlan(planRes.data || null);
    setLoading(false);
  }

  const totalKmAll = runs.reduce((s, r) => s + (r.distance_km || 0), 0);
  const runsWithHr = runs.filter(r => r.avg_hr);
  const avgBpm = runsWithHr.length > 0
    ? Math.round(runsWithHr.reduce((s, r) => s + r.avg_hr, 0) / runsWithHr.length)
    : 0;

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center gap-3">
          <a href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">←</a>
          <div className="flex-1">
            <h1 className="text-lg font-semibold tracking-tight">Running</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Semana {currentWeek} de 24</p>
          </div>
          <button
            onClick={() => setShowLogForm(true)}
            className="bg-white hover:bg-zinc-100 text-zinc-900 font-semibold py-2 px-4 rounded-xl text-sm transition-colors"
          >
            + Carrera
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-5 space-y-3">
        {loading ? (
          <p className="text-center text-zinc-600 py-12 text-sm">Cargando...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 text-center">
                <p className="text-3xl font-black tracking-tight">{totalKmAll.toFixed(0)}</p>
                <p className="text-xs text-zinc-500 mt-0.5">km totales</p>
              </div>
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 text-center">
                <p className="text-3xl font-black tracking-tight">{avgBpm || '—'}</p>
                <p className="text-xs text-zinc-500 mt-0.5">BPM promedio</p>
              </div>
            </div>

            <DayCalendar
              week={currentWeek}
              weekPlan={weekPlan}
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
