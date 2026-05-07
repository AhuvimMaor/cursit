import { CheckCircle2, Clock, Eye, Loader2, Plus, XCircle } from 'lucide-react';
import { useCallback, useState } from 'react';

import { FileUpload } from '../components/FileUpload';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { ScreenGuide } from '../components/ScreenGuide';
import { toast } from '../components/Toast';
import { useApi } from '../hooks/useApi';
import type { CommandCandidacy, Course, User } from '../lib/api';
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

type ActionModal = { id: number; type: 'approve' | 'reject' };

export const Candidacy = ({ user }: CandidacyProps) => {
  const fetcher = useCallback(() => {
    if (user.role === Role.BIS_CDR) return api.getAllCandidacies();
    if (user.role === Role.BRANCH_COORD) return api.getBranchCandidacies();
    return api.getMyCandidacySubmissions();
  }, [user.role]);

  const { data: candidacies, loading, refetch } = useApi(fetcher);

  const [showFormModal, setShowFormModal] = useState(false);
  const [actionModal, setActionModal] = useState<ActionModal | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <LoadingSpinner />;
  if (!candidacies) return null;

  const title =
    user.role === Role.BIS_CDR
      ? 'מועמדות לפיקוד - כל המערכת'
      : user.role === Role.BRANCH_COORD
        ? 'מועמדות לפיקוד - הענף'
        : 'מועמדות לפיקוד שהגשתי';

  const openActionModal = (id: number, type: ActionModal['type']) => {
    setActionModal({ id, type });
    setActionNotes('');
  };

  const closeActionModal = () => {
    setActionModal(null);
    setActionNotes('');
  };

  const handleSubmitAction = async () => {
    if (!actionModal) return;
    if (actionModal.type === 'reject' && !actionNotes) return;
    setSubmitting(true);
    try {
      if (actionModal.type === 'approve') {
        await api.approveCandidacy(actionModal.id, actionNotes || undefined);
        toast.success('המועמדות אושרה בהצלחה');
      } else {
        await api.rejectCandidacy(actionModal.id, actionNotes);
        toast.error('המועמדות נדחתה');
      }
      closeActionModal();
      refetch();
    } finally {
      setSubmitting(false);
    }
  };

  const handleCoordReview = async (id: number) => {
    await api.coordReviewCandidacy(id);
    toast.info('המועמדות סומנה כנבדקה');
    refetch();
  };

  const candidacyTags =
    user.role === Role.BIS_CDR
      ? (['כל הארגון', 'אישור / דחייה', 'סטטוס'] as const)
      : user.role === Role.BRANCH_COORD
        ? (['הענף שלך', 'בדיקת רכז', 'המשך למנהל'] as const)
        : (['הגשות שלך', 'מעקב', 'טופס חדש'] as const);

  const actionModalTitle = actionModal?.type === 'reject' ? 'דחיית מועמדות' : 'אישור מועמדות';

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <ScreenGuide
          className='min-w-0 flex-1'
          eyebrow='תהליכים'
          title={title}
          subtitle={`${candidacies.length} הגשות לקורסי פיקוד - כרטיס לכל מועמדות; סטטוס בצבע.`}
          tags={candidacyTags}
        />
        {(user.role === Role.TEAM_LEADER || user.role === Role.BIS_CDR) && (
          <button
            type='button'
            onClick={() => setShowFormModal(true)}
            className='flex shrink-0 items-center justify-center gap-1.5 self-start rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 sm:self-auto'
          >
            <Plus size={16} />
            הגש מועמדות
          </button>
        )}
      </div>

      {/* Cards grid */}
      {candidacies.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-xl border border-border bg-white p-12 text-center shadow-sm gap-3'>
          <CheckCircle2 size={48} className='text-muted-foreground/30' />
          <p className='text-sm font-medium text-muted-foreground'>אין מועמדויות עדיין</p>
          <p className='text-xs text-muted-foreground/70'>
            {user.role === Role.TEAM_LEADER || user.role === Role.BIS_CDR
              ? 'לחץ "הגש מועמדות" כדי להוסיף מועמדות חדשה'
              : 'כאן יופיעו המועמדויות שתוגשנה עבורך'}
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'>
          {candidacies.map((c: CommandCandidacy) => {
            const status = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.PENDING;

            return (
              <div
                key={c.id}
                className='flex flex-col rounded-xl border border-border bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/20'
              >
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
                      {c.courseInstance?.course?.name} - {c.courseInstance?.name}
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

                {c.reviewNotes && (
                  <p className='mt-1 text-xs text-muted-foreground'>
                    הערות בדיקה: {c.reviewNotes}
                  </p>
                )}

                <FileUpload
                  entityType='candidacy'
                  entityId={c.id}
                  canUpload={user.role === Role.TEAM_LEADER || user.role === Role.BIS_CDR}
                />

                {/* BRANCH_COORD action */}
                {user.role === Role.BRANCH_COORD && c.status === 'PENDING' && (
                  <div className='mt-4 flex gap-2 border-t border-border pt-3'>
                    <button
                      type='button'
                      onClick={() => handleCoordReview(c.id)}
                      className='rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600'
                    >
                      סמן כנבדק
                    </button>
                  </div>
                )}

                {/* BIS_CDR actions */}
                {user.role === Role.BIS_CDR &&
                  (c.status === 'PENDING' || c.status === 'COORD_REVIEWED') && (
                    <div className='mt-4 flex gap-2 border-t border-border pt-3'>
                      <button
                        type='button'
                        onClick={() => openActionModal(c.id, 'approve')}
                        className='rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600'
                      >
                        אשר
                      </button>
                      <button
                        type='button'
                        onClick={() => openActionModal(c.id, 'reject')}
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

      {/* Submit candidacy modal */}
      <Modal
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        title='הגשת מועמדות חדשה'
        size='lg'
      >
        <CandidacyForm
          teamId={user.teamId ?? undefined}
          isAdmin={user.role === Role.BIS_CDR}
          onSubmitted={() => {
            setShowFormModal(false);
            refetch();
          }}
          onCancel={() => setShowFormModal(false)}
        />
      </Modal>

      {/* Approve / reject modal */}
      <Modal open={!!actionModal} onClose={closeActionModal} title={actionModalTitle} size='sm'>
        <div className='mb-4'>
          <label className='mb-1.5 block text-xs font-medium text-foreground'>
            {actionModal?.type === 'reject' ? 'סיבת דחייה' : 'הערות (אופציונלי)'}
          </label>
          <textarea
            value={actionNotes}
            onChange={(e) => setActionNotes(e.target.value)}
            rows={3}
            placeholder={
              actionModal?.type === 'reject' ? 'חובה לציין סיבה...' : 'הערות נוספות...'
            }
            className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary'
          />
        </div>
        <div className='flex justify-end gap-2'>
          <button
            type='button'
            onClick={closeActionModal}
            className='rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted'
          >
            ביטול
          </button>
          <button
            type='button'
            onClick={handleSubmitAction}
            disabled={submitting || (actionModal?.type === 'reject' && !actionNotes)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 transition-colors ${
              actionModal?.type === 'reject'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            {submitting && <Loader2 size={14} className='animate-spin' />}
            {actionModal?.type === 'reject' ? 'דחה' : 'אשר'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

type CandidacyFormProps = {
  teamId?: number;
  isAdmin?: boolean;
  onSubmitted: () => void;
  onCancel: () => void;
};

function CandidacyForm({ teamId, isAdmin, onSubmitted, onCancel }: CandidacyFormProps) {
  const membersFetcher = useCallback(
    () =>
      isAdmin
        ? api.getUsers().then((users) => users.filter((u) => u.role === Role.TRAINEE))
        : teamId
          ? api.getTeamMembers(teamId)
          : Promise.resolve([]),
    [teamId, isAdmin],
  );
  const coursesFetcher = useCallback(() => api.getCourses(), []);
  const { data: members, loading: l1 } = useApi(membersFetcher);
  const { data: courses, loading: l2 } = useApi(coursesFetcher);

  const [candidateId, setCandidateId] = useState('');
  const [instanceId, setInstanceId] = useState('');
  const [motivation, setMotivation] = useState('');
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const foundationCourses = courses?.filter((c: Course) => c.type === 'FOUNDATION') ?? [];
  const allInstances = foundationCourses.flatMap((c: Course) =>
    (c.instances ?? [])
      .filter((i) => i.status === 'OPEN')
      .map((i) => ({ ...i, courseName: c.name })),
  );

  const handleSubmit = async () => {
    if (!candidateId || !instanceId) {
      setError('יש לבחור משתתף ומחזור');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const result = await api.submitCandidacy({
        courseInstanceId: Number(instanceId),
        candidateId: Number(candidateId),
        motivation: motivation || undefined,
        commanderNotes: notes || undefined,
      });
      for (const f of files) {
        await api.uploadFile('candidacy', result.id, f);
      }
      onSubmitted();
    } catch {
      setError('שגיאה בהגשת המועמדות');
    } finally {
      setSubmitting(false);
    }
  };

  if (l1 || l2) return <LoadingSpinner />;

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>בחר משתתף מהצוות</label>
          <select
            value={candidateId}
            onChange={(e) => setCandidateId(e.target.value)}
            className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary'
          >
            <option value=''>בחר...</option>
            {members?.map((m: User) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>בחר מחזור קורס</label>
          <select
            value={instanceId}
            onChange={(e) => setInstanceId(e.target.value)}
            className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary'
          >
            <option value=''>בחר...</option>
            {allInstances.map((i) => (
              <option key={i.id} value={i.id}>
                {i.courseName} - {i.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className='mb-1 block text-xs font-medium text-foreground'>מוטיבציה</label>
        <textarea
          value={motivation}
          onChange={(e) => setMotivation(e.target.value)}
          placeholder='מדוע המשתתף מתאים?'
          rows={3}
          className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary'
        />
      </div>

      <div>
        <label className='mb-1 block text-xs font-medium text-foreground'>הערות</label>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder='הערות נוספות (אופציונלי)'
          className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary'
        />
      </div>

      <div>
        <label className='mb-1 block text-xs font-medium text-foreground'>קבצים מצורפים</label>
        <input
          type='file'
          multiple
          accept='.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp'
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm file:ml-2 file:rounded file:border-0 file:bg-primary/10 file:px-2 file:py-0.5 file:text-xs file:font-medium file:text-primary'
        />
        {files.length > 0 && (
          <p className='mt-1 text-xs text-muted-foreground'>
            {files.length} קבצים נבחרו
          </p>
        )}
      </div>

      {error && <p className='text-xs text-red-600'>{error}</p>}

      <div className='flex justify-end gap-2 pt-1'>
        <button
          type='button'
          onClick={onCancel}
          className='rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted'
        >
          ביטול
        </button>
        <button
          type='button'
          onClick={handleSubmit}
          disabled={submitting}
          className='flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50'
        >
          {submitting && <Loader2 size={14} className='animate-spin' />}
          הגש מועמדות
        </button>
      </div>
    </div>
  );
}
