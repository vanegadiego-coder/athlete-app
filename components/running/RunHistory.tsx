'use client';

import BarChart from '@/components/shared/BarChart';
import LineChart from '@/components/shared/LineChart';

interface Run {
  id: string;
  date: string;
  type: string;
  distance_km: number;
  duration_sec: number;
  avg_pace?: string;
  avg_hr?: number;
}

const DAY_ES: Record<number, string> = { 0:'Dom',1:'Lun',2:'Mar',3:'Mie',4:'Jue',5:'Vie',6:'Sab' };

export default function RunHistory({ runs }: { runs: Run[] }) {
  // Weekly km chart — last 8 weeks
  const weeklyMap: Record<string, number> = {};
  for (const r of runs) {
    const d = new Date(r.date + 'T12:00:00');
    const dayOfWeek = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((dayOfWeek + 6) % 7));
    const key = monday.toISOString().split('T')[0];
    weeklyMap[key] = (weeklyMap[key] || 0) + (r.distance_km || 0);
  }
  const sortedWeeks = Object.keys(weeklyMap).sort().slice(-8);
  const todayMonday = (() => {
    const d = new Date(); const dow = d.getDay();
    d.setDate(d.getDate() - ((dow + 6) % 7));
    return d.toISOString().split('T')[0];
  })();
  const kmBars = sortedWeeks.map(w => ({
    label: `S${w.slice(5, 7)}/${w.slice(8)}`,
    value: Math.round((weeklyMap[w] || 0) * 10) / 10,
    isToday: w === todayMonday,
  }));
  const maxKm = Math.max(...kmBars.map(b => b.value), 1);

  // BPM trend chart
  const runsWithHr = runs.filter(r => r.avg_hr).slice(-12).reverse();
  const bpmPoints = runsWithHr.map(r => {
    const d = new Date(r.date + 'T12:00:00');
    return { label: `${DAY_ES[d.getDay()]}${d.getDate()}`, value: r.avg_hr! };
  });
  const avgBpm = runsWithHr.length > 0 ? Math.round(runsWithHr.reduce((s, r) => s + r.avg_hr!, 0) / runsWithHr.length) : 0;

  return (
    <div className="space-y-3">
      {/* km per week chart */}
      {kmBars.length > 0 && (
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Km por semana</p>
            <p className="text-xs text-zinc-400">{kmBars[kmBars.length - 1]?.value || 0} km esta semana</p>
          </div>
          <BarChart bars={kmBars} max={maxKm} height={64} />
        </div>
      )}

      {/* BPM trend */}
      {bpmPoints.length >= 2 && (
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Tendencia BPM</p>
            <p className="text-xs text-zinc-400">Promedio {avgBpm} bpm</p>
          </div>
          <LineChart points={bpmPoints} height={64} />
          <p className="text-xs text-zinc-300 mt-2">Baja = mejor condicion aerobica</p>
        </div>
      )}

      {/* Run list */}
      {runs.length > 0 && (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Carreras ({runs.length})</p>
          </div>
          <div className="divide-y divide-zinc-100">
            {runs.slice(0, 15).map(run => {
              const d = new Date(run.date + 'T12:00:00');
              const durationMin = run.duration_sec ? Math.round(run.duration_sec / 60) : null;
              return (
                <div key={run.id} className="px-5 py-3 flex items-center gap-4">
                  <div className="shrink-0 w-9 text-center">
                    <p className="text-xs text-zinc-300">{DAY_ES[d.getDay()]}</p>
                    <p className="text-sm font-semibold text-zinc-500">{d.getDate()}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{run.distance_km} km</p>
                      <p className="text-xs text-zinc-400">{run.type}</p>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {durationMin && `${durationMin} min`}
                      {run.avg_pace && ` · ${run.avg_pace}`}
                      {run.avg_hr && ` · ${run.avg_hr} bpm`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {runs.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-zinc-200 p-10 text-center">
          <p className="text-sm text-zinc-400">Sin carreras registradas aun</p>
          <p className="text-xs text-zinc-300 mt-1">Toca + Carrera para empezar</p>
        </div>
      )}
    </div>
  );
}
