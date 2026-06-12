'use client';

import { DaySummary } from '@/types';

interface DayOverviewProps {
  summary: DaySummary;
}

export default function DayOverview({ summary }: DayOverviewProps) {
  const nutritionPercentage = (summary.nutrition.calories / summary.nutrition.targetCalories) * 100;
  const proteinPercentage = (summary.nutrition.protein / summary.nutrition.targetProtein) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
        <h3 className="text-lg font-bold text-purple-900 mb-2">🏋️ Gym</h3>
        <p className="text-sm text-purple-700">Día {summary.gymToday.cycleDay}</p>
        <p className="text-base font-semibold text-purple-900">{summary.gymToday.name}</p>
        <div className="mt-3">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${summary.gymToday.attended ? 'bg-green-200 text-green-900' : 'bg-gray-200 text-gray-900'}`}>
            {summary.gymToday.attended ? '✅ Fui' : '❌ Pendiente'}
          </span>
        </div>
      </div>
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
        <h3 className="text-lg font-bold text-blue-900 mb-2">🏃 Running</h3>
        {summary.runToday.type ? (
          <>
            <p className="text-sm text-blue-700">{summary.runToday.type}</p>
            <p className="text-base font-semibold text-blue-900">{summary.runToday.distance}km · {summary.runToday.duration}min</p>
            <div className="mt-3">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${summary.runToday.completed ? 'bg-green-200 text-green-900' : 'bg-gray-200 text-gray-900'}`}>
                {summary.runToday.completed ? '✅ Hecho' : '⏳ Pendiente'}
              </span>
            </div>
          </>
        ) : (
          <p className="text-base text-blue-700">Descanso de running</p>
        )}
      </div>
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 md:col-span-2">
        <h3 className="text-lg font-bold text-green-900 mb-3">🍎 Nutrición</h3>
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-green-700">Calorías</span>
              <span className="font-semibold text-green-900">{summary.nutrition.calories} / {summary.nutrition.targetCalories} kcal</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full transition-all" style={{ width: `${Math.min(nutritionPercentage, 100)}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-green-700">Proteína</span>
              <span className="font-semibold text-green-900">{summary.nutrition.protein}g / {summary.nutrition.targetProtein}g</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full transition-all" style={{ width: `${Math.min(proteinPercentage, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
        <h3 className="text-lg font-bold text-orange-900 mb-3">💊 Suplementos</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-orange-700">Creatina 5g</span>
            <span>{summary.supplements.creatineTaken ? '✅' : '❌'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-orange-700">Magnesio 210mg</span>
            <span>{summary.supplements.magnesiumTaken ? '✅' : '❌'}</span>
          </div>
        </div>
      </div>
      <div className="bg-indigo-50 border-2 border-indigo-300 rounded-lg p-4">
        <h3 className="text-lg font-bold text-indigo-900 mb-2">📅 Plan</h3>
        <p className="text-sm text-indigo-700">Semana {summary.week} de 24</p>
        <p className="text-base font-semibold text-indigo-900">Bloque {summary.block}</p>
        <p className="text-sm text-indigo-600 mt-2">🔥 Streak: {summary.streak} días</p>
      </div>
    </div>
  );
}
