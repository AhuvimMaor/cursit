import { CalendarRange } from 'lucide-react';
import { useCallback, useMemo } from 'react';

import {
  CourseInstancePhasesPanel,
  PHASE_COLORS,
  PHASE_TYPE_LABELS,
} from '../components/CourseInstancePhasesPanel';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ScreenGuide } from '../components/ScreenGuide';
import { useApi } from '../hooks/useApi';
import type { CoursePhase } from '../lib/api';
import { api } from '../lib/api';
import type { AuthUser } from '../lib/auth';
import { Role } from '../lib/roles';

type GanttProps = {
  user: AuthUser;
  embedded?: boolean;
};

export const Gantt = ({ user, embedded }: GanttProps) => {
  const fetcher = useCallback(() => api.getGantt(), []);
  const { data: instances, loading, refetch } = useApi(fetcher);
  const isAdmin = user.role === Role.BIS_CDR;

  const usedPhaseTypes = useMemo(() => {
    const s = new Set<string>();
    for (const inst of instances ?? []) {
      for (const p of inst.phases) s.add(p.phaseType);
    }
    return [...s].sort();
  }, [instances]);

  if (loading) return <LoadingSpinner />;

  const allInstances = instances ?? [];
  const withPhases = allInstances.filter((i) => i.phases.length > 0);
  const withoutPhases = isAdmin ? allInstances.filter((i) => i.phases.length === 0) : [];

  if (allInstances.length === 0) {
    return (
      <div className={embedded ? 'space-y-2' : 'space-y-6'}>
        {!embedded && (
          <ScreenGuide
            eyebrow='תכנון'
            title='גאנט קורסים'
            subtitle='אין עדיין מחזורים עם שלבים להצגה.'
            tags={['שלבים', 'מחזורים']}
          />
        )}
        <p className='text-sm text-muted-foreground'>אין מחזורים פעילים</p>
      </div>
    );
  }

  return (
    <div className={embedded ? 'space-y-4' : 'space-y-6'}>
      {!embedded && (
        <ScreenGuide
          eyebrow='תכנון'
          title='גאנט קורסים'
          subtitle='לכל קורס כרטיס; השלבים בתוך הכרטיס בריבועים - קל לעבור עליהם ולהשוות.'
          tags={
            isAdmin
              ? (['מחזורים', 'עריכת שלבים', 'צבעי סוג'] as const)
              : (['מחזורים', 'קריאה בלבד', 'צבעי סוג'] as const)
          }
        />
      )}

      {embedded && usedPhaseTypes.length > 0 && (
        <div
          className='rounded-xl border border-border bg-slate-50/90 px-3 py-2.5 sm:px-4'
          aria-label='מפת צבעים לסוגי שלבים'
        >
          <p className='mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground'>
            סוגי שלבים
          </p>
          <div className='flex flex-wrap gap-x-4 gap-y-2'>
            {usedPhaseTypes.map((t) => (
              <span key={t} className='flex items-center gap-1.5 text-xs text-foreground'>
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-sm ${PHASE_COLORS[t] ?? 'bg-gray-400'}`}
                />
                {PHASE_TYPE_LABELS[t] ?? t}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        {withPhases.map((inst) => (
          <CourseGanttCard key={inst.id} inst={inst} isAdmin={isAdmin} onRefresh={refetch} />
        ))}

        {withoutPhases.length > 0 && (
          <div className='lg:col-span-2'>
            <h2 className='mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
              מחזורים ללא שלבים
            </h2>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              {withoutPhases.map((inst) => (
                <CourseGanttCard key={inst.id} inst={inst} isAdmin={isAdmin} onRefresh={refetch} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

type CourseGanttCardProps = {
  inst: { id: number; name: string; course: { name: string }; phases: CoursePhase[] };
  isAdmin: boolean;
  onRefresh: () => void;
};

function CourseGanttCard({ inst, isAdmin, onRefresh }: CourseGanttCardProps) {
  return (
    <article className='flex flex-col rounded-2xl border border-border bg-white shadow-sm ring-1 ring-black/[0.02]'>
      <header className='flex flex-wrap items-start justify-between gap-2 border-b border-border/80 bg-slate-50/60 px-4 py-3'>
        <div className='min-w-0 flex-1'>
          <p className='text-[11px] font-medium text-muted-foreground'>מחזור</p>
          <h3 className='text-base font-bold leading-tight text-foreground'>{inst.course.name}</h3>
          <p className='mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground'>
            <CalendarRange size={12} className='shrink-0 opacity-70' />
            <span className='rounded-md bg-white px-1.5 py-0.5 font-medium text-foreground ring-1 ring-border'>
              {inst.name}
            </span>
          </p>
        </div>
      </header>

      <div className='flex flex-1 flex-col gap-3 p-4'>
        <CourseInstancePhasesPanel
          instanceId={inst.id}
          phases={inst.phases}
          isAdmin={isAdmin}
          onRefresh={onRefresh}
          showSectionTitles={false}
        />
      </div>
    </article>
  );
}
