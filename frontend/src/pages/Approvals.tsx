import { CheckCircle2, Loader2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { FileUpload } from '../components/FileUpload';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { toast } from '../components/Toast';
import { useApi } from '../hooks/useApi';
import type { CourseRegistration } from '../lib/api';
import { api } from '../lib/api';
import type { AuthUser } from '../lib/auth';
import { Role } from '../lib/roles';

type ApprovalsProps = {
  user: AuthUser;
};

type RegAction = { id: number; type: 'approve' | 'prioritize' | 'reject' };

export const Approvals = ({ user }: ApprovalsProps) => {
  const regFetcher = useCallback(() => {
    if (user.role === Role.TEAM_LEADER) return api.getTeamRegistrations();
    return api.getBranchRegistrations();
  }, [user.role]);
  const { data: allRegs, loading, refetch } = useApi(regFetcher);

  const pendingRegs = useMemo(() => {
    if (!allRegs) return [];
    if (user.role === Role.TEAM_LEADER) return allRegs.filter((r) => r.status === 'PENDING_TL');
    if (user.role === Role.BRANCH_COORD) return allRegs.filter((r) => r.status === 'PENDING_COORD');
    return [];
  }, [allRegs, user.role]);

  const [action, setAction] = useState<RegAction | null>(null);
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!action) return;
    setSubmitting(true);
    try {
      if (action.type === 'approve') {
        await api.approveRegistrationTl(action.id, notes || undefined);
        toast.success('אושר בהצלחה');
      } else if (action.type === 'prioritize') {
        if (!priority) return;
        await api.prioritizeRegistration(action.id, {
          coordPriority: Number(priority),
          coordNotes: notes || undefined,
        });
        toast.success('תועדף ונשלח');
      } else {
        if (!notes) return;
        await api.rejectRegistration(action.id, notes);
        toast.error('נדחה');
      }
      setAction(null);
      setNotes('');
      setPriority('');
      refetch();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const title =
    user.role === Role.TEAM_LEADER ? 'אישור רישום - הצוות שלך' : 'תיעדוף רישומים - הענף';

  const subtitle =
    user.role === Role.TEAM_LEADER
      ? 'חיילי הצוות שהגישו בקשה לרישום לקורס מתקדם'
      : 'רישומים שעברו אישור ראש צוות - תעדף ושלח';

  const modalTitle =
    action?.type === 'reject'
      ? 'דחיית בקשה'
      : action?.type === 'prioritize'
        ? 'תיעדוף ושליחה'
        : 'אישור';

  return (
    <div className='space-y-5'>
      <div>
        <h1 className='text-xl font-bold text-foreground'>{title}</h1>
        <p className='mt-1 text-sm text-muted-foreground'>{subtitle}</p>
      </div>

      {pendingRegs.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-xl border border-border bg-white p-12 gap-2'>
          <CheckCircle2 size={40} className='text-emerald-200' />
          <p className='text-sm font-medium text-muted-foreground'>אין רישומים ממתינים</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'>
          {pendingRegs.map((r: CourseRegistration) => (
            <div
              key={r.id}
              className='flex flex-col rounded-xl border border-border bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/20'
            >
              <p className='text-sm font-bold text-foreground'>{r.user?.name}</p>
              <p className='mt-1 text-sm text-foreground'>{r.courseInstance?.course?.name}</p>
              <p className='text-xs text-muted-foreground'>{r.courseInstance?.name}</p>
              <p className='mt-2 text-xs text-muted-foreground'>
                {(r.user?.branch as { name: string } | undefined)?.name ?? ''} ·{' '}
                {(r.user?.team as { name: string } | undefined)?.name ?? ''}
              </p>

              <FileUpload entityType='registration' entityId={r.id} canUpload />

              <div className='mt-4 flex flex-wrap gap-2 border-t border-border pt-3'>
                {user.role === Role.BRANCH_COORD ? (
                  <>
                    <button
                      type='button'
                      onClick={() => setAction({ id: r.id, type: 'prioritize' })}
                      className='rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600'
                    >
                      תעדוף ושלח
                    </button>
                    <button
                      type='button'
                      onClick={() => setAction({ id: r.id, type: 'reject' })}
                      className='rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600'
                    >
                      דחה
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type='button'
                      onClick={() => setAction({ id: r.id, type: 'approve' })}
                      className='rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600'
                    >
                      אשר
                    </button>
                    <button
                      type='button'
                      onClick={() => setAction({ id: r.id, type: 'reject' })}
                      className='rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600'
                    >
                      דחה
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={action !== null}
        onClose={() => {
          setAction(null);
          setNotes('');
          setPriority('');
        }}
        title={modalTitle}
        size='sm'
      >
        <div className='space-y-3'>
          {action?.type === 'prioritize' && (
            <div>
              <label className='mb-1 block text-xs font-medium text-foreground'>
                תיעדוף (1 = גבוה)
              </label>
              <input
                type='number'
                min={1}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary'
                autoFocus
              />
            </div>
          )}
          <div>
            <label className='mb-1 block text-xs font-medium text-foreground'>
              {action?.type === 'reject' ? 'סיבת דחייה' : 'הערות (אופציונלי)'}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder={action?.type === 'reject' ? 'חובה...' : ''}
              className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary'
              autoFocus={action?.type !== 'prioritize'}
            />
          </div>
          <div className='flex justify-end gap-2'>
            <button
              type='button'
              onClick={() => {
                setAction(null);
                setNotes('');
                setPriority('');
              }}
              className='rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted'
            >
              ביטול
            </button>
            <button
              type='button'
              onClick={handleSubmit}
              disabled={
                submitting ||
                (action?.type === 'reject' && !notes) ||
                (action?.type === 'prioritize' && !priority)
              }
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 ${action?.type === 'reject' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
            >
              {submitting && <Loader2 size={14} className='animate-spin' />}
              {action?.type === 'reject' ? 'דחה' : action?.type === 'prioritize' ? 'שלח' : 'אשר'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
