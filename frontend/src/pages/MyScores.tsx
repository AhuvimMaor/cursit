import { Award, BookOpen, CheckCircle2, TrendingUp } from 'lucide-react';
import { useCallback } from 'react';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { ProgressBar } from '../components/ProgressBar';
import { ScoreBadge } from '../components/ScoreBadge';
import { StatCard } from '../components/StatCard';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import type { AuthUser } from '../lib/auth';

type MyScoresProps = {
  user: AuthUser;
};

export const MyScores = ({ user }: MyScoresProps) => {
  const fetcher = useCallback(() => api.getStudent(user.id), [user.id]);
  const fetchMissions = useCallback(() => api.getMissions(), []);
  const { data: student, loading: l1 } = useApi(fetcher);
  const { data: allMissions, loading: l2 } = useApi(fetchMissions);

  if (l1 || l2) return <LoadingSpinner />;
  if (!student || !allMissions) return null;

  const totalEarned = student.scores.reduce((sum, sc) => sum + sc.score, 0);
  const totalPossible = student.scores.reduce((sum, sc) => sum + sc.mission.maxScore, 0);
  const avg = student.scores.length > 0 ? Math.round(totalEarned / student.scores.length) : 0;
  const overallPct = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
  const completedCount = student.scores.length;
  const totalMissions = allMissions.length;

  const missionsWithScore = allMissions.map((m) => {
    const sc = student.scores.find((s) => s.mission.id === m.id);
    return { ...m, score: sc ?? null };
  });

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>הציונים שלי</h1>
        <p className='mt-1 text-sm text-muted-foreground'>מעקב התקדמות אישית</p>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          title='ציון ממוצע'
          value={avg}
          subtitle='על פני כל המשימות'
          icon={<Award size={24} className='text-emerald-600' />}
          color='bg-emerald-50'
        />
        <StatCard
          title='אחוז כללי'
          value={`${overallPct}%`}
          subtitle='מתוך הניקוד המקסימלי'
          icon={<TrendingUp size={24} className='text-blue-600' />}
          color='bg-blue-50'
        />
        <StatCard
          title='משימות שהוגשו'
          value={`${completedCount}/${totalMissions}`}
          subtitle={`${Math.round((completedCount / totalMissions) * 100)}% הושלמו`}
          icon={<CheckCircle2 size={24} className='text-purple-600' />}
          color='bg-purple-50'
        />
        <StatCard
          title='משימות נותרו'
          value={totalMissions - completedCount}
          subtitle='טרם הוגשו'
          icon={<BookOpen size={24} className='text-amber-600' />}
          color='bg-amber-50'
        />
      </div>

      <div className='rounded-xl border border-border bg-white p-6 shadow-sm'>
        <h2 className='mb-4 text-lg font-semibold text-foreground'>כל המשימות</h2>
        <div className='space-y-3'>
          {missionsWithScore.map((m) => {
            const sc = m.score;
            const isSubmitted = sc !== null;

            return (
              <div
                key={m.id}
                className={`rounded-lg border p-4 transition-colors ${
                  isSubmitted
                    ? 'border-border hover:bg-muted/30'
                    : 'border-dashed border-border/60 bg-muted/20'
                }`}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2'>
                      <p className='text-sm font-medium text-foreground'>{m.title}</p>
                      {isSubmitted && <CheckCircle2 size={14} className='text-emerald-500' />}
                    </div>
                    <p className='mt-0.5 text-xs text-muted-foreground'>{m.description}</p>
                  </div>
                  {isSubmitted ? (
                    <ScoreBadge score={sc.score} maxScore={m.maxScore} />
                  ) : (
                    <span className='rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500'>
                      טרם הוגש
                    </span>
                  )}
                </div>

                {isSubmitted && (
                  <>
                    <div className='mt-3'>
                      <ProgressBar value={sc.score} max={m.maxScore} />
                    </div>
                    {sc.comment && (
                      <p className='mt-2 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground'>
                        {sc.comment}
                      </p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
