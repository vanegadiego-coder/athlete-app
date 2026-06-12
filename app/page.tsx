'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

const USER_ID = '00000000-0000-0000-0000-000000000001';
const PLAN_START = new Date('2026-06-03T12:00:00');
const PLAN_START_CYCLE = 3;
const TARGET_CALORIES = 2200;
const TARGET_PROTEIN = 100;

const CYCLE_NAMES: Record<number, string> = {
  1: 'Pecho · Hombro · Triceps',
  2: 'Espalda · Biceps · Core',
  3: 'Pierna · Movilidad',
  4: 'Descanso gym',
};

function getCycleDay(dateStr: string): number {
  const diff = Math.round((new Date(dateStr + 'T12:00:00').getTime() - PLAN_START.getTime()) / 86400000);
  return ((PLAN_START_CYCLE - 1 + diff) % 4 + 4) % 4 + 1;
}

function getCurrentWeek(): number {
  const diff = new Date().getTime() - PLAN_START.getTime();
  return Math.max(1, Math.min(Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1, 24));
}

export default function Dashboard() {
  const [gymCheckedIn, setGymCheckedIn] = useState(false);
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [creatine, setCreatine] = useState(false);
  const [magnesium, setMagnesium] = useState(false);
  const [recentRun, setRecentRun] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];
  const currentWeek = getCurrentWeek();
  const gymDay = getCycleDay(today);
  const dayName = new Date().toLocaleDateString('es-PA', { weekday: 'long', day: 'numeric', month: 'long' });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [gymLogRes, nutritionRes, suppRes, runsRes] = await Promise.all([
      supabase.from('gym_log').select('attended').eq('user_id', USER_ID).eq('date', today).single(),
      supabase.from('nutrition_log').select('calories,protein_g').eq('user_id', USER_ID).eq('date', today).single(),
      supabase.from('supplements_log').select('creatine_5g,magnesium_210mg').eq('user_id', USER_ID).eq('date', today).single(),
      supabase.from('runs_log').select('*').eq('user_id', USER_ID).order('date', { ascending: false }).limit(1),
    ]);
    if (gymLogRes.data) setGymCheckedIn(true);
    if (nutritionRes.data) {
      setCalories(nutritionRes.data.calories || 0);
      setProtein(nutritionRes.data.protein_g || 0);
    }
    if (suppRes.data) {
      setCreatine(suppRes.data.creatine_5g || false);
      setMagnesium(suppRes.data.magnesium_210mg || false);
    }
    if (runsRes.data?.[0]) setRecentRun(runsRes.data[0]);
    setLoading(false);
  }

  const calPct = Math.min(100, Math.round((calories / TARGET_CALORIES) * 100));
  const protPct = Math.min(100, Math.round((protein / TARGET_PROTEIN) * 100));

  const card = "block bg-zinc-900 rounded-xl border border-zinc-800 p-5 hover:border-zinc-600 transition-colors";

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Diego</h1>
            <p className="text-xs text-zinc-500 capitalize mt-0.5">{dayName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">Sem. {currentWeek}/24</p>
            <p className="text-xs text-zinc-500">Plan 21K</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-5 space-y-3">
        {loading ? (
          <p className="text-center text-zinc-600 py-12 text-sm">Cargando...</p>
        ) : (
          <>
            <a href="/nutricion" className={card}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Nutricion</span>
                <span className="text-xs text-zinc-500">{calPct}%</span>
              </div>
              <div className="flex items-end gap-5 mb-4">
                <div>
                  <p className="text-5xl font-black tracking-tight leading-none">{calories.toLocaleString()}</p>
                  <p className="text-xs text-zinc-500 mt-1">de {TARGET_CALORIES.toLocaleString()} kcal</p>
                </div>
                <div className="mb-1">
                  <p className="text-xl font-bold">{Math.round(protein)}g</p>
                  <p className="text-xs text-zinc-500">prot / {TARGET_PROTEIN}g</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="h-0.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-100 rounded-full transition-all" style={{ width: `${calPct}%` }} />
                </div>
                <div className="h-0.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${protPct}%` }} />
                </div>
              </div>
              <div className="flex gap-4 mt-3">
                <span className={`text-xs ${creatine ? 'text-zinc-200 font-medium' : 'text-zinc-700'}`}>Creatina</span>
                <span className={`text-xs ${magnesium ? 'text-zinc-200 font-medium' : 'text-zinc-700'}`}>Magnesio</span>
              </div>
            </a>

            <a href="/gym" className={card}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Gym</span>
                {gymCheckedIn && <span className="text-xs font-semibold text-zinc-300">Registrado</span>}
              </div>
              <p className="text-lg font-semibold">Dia {gymDay}</p>
              <p className="text-sm text-zinc-500 mt-0.5">{CYCLE_NAMES[gymDay]}</p>
            </a>

            <a href="/running" className={card}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Running</span>
                <span className="text-xs text-zinc-500">Sem. {currentWeek}/24</span>
              </div>
              {recentRun ? (
                <>
                  <p className="text-lg font-semibold">{recentRun.distance_km} km</p>
                  <p className="text-sm text-zinc-500 mt-0.5">
                    {recentRun.type} · {Math.round(recentRun.duration_sec / 60)} min
                    {recentRun.avg_hr ? ` · ${recentRun.avg_hr} bpm` : ''}
                  </p>
                </>
              ) : (
                <p className="text-sm text-zinc-500">Sin carreras aun</p>
              )}
            </a>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <a href="/nutricion" className="bg-white text-zinc-900 rounded-xl py-3 text-center text-sm font-semibold hover:bg-zinc-100 transition-colors">
                + Comida
              </a>
              <a href="/running" className="bg-white text-zinc-900 rounded-xl py-3 text-center text-sm font-semibold hover:bg-zinc-100 transition-colors">
                + Carrera
              </a>
              <a href="/gym" className="bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-xl py-3 text-center text-sm font-semibold hover:border-zinc-500 transition-colors">
                Check-in gym
              </a>
              <a href="/nutricion" className="bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-xl py-3 text-center text-sm font-semibold hover:border-zinc-500 transition-colors">
                Suplementos
              </a>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
