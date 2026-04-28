import { useCallback } from 'react';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';

const PHASE_COLORS: Record<string, string> = {
  CANDIDACY_SUBMISSION: 'bg-yellow-400',
  TRYOUTS: 'bg-blue-500',
  COMMANDER_COURSE: 'bg-green-500',
  STAFF_PREP: 'bg-orange-400',
  COURSE: 'bg-red-500',
  SUMMARY_WEEK: 'bg-purple-500',
  OTHER: 'bg-gray-400',
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
  if (!instances || instances.length === 0) {
    return (
      <div className='space-y-6'>
        <h1 className='text-2xl font-bold text-foreground'>גאנט קורסים</h1>
        <p className='text-sm text-muted-foreground'>אין מחזורים פעילים</p>
      </div>
    );
  }

  const allPhases = instances.flatMap((i) => i.phases);
  const minDate =
    allPhases.length > 0
      ? new Date(Math.min(...allPhases.map((p) => new Date(p.startDate).getTime())))
      : new Date();
  const maxDate =
    allPhases.length > 0
      ? new Date(Math.max(...allPhases.map((p) => new Date(p.endDate).getTime())))
      : new Date();
  const totalDays = Math.max(1, (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));

  const getPosition = (dateStr: string) => {
    const d = new Date(dateStr);
    return ((d.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24) / totalDays) * 100;
  };

  const getWidth = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    return Math.max(2, ((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24) / totalDays) * 100);
  };

  const months: { label: string; left: number }[] = [];
  const current = new Date(minDate);
  current.setDate(1);
  while (current <= maxDate) {
    const left = getPosition(current.toISOString());
    if (left >= 0 && left <= 100) {
      months.push({
        label: current.toLocaleDateString('he-IL', { month: 'short', year: '2-digit' }),
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
      <div className='flex flex-wrap gap-3'>
        {Object.entries(PHASE_LABELS).map(([key, label]) => (
          <div key={key} className='flex items-center gap-1.5'>
            <div className={`h-3 w-3 rounded-full ${PHASE_COLORS[key]}`} />
            <span className='text-xs text-muted-foreground'>{label}</span>
          </div>
        ))}
      </div>

      <div className='rounded-xl border border-border bg-white p-6 shadow-sm'>
        {/* Month headers */}
        <div className='relative mb-2 h-6 border-b border-border'>
          {months.map((m, i) => (
            <span
              key={i}
              className='absolute text-xs text-muted-foreground'
              style={{ right: `${m.left}%` }}
            >
              {m.label}
            </span>
          ))}
        </div>

        {/* Courses */}
        <div className='space-y-6 pt-2'>
          {instances.map((inst) => (
            <div key={inst.id}>
              <div className='mb-2 flex items-center gap-2'>
                <h3 className='text-sm font-semibold text-foreground'>{inst.course.name}</h3>
                <span className='rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground'>
                  {inst.name}
                </span>
              </div>

              {inst.phases.length === 0 ? (
                <p className='py-2 text-xs text-muted-foreground'>אין שלבים מוגדרים</p>
              ) : (
                <div className='relative h-10'>
                  {inst.phases.map((phase) => {
                    const right = getPosition(phase.startDate);
                    const width = getWidth(phase.startDate, phase.endDate);
                    return (
                      <div
                        key={phase.id}
                        className={`group absolute top-1 h-8 rounded-md ${PHASE_COLORS[phase.phaseType] ?? 'bg-gray-400'} flex cursor-default items-center justify-center overflow-hidden shadow-sm transition-shadow hover:shadow-md`}
                        style={{ right: `${right}%`, width: `${width}%` }}
                        title={`${phase.name}: ${new Date(phase.startDate).toLocaleDateString('he-IL')} — ${new Date(phase.endDate).toLocaleDateString('he-IL')}`}
                      >
                        <span className='truncate px-1 text-xs font-medium text-white'>
                          {phase.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
