import { useCallback } from 'react';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';

const PHASE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  CANDIDACY_SUBMISSION: { bg: 'bg-amber-400', text: 'text-amber-900', border: 'border-amber-500' },
  TRYOUTS: { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-600' },
  COMMANDER_COURSE: { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-600' },
  STAFF_PREP: { bg: 'bg-orange-400', text: 'text-orange-900', border: 'border-orange-500' },
  COURSE: { bg: 'bg-indigo-500', text: 'text-white', border: 'border-indigo-600' },
  SUMMARY_WEEK: { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-600' },
  OTHER: { bg: 'bg-gray-400', text: 'text-white', border: 'border-gray-500' },
};

const PHASE_LABELS: Record<string, string> = {
  CANDIDACY_SUBMISSION: 'הגשת מועמדות',
  TRYOUTS: 'מיונים',
  COMMANDER_COURSE: 'הכשרה',
  STAFF_PREP: 'הכנת צוות',
  COURSE: 'הקורס',
  SUMMARY_WEEK: 'סיכומים',
  OTHER: 'אחר',
};

export const Gantt = () => {
  const fetcher = useCallback(() => api.getGantt(), []);
  const { data: instances, loading } = useApi(fetcher);

  if (loading) return <LoadingSpinner />;

  const withPhases = instances?.filter((i) => i.phases.length > 0) ?? [];

  if (withPhases.length === 0) {
    return (
      <div className='space-y-6'>
        <h1 className='text-2xl font-bold text-foreground'>גאנט קורסים</h1>
        <p className='text-sm text-muted-foreground'>אין מחזורים פעילים עם שלבים מוגדרים</p>
      </div>
    );
  }

  const allPhases = withPhases.flatMap((i) => i.phases);
  const minDate = new Date(Math.min(...allPhases.map((p) => new Date(p.startDate).getTime())));
  const maxDate = new Date(Math.max(...allPhases.map((p) => new Date(p.endDate).getTime())));

  const paddingDays = 7;
  minDate.setDate(minDate.getDate() - paddingDays);
  maxDate.setDate(maxDate.getDate() + paddingDays);

  const totalDays = Math.max(1, (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));

  const getLeft = (dateStr: string) => {
    const d = new Date(dateStr);
    return ((d.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24) / totalDays) * 100;
  };

  const getWidth = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    return Math.max(3, ((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24) / totalDays) * 100);
  };

  const todayLeft = getLeft(new Date().toISOString());
  const showToday = todayLeft >= 0 && todayLeft <= 100;

  const months: { label: string; left: number }[] = [];
  const current = new Date(minDate);
  current.setDate(1);
  while (current <= maxDate) {
    const left = getLeft(current.toISOString());
    if (left >= 0 && left <= 100) {
      months.push({
        label: current.toLocaleDateString('he-IL', { month: 'long', year: '2-digit' }),
        left,
      });
    }
    current.setMonth(current.getMonth() + 1);
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>גאנט קורסים</h1>
        <p className='mt-1 text-sm text-muted-foreground'>לוח זמנים — קורסים ומחזורים פעילים</p>
      </div>

      {/* Legend */}
      <div className='flex flex-wrap gap-4'>
        {Object.entries(PHASE_LABELS).map(([key, label]) => (
          <div key={key} className='flex items-center gap-1.5'>
            <div className={`h-3 w-6 rounded-sm ${PHASE_COLORS[key].bg}`} />
            <span className='text-xs text-muted-foreground'>{label}</span>
          </div>
        ))}
      </div>

      <div className='overflow-x-auto rounded-xl border border-border bg-white shadow-sm'>
        <div className='min-w-[800px] p-6'>
          {/* Month headers */}
          <div className='relative mb-1 h-8 border-b border-border'>
            {months.map((m, i) => (
              <div
                key={i}
                className='absolute top-0 h-full border-r border-border/30'
                style={{ left: `${m.left}%` }}
              >
                <span className='absolute -top-0.5 pr-2 text-xs font-medium text-muted-foreground'>
                  {m.label}
                </span>
              </div>
            ))}
          </div>

          {/* Grid lines */}
          <div className='relative'>
            {/* Vertical grid lines for months */}
            {months.map((m, i) => (
              <div
                key={i}
                className='absolute top-0 h-full border-r border-dashed border-border/20'
                style={{ left: `${m.left}%` }}
              />
            ))}

            {/* Today indicator */}
            {showToday && (
              <div
                className='absolute top-0 z-20 h-full w-0.5 bg-red-400'
                style={{ left: `${todayLeft}%` }}
              >
                <div className='absolute -top-5 -translate-x-1/2 rounded bg-red-400 px-1.5 py-0.5 text-[10px] font-medium text-white'>
                  היום
                </div>
              </div>
            )}

            {/* Courses */}
            <div className='space-y-1 py-2'>
              {withPhases.map((inst) => (
                <div key={inst.id} className='group'>
                  {/* Course header row */}
                  <div className='flex items-center gap-2 py-2'>
                    <div className='w-44 shrink-0 text-right'>
                      <p className='text-sm font-semibold text-foreground'>{inst.course.name}</p>
                      <p className='text-xs text-muted-foreground'>{inst.name}</p>
                    </div>
                    <div className='relative h-9 flex-1'>
                      {inst.phases.map((phase) => {
                        const left = getLeft(phase.startDate);
                        const width = getWidth(phase.startDate, phase.endDate);
                        const colors = PHASE_COLORS[phase.phaseType] ?? PHASE_COLORS.OTHER;
                        const startStr = new Date(phase.startDate).toLocaleDateString('he-IL', {
                          day: 'numeric',
                          month: 'numeric',
                        });
                        const endStr = new Date(phase.endDate).toLocaleDateString('he-IL', {
                          day: 'numeric',
                          month: 'numeric',
                        });

                        return (
                          <div
                            key={phase.id}
                            className={`absolute top-0.5 h-8 rounded-md border ${colors.bg} ${colors.border} ${colors.text} flex cursor-default items-center justify-center overflow-hidden shadow-sm transition-all hover:shadow-md hover:brightness-110`}
                            style={{ left: `${left}%`, width: `${width}%` }}
                            title={`${phase.name}\n${startStr} — ${endStr}`}
                          >
                            <span className='truncate px-1.5 text-[11px] font-medium leading-tight'>
                              {phase.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Phase details on hover */}
                  <div className='mr-44 hidden pb-2 group-hover:block'>
                    <div className='flex flex-wrap gap-2'>
                      {inst.phases.map((phase) => {
                        const colors = PHASE_COLORS[phase.phaseType] ?? PHASE_COLORS.OTHER;
                        return (
                          <span
                            key={phase.id}
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] ${colors.border} bg-white`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${colors.bg}`} />
                            {phase.name}:{' '}
                            {new Date(phase.startDate).toLocaleDateString('he-IL', {
                              day: 'numeric',
                              month: 'numeric',
                            })}{' '}
                            —{' '}
                            {new Date(phase.endDate).toLocaleDateString('he-IL', {
                              day: 'numeric',
                              month: 'numeric',
                            })}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className='border-b border-border/10' />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
