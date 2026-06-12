'use client';

interface Props {
  history: any[];
  cycleDays: Record<number, { name: string }>;
}

export default function GymHistory({ history, cycleDays }: Props) {
  if (history.length === 0) {
    return (
      <div className="bg-zinc-900 border border-dashed border-zinc-800 rounded-xl p-10 text-center">
        <p className="text-sm text-zinc-600">Sin sesiones registradas aun</p>
      </div>
    );
  }

  const attended = history.filter(h => h.attended).length;
  const pct = Math.round((attended / history.length) * 100);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Historial</p>
        <p className="text-sm font-semibold">{attended}/{history.length} · {pct}%</p>
      </div>

      <div className="px-5 py-4 border-b border-zinc-800">
        <div className="flex gap-1.5 flex-wrap">
          {history.map((log) => (
            <div
              key={log.id}
              className={`w-6 h-6 rounded-md ${log.attended ? 'bg-white' : 'bg-zinc-800'}`}
              title={log.date}
            />
          ))}
        </div>
      </div>

      <div className="divide-y divide-zinc-800">
        {history.map((log) => {
          const day = cycleDays[log.cycle_day as keyof typeof cycleDays];
          const date = new Date(log.date + 'T00:00:00').toLocaleDateString('es-PA', { weekday: 'short', day: 'numeric', month: 'short' });
          return (
            <div key={log.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{day?.name || `Dia ${log.cycle_day}`}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{date}</p>
              </div>
              <span className={`text-xs font-semibold ${log.attended ? 'text-zinc-200' : 'text-zinc-700'}`}>
                {log.attended ? 'Asistio' : 'No asistio'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
