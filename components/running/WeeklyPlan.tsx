'use client';

const ZONE_COLORS: Record<string, string> = {
  'Z2 Fácil': 'bg-blue-100 text-blue-800',
  'Larga Z2': 'bg-blue-200 text-blue-900',
  'Intervalos': 'bg-red-100 text-red-800',
  'Tempo': 'bg-orange-100 text-orange-800',
  'Z1 Recovery': 'bg-green-100 text-green-700',
  'Fartlek': 'bg-purple-100 text-purple-800',
  'Z3 Moderado': 'bg-yellow-100 text-yellow-800',
  'Rodaje': 'bg-gray-100 text-gray-700',
};

interface Props {
  week: number;
  plan: any;
  completedRuns: any[];
}

export default function WeeklyPlan({ week, plan, completedRuns }: Props) {
  const totalKmCompleted = completedRuns.reduce((s, r) => s + (r.distance_km || 0), 0);

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-blue-50 border-b border-blue-200 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900">Semana {week} — {plan?.title || 'Plan actual'}</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Bloque {plan?.block_number || '—'} {plan?.discharge_week ? '· Semana de descarga 💤' : ''}
          </p>
        </div>
        {plan && (
          <div className="text-right">
            <p className="text-sm font-bold text-blue-700">{totalKmCompleted.toFixed(1)} / {plan.total_km_target}km</p>
            <p className="text-xs text-gray-500">completados</p>
          </div>
        )}
      </div>

      {plan?.training_runs?.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {plan.training_runs.sort((a: any, b: any) => a.cycle_day - b.cycle_day).map((run: any) => (
            <div key={run.id} className="px-4 py-3 flex gap-3 items-start">
              <div className="shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                D{run.cycle_day}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ZONE_COLORS[run.type] || 'bg-gray-100 text-gray-700'}`}>
                    {run.type}
                  </span>
                  {run.optional && <span className="text-xs text-gray-400">opcional</span>}
                </div>
                <p className="text-sm text-gray-700 mt-1">{run.description}</p>
                <div className="flex gap-3 mt-1 text-xs text-gray-400">
                  <span>{run.duration_min} min</span>
                  <span>{run.distance_km} km</span>
                  <span>{run.fc_target}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 py-6 text-center text-gray-400">
          <p className="text-2xl mb-1">📋</p>
          <p className="text-sm">Plan no cargado para esta semana</p>
          <p className="text-xs mt-1">Los entrenamientos aparecerán aquí una vez se cargue el plan</p>
        </div>
      )}
    </div>
  );
}
