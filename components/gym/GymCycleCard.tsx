'use client';

interface DayInfo {
  name: string;
  emoji: string;
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
    <div className="bg-white border-2 border-purple-300 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl">{dayInfo.emoji}</span>
        <div>
          <p className="text-sm font-medium text-purple-600">Día {currentDay} del ciclo</p>
          <h2 className="text-xl font-bold text-gray-900">{dayInfo.name}</h2>
        </div>
      </div>

      <div className={`rounded-lg px-4 py-2 mb-5 text-sm font-medium ${dayInfo.canRun ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
        {dayInfo.runNote}
      </div>

      {alreadyCheckedIn ? (
        <div className={`rounded-xl p-4 text-center ${todayLog.attended ? 'bg-green-100 border-2 border-green-400' : 'bg-gray-100 border-2 border-gray-300'}`}>
          <p className="text-2xl mb-1">{todayLog.attended ? '✅' : '❌'}</p>
          <p className="font-bold text-lg text-gray-800">{todayLog.attended ? 'Sesión completada' : 'Día registrado como descanso'}</p>
          <p className="text-sm text-gray-500 mt-1">Registrado hoy</p>
        </div>
      ) : (
        <div>
          <p className="text-sm font-medium text-gray-600 mb-3 text-center">¿Fuiste al gym hoy?</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onCheckIn(true)}
              disabled={saving}
              className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl text-lg transition"
            >
              ✅ Sí fui
            </button>
            <button
              onClick={() => onCheckIn(false)}
              disabled={saving}
              className="bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-700 font-bold py-4 rounded-xl text-lg transition"
            >
              ❌ No fui
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
