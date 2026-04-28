import { Award, GraduationCap, Target, TrendingUp } from 'lucide-react';
import { useCallback, useMemo } from 'react';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { ProgressBar } from '../components/ProgressBar';
import { ScoreBadge } from '../components/ScoreBadge';
import { StatCard } from '../components/StatCard';
import { useApi } from '../hooks/useApi';
import type { Score } from '../lib/api';
import { api } from '../lib/api';

type DashboardProps = {
  onStudentClick: (id: number) => void;
};

export const Dashboard = ({ onStudentClick }: DashboardProps) => {
  const fetchStudents = useCallback(() => api.getStudents(), []);
  const fetchMissions = useCallback(() => api.getMissions(), []);
  const fetchScores = useCallback(() => api.getScores(), []);
  const { data: students, loading: l1 } = useApi(fetchStudents);
  const { data: missions, loading: l2 } = useApi(fetchMissions);
  const { data: scores, loading: l3 } = useApi(fetchScores);

  const stats = useMemo(() => {
    if (!students || !missions || !scores) return null;

    const avgScore =
      scores.length > 0 ? Math.round(scores.reduce((s, sc) => s + sc.score, 0) / scores.length) : 0;
    const completionRate = Math.round((scores.length / (students.length * missions.length)) * 100);

    const studentAvgs = students.map((st) => {
      const studentScores = scores.filter((sc) => sc.studentId === st.id);
      const avg =
        studentScores.length > 0
          ? Math.round(studentScores.reduce((s, sc) => s + sc.score, 0) / studentScores.length)
          : 0;
      return { ...st, avg, completed: studentScores.length, scores: studentScores };
    });

    const topStudents = [...studentAvgs].sort((a, b) => b.avg - a.avg).slice(0, 5);

    const recentScores = [...scores]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);

    const missionStats = missions.map((m) => {
      const mScores = scores.filter((sc) => sc.missionId === m.id);
      return { ...m, submissions: mScores.length };
    });

    return { avgScore, completionRate, studentAvgs, topStudents, recentScores, missionStats };
  }, [students, missions, scores]);

  if (l1 || l2 || l3) return <LoadingSpinner />;
  if (!students || !missions || !scores || !stats) return null;

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>לוח בקרה</h1>
        <p className='mt-1 text-sm text-muted-foreground'>סקירת קורס והתקדמות תלמידים</p>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          title='תלמידים'
          value={students.length}
          subtitle='רשומים לקורס'
          icon={<GraduationCap size={24} className='text-blue-600' />}
          color='bg-blue-50'
        />
        <StatCard
          title='משימות'
          value={missions.length}
          subtitle='סה"כ מטלות'
          icon={<Target size={24} className='text-purple-600' />}
          color='bg-purple-50'
        />
        <StatCard
          title='ציון ממוצע'
          value={stats.avgScore}
          subtitle='על פני כל ההגשות'
          icon={<Award size={24} className='text-emerald-600' />}
          color='bg-emerald-50'
        />
        <StatCard
          title='השלמה'
          value={`${stats.completionRate}%`}
          subtitle={`${scores.length} / ${students.length * missions.length} הוגשו`}
          icon={<TrendingUp size={24} className='text-amber-600' />}
          color='bg-amber-50'
        />
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <div className='rounded-xl border border-border bg-white p-6 shadow-sm'>
          <h2 className='mb-4 text-lg font-semibold text-foreground'>תלמידים מצטיינים</h2>
          <div className='space-y-4'>
            {stats.topStudents.map((st, idx) => (
              <button
                key={st.id}
                onClick={() => onStudentClick(st.id)}
                className='flex w-full items-center gap-4 rounded-lg p-2 text-right transition-colors hover:bg-muted'
              >
                <span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary'>
                  {idx + 1}
                </span>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium text-foreground'>{st.name}</p>
                  <p className='text-xs text-muted-foreground'>{st.completed} משימות הושלמו</p>
                </div>
                <ProgressBar value={st.avg} max={100} className='w-32' />
              </button>
            ))}
          </div>
        </div>

        <div className='rounded-xl border border-border bg-white p-6 shadow-sm'>
          <h2 className='mb-4 text-lg font-semibold text-foreground'>התקדמות משימות</h2>
          <div className='space-y-4'>
            {stats.missionStats.map((m) => (
              <div key={m.id} className='space-y-1.5'>
                <div className='flex items-center justify-between'>
                  <p className='text-sm font-medium text-foreground'>{m.title}</p>
                  <span className='text-xs text-muted-foreground'>
                    {m.submissions}/{students.length} הוגשו
                  </span>
                </div>
                <ProgressBar value={m.submissions} max={students.length} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='rounded-xl border border-border bg-white p-6 shadow-sm'>
        <h2 className='mb-4 text-lg font-semibold text-foreground'>הגשות אחרונות</h2>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-border text-right'>
                <th className='pb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                  תלמיד
                </th>
                <th className='pb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                  משימה
                </th>
                <th className='pb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                  ציון
                </th>
                <th className='pb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                  הערה
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {stats.recentScores.map((sc: Score) => (
                <tr key={sc.id} className='hover:bg-muted/50'>
                  <td className='py-3 text-sm font-medium text-foreground'>{sc.student?.name}</td>
                  <td className='py-3 text-sm text-muted-foreground'>{sc.mission?.title}</td>
                  <td className='py-3'>
                    <ScoreBadge score={sc.score} maxScore={sc.mission?.maxScore ?? 100} />
                  </td>
                  <td className='max-w-xs truncate py-3 text-sm text-muted-foreground'>
                    {sc.comment || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
