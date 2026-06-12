'use client';

interface Props {
  history: any[];
  cycleDays: Record<number, { name: string; emoji: string }>;
}

export default function GymHistory({ history, cycleDays }: Props) {
  if (history.length === 0) {
    return (
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center">
        <p className="text-gray-400">No hay sesiones registradas aún.</p>
      </div>
    );
  }

  const attended = history.filter(h => h.attended).length;
  const total = history.length;
  const percentage = Math.round((attended / total) * 100);

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">📅 Historial reciente</h3>
        <span className="text-sm font-semibold text-purple-700">{attended}/{total} sesiones · {percentage}%</span>
      </div>

      <div className="space-y-2">
        {history.map((log) => {
          const day = cycleDays[log.cycle_day as keyof typeof cycleDays];
          const date = new Date(log.date + 'T00:00:00').toLocaleDateString('es-PA', { weekday: 'short', day: 'numeric', month: 'short' });
          return (
            <div key={log.id} className={`flex items-center justify-between p-3 rounded-lg ${log.attended ? 'bg-green-50' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <span className="text-lg">{log.attended ? '✅' : '❌'}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{day?.emoji} {day?.name}</p>
                  <p className="text-xs text-gray-500">{date}</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${log.attended ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                Día {log.cycle_day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
