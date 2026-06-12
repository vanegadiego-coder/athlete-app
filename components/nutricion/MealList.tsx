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
      <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
        <p className="text-3xl mb-2">🍽️</p>
        <p className="text-gray-500 font-medium">No hay comidas registradas hoy</p>
        <p className="text-gray-400 text-sm mt-1">Toca "+ Comida" para agregar</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="font-bold text-gray-900">Comidas de hoy ({meals.length})</h2>
      </div>
      <div className="divide-y divide-gray-100">
        {meals.map((meal) => (
          <div key={meal.id} className="px-4 py-3 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900 text-sm truncate">{meal.food_description}</p>
                {meal.estimated_by_ai && (
                  <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full shrink-0">IA</span>
                )}
              </div>
              <div className="flex gap-3 mt-1 text-xs text-gray-500">
                <span className="font-semibold text-orange-600">{meal.calories} kcal</span>
                <span>P: {Math.round(meal.protein_g)}g</span>
                <span>C: {Math.round(meal.carbs_g)}g</span>
                <span>G: {Math.round(meal.fats_g)}g</span>
              </div>
            </div>
            <button
              onClick={() => onDelete(meal.id)}
              className="text-gray-300 hover:text-red-400 transition text-lg shrink-0 mt-0.5"
            >×</button>
          </div>
        ))}
      </div>
    </div>
  );
}
