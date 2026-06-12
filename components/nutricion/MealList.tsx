'use client';

interface Meal {
  id: string;
  food_description: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  estimated_by_ai?: boolean;
}

interface Props {
  meals: Meal[];
  onDelete: (id: string) => void;
}

export default function MealList({ meals, onDelete }: Props) {
  if (meals.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-zinc-200 p-10 text-center">
        <p className="text-sm text-zinc-400">Sin comidas registradas hoy</p>
        <p className="text-xs text-zinc-300 mt-1">Toca + Comida para agregar</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-zinc-100 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Comidas ({meals.length})</p>
        <p className="text-xs text-zinc-400">{meals.reduce((s, m) => s + m.calories, 0)} kcal total</p>
      </div>
      <div className="divide-y divide-zinc-100">
        {meals.map((meal) => (
          <div key={meal.id} className="px-5 py-3 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{meal.food_description}</p>
                {meal.estimated_by_ai && <span className="text-xs text-zinc-300 shrink-0">IA</span>}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {meal.calories} kcal · {Math.round(meal.protein_g)}g prot · {Math.round(meal.carbs_g)}g carbs · {Math.round(meal.fats_g)}g grasas
              </p>
            </div>
            <button onClick={() => onDelete(meal.id)} className="text-zinc-200 hover:text-zinc-500 transition-colors text-xl leading-none shrink-0 mt-0.5">×</button>
          </div>
        ))}
      </div>
    </div>
  );
}
