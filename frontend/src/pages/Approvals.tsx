import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useCallback } from 'react';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import type { CourseRegistration } from '../lib/api';
import { api } from '../lib/api';
import type { AuthUser } from '../lib/auth';
import { Role } from '../lib/roles';

type ApprovalsProps = {
  user: AuthUser;
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING_COORD: { label: 'ממתין לרכז ענפי', color: 'bg-yellow-100 text-yellow-700' },
  PENDING_BIS: { label: 'ממתין לאישור סופי', color: 'bg-blue-100 text-blue-700' },
  APPROVED: { label: 'אושר', color: 'bg-emerald-100 text-emerald-700' },
  REJECTED: { label: 'נדחה', color: 'bg-red-100 text-red-700' },
};

export const Approvals = ({ user }: ApprovalsProps) => {
  const fetcher = useCallback(() => {
    if (user.role === Role.BIS_CDR) return api.getAllRegistrations();
    return api.getBranchRegistrations();
  }, [user.role]);

  const { data: registrations, loading, refetch } = useApi(fetcher);

  if (loading) return <LoadingSpinner />;
  if (!registrations) return null;

  const title = user.role === Role.BIS_CDR ? 'אישור רישומים' : 'רישומים ענפיים';

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
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>{title}</h1>
        <p className='mt-1 text-sm text-muted-foreground'>{registrations.length} רישומים</p>
      </div>

      {registrations.length === 0 ? (
        <div className='rounded-xl border border-border bg-white p-8 text-center shadow-sm'>
          <p className='text-sm text-muted-foreground'>אין רישומים ממתינים</p>
        </div>
      ) : (
        <div className='rounded-xl border border-border bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-border bg-muted/30'>
                  <th className='px-6 py-3 text-right text-xs font-medium uppercase text-muted-foreground'>
                    משתתף
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-medium uppercase text-muted-foreground'>
                    קורס
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-medium uppercase text-muted-foreground'>
                    ענף
                  </th>
                  <th className='px-6 py-3 text-center text-xs font-medium uppercase text-muted-foreground'>
                    סטטוס
                  </th>
                  <th className='px-6 py-3 text-center text-xs font-medium uppercase text-muted-foreground'>
                    תיעדוף
                  </th>
                  <th className='px-6 py-3 text-center text-xs font-medium uppercase text-muted-foreground'>
                    הערות
                  </th>
                  <th className='px-6 py-3' />
                </tr>
              </thead>
              <tbody className='divide-y divide-border'>
                {registrations.map((r: CourseRegistration) => {
                  const status = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.PENDING_COORD;
                  const canCoordApprove =
                    user.role === Role.BRANCH_COORD && r.status === 'PENDING_COORD';
                  const canBisApprove = user.role === Role.BIS_CDR && r.status === 'PENDING_BIS';

                  return (
                    <tr key={r.id} className='hover:bg-muted/30'>
                      <td className='px-6 py-4'>
                        <p className='text-sm font-medium text-foreground'>{r.user?.name}</p>
                        <p className='text-xs text-muted-foreground'>
                          {(r.user?.team as { name: string } | undefined)?.name}
                        </p>
                      </td>
                      <td className='px-6 py-4 text-sm text-foreground'>
                        {r.courseInstance?.course?.name}
                      </td>
                      <td className='px-6 py-4 text-sm text-muted-foreground'>
                        {(r.user?.branch as { name: string } | undefined)?.name}
                      </td>
                      <td className='px-6 py-4 text-center'>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-center text-sm text-foreground'>
                        {r.coordPriority ?? '—'}
                      </td>
                      <td className='max-w-[150px] truncate px-6 py-4 text-xs text-muted-foreground'>
                        {r.coordNotes || r.bisNotes || r.rejectionReason || '—'}
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex justify-end gap-1.5'>
                          {canCoordApprove && (
                            <>
                              <button
                                onClick={() => handlePrioritize(r.id)}
                                className='rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600'
                              >
                                אשר + תעדף
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
                                <CheckCircle2 size={12} className='inline' /> אשר סופי
                              </button>
                              <button
                                onClick={() => handleReject(r.id)}
                                className='rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600'
                              >
                                <XCircle size={12} className='inline' /> דחה
                              </button>
                            </>
                          )}
                          {!canCoordApprove &&
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
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
