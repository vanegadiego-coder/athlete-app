'use client';

const ZONE_DOT: Record<string, string> = {
  'Z2 Fácil': 'bg-blue-400',
  'Larga Z2': 'bg-blue-600',
  'Intervalos': 'bg-red-500',
  'Tempo': 'bg-orange-500',
  'Fartlek': 'bg-purple-500',
  'Z3 Moderado': 'bg-yellow-500',
  'Z1 Recovery': 'bg-green-400',
};

interface Run {
  id: string;
  date: string;
  type: string;
  distance_km: number;
  duration_min: number;
  avg_bpm?: number;
  felt_good?: boolean;
}

export default function RunHistory({ runs }: { runs: Run[] }) {
  if (runs.length === 0) {
    return (
      <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
        <p className="text-3xl mb-2">🏃</p>
        <p className="text-gray-500 font-medium">No hay carreras registradas aún</p>
        <p className="text-gray-400 text-sm mt-1">Toca "+ Carrera" para empezar</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-bold text-gray-900">Historial ({runs.length})</h2>
      </div>
      <div className="divide-y divide-gray-100">
        {runs.map(run => {
          const pace = run.duration_min && run.distance_km
            ? (run.duration_min / run.distance_km).toFixed(1)
            : null;
          const dateStr = new Date(run.date + 'T12:00:00').toLocaleDateString('es-PA', { weekday: 'short', day: 'numeric', month: 'short' });

          return (
            <div key={run.id} className="px-4 py-3 flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full shrink-0 ${ZONE_DOT[run.type] || 'bg-gray-400'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{run.distance_km}km</p>
                  <span className="text-xs text-gray-500">{run.type}</span>
                  {run.felt_good === false && <span className="text-xs">😓</span>}
                </div>
                <div className="flex gap-3 text-xs text-gray-400 mt-0.5">
                  <span>{dateStr}</span>
                  <span>{run.duration_min}min</span>
                  {pace && <span>{pace} min/km</span>}
                  {run.avg_bpm && <span>❤️ {run.avg_bpm} bpm</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
