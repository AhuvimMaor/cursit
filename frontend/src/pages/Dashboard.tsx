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
import { ScreenGuide } from '../components/ScreenGuide';
import { StatCard } from '../components/StatCard';
import { useApi } from '../hooks/useApi';
import { api } from '../lib/api';
import type { AuthUser } from '../lib/auth';
import type { Page } from '../lib/permissions';
import { Role } from '../lib/roles';

type DashboardProps = {
  user: AuthUser;
  onNavigate: (page: Page) => void;
};

export const Dashboard = ({ user, onNavigate }: DashboardProps) => {
  if (user.role === Role.TRAINEE) return <TraineeDashboard user={user} onNavigate={onNavigate} />;
  if (user.role === Role.TEAM_LEADER)
    return <TeamLeaderDashboard user={user} onNavigate={onNavigate} />;
  if (user.role === Role.BRANCH_COORD)
    return <CoordDashboard user={user} onNavigate={onNavigate} />;
  return <AdminDashboard onNavigate={onNavigate} />;
};

// ── Trainee: personal scores + registrations ──
function TraineeDashboard({
  user,
  onNavigate,
}: {
  user: AuthUser;
  onNavigate: (page: Page) => void;
}) {
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
      <ScreenGuide
        eyebrow='סקירה'
        title={`שלום, ${user.name}`}
        subtitle='סיכום רישומים ומועדים קרובים מהקטלוג.'
        tags={['רישומים', 'מועדים', 'סטטוס']}
      />

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          title='קורסים שאושרו'
          value={approved.length}
          icon={<CheckCircle2 size={24} className='text-emerald-600' />}
          color='bg-emerald-50'
          onClick={() => onNavigate('my-registrations')}
        />
        <StatCard
          title='ממתינים לאישור'
          value={pending.length}
          icon={<Clock size={24} className='text-amber-600' />}
          color='bg-amber-50'
          onClick={() => onNavigate('my-registrations')}
        />
        <StatCard
          title='נדחו'
          value={rejected.length}
          icon={<XCircle size={24} className='text-red-500' />}
          color='bg-red-50'
          onClick={() => onNavigate('my-registrations')}
        />
        <StatCard
          title='סה"כ בקשות'
          value={regs?.length ?? 0}
          icon={<GraduationCap size={24} className='text-blue-600' />}
          color='bg-blue-50'
          onClick={() => onNavigate('my-registrations')}
        />
      </div>

      {/* My registrations summary */}
      {regs && regs.length > 0 && (
        <div className='rounded-xl border border-border bg-white p-6 shadow-sm'>
          <h2 className='mb-4 text-lg font-semibold text-foreground'>הרישומים שלי</h2>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {regs.map((r) => {
              const statusConfig: Record<string, { label: string; color: string }> = {
                PENDING_COORD: { label: 'ממתין', color: 'bg-yellow-100 text-yellow-700' },
                PENDING_BIS: { label: 'בתהליך', color: 'bg-blue-100 text-blue-700' },
                APPROVED: { label: 'אושר', color: 'bg-emerald-100 text-emerald-700' },
                REJECTED: { label: 'נדחה', color: 'bg-red-100 text-red-700' },
              };
              const s = statusConfig[r.status] ?? statusConfig.PENDING_COORD;
              return (
                <button
                  key={r.id}
                  type='button'
                  onClick={() => onNavigate('my-registrations')}
                  className='flex flex-col rounded-xl border border-border bg-white p-4 text-right shadow-sm transition-colors hover:border-primary/25 hover:bg-slate-50/80'
                >
                  <p className='text-sm font-semibold text-foreground leading-snug'>
                    {r.courseInstance?.course?.name}
                  </p>
                  <p className='mt-1 text-xs text-muted-foreground'>{r.courseInstance?.name}</p>
                  <span
                    className={`mt-3 inline-flex self-start rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}
                  >
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming events */}
      {upcomingPhases.length > 0 && (
        <div className='rounded-xl border border-border bg-white p-6 shadow-sm'>
          <h2 className='mb-4 text-lg font-semibold text-foreground'>אירועים קרובים</h2>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {upcomingPhases.map((p) => (
              <button
                key={p.id}
                type='button'
                onClick={() => onNavigate('courses-hub')}
                className='flex flex-col rounded-xl border border-border bg-white p-4 text-right shadow-sm transition-colors hover:border-primary/25 hover:bg-slate-50/80'
              >
                <div className='mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10'>
                  <Clock size={16} className='text-primary' />
                </div>
                <p className='text-sm font-semibold text-foreground leading-snug'>{p.name}</p>
                <p className='mt-1 text-xs text-muted-foreground leading-snug'>{p.courseName}</p>
                <p className='text-[11px] text-muted-foreground'>{p.instanceName}</p>
                <p className='mt-3 text-xs font-medium text-primary'>
                  {new Date(p.startDate).toLocaleDateString('he-IL')}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Team Leader: team stats + candidacy overview ──
function TeamLeaderDashboard({
  user,
  onNavigate,
}: {
  user: AuthUser;
  onNavigate: (page: Page) => void;
}) {
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
      <ScreenGuide
        eyebrow='סקירה'
        title={`שלום, ${user.name}`}
        subtitle={
          user.team?.name
            ? `ראש צוות - ${user.team.name}: מועמדויות ומועדים במבט אחד.`
            : 'ראש צוות - מועמדויות ומועדים במבט אחד.'
        }
        tags={['מועמדויות', 'מועדים', 'אישורים']}
      />

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          title='מועמדויות שהגשתי'
          value={candidacies?.length ?? 0}
          icon={<Users size={24} className='text-blue-600' />}
          color='bg-blue-50'
          onClick={() => onNavigate('candidacy')}
        />
        <StatCard
          title='ממתינות'
          value={pending.length}
          icon={<Clock size={24} className='text-amber-600' />}
          color='bg-amber-50'
          onClick={() => onNavigate('candidacy')}
        />
        <StatCard
          title='אושרו'
          value={approved.length}
          icon={<CheckCircle2 size={24} className='text-emerald-600' />}
          color='bg-emerald-50'
          onClick={() => onNavigate('candidacy')}
        />
        <StatCard
          title='אירועים קרובים'
          value={upcomingPhases.length}
          subtitle='לוח זמנים'
          icon={<Calendar size={24} className='text-purple-600' />}
          color='bg-purple-50'
          onClick={() => onNavigate('courses-hub')}
        />
      </div>

      {candidacies && candidacies.length > 0 && (
        <div className='rounded-xl border border-border bg-white p-6 shadow-sm'>
          <h2 className='mb-4 text-lg font-semibold text-foreground'>מועמדויות אחרונות</h2>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {candidacies.slice(0, 6).map((c) => (
              <button
                key={c.id}
                type='button'
                onClick={() => onNavigate('candidacy')}
                className='flex flex-col rounded-xl border border-border bg-white p-4 text-right shadow-sm transition-colors hover:border-primary/25 hover:bg-slate-50/80'
              >
                <p className='text-sm font-semibold text-foreground'>{c.candidate?.name}</p>
                <p className='mt-1 text-xs text-muted-foreground leading-snug'>
                  {c.courseInstance?.course?.name}
                </p>
                <span
                  className={`mt-3 inline-flex self-start rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    c.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-700'
                      : c.status === 'REJECTED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {c.status === 'APPROVED' ? 'אושר' : c.status === 'REJECTED' ? 'נדחה' : 'ממתין'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {upcomingPhases.length > 0 && (
        <div className='rounded-xl border border-border bg-white p-6 shadow-sm'>
          <h2 className='mb-4 text-lg font-semibold text-foreground'>אירועים קרובים</h2>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {upcomingPhases.map((p) => (
              <button
                key={p.id}
                type='button'
                onClick={() => onNavigate('courses-hub')}
                className='flex flex-col rounded-xl border border-border bg-white p-4 text-right shadow-sm transition-colors hover:border-primary/25 hover:bg-slate-50/80'
              >
                <div className='mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10'>
                  <Clock size={16} className='text-primary' />
                </div>
                <p className='text-sm font-semibold text-foreground leading-snug'>{p.name}</p>
                <p className='mt-1 text-xs text-muted-foreground'>{p.courseName}</p>
                <p className='text-[11px] text-muted-foreground'>{p.instanceName}</p>
                <p className='mt-3 text-xs font-medium text-primary'>
                  {new Date(p.startDate).toLocaleDateString('he-IL')}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Branch Coordinator: branch stats ──
function CoordDashboard({
  user,
  onNavigate,
}: {
  user: AuthUser;
  onNavigate: (page: Page) => void;
}) {
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
      <ScreenGuide
        eyebrow='סקירה'
        title='לוח בקרה - רכז ענף'
        subtitle={
          user.branch?.name
            ? `${user.branch.name} - רישומים ומועמדויות שדורשים טיפול.`
            : 'רישומים ומועמדויות שדורשים טיפול.'
        }
        tags={['תיעדוף', 'מועמדויות', 'קטלוג']}
      />

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          title='רישומים ממתינים'
          value={pendingRegs.length}
          subtitle='לתיעדוף'
          icon={<CheckSquare size={24} className='text-amber-600' />}
          color='bg-amber-50'
          onClick={() => onNavigate('approvals')}
        />
        <StatCard
          title='מועמדויות ממתינות'
          value={pendingCandidacies.length}
          subtitle='לבדיקה'
          icon={<Users size={24} className='text-blue-600' />}
          color='bg-blue-50'
          onClick={() => onNavigate('candidacy')}
        />
        <StatCard
          title='סה"כ רישומים'
          value={regs?.length ?? 0}
          icon={<TrendingUp size={24} className='text-purple-600' />}
          color='bg-purple-50'
          onClick={() => onNavigate('approvals')}
        />
        <StatCard
          title='קורסים בקטלוג'
          value={courses?.length ?? 0}
          icon={<GraduationCap size={24} className='text-emerald-600' />}
          color='bg-emerald-50'
          onClick={() => onNavigate('courses-hub')}
        />
      </div>

      {pendingRegs.length > 0 && (
        <div className='rounded-xl border border-border bg-white p-6 shadow-sm'>
          <h2 className='mb-4 text-lg font-semibold text-foreground'>רישומים ממתינים לתיעדוף</h2>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {pendingRegs.slice(0, 6).map((r) => (
              <button
                key={r.id}
                type='button'
                onClick={() => onNavigate('approvals')}
                className='flex flex-col rounded-xl border border-border bg-white p-4 text-right shadow-sm transition-colors hover:border-primary/25 hover:bg-slate-50/80'
              >
                <p className='text-sm font-semibold text-foreground'>{r.user?.name}</p>
                <p className='mt-1 text-xs text-muted-foreground leading-snug'>
                  {r.courseInstance?.course?.name}
                </p>
                <p className='text-[11px] text-muted-foreground'>{r.courseInstance?.name}</p>
                <span className='mt-3 inline-flex self-start rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700'>
                  ממתין
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Admin: full overview ──
function AdminDashboard({ onNavigate }: { onNavigate: (page: Page) => void }) {
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
      <ScreenGuide
        eyebrow='סקירה'
        title='לוח בקרה - מנהל מערכת'
        subtitle='אישור רישום לקורס, מועמדות לפיקוד, וקורסים ולוחות - לחיצה על כרטיס מעבירה למסך המתאים.'
        tags={['רישום לקורס', 'מועמדות לפיקוד', 'קורסים ולוחות']}
      />

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          title='רישומים לאישור'
          value={pendingRegs.length}
          subtitle='ממתינים לאישור סופי'
          icon={<CheckSquare size={24} className='text-amber-600' />}
          color='bg-amber-50'
          onClick={() => onNavigate('approvals')}
        />
        <StatCard
          title='מועמדויות לבדיקה'
          value={pendingCandidacies.length}
          icon={<Users size={24} className='text-blue-600' />}
          color='bg-blue-50'
          onClick={() => onNavigate('candidacy')}
        />
        <StatCard
          title='מחזורים פתוחים'
          value={openInstances.length}
          icon={<Award size={24} className='text-emerald-600' />}
          color='bg-emerald-50'
          onClick={() => onNavigate('courses-hub')}
        />
        <StatCard
          title='קורסים בקטלוג'
          value={courses?.length ?? 0}
          icon={<GraduationCap size={24} className='text-purple-600' />}
          color='bg-purple-50'
          onClick={() => onNavigate('courses-hub')}
        />
      </div>

      {upcomingPhases.length > 0 && (
        <div className='rounded-xl border border-border bg-white p-6 shadow-sm'>
          <h2 className='mb-4 text-lg font-semibold text-foreground'>אירועים קרובים</h2>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {upcomingPhases.map((p) => (
              <button
                key={p.id}
                type='button'
                onClick={() => onNavigate('courses-hub')}
                className='flex flex-col rounded-xl border border-border bg-white p-4 text-right shadow-sm transition-colors hover:border-primary/25 hover:bg-slate-50/80'
              >
                <div className='mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
                  <Clock size={20} className='text-primary' />
                </div>
                <p className='text-sm font-semibold text-foreground leading-snug'>{p.name}</p>
                <p className='mt-1 text-xs text-muted-foreground'>{p.courseName}</p>
                <p className='text-[11px] text-muted-foreground'>{p.instanceName}</p>
                <div className='mt-3 text-xs text-muted-foreground'>
                  <p>{new Date(p.startDate).toLocaleDateString('he-IL')}</p>
                  <p>{new Date(p.endDate).toLocaleDateString('he-IL')}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {pendingRegs.length > 0 && (
        <div className='rounded-xl border border-border bg-white p-6 shadow-sm'>
          <h2 className='mb-4 text-lg font-semibold text-foreground'>
            רישומים ממתינים לאישור סופי
          </h2>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {pendingRegs.slice(0, 6).map((r) => (
              <button
                key={r.id}
                type='button'
                onClick={() => onNavigate('approvals')}
                className='flex flex-col rounded-xl border border-border bg-white p-4 text-right shadow-sm transition-colors hover:border-primary/25 hover:bg-slate-50/80'
              >
                <p className='text-sm font-semibold text-foreground'>{r.user?.name}</p>
                <p className='mt-1 text-xs text-muted-foreground leading-snug'>
                  {r.courseInstance?.course?.name}
                </p>
                <p className='text-[11px] text-muted-foreground'>{r.courseInstance?.name}</p>
                <span className='mt-3 inline-flex self-start rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700'>
                  ממתין לאישור סופי
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
