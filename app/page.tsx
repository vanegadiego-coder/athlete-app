import DayOverview from '@/components/dashboard/DayOverview';
import { DaySummary } from '@/types';

export default function Dashboard() {
  const mockSummary: DaySummary = {
    date: new Date().toISOString().split('T')[0],
    gymToday: {
      cycleDay: 1,
      name: 'Pecho / Hombro / Tríceps',
      attended: false,
    },
    runToday: {
      type: 'Intervalos',
      distance: 3.5,
      duration: 25,
      completed: false,
    },
    nutrition: {
      calories: 1650,
      targetCalories: 2200,
      protein: 65,
      targetProtein: 100,
      percentage: 75,
    },
    supplements: {
      creatineTaken: false,
      magnesiumTaken: false,
    },
    week: 2,
    block: 1,
    streak: 9,
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b-2 border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">💪 Athlete App</h1>
          <p className="text-sm text-gray-600">Diego • 21K Media Maratón</p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📅 Hoy</h2>
          <DayOverview summary={mockSummary} />
        </div>
        <div className="bg-white border-2 border-gray-300 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">⚡ Acciones Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition">+ Comida</button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition">+ Carrera</button>
            <button className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition">✅ Gym</button>
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition">💊 Suplementos</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 text-center">
            <h3 className="text-lg font-bold text-blue-900">📊 Running</h3>
            <p className="text-sm text-blue-700 mt-2">Log de carreras + plan integrado</p>
          </div>
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 text-center">
            <h3 className="text-lg font-bold text-green-900">🍎 Nutrición</h3>
            <p className="text-sm text-green-700 mt-2">Tracking diario de macros</p>
          </div>
          <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 text-center">
            <h3 className="text-lg font-bold text-purple-900">🏋️ Gym</h3>
            <p className="text-sm text-purple-700 mt-2">Ciclo rotativo + asistencia</p>
          </div>
        </div>
      </div>
    </main>
  );
}
