'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import MacroProgress from '@/components/nutricion/MacroProgress';
import MealList from '@/components/nutricion/MealList';
import AddMealForm from '@/components/nutricion/AddMealForm';
import SupplementTracker from '@/components/nutricion/SupplementTracker';

const USER_ID = '00000000-0000-0000-0000-000000000001';
const TARGET_CALORIES = 2200;
const TARGET_PROTEIN = 100;

export default function NutricionPage() {
  const [meals, setMeals] = useState<any[]>([]);
  const [supplements, setSupplements] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [mealsRes, suppRes] = await Promise.all([
      supabase.from('meals').select('*').eq('user_id', USER_ID).eq('date', today),
      supabase.from('supplements_log').select('*').eq('user_id', USER_ID).eq('date', today).single(),
    ]);
    setMeals(mealsRes.data || []);
    setSupplements(suppRes.data || null);
    setLoading(false);
  }

  async function deleteMeal(id: string) {
    await supabase.from('meals').delete().eq('id', id);
    await loadData();
  }

  const totalCalories = meals.reduce((s, m) => s + (m.calories || 0), 0);
  const totalProtein = meals.reduce((s, m) => s + (m.protein || 0), 0);
  const totalCarbs = meals.reduce((s, m) => s + (m.carbs || 0), 0);
  const totalFat = meals.reduce((s, m) => s + (m.fat || 0), 0);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b-2 border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <a href="/" className="text-gray-400 hover:text-gray-600 text-xl">←</a>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">🍎 Nutrición</h1>
            <p className="text-xs text-gray-500">{new Date().toLocaleDateString('es-PA', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition"
          >
            + Comida
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {loading ? (
          <p className="text-center text-gray-500 py-8">Cargando...</p>
        ) : (
          <>
            <MacroProgress
              calories={totalCalories}
              protein={totalProtein}
              carbs={totalCarbs}
              fat={totalFat}
              targetCalories={TARGET_CALORIES}
              targetProtein={TARGET_PROTEIN}
            />

            <SupplementTracker
              userId={USER_ID}
              date={today}
              supplements={supplements}
              onUpdate={loadData}
            />

            <MealList meals={meals} onDelete={deleteMeal} />
          </>
        )}
      </div>

      {showAddForm && (
        <AddMealForm
          userId={USER_ID}
          date={today}
          onClose={() => setShowAddForm(false)}
          onSaved={() => { setShowAddForm(false); loadData(); }}
        />
      )}
    </main>
  );
}
