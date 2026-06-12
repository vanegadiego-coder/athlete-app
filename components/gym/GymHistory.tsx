'use client';

interface Props {
  history: any[];
  cycleDays: Record<number, { name: string; emoji: string }>;
}

export default function GymHistory({ history, cycleDays }: Props) {
  if (history.length === 0) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl p-6 text-center">
        <p className="text-sm text-zinc-400">Sin sesiones registradas aun</p>
      </div>
    );
  }

  const attended = history.filter(h => h.attended).length;
  const pct = Math.round((attended / history.length) * 100);

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Historial</p>
        <p className="text-sm font-semibold">{attended}/{history.length} · {pct}%</p>
      </div>

      {/* Attendance dots */}
      <div className="px-5 py-4 border-b border-zinc-100">
        <div className="flex gap-1.5 flex-wrap">
          {history.map((log) => (
            <div
              key={log.id}
              className={`w-6 h-6 rounded-md ${log.attended ? 'bg-zinc-900' : 'bg-zinc-100'}`}
              title={log.date}
            />
          ))}
        </div>
      </div>

      <div className="divide-y divide-zinc-100">
        {history.map((log) => {
          const day = cycleDays[log.cycle_day as keyof typeof cycleDays];
          const date = new Date(log.date + 'T00:00:00').toLocaleDateString('es-PA', { weekday: 'short', day: 'numeric', month: 'short' });
          return (
            <div key={log.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{day?.name || `Dia ${log.cycle_day}`}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{date}</p>
              </div>
              <span className={`text-xs font-semibold ${log.attended ? 'text-zinc-900' : 'text-zinc-300'}`}>
                {log.attended ? 'Asistio' : 'No asistio'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
