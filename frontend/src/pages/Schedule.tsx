import { Calendar, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { useCallback, useMemo } from 'react';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import type { AuthUser } from '../lib/auth';
import { Role } from '../lib/roles';

type ScheduleProps = {
  user: AuthUser;
};

export const Schedule = ({ user }: ScheduleProps) => {
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

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>לוח זמנים אישי</h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          {user.role === Role.TRAINEE ? 'אירועים וקורסים שנרשמת אליהם' : 'כל האירועים הקרובים'}
        </p>
      </div>

      {/* Stats */}
      <div className='flex gap-3'>
        <div className='rounded-lg border border-border bg-white px-4 py-3 text-center'>
          <p className='text-xl font-bold text-foreground'>{upcoming.length}</p>
          <p className='text-xs text-muted-foreground'>אירועים קרובים</p>
        </div>
        <div className='rounded-lg border border-border bg-white px-4 py-3 text-center'>
          <p className='text-xl font-bold text-muted-foreground'>{past.length}</p>
          <p className='text-xs text-muted-foreground'>הסתיימו</p>
        </div>
        {user.role === Role.TRAINEE && (
          <div className='rounded-lg border border-border bg-white px-4 py-3 text-center'>
            <p className='text-xl font-bold text-primary'>
              {upcoming.filter((e) => e.isPersonal).length}
            </p>
            <p className='text-xs text-muted-foreground'>קשורים אליך</p>
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
          <div className='space-y-2'>
            {items.map((e) => {
              const isActive = now >= e.startDate && now <= e.endDate;
              const daysUntil = Math.ceil(
                (e.startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
              );

              return (
                <div
                  key={e.id}
                  className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${
                    isActive
                      ? 'border-primary/30 bg-primary/5'
                      : e.isPersonal
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : 'border-border bg-white'
                  }`}
                >
                  {/* Date block */}
                  <div className='flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-muted'>
                    <span className='text-lg font-bold leading-none text-foreground'>
                      {e.startDate.getDate()}
                    </span>
                    <span className='text-[10px] text-muted-foreground'>
                      {e.startDate.toLocaleDateString('he-IL', { month: 'short' })}
                    </span>
                  </div>

                  {/* Details */}
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-2'>
                      <p className='text-sm font-medium text-foreground'>{e.name}</p>
                      {e.isPersonal && (
                        <span className='rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700'>
                          שלי
                        </span>
                      )}
                      {isActive && (
                        <span className='rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary'>
                          עכשיו
                        </span>
                      )}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      {e.courseName} — {e.instanceName}
                    </p>
                    <div className='mt-1 flex items-center gap-3 text-xs text-muted-foreground'>
                      <span className='flex items-center gap-1'>
                        <Clock size={10} />
                        {e.startDate.toLocaleDateString('he-IL')} —{' '}
                        {e.endDate.toLocaleDateString('he-IL')}
                      </span>
                      {e.location && (
                        <span className='flex items-center gap-1'>
                          <MapPin size={10} />
                          {e.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Days until */}
                  <div className='text-left'>
                    {isActive ? (
                      <span className='flex items-center gap-1 text-xs font-medium text-primary'>
                        <CheckCircle2 size={14} /> מתקיים
                      </span>
                    ) : daysUntil > 0 ? (
                      <span className='text-xs text-muted-foreground'>בעוד {daysUntil} ימים</span>
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
