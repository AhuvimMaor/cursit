import { CheckCircle2, Clock, Search, XCircle } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { ScreenGuide } from '../components/ScreenGuide';
import { useApi } from '../hooks/useApi';
import type { CourseRegistration } from '../lib/api';
import { api } from '../lib/api';
import type { AuthUser } from '../lib/auth';
import { Role } from '../lib/roles';

type ApprovalsProps = {
  user: AuthUser;
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_TL: 'ממתין לראש צוות',
  PENDING_COORD: 'ממתין לרכז',
  PENDING_BIS: 'ממתין לאישור סופי',
  APPROVED: 'אושר',
  REJECTED: 'נדחה',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING_TL: 'bg-orange-100 text-orange-700',
  PENDING_COORD: 'bg-yellow-100 text-yellow-700',
  PENDING_BIS: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export const Approvals = ({ user }: ApprovalsProps) => {
  const fetcher = useCallback(() => {
    if (user.role === Role.BIS_CDR) return api.getAllRegistrations();
    if (user.role === Role.TEAM_LEADER) return api.getTeamRegistrations();
    return api.getBranchRegistrations();
  }, [user.role]);

  const { data: registrations, loading, refetch } = useApi(fetcher);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!registrations) return [];
    return registrations.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        if (
          !r.user?.name?.toLowerCase().includes(s) &&
          !r.courseInstance?.course?.name?.toLowerCase().includes(s)
        )
          return false;
      }
      return true;
    });
  }, [registrations, statusFilter, search]);

  if (loading) return <LoadingSpinner />;

  const title =
    user.role === Role.BIS_CDR
      ? 'אישור רישום לקורס'
      : user.role === Role.TEAM_LEADER
        ? 'אישור רישום לקורס — הצוות'
        : 'אישור רישום לקורס — הענף';

  const handleApproveTl = async (id: number) => {
    const notes = prompt('הערות (אופציונלי):');
    await api.approveRegistrationTl(id, notes ?? undefined);
    refetch();
  };

  const statusCounts: Record<string, number> = {
    PENDING_TL: registrations?.filter((r) => r.status === 'PENDING_TL').length ?? 0,
    PENDING_COORD: registrations?.filter((r) => r.status === 'PENDING_COORD').length ?? 0,
    PENDING_BIS: registrations?.filter((r) => r.status === 'PENDING_BIS').length ?? 0,
    APPROVED: registrations?.filter((r) => r.status === 'APPROVED').length ?? 0,
    REJECTED: registrations?.filter((r) => r.status === 'REJECTED').length ?? 0,
  };

  const handlePrioritize = async (id: number) => {
    const priorityStr = prompt('תיעדוף (1 = הכי גבוה):');
    if (!priorityStr) return;
    const notes = prompt('הערות (אופציונלי):');
    await api.prioritizeRegistration(id, {
      coordPriority: Number(priorityStr),
      coordNotes: notes ?? undefined,
    });
    refetch();
  };

  const handleApproveFinal = async (id: number) => {
    const notes = prompt('הערות (אופציונלי):');
    await api.approveRegistrationFinal(id, notes ?? undefined);
    refetch();
  };

  const handleReject = async (id: number) => {
    const reason = prompt('סיבת דחייה:');
    if (!reason) return;
    await api.rejectRegistration(id, reason);
    refetch();
  };

  const approvalTags =
    user.role === Role.TEAM_LEADER
      ? (['צוות שלך', 'אישור ראשון', 'סטטוס בשורה'] as const)
      : user.role === Role.BRANCH_COORD
        ? (['ענף', 'תיעדוף', 'הערות'] as const)
        : (['אישור סופי', 'תיעדוף', 'דחייה'] as const);

  return (
    <div className='space-y-4'>
      <ScreenGuide
        eyebrow='תהליכים'
        title={title}
        subtitle='בקשות רישום של משתתפים לקורסים — כרטיס לכל בקשה; הפעולות בתחתית הכרטיס.'
        tags={approvalTags}
      />

      {/* סינון סטטוס — גלילה אופקית במסכים צרים */}
      <div className='-mx-1 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden'>
        <button
          type='button'
          onClick={() => setStatusFilter('')}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${!statusFilter ? 'bg-foreground text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
        >
          הכל ({registrations?.length ?? 0})
        </button>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <button
            type='button'
            key={key}
            onClick={() => setStatusFilter(statusFilter === key ? '' : key)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${statusFilter === key ? 'bg-foreground text-white' : `${STATUS_COLORS[key]} hover:opacity-80`}`}
          >
            {label} ({statusCounts[key as keyof typeof statusCounts]})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className='relative max-w-sm'>
        <Search
          size={16}
          className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground'
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='חיפוש לפי שם או קורס...'
          className='w-full rounded-lg border border-border bg-white py-2 pr-9 pl-3 text-sm outline-none focus:border-primary'
        />
      </div>

      <div className='rounded-xl border border-border bg-muted/20 px-3 py-3 sm:px-4'>
        <p className='mb-3 text-center text-xs text-muted-foreground sm:text-right'>
          {filtered.length} מתוך {registrations?.length ?? 0} בקשות
        </p>
        {filtered.length === 0 ? (
          <p className='py-10 text-center text-sm text-muted-foreground'>אין רישומים תואמים</p>
        ) : (
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'>
            {filtered.map((r: CourseRegistration) => {
              const canTlApprove = user.role === Role.TEAM_LEADER && r.status === 'PENDING_TL';
              const canCoordApprove =
                user.role === Role.BRANCH_COORD && r.status === 'PENDING_COORD';
              const canBisApprove = user.role === Role.BIS_CDR && r.status === 'PENDING_BIS';
              const noteLine = r.coordNotes || r.bisNotes || r.rejectionReason || null;
              return (
                <div
                  key={r.id}
                  className='flex flex-col rounded-xl border border-border bg-white p-4 shadow-sm'
                >
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm font-bold text-foreground'>{r.user?.name}</p>
                    <p className='mt-1 text-sm text-foreground leading-snug'>
                      {r.courseInstance?.course?.name}
                    </p>
                    <p className='text-xs text-muted-foreground'>{r.courseInstance?.name}</p>
                    <p className='mt-2 text-xs text-muted-foreground'>
                      {(r.user?.branch as { name: string } | undefined)?.name ?? '—'} ·{' '}
                      {(r.user?.team as { name: string } | undefined)?.name ?? '—'}
                    </p>
                  </div>
                  <div className='mt-3 flex flex-wrap items-center gap-2'>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status]}`}
                    >
                      {STATUS_LABELS[r.status]}
                    </span>
                    <span className='rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground'>
                      תיעדוף: {r.coordPriority ?? '—'}
                    </span>
                  </div>
                  {noteLine && (
                    <p className='mt-2 line-clamp-2 rounded-md bg-muted/50 px-2 py-1.5 text-xs text-muted-foreground'>
                      {noteLine}
                    </p>
                  )}
                  <div className='mt-4 flex flex-wrap justify-end gap-1.5 border-t border-border pt-3'>
                    {canTlApprove && (
                      <>
                        <button
                          type='button'
                          onClick={() => handleApproveTl(r.id)}
                          className='rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600'
                        >
                          אשר
                        </button>
                        <button
                          type='button'
                          onClick={() => handleReject(r.id)}
                          className='rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600'
                        >
                          דחה
                        </button>
                      </>
                    )}
                    {canCoordApprove && (
                      <>
                        <button
                          type='button'
                          onClick={() => handlePrioritize(r.id)}
                          className='rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600'
                        >
                          תעדוף ושלח
                        </button>
                        <button
                          type='button'
                          onClick={() => handleReject(r.id)}
                          className='rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600'
                        >
                          דחה
                        </button>
                      </>
                    )}
                    {canBisApprove && (
                      <>
                        <button
                          type='button'
                          onClick={() => handleApproveFinal(r.id)}
                          className='rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600'
                        >
                          <CheckCircle2 size={12} className='inline' /> אשר סופי
                        </button>
                        <button
                          type='button'
                          onClick={() => handleReject(r.id)}
                          className='rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600'
                        >
                          <XCircle size={12} className='inline' /> דחה
                        </button>
                      </>
                    )}
                    {!canTlApprove &&
                      !canCoordApprove &&
                      !canBisApprove &&
                      r.status !== 'APPROVED' &&
                      r.status !== 'REJECTED' && (
                        <span className='flex items-center gap-1 text-xs text-muted-foreground'>
                          <Clock size={14} /> אין פעולה בשלב זה
                        </span>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
