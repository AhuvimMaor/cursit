import { Calendar, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { useCallback, useMemo } from 'react';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { ScreenGuide } from '../components/ScreenGuide';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import type { AuthUser } from '../lib/auth';
import { Role } from '../lib/roles';

type ScheduleProps = {
  user: AuthUser;
  /** כשמוצג בתוך ״קורסים ולוחות״ — בלי כותרת כפולה */
  embedded?: boolean;
};

export const Schedule = ({ user, embedded }: ScheduleProps) => {
  const fetchGantt = useCallback(() => api.getGantt(), []);
  const fetchRegs = useCallback(
    () => (user.role === Role.TRAINEE ? api.getMyRegistrations() : Promise.resolve([])),
    [user.role],
  );
  const { data: gantt, loading: l1 } = useApi(fetchGantt);
  const { data: regs, loading: l2 } = useApi(fetchRegs);

  const events = useMemo(() => {
    if (!gantt) return [];

    const registeredInstanceIds = new Set(
      regs
        ?.filter(
          (r) =>
            r.status === 'APPROVED' || r.status === 'PENDING_COORD' || r.status === 'PENDING_BIS',
        )
        .map((r) => r.courseInstanceId) ?? [],
    );

    const allEvents = gantt.flatMap((inst) =>
      inst.phases.map((p) => ({
        id: p.id,
        name: p.name,
        courseName: inst.course.name,
        instanceName: inst.name,
        startDate: new Date(p.startDate),
        endDate: new Date(p.endDate),
        location: inst.course.location,
        isPersonal: registeredInstanceIds.has(inst.id),
        phaseType: p.phaseType,
      })),
    );

    return allEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }, [gantt, regs]);

  if (l1 || l2) return <LoadingSpinner />;

  const now = new Date();
  const upcoming = events.filter((e) => e.endDate >= now);
  const past = events.filter((e) => e.endDate < now);

  const groupByMonth = (items: typeof events) => {
    const groups: Record<string, typeof events> = {};
    for (const e of items) {
      const key = e.startDate.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    }
    return groups;
  };

  const upcomingByMonth = groupByMonth(upcoming);

  const scheduleTags =
    user.role === Role.TRAINEE
      ? (['לפי תאריך', 'שלי', 'מחזורים'] as const)
      : (['כל המחזורים', 'חודשים', 'גאנט לעריכה'] as const);

  return (
    <div className={embedded ? 'space-y-4' : 'space-y-6'}>
      {!embedded && (
        <ScreenGuide
          eyebrow='לוחות'
          title='לוח זמנים'
          subtitle={
            user.role === Role.TRAINEE
              ? 'מועדים מהמחזורים שאליהם נרשמת - מסודרים לפי חודש.'
              : 'כל השלבים במערכת - לפי חודש.'
          }
          tags={scheduleTags}
        />
      )}

      {/* סיכומים — ריבועים שווים */}
      <div className={`grid gap-3 ${user.role === Role.TRAINEE ? 'grid-cols-3' : 'grid-cols-2'}`}>
        <div className='flex min-h-[5.5rem] flex-col justify-center rounded-xl border border-border bg-white px-3 py-3 text-center shadow-sm'>
          <p className='text-2xl font-bold tabular-nums text-foreground'>{upcoming.length}</p>
          <p className='mt-1 text-[11px] font-medium leading-tight text-muted-foreground'>
            אירועים קרובים
          </p>
        </div>
        <div className='flex min-h-[5.5rem] flex-col justify-center rounded-xl border border-border bg-white px-3 py-3 text-center shadow-sm'>
          <p className='text-2xl font-bold tabular-nums text-muted-foreground'>{past.length}</p>
          <p className='mt-1 text-[11px] font-medium leading-tight text-muted-foreground'>
            הסתיימו
          </p>
        </div>
        {user.role === Role.TRAINEE && (
          <div className='flex min-h-[5.5rem] flex-col justify-center rounded-xl border border-emerald-200/80 bg-emerald-50/60 px-3 py-3 text-center shadow-sm'>
            <p className='text-2xl font-bold tabular-nums text-emerald-700'>
              {upcoming.filter((e) => e.isPersonal).length}
            </p>
            <p className='mt-1 text-[11px] font-medium leading-tight text-emerald-800/80'>
              קשורים אליך
            </p>
          </div>
        )}
      </div>

      {/* Timeline */}
      {Object.entries(upcomingByMonth).map(([month, items]) => (
        <div key={month}>
          <h2 className='mb-3 flex items-center gap-2 text-sm font-semibold text-foreground'>
            <Calendar size={16} className='text-primary' />
            {month}
          </h2>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'>
            {items.map((e) => {
              const isActive = now >= e.startDate && now <= e.endDate;
              const daysUntil = Math.ceil(
                (e.startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
              );

              return (
                <div
                  key={e.id}
                  className={`flex flex-col rounded-xl border p-4 text-right transition-colors ${
                    isActive
                      ? 'border-primary/30 bg-primary/5'
                      : e.isPersonal
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : 'border-border bg-white shadow-sm'
                  }`}
                >
                  <div className='mb-3 flex items-start justify-between gap-2'>
                    <div className='flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-muted'>
                      <span className='text-base font-bold leading-none text-foreground'>
                        {e.startDate.getDate()}
                      </span>
                      <span className='text-[10px] text-muted-foreground'>
                        {e.startDate.toLocaleDateString('he-IL', { month: 'short' })}
                      </span>
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-sm font-semibold text-foreground leading-snug'>{e.name}</p>
                      <p className='mt-0.5 text-xs text-muted-foreground leading-snug'>
                        {e.courseName}
                      </p>
                      <p className='text-[11px] text-muted-foreground'>{e.instanceName}</p>
                    </div>
                  </div>
                  <div className='mt-auto flex flex-wrap items-center gap-1.5'>
                    {e.isPersonal && (
                      <span className='rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700'>
                        שלי
                      </span>
                    )}
                    {isActive && (
                      <span className='rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary'>
                        עכשיו
                      </span>
                    )}
                  </div>
                  <div className='mt-3 space-y-1 border-t border-border/60 pt-3 text-xs text-muted-foreground'>
                    <p className='flex items-center gap-1'>
                      <Clock size={12} className='shrink-0' />
                      {e.startDate.toLocaleDateString('he-IL')} -{' '}
                      {e.endDate.toLocaleDateString('he-IL')}
                    </p>
                    {e.location && (
                      <p className='flex items-center gap-1'>
                        <MapPin size={12} className='shrink-0' />
                        {e.location}
                      </p>
                    )}
                    {isActive ? (
                      <p className='flex items-center gap-1 font-medium text-primary'>
                        <CheckCircle2 size={14} /> מתקיים
                      </p>
                    ) : daysUntil > 0 ? (
                      <p>בעוד {daysUntil} ימים</p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {upcoming.length === 0 && (
        <div className='rounded-xl border border-border bg-white p-8 text-center shadow-sm'>
          <p className='text-sm text-muted-foreground'>אין אירועים קרובים</p>
        </div>
      )}
    </div>
  );
};
