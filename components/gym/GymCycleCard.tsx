'use client';

interface DayInfo {
  name: string;
  canRun: boolean;
  runNote: string;
}

interface Props {
  currentDay: number;
  dayInfo: DayInfo;
  todayLog: any;
  onCheckIn: (attended: boolean) => void;
  saving: boolean;
  today: string;
}

export default function GymCycleCard({ currentDay, dayInfo, todayLog, onCheckIn, saving, today }: Props) {
  const alreadyCheckedIn = todayLog?.date === today;

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Dia {currentDay} del ciclo</p>
          <h2 className="text-xl font-semibold tracking-tight">{dayInfo.name}</h2>
          <p className="text-sm text-zinc-500 mt-1">{dayInfo.runNote}</p>
        </div>
      </div>

      {alreadyCheckedIn ? (
        <div className={`rounded-xl p-4 text-center border ${todayLog.attended ? 'bg-white border-white text-zinc-900' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
          <p className="font-semibold">{todayLog.attended ? 'Sesion completada' : 'Dia de descanso registrado'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onCheckIn(true)}
            disabled={saving}
            className="bg-white hover:bg-zinc-100 disabled:opacity-40 text-zinc-900 font-semibold py-4 rounded-xl text-sm transition-colors"
          >
            Si fui
          </button>
          <button
            onClick={() => onCheckIn(false)}
            disabled={saving}
            className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-400 font-semibold py-4 rounded-xl text-sm transition-colors border border-zinc-700"
          >
            No fui
          </button>
        </div>
      )}
    </div>
  );
}
