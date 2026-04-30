import { CheckCircle2, Clock, Search, XCircle } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { LoadingSpinner } from '../components/LoadingSpinner';
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
      ? 'אישור רישומים'
      : user.role === Role.TEAM_LEADER
        ? 'אישור רישומים צוותיים'
        : 'רישומים ענפיים';

  const handleApproveTl = async (id: number) => {
    const notes = prompt('הערות (אופציונלי):');
    await api.approveRegistrationTl(id, notes ?? undefined);
    refetch();
  };

  const statusCounts = {
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

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-bold text-foreground'>{title}</h1>

      {/* Status filter chips */}
      <div className='flex flex-wrap gap-2'>
        <button
          onClick={() => setStatusFilter('')}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!statusFilter ? 'bg-foreground text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
        >
          הכל ({registrations?.length ?? 0})
        </button>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(statusFilter === key ? '' : key)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${statusFilter === key ? 'bg-foreground text-white' : `${STATUS_COLORS[key]} hover:opacity-80`}`}
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

      {/* Table */}
      <div className='rounded-xl border border-border bg-white shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-border bg-muted/30 text-right'>
                <th className='px-4 py-3 text-xs font-medium text-muted-foreground'>משתתף</th>
                <th className='px-4 py-3 text-xs font-medium text-muted-foreground'>קורס</th>
                <th className='px-4 py-3 text-xs font-medium text-muted-foreground'>ענף / צוות</th>
                <th className='px-4 py-3 text-center text-xs font-medium text-muted-foreground'>
                  סטטוס
                </th>
                <th className='px-4 py-3 text-center text-xs font-medium text-muted-foreground'>
                  תיעדוף
                </th>
                <th className='px-4 py-3 text-xs font-medium text-muted-foreground'>הערות</th>
                <th className='px-4 py-3 w-32' />
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {filtered.map((r: CourseRegistration) => {
                const canTlApprove = user.role === Role.TEAM_LEADER && r.status === 'PENDING_TL';
                const canCoordApprove =
                  user.role === Role.BRANCH_COORD && r.status === 'PENDING_COORD';
                const canBisApprove = user.role === Role.BIS_CDR && r.status === 'PENDING_BIS';
                return (
                  <tr key={r.id} className='hover:bg-muted/30'>
                    <td className='px-4 py-3'>
                      <p className='text-sm font-medium text-foreground'>{r.user?.name}</p>
                    </td>
                    <td className='px-4 py-3'>
                      <p className='text-sm text-foreground'>{r.courseInstance?.course?.name}</p>
                      <p className='text-xs text-muted-foreground'>{r.courseInstance?.name}</p>
                    </td>
                    <td className='px-4 py-3 text-xs text-muted-foreground'>
                      {(r.user?.branch as { name: string } | undefined)?.name} /{' '}
                      {(r.user?.team as { name: string } | undefined)?.name ?? '—'}
                    </td>
                    <td className='px-4 py-3 text-center'>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status]}`}
                      >
                        {STATUS_LABELS[r.status]}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-center text-sm font-medium text-foreground'>
                      {r.coordPriority ?? '—'}
                    </td>
                    <td className='max-w-[120px] truncate px-4 py-3 text-xs text-muted-foreground'>
                      {r.coordNotes || r.bisNotes || r.rejectionReason || '—'}
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex justify-end gap-1'>
                        {canTlApprove && (
                          <>
                            <button
                              onClick={() => handleApproveTl(r.id)}
                              className='rounded bg-emerald-500 px-2 py-1 text-xs text-white hover:bg-emerald-600'
                            >
                              אשר
                            </button>
                            <button
                              onClick={() => handleReject(r.id)}
                              className='rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600'
                            >
                              דחה
                            </button>
                          </>
                        )}
                        {canCoordApprove && (
                          <>
                            <button
                              onClick={() => handlePrioritize(r.id)}
                              className='rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600'
                            >
                              אשר
                            </button>
                            <button
                              onClick={() => handleReject(r.id)}
                              className='rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600'
                            >
                              דחה
                            </button>
                          </>
                        )}
                        {canBisApprove && (
                          <>
                            <button
                              onClick={() => handleApproveFinal(r.id)}
                              className='rounded bg-emerald-500 px-2 py-1 text-xs text-white hover:bg-emerald-600'
                            >
                              <CheckCircle2 size={12} className='inline' /> אשר
                            </button>
                            <button
                              onClick={() => handleReject(r.id)}
                              className='rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600'
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
                            <Clock size={14} className='text-muted-foreground' />
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className='px-4 py-8 text-center text-sm text-muted-foreground'>
                    אין רישומים תואמים
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className='border-t border-border px-4 py-2 text-xs text-muted-foreground'>
          {filtered.length} מתוך {registrations?.length ?? 0}
        </div>
      </div>
    </div>
  );
};
