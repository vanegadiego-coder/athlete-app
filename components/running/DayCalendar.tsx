'use client';

const GYM_DAYS: Record<number, { name: string; emoji: string; canRun: boolean }> = {
  1: { name: 'Pecho · Hombro · Tríceps', emoji: '💪', canRun: true },
  2: { name: 'Espalda · Bíceps · Core', emoji: '🔙', canRun: true },
  3: { name: 'Pierna · Movilidad', emoji: '🦵', canRun: false },
  4: { name: 'Descanso gym', emoji: '🏃', canRun: true },
};

const ZONE_COLORS: Record<string, string> = {
  'Z2 Fácil': 'text-blue-700 bg-blue-50 border-blue-200',
  'Larga Z2': 'text-blue-900 bg-blue-100 border-blue-300',
  'Intervalos': 'text-red-700 bg-red-50 border-red-200',
  'Tempo': 'text-orange-700 bg-orange-50 border-orange-200',
  'Fartlek': 'text-purple-700 bg-purple-50 border-purple-200',
  'Z3 Moderado': 'text-yellow-700 bg-yellow-50 border-yellow-200',
  'Carrera Oficial': 'text-green-700 bg-green-100 border-green-300',
};

interface Props {
  week: number;
  weekPlan: any;
  gymCycleDay: number;
  today: string;
  loggedRuns: any[];
  onLogRun: () => void;
}

function getCycleDayForDate(targetDateStr: string, todayStr: string, todayCycleDay: number): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const todayTs = new Date(todayStr + 'T12:00:00').getTime();
  const targetTs = new Date(targetDateStr + 'T12:00:00').getTime();
  const diffDays = Math.round((targetTs - todayTs) / msPerDay);
  return ((todayCycleDay - 1 + diffDays) % 4 + 4) % 4 + 1;
}

