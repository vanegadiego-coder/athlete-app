'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

const USER_ID = '00000000-0000-0000-0000-000000000001';
const PLAN_START = new Date('2026-06-03');
const TARGET_CALORIES = 2200;
const TARGET_PROTEIN = 100;

const CYCLE_DAYS: Record<number, { name: string; emoji: string }> = {
  1: { name: 'Pecho / Hombro / Tríceps', emoji: '💪' },
  2: { name: 'Espalda / Bíceps / Core', emoji: '🔙' },
  3: { name: 'Pierna / Movilidad', emoji: '🦵' },
  4: { name: 'Descanso gym', emoji: '🏃' },
};

function getCurrentWeek(): number {
  const diff = new Date().getTime() - PLAN_START.getTime();
  return Math.max(1, Math.min(Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1, 24));
}

export default function Dashboard() {
  const [gymDay, setGymDay] = useState<number>(1);
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
  const dayName = new Date().toLocaleDateString('es-PA', { weekday: 'long', day: 'numeric', month: 'long' });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [cycleRes, gymLogRes, mealsRes, suppRes, runsRes] = await Promise.all([
      supabase.from('gym_cycle').select('current_day').eq('user_id', USER_ID).single(),
      supabase.from('gym_log').select('attended').eq('user_id', USER_ID).eq('date', today).single(),
      supabase.from('meals').select('calories,protein').eq('user_id', USER_ID).eq('date', today),
      supabase.from('supplements_log').select('creatine_taken,magnesium_taken').eq('user_id', USER_ID).eq('date', today).single(),
      supabase.from('runs_log').select('*').eq('user_id', USER_ID).order('date', { ascending: false }).limit(1),
    ]);
    if (cycleRes.data) setGymDay(cycleRes.data.current_day);
    if (gymLogRes.data) setGymCheckedIn(true);
    if (mealsRes.data) {
      setCalories(mealsRes.data.reduce((s: number, m: any) => s + (m.calories || 0), 0));
      setProtein(mealsRes.data.reduce((s: number, m: any) => s + (m.protein || 0), 0));
    }
    if (suppRes.data) {
      setCreatine(suppRes.data.creatine_taken || false);
      setMagnesium(suppRes.data.magnesium_taken || false);
    }
    if (runsRes.data?.[0]) setRecentRun(runsRes.data[0]);
    setLoading(false);
  }

  const calPct = Math.min(100, Math.round((calories / TARGET_CALORIES) * 100));
  const protPct = Math.min(100, Math.round((protein / TARGET_PROTEIN) * 100));

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b-2 border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">⚡ Diego</h1>
            <p className="text-xs text-gray-500 capitalize">{dayName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-blue-600">Semana {currentWeek}/24</p>
            <p className="text-xs text-gray-400">Plan 21K</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {loading ? (
          <p className="text-center text-gray-500 py-12 text-lg">Cargando...</p>
        ) : (
          <>
            {/* Nutrición card */}
            <a href="/nutricion" className="block bg-white rounded-xl border-2 border-gray-200 hover:border-green-400 transition p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-900">🍎 Nutrición</h2>
                <span className={`text-sm font-bold ${calPct >= 90 ? 'text-green-600' : 'text-orange-500'}`}>
                  {calPct}%
                </span>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Calorías</span>
                    <span>{calories} / {TARGET_CALORIES} kcal</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-400 rounded-full transition-all" style={{ width: `${calPct}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Proteína</span>
                    <span>{Math.round(protein)}g / {TARGET_PROTEIN}g</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${protPct}%` }} />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-3">
                <span className={`text-xs px-2 py-1 rounded-full ${creatine ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                  {creatine ? '⚡ Creatina ✓' : '⚡ Creatina pendiente'}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${magnesium ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-400'}`}>
                  {magnesium ? '🌙 Mg ✓' : '🌙 Mg pendiente'}
                </span>
              </div>
            </a>

            {/* Gym card */}
            <a href="/gym" className="block bg-white rounded-xl border-2 border-gray-200 hover:border-purple-400 transition p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900">🏋️ Gym</h2>
                {gymCheckedIn && <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full">✓ Registrado</span>}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl">
                  {CYCLE_DAYS[gymDay]?.emoji || '💪'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Día {gymDay}</p>
                  <p className="text-sm text-gray-600">{CYCLE_DAYS[gymDay]?.name}</p>
                </div>
              </div>
            </a>

            {/* Running card */}
            <a href="/running" className="block bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 transition p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-gray-900">🏃 Running</h2>
                <span className="text-xs text-blue-600 font-bold">Sem. {currentWeek}/24</span>
              </div>
              {recentRun ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-xl">🏃</div>
                  <div>
                    <p className="font-semibold text-gray-900">{recentRun.distance_km}km · {recentRun.type}</p>
                    <div className="flex gap-2 text-xs text-gray-500">
                      <span>{recentRun.duration_min}min</span>
                      {recentRun.avg_bpm && <span>❤️ {recentRun.avg_bpm} bpm</span>}
                      <span>{new Date(recentRun.date + 'T12:00:00').toLocaleDateString('es-PA', { weekday: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No hay carreras aún — toca para empezar</p>
              )}
            </a>

            {/* Quick actions */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
              <h2 className="font-bold text-gray-900 mb-3">⚡ Acciones rápidas</h2>
              <div className="grid grid-cols-2 gap-2">
                <a href="/nutricion" className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg py-3 text-center text-sm font-semibold text-green-700 transition">
                  🍎 + Comida
                </a>
                <a href="/running" className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg py-3 text-center text-sm font-semibold text-blue-700 transition">
                  🏃 + Carrera
                </a>
                <a href="/gym" className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg py-3 text-center text-sm font-semibold text-purple-700 transition">
                  🏋️ Check-in gym
                </a>
                <a href="/nutricion" className="bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg py-3 text-center text-sm font-semibold text-orange-700 transition">
                  💊 Suplementos
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
