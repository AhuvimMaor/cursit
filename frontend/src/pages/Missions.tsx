import { CheckCircle2, Clock, Users } from 'lucide-react';
import { useCallback, useMemo } from 'react';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { ProgressBar } from '../components/ProgressBar';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';

export const Missions = () => {
  const fetchMissions = useCallback(() => api.getMissions(), []);
  const fetchScores = useCallback(() => api.getScores(), []);
  const fetchStudents = useCallback(() => api.getStudents(), []);
  const { data: missions, loading: l1 } = useApi(fetchMissions);
  const { data: scores, loading: l2 } = useApi(fetchScores);
  const { data: students, loading: l3 } = useApi(fetchStudents);

  const enriched = useMemo(() => {
    if (!missions || !scores || !students) return [];
    return missions.map((m) => {
      const missionScores = scores.filter((sc) => sc.missionId === m.id);
      const avg =
        missionScores.length > 0
          ? Math.round(missionScores.reduce((sum, sc) => sum + sc.score, 0) / missionScores.length)
          : 0;
      const highest =
        missionScores.length > 0 ? Math.max(...missionScores.map((sc) => sc.score)) : 0;
      const lowest =
        missionScores.length > 0 ? Math.min(...missionScores.map((sc) => sc.score)) : 0;
      return {
        ...m,
        avg,
        highest,
        lowest,
        submissions: missionScores.length,
        totalStudents: students.length,
      };
    });
  }, [missions, scores, students]);

  if (l1 || l2 || l3) return <LoadingSpinner />;

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>משימות</h1>
        <p className='mt-1 text-sm text-muted-foreground'>{enriched.length} מטלות</p>
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        {enriched.map((m) => {
          const completionPct = Math.round((m.submissions / m.totalStudents) * 100);
          const isComplete = m.submissions === m.totalStudents;

          return (
            <div
              key={m.id}
              className='rounded-xl border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md'
            >
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <h3 className='text-base font-semibold text-foreground'>{m.title}</h3>
                    {isComplete && <CheckCircle2 size={16} className='text-emerald-500' />}
                  </div>
                  <p className='mt-1 text-sm text-muted-foreground'>{m.description}</p>
                </div>
                <span className='mr-3 shrink-0 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary'>
                  {m.maxScore} נק׳
                </span>
              </div>

              <div className='mt-4'>
                <div className='mb-2 flex items-center justify-between text-xs text-muted-foreground'>
                  <span className='flex items-center gap-1'>
                    <Users size={12} />
                    {m.submissions}/{m.totalStudents} הוגשו
                  </span>
                  <span>{completionPct}%</span>
                </div>
                <ProgressBar value={m.submissions} max={m.totalStudents} />
              </div>

              {m.submissions > 0 && (
                <div className='mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4'>
                  <div className='text-center'>
                    <p className='text-lg font-bold text-foreground'>{m.avg}</p>
                    <p className='text-xs text-muted-foreground'>ממוצע</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-lg font-bold text-emerald-600'>{m.highest}</p>
                    <p className='text-xs text-muted-foreground'>הגבוה</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-lg font-bold text-red-500'>{m.lowest}</p>
                    <p className='text-xs text-muted-foreground'>הנמוך</p>
                  </div>
                </div>
              )}

              {m.submissions === 0 && (
                <div className='mt-4 flex items-center gap-1.5 border-t border-border pt-4 text-xs text-muted-foreground'>
                  <Clock size={12} />
                  אין הגשות עדיין
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
