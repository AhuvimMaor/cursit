import { ChevronLeft, Mail, Search } from 'lucide-react';
import { useCallback, useMemo } from 'react';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { ProgressBar } from '../components/ProgressBar';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';

type StudentsProps = {
  onStudentClick: (id: number) => void;
};

export const Students = ({ onStudentClick }: StudentsProps) => {
  const fetchStudents = useCallback(() => api.getStudents(), []);
  const fetchScores = useCallback(() => api.getScores(), []);
  const fetchMissions = useCallback(() => api.getMissions(), []);
  const { data: students, loading: l1 } = useApi(fetchStudents);
  const { data: scores, loading: l2 } = useApi(fetchScores);
  const { data: missions, loading: l3 } = useApi(fetchMissions);

  const enriched = useMemo(() => {
    if (!students || !scores || !missions) return [];
    return students.map((st) => {
      const studentScores = scores.filter((sc) => sc.studentId === st.id);
      const totalPossible = studentScores.reduce((sum, sc) => {
        const mission = missions.find((m) => m.id === sc.missionId);
        return sum + (mission?.maxScore ?? 100);
      }, 0);
      const totalEarned = studentScores.reduce((sum, sc) => sum + sc.score, 0);
      const avg = studentScores.length > 0 ? Math.round(totalEarned / studentScores.length) : 0;
      const pct = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
      return { ...st, avg, pct, completed: studentScores.length, total: missions.length };
    });
  }, [students, scores, missions]);

  if (l1 || l2 || l3) return <LoadingSpinner />;

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-foreground'>תלמידים</h1>
          <p className='mt-1 text-sm text-muted-foreground'>{enriched.length} תלמידים רשומים</p>
        </div>
      </div>

      <div className='rounded-xl border border-border bg-white shadow-sm'>
        <div className='border-b border-border px-6 py-4'>
          <div className='relative max-w-sm'>
            <Search
              size={16}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground'
            />
            <input
              type='text'
              placeholder='חיפוש תלמידים...'
              className='w-full rounded-lg border border-border bg-muted/50 py-2 pr-9 pl-4 text-sm outline-none transition-colors focus:border-primary focus:bg-white'
              disabled
            />
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-border bg-muted/30'>
                <th className='px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                  תלמיד
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                  התקדמות
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                  הושלמו
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                  ציון ממוצע
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                  סטטוס
                </th>
                <th className='px-6 py-3' />
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {enriched.map((st) => {
                const statusColor =
                  st.pct >= 80
                    ? 'bg-emerald-100 text-emerald-700'
                    : st.pct >= 60
                      ? 'bg-amber-100 text-amber-700'
                      : st.completed === 0
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-red-100 text-red-700';
                const statusText =
                  st.pct >= 80
                    ? 'מצטיין'
                    : st.pct >= 60
                      ? 'טוב'
                      : st.completed === 0
                        ? 'לא התחיל'
                        : 'צריך עזרה';

                return (
                  <tr
                    key={st.id}
                    onClick={() => onStudentClick(st.id)}
                    className='cursor-pointer transition-colors hover:bg-muted/50'
                  >
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary'>
                          {st.name.charAt(0)}
                        </div>
                        <div>
                          <p className='text-sm font-medium text-foreground'>{st.name}</p>
                          <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                            <Mail size={12} />
                            {st.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <ProgressBar value={st.completed} max={st.total} className='w-36' />
                    </td>
                    <td className='px-6 py-4 text-center text-sm text-foreground'>
                      {st.completed}/{st.total}
                    </td>
                    <td className='px-6 py-4 text-center text-sm font-semibold text-foreground'>
                      {st.avg}
                    </td>
                    <td className='px-6 py-4 text-center'>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor}`}
                      >
                        {statusText}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-left'>
                      <ChevronLeft size={16} className='text-muted-foreground' />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
