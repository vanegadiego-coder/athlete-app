'use client';

const GYM_DAYS: Record<number, { name: string; canRun: boolean; note: string }> = {
  1: { name: 'Pecho · Hombro · Triceps', canRun: true, note: 'Intervalos o Tempo' },
  2: { name: 'Espalda · Biceps · Core', canRun: true, note: 'Z2 opcional' },
  3: { name: 'Pierna · Movilidad', canRun: false, note: 'Sin carrera' },
  4: { name: 'Descanso gym', canRun: true, note: 'Carrera larga obligatoria' },
};

const DAY_ES: Record<number, string> = { 0: 'Dom', 1: 'Lun', 2: 'Mar', 3: 'Mie', 4: 'Jue', 5: 'Vie', 6: 'Sab' };
const MONTH_ES: Record<number, string> = { 0:'ene',1:'feb',2:'mar',3:'abr',4:'may',5:'jun',6:'jul',7:'ago',8:'sep',9:'oct',10:'nov',11:'dic' };

function getCycleDay(targetStr: string, todayStr: string, todayCycle: number): number {
  const diff = Math.round((new Date(targetStr + 'T12:00:00').getTime() - new Date(todayStr + 'T12:00:00').getTime()) / 86400000);
  return ((todayCycle - 1 + diff) % 4 + 4) % 4 + 1;
}

function getWeekDays(plan: any): string[] {
  if (!plan?.start_date) return [];
  const start = new Date(plan.start_date + 'T12:00:00');
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start); d.setDate(start.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

interface Props {
  week: number;
  weekPlan: any;
  gymCycleDay: number;
  today: string;
  loggedRuns: any[];
  onLogRun: () => void;
}

export default function DayCalendar({ week, weekPlan, gymCycleDay, today, loggedRuns, onLogRun }: Props) {
  const weekDays = getWeekDays(weekPlan);
  const runsByDay: Record<number, any> = {};
  if (weekPlan?.training_runs) {
    for (const r of weekPlan.training_runs) runsByDay[r.cycle_day] = r;
  }
  const loggedByDate: Record<string, any> = {};
  for (const r of loggedRuns) loggedByDate[r.date] = r;

  const todayGym = GYM_DAYS[gymCycleDay];
  const todayPlanned = runsByDay[gymCycleDay];
  const todayLogged = loggedByDate[today];
  const todayObj = new Date(today + 'T12:00:00');

  const assignedDays = new Set<number>();

  return (
    <div className="space-y-3">
      {/* TODAY card */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Hoy</p>
            <p className="text-xl font-semibold tracking-tight mt-0.5 capitalize">
              {DAY_ES[todayObj.getDay()]} {todayObj.getDate()} {MONTH_ES[todayObj.getMonth()]}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-400">Dia {gymCycleDay} del ciclo</p>
            <p className="text-xs text-zinc-300 mt-0.5">{todayGym.name}</p>
          </div>
        </div>

        {!todayGym.canRun ? (
          <div className="border border-zinc-100 rounded-xl px-4 py-3">
            <p className="text-sm font-medium text-zinc-500">Dia de pierna — sin carrera programada</p>
          </div>
        ) : todayPlanned ? (
          <div>
            <div className="border border-zinc-200 rounded-xl px-4 py-3 mb-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold">{todayPlanned.type}</p>
                <p className="text-sm text-zinc-400">
                  {todayPlanned.duration_min > 0 && `${todayPlanned.duration_min} min`}
                  {todayPlanned.distance_km > 0 && ` · ${todayPlanned.distance_km} km`}
                </p>
              </div>
              <p className="text-xs text-zinc-400">{todayPlanned.description}</p>
              <p className="text-xs text-zinc-300 mt-1.5">FC: {todayPlanned.fc_target}</p>
            </div>

            {todayLogged ? (
              <div className="bg-zinc-900 rounded-xl px-4 py-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Completado</p>
                <p className="text-xs text-zinc-400">
                  {todayLogged.distance_km} km · {Math.round(todayLogged.duration_sec / 60)} min
                  {todayLogged.avg_hr ? ` · ${todayLogged.avg_hr} bpm` : ''}
                </p>
              </div>
            ) : (
              <button onClick={onLogRun} className="w-full bg-zinc-900 hover:bg-zinc-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                Registrar carrera
              </button>
            )}
          </div>
        ) : (
          <div className="border border-zinc-100 rounded-xl px-4 py-3">
            <p className="text-sm text-zinc-400">Sin carrera programada para este dia</p>
          </div>
        )}
      </div>

      {/* Week view */}
      {weekDays.length > 0 && (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-100 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Semana {week}{weekPlan?.title ? ` — ${weekPlan.title}` : ''}</p>
            {weekPlan?.total_km_target && <p className="text-xs text-zinc-400">Meta {weekPlan.total_km_target} km</p>}
          </div>

          <div className="divide-y divide-zinc-100">
            {weekDays.map(dateStr => {
              const d = new Date(dateStr + 'T12:00:00');
              const isToday = dateStr === today;
              const isPast = dateStr < today;
              const cycleDay = getCycleDay(dateStr, today, gymCycleDay);
              const gym = GYM_DAYS[cycleDay];
              let planned = null;
              if (!assignedDays.has(cycleDay) && runsByDay[cycleDay]) {
                planned = runsByDay[cycleDay];
                assignedDays.add(cycleDay);
              }
              const logged = loggedByDate[dateStr];

              return (
                <div key={dateStr} className={`px-5 py-3 flex items-start gap-4 ${isToday ? 'bg-zinc-50' : ''}`}>
                  <div className="shrink-0 w-9 text-center pt-0.5">
                    <p className={`text-xs ${isToday ? 'text-zinc-900 font-bold' : 'text-zinc-300'}`}>{DAY_ES[d.getDay()]}</p>
                    <p className={`text-base font-bold leading-tight ${isToday ? 'text-zinc-900' : isPast ? 'text-zinc-300' : 'text-zinc-600'}`}>{d.getDate()}</p>
                  </div>

                  <div className="flex-1 min-w-0 py-0.5">
                    {!gym.canRun ? (
                      <p className="text-sm text-zinc-300">Sin carrera · {gym.name.split(' · ')[0]}</p>
                    ) : planned ? (
                      <div>
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${isPast && !logged ? 'text-zinc-300' : 'text-zinc-700'}`}>{planned.type}</p>
                          <p className={`text-xs ${isPast && !logged ? 'text-zinc-200' : 'text-zinc-400'}`}>
                            {planned.duration_min > 0 ? `${planned.duration_min}min` : ''}{planned.distance_km > 0 ? ` · ${planned.distance_km}km` : ''}
                            {planned.is_optional ? ' · opcional' : ''}
                          </p>
                        </div>
                        {logged && (
                          <p className="text-xs text-zinc-500 font-medium mt-0.5">
                            {logged.distance_km} km · {Math.round(logged.duration_sec / 60)} min{logged.avg_hr ? ` · ${logged.avg_hr} bpm` : ''}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-300">{gym.name.split(' · ')[0]}</p>
                    )}
                  </div>

                  {isToday && <div className="w-1 h-1 rounded-full bg-zinc-900 shrink-0 mt-2" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
