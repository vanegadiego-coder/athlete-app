'use client';

interface Props {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  targetCalories: number;
  targetProtein: number;
}

function Bar({ value, target, color }: { value: number; target: number; color: string }) {
  const pct = Math.min(100, Math.round((value / target) * 100));
  return (
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function MacroProgress({ calories, protein, carbs, fat, targetCalories, targetProtein }: Props) {
  const calPct = Math.round((calories / targetCalories) * 100);
  const protPct = Math.round((protein / targetProtein) * 100);
  const remaining = targetCalories - calories;

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Macros de hoy</h2>
        <span className={`text-sm font-semibold px-2 py-1 rounded-full ${calPct >= 90 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {calPct}%
        </span>
      </div>

      {/* Calories big display */}
      <div className="text-center py-2">
        <p className="text-4xl font-black text-gray-900">{calories.toLocaleString()}</p>
        <p className="text-sm text-gray-500">de {targetCalories.toLocaleString()} kcal</p>
        <p className={`text-sm font-medium mt-1 ${remaining > 0 ? 'text-orange-600' : 'text-green-600'}`}>
          {remaining > 0 ? `Faltan ${remaining} kcal` : `✓ Meta alcanzada (+${Math.abs(remaining)} extra)`}
        </p>
      </div>

      <Bar value={calories} target={targetCalories} color="bg-orange-400" />

      {/* Protein */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="font-semibold text-gray-700">Proteína</span>
          <span className={protPct >= 100 ? 'text-green-600 font-bold' : 'text-gray-600'}>
            {Math.round(protein)}g / {targetProtein}g {protPct >= 100 ? '✓' : ''}
          </span>
        </div>
        <Bar value={protein} target={targetProtein} color="bg-blue-500" />
      </div>

      {/* Carbs + Fat */}
      <div className="grid grid-cols-2 gap-4 pt-1">
        <div className="bg-yellow-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Carbohidratos</p>
          <p className="text-xl font-bold text-yellow-700">{Math.round(carbs)}g</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Grasas</p>
          <p className="text-xl font-bold text-red-600">{Math.round(fat)}g</p>
        </div>
      </div>
    </div>
  );
}
