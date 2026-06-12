'use client';

import { useState } from 'react';

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
  onChangeDay: (day: number) => void;
  saving: boolean;
  today: string;
}

const ALL_DAYS: Record<number, string> = {
  1: 'Pecho · Hombro · Triceps',
  2: 'Espalda · Biceps · Core',
  3: 'Pierna · Movilidad',
  4: 'Descanso gym',
};

export default function GymCycleCard({ currentDay, dayInfo, todayLog, onCheckIn, onChangeDay, saving, today }: Props) {
  const alreadyCheckedIn = todayLog?.date === today;
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Dia {currentDay} del ciclo</p>
          <h2 className="text-xl font-semibold tracking-tight">{dayInfo.name}</h2>
          <p className="text-sm text-zinc-400 mt-1">{dayInfo.runNote}</p>
        </div>
        {!alreadyCheckedIn && (
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="text-xs text-zinc-400 hover:text-zinc-700 underline underline-offset-2 transition-colors shrink-0 ml-4 mt-1"
          >
            Corregir
          </button>
        )}
      </div>

      {showPicker && (
        <div className="mb-5 border border-zinc-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-zinc-500 mb-3 uppercase tracking-wider">En que dia del ciclo estas hoy?</p>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map(d => (
              <button
                key={d}
                onClick={() => { onChangeDay(d); setShowPicker(false); }}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold text-left transition-colors ${
                  d === currentDay
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                Dia {d} — {ALL_DAYS[d].split(' · ')[0]}
              </button>
            ))}
          </div>
          <button onClick={() => setShowPicker(false)} className="text-xs text-zinc-400 mt-3 w-full text-center">Cancelar</button>
        </div>
      )}

      {alreadyCheckedIn ? (
        <div className={`rounded-xl p-4 text-center border ${todayLog.attended ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-zinc-50 border-zinc-200'}`}>
          <p className="font-semibold">{todayLog.attended ? 'Sesion completada' : 'Dia de descanso registrado'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onCheckIn(true)}
            disabled={saving}
            className="bg-zinc-900 hover:bg-zinc-700 disabled:opacity-40 text-white font-semibold py-4 rounded-xl text-sm transition-colors"
          >
            Si fui
          </button>
          <button
            onClick={() => onCheckIn(false)}
            disabled={saving}
            className="bg-zinc-50 hover:bg-zinc-100 disabled:opacity-40 text-zinc-600 font-semibold py-4 rounded-xl text-sm transition-colors"
          >
            No fui
          </button>
        </div>
      )}
    </div>
  );
}
