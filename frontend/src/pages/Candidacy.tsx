import { CheckCircle2, Clock, Eye, XCircle } from 'lucide-react';
import { useCallback } from 'react';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import type { CommandCandidacy } from '../lib/api';
import { api } from '../lib/api';
import type { AuthUser } from '../lib/auth';
import { Role } from '../lib/roles';

type CandidacyProps = {
  user: AuthUser;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: 'ממתין', color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={14} /> },
  COORD_REVIEWED: {
    label: 'נבדק ע"י רכז',
    color: 'bg-blue-100 text-blue-700',
    icon: <Eye size={14} />,
  },
  APPROVED: {
    label: 'אושר',
    color: 'bg-emerald-100 text-emerald-700',
    icon: <CheckCircle2 size={14} />,
  },
  REJECTED: { label: 'נדחה', color: 'bg-red-100 text-red-700', icon: <XCircle size={14} /> },
};

export const Candidacy = ({ user }: CandidacyProps) => {
  const fetcher = useCallback(() => {
    if (user.role === Role.BIS_CDR) return api.getAllCandidacies();
    if (user.role === Role.BRANCH_COORD) return api.getBranchCandidacies();
    return api.getMyCandidacySubmissions();
  }, [user.role]);

  const { data: candidacies, loading, refetch } = useApi(fetcher);

  if (loading) return <LoadingSpinner />;
  if (!candidacies) return null;

  const title =
    user.role === Role.BIS_CDR
      ? 'כל המועמדויות'
      : user.role === Role.BRANCH_COORD
        ? 'מועמדויות הענף'
        : 'המועמדויות שהגשתי';

  const handleApprove = async (id: number) => {
    await api.approveCandidacy(id);
    refetch();
  };

  const handleReject = async (id: number) => {
    await api.rejectCandidacy(id);
    refetch();
  };

  const handleCoordReview = async (id: number) => {
    await api.coordReviewCandidacy(id);
    refetch();
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>{title}</h1>
        <p className='mt-1 text-sm text-muted-foreground'>{candidacies.length} מועמדויות</p>
      </div>

      {candidacies.length === 0 ? (
        <div className='rounded-xl border border-border bg-white p-8 text-center shadow-sm'>
          <p className='text-sm text-muted-foreground'>אין מועמדויות</p>
        </div>
      ) : (
        <div className='space-y-4'>
          {candidacies.map((c: CommandCandidacy) => {
            const status = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.PENDING;
            return (
              <div key={c.id} className='rounded-xl border border-border bg-white p-6 shadow-sm'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2'>
                      <h3 className='text-sm font-semibold text-foreground'>{c.candidate?.name}</h3>
                      <span
                        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}
                      >
                        {status.icon}
                        {status.label}
                      </span>
                    </div>
                    <p className='mt-0.5 text-xs text-muted-foreground'>
                      {c.courseInstance?.course?.name} — {c.courseInstance?.name}
                    </p>
                    {c.candidate?.team && (
                      <p className='text-xs text-muted-foreground'>
                        צוות: {(c.candidate.team as { name: string }).name}
                      </p>
                    )}
                  </div>
                </div>

                {c.motivation && (
                  <div className='mt-3 rounded-md bg-muted/50 px-3 py-2'>
                    <p className='text-xs font-medium text-foreground'>מוטיבציה:</p>
                    <p className='mt-0.5 text-xs text-muted-foreground'>{c.motivation}</p>
                  </div>
                )}

                {c.commanderNotes && (
                  <p className='mt-2 text-xs text-muted-foreground'>
                    הערות מגיש: {c.commanderNotes}
                  </p>
                )}

                {/* Actions */}
                {user.role === Role.BRANCH_COORD && c.status === 'PENDING' && (
                  <div className='mt-4 flex gap-2 border-t border-border pt-3'>
                    <button
                      onClick={() => handleCoordReview(c.id)}
                      className='rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600'
                    >
                      סמן כנבדק
                    </button>
                  </div>
                )}

                {user.role === Role.BIS_CDR &&
                  (c.status === 'PENDING' || c.status === 'COORD_REVIEWED') && (
                    <div className='mt-4 flex gap-2 border-t border-border pt-3'>
                      <button
                        onClick={() => handleApprove(c.id)}
                        className='rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600'
                      >
                        אשר
                      </button>
                      <button
                        onClick={() => handleReject(c.id)}
                        className='rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600'
                      >
                        דחה
                      </button>
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
