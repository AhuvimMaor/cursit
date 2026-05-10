import { CheckCircle2, Loader2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { FileUpload } from '../components/FileUpload';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { toast } from '../components/Toast';
import { useApi } from '../hooks/useApi';
import type { CourseRegistration } from '../lib/api';
import { api } from '../lib/api';

type RegAction = { id: number; type: 'approve' | 'reject' };

export const Approvals = () => {
  const regFetcher = useCallback(() => api.getBranchRegistrations(), []);
  const { data: allRegs, loading, refetch } = useApi(regFetcher);

  const pendingRegs = useMemo(() => {
    if (!allRegs) return [];
    return allRegs.filter((r) => r.status === 'PENDING_COORD');
  }, [allRegs]);

  const [action, setAction] = useState<RegAction | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!action) return;
    setSubmitting(true);
    try {
      if (action.type === 'approve') {
        await api.prioritizeRegistration(action.id, {
          coordNotes: notes || undefined,
        });
        toast.success('הרישום אושר');
      } else {
        if (!notes) return;
        await api.rejectRegistration(action.id, notes);
        toast.error('הרישום נדחה');
      }
      setAction(null);
      setNotes('');
      refetch();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const modalTitle = action?.type === 'reject' ? 'דחיית בקשה' : 'אישור רישום';

  return (
    <div className='space-y-5'>
      <div>
        <h1 className='text-xl font-bold text-foreground'>רישומים ממתינים לאישור</h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          בקשות רישום לקורסים מתקדמים שהוגשו ע"י חיילים
        </p>
      </div>

      {pendingRegs.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-xl border border-border bg-white p-12 gap-2'>
          <CheckCircle2 size={40} className='text-emerald-200' />
          <p className='text-sm font-medium text-muted-foreground'>אין רישומים ממתינים לאישור</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'>
          {pendingRegs.map((r: CourseRegistration) => (
            <div key={r.id} className='flex flex-col rounded-xl border border-border bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/20'>
              <p className='text-sm font-bold text-foreground'>{r.user?.name}</p>
              <p className='mt-1 text-sm text-foreground'>{r.courseInstance?.course?.name}</p>
              <p className='text-xs text-muted-foreground'>{r.courseInstance?.name}</p>
              <p className='mt-2 text-xs text-muted-foreground'>
                {(r.user?.branch as { name: string } | undefined)?.name ?? ''} · {(r.user?.team as { name: string } | undefined)?.name ?? ''}
              </p>

              <FileUpload entityType='registration' entityId={r.id} canUpload />

              <div className='mt-4 flex flex-wrap gap-2 border-t border-border pt-3'>
                <button type='button' onClick={() => setAction({ id: r.id, type: 'approve' })} className='rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600'>
                  אשר
                </button>
                <button type='button' onClick={() => setAction({ id: r.id, type: 'reject' })} className='rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600'>
                  דחה
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={action !== null} onClose={() => { setAction(null); setNotes(''); }} title={modalTitle} size='sm'>
        <div className='space-y-3'>
          <div>
            <label className='mb-1 block text-xs font-medium text-foreground'>
              {action?.type === 'reject' ? 'סיבת דחייה' : 'הערות (אופציונלי)'}
            </label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder={action?.type === 'reject' ? 'חובה...' : ''} className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary' autoFocus />
          </div>
          <div className='flex justify-end gap-2'>
            <button type='button' onClick={() => { setAction(null); setNotes(''); }} className='rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted'>ביטול</button>
            <button
              type='button'
              onClick={handleSubmit}
              disabled={submitting || (action?.type === 'reject' && !notes)}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 ${action?.type === 'reject' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
            >
              {submitting && <Loader2 size={14} className='animate-spin' />}
              {action?.type === 'reject' ? 'דחה' : 'אשר'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
