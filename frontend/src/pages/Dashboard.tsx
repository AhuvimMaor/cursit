import { Calendar, CheckSquare, Clock, GraduationCap, Users } from 'lucide-react';
import { useCallback } from 'react';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatCard } from '../components/StatCard';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import type { AuthUser } from '../lib/auth';
import { Role } from '../lib/roles';

type DashboardProps = {
  user: AuthUser;
};

export const Dashboard = ({ user }: DashboardProps) => {
  const fetchCourses = useCallback(() => api.getCourses(), []);
  const fetchGantt = useCallback(() => api.getGantt(), []);
  const { data: courses, loading: l1 } = useApi(fetchCourses);
  const { data: gantt, loading: l2 } = useApi(fetchGantt);

  if (l1 || l2) return <LoadingSpinner />;
  if (!courses || !gantt) return null;

  const foundation = courses.filter((c) => c.type === 'FOUNDATION');
  const advanced = courses.filter((c) => c.type === 'ADVANCED');
  const openInstances = gantt.filter((g) => g.status === 'OPEN');

  const upcomingPhases = gantt
    .flatMap((g) =>
      g.phases.map((p) => ({
        ...p,
        courseName: g.course.name,
        instanceName: g.name,
      })),
    )
    .filter((p) => new Date(p.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 6);

  const greeting =
    user.role === Role.TRAINEE
      ? `שלום, ${user.name}`
      : user.role === Role.TEAM_LEADER
        ? `שלום, ${user.name}`
        : `ברוך הבא`;

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>{greeting}</h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          {user.role === Role.BIS_CDR && 'סקירת מערכת הדרכה'}
          {user.role === Role.BRANCH_COORD && `רכז ${user.branch?.name ?? ''}`}
          {user.role === Role.TEAM_LEADER && `${user.team?.name ?? ''}`}
          {user.role === Role.TRAINEE && 'מערכת הדרכה וקורסים'}
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          title='קורסי יסוד'
          value={foundation.length}
          icon={<GraduationCap size={24} className='text-blue-600' />}
          color='bg-blue-50'
        />
        <StatCard
          title='קורסים מתקדמים'
          value={advanced.length}
          subtitle='בקטלוג'
          icon={<Users size={24} className='text-purple-600' />}
          color='bg-purple-50'
        />
        <StatCard
          title='מחזורים פתוחים'
          value={openInstances.length}
          subtitle='לרישום'
          icon={<CheckSquare size={24} className='text-emerald-600' />}
          color='bg-emerald-50'
        />
        <StatCard
          title='אירועים קרובים'
          value={upcomingPhases.length}
          subtitle='בגאנט'
          icon={<Calendar size={24} className='text-amber-600' />}
          color='bg-amber-50'
        />
      </div>

      <div className='rounded-xl border border-border bg-white p-6 shadow-sm'>
        <h2 className='mb-4 text-lg font-semibold text-foreground'>אירועים קרובים</h2>
        {upcomingPhases.length === 0 ? (
          <p className='py-8 text-center text-sm text-muted-foreground'>אין אירועים קרובים</p>
        ) : (
          <div className='space-y-3'>
            {upcomingPhases.map((p) => (
              <div
                key={p.id}
                className='flex items-center gap-4 rounded-lg border border-border p-4'
              >
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
                  <Clock size={20} className='text-primary' />
                </div>
                <div className='flex-1'>
                  <p className='text-sm font-medium text-foreground'>{p.name}</p>
                  <p className='text-xs text-muted-foreground'>
                    {p.courseName} — {p.instanceName}
                  </p>
                </div>
                <div className='text-left text-xs text-muted-foreground'>
                  <p>{new Date(p.startDate).toLocaleDateString('he-IL')}</p>
                  <p>{new Date(p.endDate).toLocaleDateString('he-IL')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
