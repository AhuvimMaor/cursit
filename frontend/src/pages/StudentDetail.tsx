import { ArrowRight, Mail, Trophy } from 'lucide-react';
import { useCallback } from 'react';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { ProgressBar } from '../components/ProgressBar';
import { ScoreBadge } from '../components/ScoreBadge';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';

type StudentDetailProps = {
  studentId: number;
  onBack: () => void;
};

export const StudentDetail = ({ studentId, onBack }: StudentDetailProps) => {
  const fetcher = useCallback(() => api.getStudent(studentId), [studentId]);
  const { data: student, loading } = useApi(fetcher);

  if (loading) return <LoadingSpinner />;
  if (!student) return null;

  const totalEarned = student.scores.reduce((sum, sc) => sum + sc.score, 0);
  const totalPossible = student.scores.reduce((sum, sc) => sum + sc.mission.maxScore, 0);
  const avg = student.scores.length > 0 ? Math.round(totalEarned / student.scores.length) : 0;
  const overallPct = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
  const highestScore =
    student.scores.length > 0
      ? student.scores.reduce((best, sc) =>
          sc.score / sc.mission.maxScore > best.score / best.mission.maxScore ? sc : best,
        )
      : null;

  return (
    <div className='space-y-6'>
      <button
        onClick={onBack}
        className='flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground'
      >
        <ArrowRight size={16} />
        חזרה לתלמידים
      </button>

      <div className='rounded-xl border border-border bg-white p-6 shadow-sm'>
        <div className='flex items-start gap-5'>
          <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary'>
            {student.name.charAt(0)}
          </div>
          <div className='flex-1'>
            <h1 className='text-2xl font-bold text-foreground'>{student.name}</h1>
            <div className='mt-1 flex items-center gap-1.5 text-sm text-muted-foreground'>
              <Mail size={14} />
              {student.email}
            </div>
          </div>
        </div>

        <div className='mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4'>
          <div className='rounded-lg bg-muted/50 p-4 text-center'>
            <p className='text-2xl font-bold text-foreground'>{avg}</p>
            <p className='text-xs text-muted-foreground'>ציון ממוצע</p>
          </div>
          <div className='rounded-lg bg-muted/50 p-4 text-center'>
            <p className='text-2xl font-bold text-foreground'>{overallPct}%</p>
            <p className='text-xs text-muted-foreground'>כללי</p>
          </div>
          <div className='rounded-lg bg-muted/50 p-4 text-center'>
            <p className='text-2xl font-bold text-foreground'>{student.scores.length}</p>
            <p className='text-xs text-muted-foreground'>הוגשו</p>
          </div>
          <div className='rounded-lg bg-muted/50 p-4 text-center'>
            {highestScore ? (
              <>
                <p className='text-2xl font-bold text-emerald-600'>
                  {Math.round((highestScore.score / highestScore.mission.maxScore) * 100)}%
                </p>
                <p className='text-xs text-muted-foreground'>ציון הכי גבוה</p>
              </>
            ) : (
              <>
                <p className='text-2xl font-bold text-foreground'>—</p>
                <p className='text-xs text-muted-foreground'>ציון הכי גבוה</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className='rounded-xl border border-border bg-white p-6 shadow-sm'>
        <h2 className='mb-4 flex items-center gap-2 text-lg font-semibold text-foreground'>
          <Trophy size={20} className='text-amber-500' />
          ציוני משימות
        </h2>

        {student.scores.length === 0 ? (
          <p className='py-8 text-center text-sm text-muted-foreground'>אין הגשות עדיין</p>
        ) : (
          <div className='space-y-3'>
            {student.scores
              .sort((a, b) => a.mission.id - b.mission.id)
              .map((sc) => (
                <div
                  key={sc.id}
                  className='rounded-lg border border-border p-4 transition-colors hover:bg-muted/30'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex-1'>
                      <p className='text-sm font-medium text-foreground'>{sc.mission.title}</p>
                      <p className='mt-0.5 text-xs text-muted-foreground'>
                        {sc.mission.description}
                      </p>
                    </div>
                    <ScoreBadge score={sc.score} maxScore={sc.mission.maxScore} />
                  </div>
                  <div className='mt-3'>
                    <ProgressBar value={sc.score} max={sc.mission.maxScore} />
                  </div>
                  {sc.comment && (
                    <p className='mt-2 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground'>
                      {sc.comment}
                    </p>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
