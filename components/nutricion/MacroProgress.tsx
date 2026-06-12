'use client';

interface Props {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  targetCalories: number;
  targetProtein: number;
}

export default function MacroProgress({ calories, protein, carbs, fat, targetCalories, targetProtein }: Props) {
  const calPct = Math.min(100, Math.round((calories / targetCalories) * 100));
  const protPct = Math.min(100, Math.round((protein / targetProtein) * 100));
  const remaining = targetCalories - calories;

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Hoy</p>
        <p className="text-xs text-zinc-400">{calPct}%</p>
      </div>

      <div className="flex items-end gap-5 mb-5 mt-3">
        <div>
          <p className="text-5xl font-black tracking-tight leading-none">{calories.toLocaleString()}</p>
          <p className="text-xs text-zinc-400 mt-1">de {targetCalories.toLocaleString()} kcal</p>
        </div>
        <p className={`text-sm mb-1 ${remaining > 0 ? 'text-zinc-400' : 'text-zinc-900 font-semibold'}`}>
          {remaining > 0 ? `faltan ${remaining}` : `meta lograda`}
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
            <span>Calorias</span>
            <span>{calories} / {targetCalories}</span>
          </div>
          <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
            <div className="h-full bg-zinc-900 rounded-full transition-all" style={{ width: `${calPct}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
            <span>Proteina</span>
            <span>{Math.round(protein)}g / {targetProtein}g</span>
          </div>
          <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${protPct}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-zinc-100">
        <div>
          <p className="text-xs text-zinc-400 mb-0.5">Carbohidratos</p>
          <p className="text-lg font-bold tracking-tight">{Math.round(carbs)}g</p>
        </div>
        <div>
          <p className="text-xs text-zinc-400 mb-0.5">Grasas</p>
          <p className="text-lg font-bold tracking-tight">{Math.round(fat)}g</p>
        </div>
      </div>
    </div>
  );
}
