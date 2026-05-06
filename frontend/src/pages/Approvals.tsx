import { CheckCircle2, Loader2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { FileUpload } from '../components/FileUpload';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { toast } from '../components/Toast';
import { useApi } from '../hooks/useApi';
import type { CommandCandidacy, CourseRegistration } from '../lib/api';
import { api } from '../lib/api';
import type { AuthUser } from '../lib/auth';
import { Role } from '../lib/roles';

type ApprovalsProps = {
  user: AuthUser;
};

type Tab = 'registrations' | 'candidacies';


type RegAction = { id: number; type: 'approve' | 'prioritize' | 'reject' };
type CandAction = { id: number; type: 'approve' | 'reject' };

export const Approvals = ({ user }: ApprovalsProps) => {
  const [tab, setTab] = useState<Tab>('registrations');

  // Registration data
  const regFetcher = useCallback(() => {
    if (user.role === Role.BIS_CDR) return api.getAllRegistrations();
    if (user.role === Role.TEAM_LEADER) return api.getTeamRegistrations();
    return api.getBranchRegistrations();
  }, [user.role]);
  const { data: allRegs, loading: loadingRegs, refetch: refetchRegs } = useApi(regFetcher);

  // Candidacy data (only BIS_CDR sees candidacies here)
  const candFetcher = useCallback(() => {
    if (user.role === Role.BIS_CDR) return api.getAllCandidacies();
    return Promise.resolve([]);
  }, [user.role]);
  const { data: allCands, loading: loadingCands, refetch: refetchCands } = useApi(candFetcher);

  // Filter: only show items that need THIS user's action
  const pendingRegs = useMemo(() => {
    if (!allRegs) return [];
    if (user.role === Role.TEAM_LEADER) return allRegs.filter((r) => r.status === 'PENDING_TL');
    if (user.role === Role.BRANCH_COORD) return allRegs.filter((r) => r.status === 'PENDING_COORD');
    if (user.role === Role.BIS_CDR) return allRegs.filter((r) => r.status === 'PENDING_BIS');
    return [];
  }, [allRegs, user.role]);

  const pendingCands = useMemo(() => {
    if (!allCands) return [];
    return allCands.filter((c) => c.status === 'PENDING' || c.status === 'COORD_REVIEWED');
  }, [allCands]);

  // Registration actions
  const [regAction, setRegAction] = useState<RegAction | null>(null);
  const [regNotes, setRegNotes] = useState('');
  const [regPriority, setRegPriority] = useState('');
  const [regSubmitting, setRegSubmitting] = useState(false);

  const handleRegSubmit = async () => {
    if (!regAction) return;
    setRegSubmitting(true);
    try {
      if (regAction.type === 'approve') {
        if (user.role === Role.TEAM_LEADER) {
          await api.approveRegistrationTl(regAction.id, regNotes || undefined);
        } else if (user.role === Role.BIS_CDR) {
          await api.approveRegistrationFinal(regAction.id, regNotes || undefined);
        }
        toast.success('אושר בהצלחה');
      } else if (regAction.type === 'prioritize') {
        if (!regPriority) return;
        await api.prioritizeRegistration(regAction.id, {
          coordPriority: Number(regPriority),
          coordNotes: regNotes || undefined,
        });
        toast.success('תועדף ונשלח לאישור');
      } else {
        if (!regNotes) return;
        await api.rejectRegistration(regAction.id, regNotes);
        toast.error('נדחה');
      }
      setRegAction(null);
      setRegNotes('');
      setRegPriority('');
      refetchRegs();
    } finally {
      setRegSubmitting(false);
    }
  };

  // Candidacy actions
  const [candAction, setCandAction] = useState<CandAction | null>(null);
  const [candNotes, setCandNotes] = useState('');
  const [candSubmitting, setCandSubmitting] = useState(false);

  const handleCandSubmit = async () => {
    if (!candAction) return;
    setCandSubmitting(true);
    try {
      if (candAction.type === 'approve') {
        await api.approveCandidacy(candAction.id, candNotes || undefined);
        toast.success('מועמדות אושרה');
      } else {
        if (!candNotes) return;
        await api.rejectCandidacy(candAction.id, candNotes);
        toast.error('מועמדות נדחתה');
      }
      setCandAction(null);
      setCandNotes('');
      refetchCands();
    } finally {
      setCandSubmitting(false);
    }
  };

  if (loadingRegs || loadingCands) return <LoadingSpinner />;

  const regModalTitle = regAction?.type === 'reject' ? 'דחיית בקשה' : regAction?.type === 'prioritize' ? 'תיעדוף ושליחה' : 'אישור בקשה';
  const candModalTitle = candAction?.type === 'reject' ? 'דחיית מועמדות' : 'אישור מועמדות';

  return (
    <div className='space-y-5'>
      <div>
        <h1 className='text-xl font-bold text-foreground'>ממתינים לאישורך</h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          {user.role === Role.BIS_CDR && 'רישומים לקורסים מתקדמים + מועמדויות לפיקוד'}
          {user.role === Role.BRANCH_COORD && 'רישומים לקורסים מתקדמים - תעדוף ושליחה למפקד'}
          {user.role === Role.TEAM_LEADER && 'רישומים של חיילי הצוות - אישור ראשוני'}
        </p>
      </div>

      {/* Tabs - only show if BIS_CDR (has both) */}
      {user.role === Role.BIS_CDR && (
        <div className='flex gap-1 rounded-lg bg-muted p-1'>
          <button
            type='button'
            onClick={() => setTab('registrations')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'registrations' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            רישומים ({pendingRegs.length})
          </button>
          <button
            type='button'
            onClick={() => setTab('candidacies')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'candidacies' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            מועמדויות ({pendingCands.length})
          </button>
        </div>
      )}

      {/* Registrations tab */}
      {tab === 'registrations' && (
        <div>
          {pendingRegs.length === 0 ? (
            <div className='flex flex-col items-center justify-center rounded-xl border border-border bg-white p-12 gap-2'>
              <CheckCircle2 size={40} className='text-emerald-200' />
              <p className='text-sm font-medium text-muted-foreground'>אין רישומים ממתינים לאישורך</p>
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
                  {r.coordPriority && (
                    <span className='mt-2 inline-block w-fit rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground'>
                      תיעדוף: {r.coordPriority}
                    </span>
                  )}

                  <FileUpload entityType='registration' entityId={r.id} canUpload />

                  <div className='mt-4 flex flex-wrap gap-2 border-t border-border pt-3'>
                    {user.role === Role.BRANCH_COORD ? (
                      <>
                        <button type='button' onClick={() => setRegAction({ id: r.id, type: 'prioritize' })} className='rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600'>
                          תעדוף ושלח
                        </button>
                        <button type='button' onClick={() => setRegAction({ id: r.id, type: 'reject' })} className='rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600'>
                          דחה
                        </button>
                      </>
                    ) : (
                      <>
                        <button type='button' onClick={() => setRegAction({ id: r.id, type: 'approve' })} className='rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600'>
                          אשר
                        </button>
                        <button type='button' onClick={() => setRegAction({ id: r.id, type: 'reject' })} className='rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600'>
                          דחה
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Candidacies tab (BIS_CDR only) */}
      {tab === 'candidacies' && user.role === Role.BIS_CDR && (
        <div>
          {pendingCands.length === 0 ? (
            <div className='flex flex-col items-center justify-center rounded-xl border border-border bg-white p-12 gap-2'>
              <CheckCircle2 size={40} className='text-emerald-200' />
              <p className='text-sm font-medium text-muted-foreground'>אין מועמדויות ממתינות לאישורך</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'>
              {pendingCands.map((c: CommandCandidacy) => (
                <div key={c.id} className='flex flex-col rounded-xl border border-border bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-amber-200'>
                  <p className='text-sm font-bold text-foreground'>{c.candidate?.name}</p>
                  <p className='mt-1 text-sm text-foreground'>{c.courseInstance?.course?.name}</p>
                  <p className='text-xs text-muted-foreground'>{c.courseInstance?.name}</p>
                  {c.motivation && (
                    <p className='mt-2 rounded-md bg-muted/50 px-2 py-1.5 text-xs text-muted-foreground'>
                      {c.motivation}
                    </p>
                  )}
                  {c.commanderNotes && (
                    <p className='mt-1 text-xs text-muted-foreground'>הערות: {c.commanderNotes}</p>
                  )}
                  <span className={`mt-2 inline-block w-fit rounded-full px-2 py-0.5 text-[10px] font-medium ${c.status === 'COORD_REVIEWED' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {c.status === 'COORD_REVIEWED' ? 'נבדק ע"י רכז' : 'ממתין'}
                  </span>

                  <FileUpload entityType='candidacy' entityId={c.id} canUpload />

                  <div className='mt-4 flex flex-wrap gap-2 border-t border-border pt-3'>
                    <button type='button' onClick={() => setCandAction({ id: c.id, type: 'approve' })} className='rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600'>
                      אשר
                    </button>
                    <button type='button' onClick={() => setCandAction({ id: c.id, type: 'reject' })} className='rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600'>
                      דחה
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Registration action modal */}
      <Modal open={regAction !== null} onClose={() => { setRegAction(null); setRegNotes(''); setRegPriority(''); }} title={regModalTitle} size='sm'>
        <div className='space-y-3'>
          {regAction?.type === 'prioritize' && (
            <div>
              <label className='mb-1 block text-xs font-medium text-foreground'>תיעדוף (1 = גבוה)</label>
              <input type='number' min={1} value={regPriority} onChange={(e) => setRegPriority(e.target.value)} className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary' autoFocus />
            </div>
          )}
          <div>
            <label className='mb-1 block text-xs font-medium text-foreground'>
              {regAction?.type === 'reject' ? 'סיבת דחייה' : 'הערות (אופציונלי)'}
            </label>
            <textarea value={regNotes} onChange={(e) => setRegNotes(e.target.value)} rows={2} placeholder={regAction?.type === 'reject' ? 'חובה...' : ''} className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary' autoFocus={regAction?.type !== 'prioritize'} />
          </div>
          <div className='flex justify-end gap-2'>
            <button type='button' onClick={() => { setRegAction(null); setRegNotes(''); setRegPriority(''); }} className='rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted'>ביטול</button>
            <button
              type='button'
              onClick={handleRegSubmit}
              disabled={regSubmitting || (regAction?.type === 'reject' && !regNotes) || (regAction?.type === 'prioritize' && !regPriority)}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 ${regAction?.type === 'reject' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
            >
              {regSubmitting && <Loader2 size={14} className='animate-spin' />}
              {regAction?.type === 'reject' ? 'דחה' : 'אשר'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Candidacy action modal */}
      <Modal open={candAction !== null} onClose={() => { setCandAction(null); setCandNotes(''); }} title={candModalTitle} size='sm'>
        <div className='space-y-3'>
          <div>
            <label className='mb-1 block text-xs font-medium text-foreground'>
              {candAction?.type === 'reject' ? 'סיבת דחייה' : 'הערות (אופציונלי)'}
            </label>
            <textarea value={candNotes} onChange={(e) => setCandNotes(e.target.value)} rows={2} placeholder={candAction?.type === 'reject' ? 'חובה...' : ''} className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary' autoFocus />
          </div>
          <div className='flex justify-end gap-2'>
            <button type='button' onClick={() => { setCandAction(null); setCandNotes(''); }} className='rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted'>ביטול</button>
            <button
              type='button'
              onClick={handleCandSubmit}
              disabled={candSubmitting || (candAction?.type === 'reject' && !candNotes)}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 ${candAction?.type === 'reject' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
            >
              {candSubmitting && <Loader2 size={14} className='animate-spin' />}
              {candAction?.type === 'reject' ? 'דחה' : 'אשר'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
