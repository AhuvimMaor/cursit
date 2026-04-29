import {
  Award,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  GraduationCap,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
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
  if (user.role === Role.TRAINEE) return <TraineeDashboard user={user} />;
  if (user.role === Role.TEAM_LEADER) return <TeamLeaderDashboard user={user} />;
  if (user.role === Role.BRANCH_COORD) return <CoordDashboard user={user} />;
  return <AdminDashboard />;
};

// ── Trainee: personal scores + registrations ──
function TraineeDashboard({ user }: { user: AuthUser }) {
  const fetchRegs = useCallback(() => api.getMyRegistrations(), []);
  const fetchGantt = useCallback(() => api.getGantt(), []);
  const { data: regs, loading: l1 } = useApi(fetchRegs);
  const { data: gantt, loading: l2 } = useApi(fetchGantt);

  if (l1 || l2) return <LoadingSpinner />;

  const approved = regs?.filter((r) => r.status === 'APPROVED') ?? [];
  const pending =
    regs?.filter((r) => r.status === 'PENDING_COORD' || r.status === 'PENDING_BIS') ?? [];
  const rejected = regs?.filter((r) => r.status === 'REJECTED') ?? [];

  const upcomingPhases =
    gantt
      ?.flatMap((g) =>
        g.phases.map((p) => ({ ...p, courseName: g.course.name, instanceName: g.name })),
      )
      .filter((p) => new Date(p.startDate) > new Date())
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 4) ?? [];

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>שלום, {user.name} 👋</h1>
        <p className='mt-1 text-sm text-muted-foreground'>סיכום ההתקדמות שלך</p>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          title='קורסים שאושרו'
          value={approved.length}
          icon={<CheckCircle2 size={24} className='text-emerald-600' />}
          color='bg-emerald-50'
        />
        <StatCard
          title='ממתינים לאישור'
          value={pending.length}
          icon={<Clock size={24} className='text-amber-600' />}
          color='bg-amber-50'
        />
        <StatCard
          title='נדחו'
          value={rejected.length}
          icon={<XCircle size={24} className='text-red-500' />}
          color='bg-red-50'
        />
        <StatCard
          title='סה"כ בקשות'
          value={regs?.length ?? 0}
          icon={<GraduationCap size={24} className='text-blue-600' />}
          color='bg-blue-50'
        />
      </div>

      {/* My registrations summary */}
      {regs && regs.length > 0 && (
        <div className='rounded-xl border border-border bg-white p-6 shadow-sm'>
          <h2 className='mb-4 text-lg font-semibold text-foreground'>הרישומים שלי</h2>
          <div className='space-y-3'>
            {regs.map((r) => {
              const statusConfig: Record<string, { label: string; color: string }> = {
                PENDING_COORD: { label: 'ממתין', color: 'bg-yellow-100 text-yellow-700' },
                PENDING_BIS: { label: 'בתהליך', color: 'bg-blue-100 text-blue-700' },
                APPROVED: { label: 'אושר', color: 'bg-emerald-100 text-emerald-700' },
                REJECTED: { label: 'נדחה', color: 'bg-red-100 text-red-700' },
              };
              const s = statusConfig[r.status] ?? statusConfig.PENDING_COORD;
              return (
                <div
                  key={r.id}
                  className='flex items-center justify-between rounded-lg border border-border p-3'
                >
                  <div>
                    <p className='text-sm font-medium text-foreground'>
                      {r.courseInstance?.course?.name}
                    </p>
                    <p className='text-xs text-muted-foreground'>{r.courseInstance?.name}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming events */}
      {upcomingPhases.length > 0 && (
        <div className='rounded-xl border border-border bg-white p-6 shadow-sm'>
          <h2 className='mb-4 text-lg font-semibold text-foreground'>אירועים קרובים</h2>
          <div className='space-y-3'>
            {upcomingPhases.map((p) => (
              <div
                key={p.id}
                className='flex items-center gap-4 rounded-lg border border-border p-3'
              >
                <Clock size={16} className='text-primary' />
                <div className='flex-1'>
                  <p className='text-sm font-medium text-foreground'>{p.name}</p>
                  <p className='text-xs text-muted-foreground'>
                    {p.courseName} — {p.instanceName}
                  </p>
                </div>
                <p className='text-xs text-muted-foreground'>
                  {new Date(p.startDate).toLocaleDateString('he-IL')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Team Leader: team stats + candidacy overview ──
function TeamLeaderDashboard({ user }: { user: AuthUser }) {
  const fetchCandidacies = useCallback(() => api.getMyCandidacySubmissions(), []);
  const fetchGantt = useCallback(() => api.getGantt(), []);
  const { data: candidacies, loading: l1 } = useApi(fetchCandidacies);
  const { data: gantt, loading: l2 } = useApi(fetchGantt);

  if (l1 || l2) return <LoadingSpinner />;

  const pending =
    candidacies?.filter((c) => c.status === 'PENDING' || c.status === 'COORD_REVIEWED') ?? [];
  const approved = candidacies?.filter((c) => c.status === 'APPROVED') ?? [];

  const upcomingPhases =
    gantt
      ?.flatMap((g) =>
        g.phases.map((p) => ({ ...p, courseName: g.course.name, instanceName: g.name })),
      )
      .filter((p) => new Date(p.startDate) > new Date())
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 4) ?? [];

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>שלום, {user.name}</h1>
        <p className='mt-1 text-sm text-muted-foreground'>{user.team?.name ?? ''}</p>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          title='מועמדויות שהגשתי'
          value={candidacies?.length ?? 0}
          icon={<Users size={24} className='text-blue-600' />}
          color='bg-blue-50'
        />
        <StatCard
          title='ממתינות'
          value={pending.length}
          icon={<Clock size={24} className='text-amber-600' />}
          color='bg-amber-50'
        />
        <StatCard
          title='אושרו'
          value={approved.length}
          icon={<CheckCircle2 size={24} className='text-emerald-600' />}
          color='bg-emerald-50'
        />
        <StatCard
          title='אירועים קרובים'
          value={upcomingPhases.length}
          subtitle='בגאנט'
          icon={<Calendar size={24} className='text-purple-600' />}
          color='bg-purple-50'
        />
      </div>

      {candidacies && candidacies.length > 0 && (
        <div className='rounded-xl border border-border bg-white p-6 shadow-sm'>
          <h2 className='mb-4 text-lg font-semibold text-foreground'>מועמדויות אחרונות</h2>
          <div className='space-y-3'>
            {candidacies.slice(0, 5).map((c) => (
              <div
                key={c.id}
                className='flex items-center justify-between rounded-lg border border-border p-3'
              >
                <div>
                  <p className='text-sm font-medium text-foreground'>{c.candidate?.name}</p>
                  <p className='text-xs text-muted-foreground'>{c.courseInstance?.course?.name}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    c.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-700'
                      : c.status === 'REJECTED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {c.status === 'APPROVED' ? 'אושר' : c.status === 'REJECTED' ? 'נדחה' : 'ממתין'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {upcomingPhases.length > 0 && (
        <div className='rounded-xl border border-border bg-white p-6 shadow-sm'>
          <h2 className='mb-4 text-lg font-semibold text-foreground'>אירועים קרובים</h2>
          <div className='space-y-3'>
            {upcomingPhases.map((p) => (
              <div
                key={p.id}
                className='flex items-center gap-4 rounded-lg border border-border p-3'
              >
                <Clock size={16} className='text-primary' />
                <div className='flex-1'>
                  <p className='text-sm font-medium text-foreground'>{p.name}</p>
                  <p className='text-xs text-muted-foreground'>{p.courseName}</p>
                </div>
                <p className='text-xs text-muted-foreground'>
                  {new Date(p.startDate).toLocaleDateString('he-IL')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Branch Coordinator: branch stats ──
function CoordDashboard({ user }: { user: AuthUser }) {
  const fetchRegs = useCallback(() => api.getBranchRegistrations(), []);
  const fetchCandidacies = useCallback(() => api.getBranchCandidacies(), []);
  const fetchCourses = useCallback(() => api.getCourses(), []);
  const { data: regs, loading: l1 } = useApi(fetchRegs);
  const { data: candidacies, loading: l2 } = useApi(fetchCandidacies);
  const { data: courses, loading: l3 } = useApi(fetchCourses);

  if (l1 || l2 || l3) return <LoadingSpinner />;

  const pendingRegs = regs?.filter((r) => r.status === 'PENDING_COORD') ?? [];
  const pendingCandidacies = candidacies?.filter((c) => c.status === 'PENDING') ?? [];

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>ברוך הבא</h1>
        <p className='mt-1 text-sm text-muted-foreground'>רכז {user.branch?.name ?? ''}</p>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          title='רישומים ממתינים'
          value={pendingRegs.length}
          subtitle='לתיעדוף'
          icon={<CheckSquare size={24} className='text-amber-600' />}
          color='bg-amber-50'
        />
        <StatCard
          title='מועמדויות ממתינות'
          value={pendingCandidacies.length}
          subtitle='לבדיקה'
          icon={<Users size={24} className='text-blue-600' />}
          color='bg-blue-50'
        />
        <StatCard
          title='סה"כ רישומים'
          value={regs?.length ?? 0}
          icon={<TrendingUp size={24} className='text-purple-600' />}
          color='bg-purple-50'
        />
        <StatCard
          title='קורסים בקטלוג'
          value={courses?.length ?? 0}
          icon={<GraduationCap size={24} className='text-emerald-600' />}
          color='bg-emerald-50'
        />
      </div>

      {pendingRegs.length > 0 && (
        <div className='rounded-xl border border-border bg-white p-6 shadow-sm'>
          <h2 className='mb-4 text-lg font-semibold text-foreground'>רישומים ממתינים לתיעדוף</h2>
          <div className='space-y-3'>
            {pendingRegs.slice(0, 5).map((r) => (
              <div
                key={r.id}
                className='flex items-center justify-between rounded-lg border border-border p-3'
              >
                <div>
                  <p className='text-sm font-medium text-foreground'>{r.user?.name}</p>
                  <p className='text-xs text-muted-foreground'>
                    {r.courseInstance?.course?.name} — {r.courseInstance?.name}
                  </p>
                </div>
                <span className='rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700'>
                  ממתין
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Admin: full overview ──
function AdminDashboard() {
  const fetchCourses = useCallback(() => api.getCourses(), []);
  const fetchGantt = useCallback(() => api.getGantt(), []);
  const fetchRegs = useCallback(() => api.getAllRegistrations(), []);
  const fetchCandidacies = useCallback(() => api.getAllCandidacies(), []);
  const { data: courses, loading: l1 } = useApi(fetchCourses);
  const { data: gantt, loading: l2 } = useApi(fetchGantt);
  const { data: regs, loading: l3 } = useApi(fetchRegs);
  const { data: candidacies, loading: l4 } = useApi(fetchCandidacies);

  if (l1 || l2 || l3 || l4) return <LoadingSpinner />;

  const pendingRegs = regs?.filter((r) => r.status === 'PENDING_BIS') ?? [];
  const pendingCandidacies =
    candidacies?.filter((c) => c.status === 'PENDING' || c.status === 'COORD_REVIEWED') ?? [];
  const openInstances = gantt?.filter((g) => g.status === 'OPEN') ?? [];

  const upcomingPhases =
    gantt
      ?.flatMap((g) =>
        g.phases.map((p) => ({ ...p, courseName: g.course.name, instanceName: g.name })),
      )
      .filter((p) => new Date(p.startDate) > new Date())
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 6) ?? [];

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>ברוך הבא</h1>
        <p className='mt-1 text-sm text-muted-foreground'>סקירת מערכת הדרכה</p>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          title='רישומים לאישור'
          value={pendingRegs.length}
          subtitle='ממתינים לאישור סופי'
          icon={<CheckSquare size={24} className='text-amber-600' />}
          color='bg-amber-50'
        />
        <StatCard
          title='מועמדויות לבדיקה'
          value={pendingCandidacies.length}
          icon={<Users size={24} className='text-blue-600' />}
          color='bg-blue-50'
        />
        <StatCard
          title='מחזורים פתוחים'
          value={openInstances.length}
          icon={<Award size={24} className='text-emerald-600' />}
          color='bg-emerald-50'
        />
        <StatCard
          title='קורסים בקטלוג'
          value={courses?.length ?? 0}
          icon={<GraduationCap size={24} className='text-purple-600' />}
          color='bg-purple-50'
        />
      </div>

      {upcomingPhases.length > 0 && (
        <div className='rounded-xl border border-border bg-white p-6 shadow-sm'>
          <h2 className='mb-4 text-lg font-semibold text-foreground'>אירועים קרובים</h2>
          <div className='space-y-3'>
            {upcomingPhases.map((p) => (
              <div
                key={p.id}
                className='flex items-center gap-4 rounded-lg border border-border p-3'
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
        </div>
      )}

      {pendingRegs.length > 0 && (
        <div className='rounded-xl border border-border bg-white p-6 shadow-sm'>
          <h2 className='mb-4 text-lg font-semibold text-foreground'>
            רישומים ממתינים לאישור סופי
          </h2>
          <div className='space-y-3'>
            {pendingRegs.slice(0, 5).map((r) => (
              <div
                key={r.id}
                className='flex items-center justify-between rounded-lg border border-border p-3'
              >
                <div>
                  <p className='text-sm font-medium text-foreground'>{r.user?.name}</p>
                  <p className='text-xs text-muted-foreground'>{r.courseInstance?.course?.name}</p>
                </div>
                <span className='rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700'>
                  ממתין לאישור סופי
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