function getWeekDays(weekPlan: any): string[] {
  if (!weekPlan) return [];
  const start = new Date(weekPlan.start_date + 'T12:00:00');
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

const DAY_NAMES_ES: Record<number, string> = { 0: 'Dom', 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb' };

export default function DayCalendar({ week, weekPlan, gymCycleDay, today, loggedRuns, onLogRun }: Props) {
  const weekDays = getWeekDays(weekPlan);

  // Build a map of cycle_day → training_run for this week
  const runsByDay: Record<number, any> = {};
  if (weekPlan?.training_runs) {
    for (const run of weekPlan.training_runs) {
      runsByDay[run.cycle_day] = run;
    }
  }

  // Build a map of date → logged run
  const loggedByDate: Record<string, any> = {};
  for (const run of loggedRuns) {
    loggedByDate[run.date] = run;
  }

  // Find today's planned run
  const todayCycleDay = gymCycleDay;
  const todayPlannedRun = runsByDay[todayCycleDay];
  const gymInfo = GYM_DAYS[todayCycleDay];
  const todayLogged = loggedByDate[today];
  const todayDate = new Date(today + 'T12:00:00');
  const todayDayName = DAY_NAMES_ES[todayDate.getDay()];
  const todayDayNum = todayDate.getDate();
  const todayMonthName = todayDate.toLocaleDateString('es-PA', { month: 'long' });

  // Track which cycle days we've already assigned to avoid showing same run twice in a week
  const assignedCycleDays = new Set<number>();

  return (
    <div className="space-y-4">
      {/* TODAY card — big and prominent */}
      <div className={`rounded-xl border-2 p-5 ${todayPlannedRun ? 'bg-blue-50 border-blue-400' : 'bg-gray-100 border-gray-300'}`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">HOY</p>
            <p className="text-lg font-black text-gray-900 capitalize">
              {todayDayName} {todayDayNum} de {todayMonthName}
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl">{gymInfo.emoji}</span>
            <p className="text-xs text-gray-500 mt-0.5">Día {todayCycleDay}</p>
          </div>
        </div>

        {!gymInfo.canRun ? (
          <div className="bg-white rounded-lg px-4 py-3 border border-gray-200 text-center">
            <p className="font-semibold text-gray-700">🦵 Día de pierna — sin carrera</p>
            <p className="text-xs text-gray-400 mt-1">{gymInfo.name}</p>
          </div>
        ) : todayPlannedRun ? (
          <div>
            <div className={`rounded-lg px-4 py-3 border ${ZONE_COLORS[todayPlannedRun.type] || 'bg-white border-gray-200 text-gray-700'}`}>
              <div className="flex items-center justify-between">
                <p className="font-bold text-base">{todayPlannedRun.type}</p>
                <div className="text-right text-sm font-semibold">
                  {todayPlannedRun.duration_min > 0 && <span>{todayPlannedRun.duration_min} min</span>}
                  {todayPlannedRun.distance_km > 0 && <span className="ml-2">· {todayPlannedRun.distance_km} km</span>}
                </div>
              </div>
              <p className="text-sm mt-1 opacity-80">{todayPlannedRun.description}</p>
              <p className="text-xs mt-2 opacity-60">FC objetivo: {todayPlannedRun.fc_target}</p>
            </div>

            {todayLogged ? (
              <div className="mt-3 flex items-center gap-2 bg-green-100 rounded-lg px-3 py-2">
                <span className="text-green-600 font-bold">✓ Completado</span>
                <span className="text-sm text-green-700">
                  {todayLogged.distance_km}km · {Math.round(todayLogged.duration_sec / 60)}min
                  {todayLogged.avg_hr ? ` · ${todayLogged.avg_hr} bpm` : ''}
                </span>
              </div>
            ) : (
              <button
                onClick={onLogRun}
                className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 rounded-lg transition text-sm"
              >
                + Registrar esta carrera
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg px-4 py-3 border border-gray-200 text-center">
            <p className="text-gray-500">Sin carrera programada hoy</p>
            <p className="text-xs text-gray-400 mt-1">{gymInfo.name}</p>
          </div>
        )}
      </div>

      {/* Week view */}
      {weekDays.length > 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="font-bold text-gray-900 text-sm">
              Semana {week} — {weekPlan?.title || ''}
              {weekPlan?.is_deload ? ' · 💤 descarga' : ''}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {weekPlan?.total_km_target && `Meta: ${weekPlan.total_km_target} km`}
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {weekDays.map(dateStr => {
              const dateObj = new Date(dateStr + 'T12:00:00');
              const dayName = DAY_NAMES_ES[dateObj.getDay()];
              const dayNum = dateObj.getDate();
              const isToday = dateStr === today;
              const isPast = dateStr < today;
              const cycleDay = getCycleDayForDate(dateStr, today, gymCycleDay);
              const gym = GYM_DAYS[cycleDay];

              // Only show a planned run for each cycle_day once
              let plannedRun = null;
              if (!assignedCycleDays.has(cycleDay) && runsByDay[cycleDay]) {
                plannedRun = runsByDay[cycleDay];
                assignedCycleDays.add(cycleDay);
              }

              const logged = loggedByDate[dateStr];

              return (
                <div
                  key={dateStr}
                  className={`px-4 py-3 flex items-start gap-3 ${isToday ? 'bg-blue-50' : ''} ${isPast ? 'opacity-60' : ''}`}
                >
                  {/* Day column */}
                  <div className="shrink-0 w-10 text-center">
                    <p className={`text-xs font-bold ${isToday ? 'text-blue-600' : 'text-gray-400'}`}>{dayName}</p>
                    <p className={`text-lg font-black leading-tight ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>{dayNum}</p>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 py-0.5">
                    {!gym.canRun ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🦵</span>
                        <span className="text-sm text-gray-500">Sin carrera · {gym.name}</span>
                      </div>
                    ) : plannedRun ? (
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${ZONE_COLORS[plannedRun.type] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            {plannedRun.type}
                          </span>
                          {plannedRun.is_optional && <span className="text-xs text-gray-400">opcional</span>}
                          <span className="text-xs text-gray-500">
                            {plannedRun.duration_min > 0 ? `${plannedRun.duration_min}min` : ''} {plannedRun.distance_km > 0 ? `· ${plannedRun.distance_km}km` : ''}
                          </span>
                        </div>
                        {logged && (
                          <p className="text-xs text-green-600 font-semibold mt-1">
                            ✓ {logged.distance_km}km · {Math.round(logged.duration_sec / 60)}min
                            {logged.avg_hr ? ` · ${logged.avg_hr}bpm` : ''}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">{gym.emoji}</span>
                        <span className="text-sm text-gray-400">Gym {gym.name.split('·')[0].trim()}</span>
                        {logged && (
                          <span className="text-xs text-green-600 font-semibold ml-auto">✓ {logged.distance_km}km</span>
                        )}
                      </div>
                    )}
                  </div>

                  {isToday && <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
