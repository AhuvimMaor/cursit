import { CheckCircle2, Clock, Eye, Loader2, Plus, XCircle } from 'lucide-react';
import { useCallback, useState } from 'react';

import { LoadingSpinner } from '../components/LoadingSpinner';
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

export const Candidacy = ({ user }: CandidacyProps) => {
  const fetcher = useCallback(() => {
    if (user.role === Role.BIS_CDR) return api.getAllCandidacies();
    if (user.role === Role.BRANCH_COORD) return api.getBranchCandidacies();
    return api.getMyCandidacySubmissions();
  }, [user.role]);

  const { data: candidacies, loading, refetch } = useApi(fetcher);
  const [showForm, setShowForm] = useState(false);

  if (loading) return <LoadingSpinner />;
  if (!candidacies) return null;

  const title =
    user.role === Role.BIS_CDR
      ? 'כל המועמדויות'
      : user.role === Role.BRANCH_COORD
        ? 'מועמדויות הענף'
        : 'המועמדויות שהגשתי';

  const handleApprove = async (id: number) => {
    const notes = prompt('הערות (אופציונלי):');
    await api.approveCandidacy(id, notes ?? undefined);
    refetch();
  };

  const handleReject = async (id: number) => {
    const notes = prompt('סיבת דחייה:');
    if (!notes) return;
    await api.rejectCandidacy(id, notes);
    refetch();
  };

  const handleCoordReview = async (id: number) => {
    await api.coordReviewCandidacy(id);
    refetch();
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-foreground'>{title}</h1>
          <p className='mt-1 text-sm text-muted-foreground'>{candidacies.length} מועמדויות</p>
        </div>
        {user.role === Role.TEAM_LEADER && (
          <button
            onClick={() => setShowForm(!showForm)}
            className='flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90'
          >
            <Plus size={16} />
            הגש מועמדות
          </button>
        )}
      </div>

      {showForm && user.teamId && (
        <CandidacyForm
          teamId={user.teamId}
          onSubmitted={() => {
            setShowForm(false);
            refetch();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {candidacies.length === 0 && !showForm ? (
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

                {c.reviewNotes && (
                  <p className='mt-1 text-xs text-muted-foreground'>הערות בדיקה: {c.reviewNotes}</p>
                )}

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

type CandidacyFormProps = {
  teamId: number;
  onSubmitted: () => void;
  onCancel: () => void;
};

function CandidacyForm({ teamId, onSubmitted, onCancel }: CandidacyFormProps) {
  const membersFetcher = useCallback(() => api.getTeamMembers(teamId), [teamId]);
  const coursesFetcher = useCallback(() => api.getCourses(), []);
  const { data: members, loading: l1 } = useApi(membersFetcher);
  const { data: courses, loading: l2 } = useApi(coursesFetcher);

  const [candidateId, setCandidateId] = useState('');
  const [instanceId, setInstanceId] = useState('');
  const [motivation, setMotivation] = useState('');
  const [notes, setNotes] = useState('');
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
      await api.submitCandidacy({
        courseInstanceId: Number(instanceId),
        candidateId: Number(candidateId),
        motivation: motivation || undefined,
        commanderNotes: notes || undefined,
      });
      onSubmitted();
    } catch {
      setError('שגיאה בהגשת המועמדות');
    } finally {
      setSubmitting(false);
    }
  };

  if (l1 || l2) return <LoadingSpinner />;

  return (
    <div className='rounded-xl border-2 border-primary/20 bg-primary/5 p-6'>
      <h3 className='mb-4 text-base font-semibold text-foreground'>הגשת מועמדות חדשה</h3>

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
                {i.courseName} — {i.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className='mt-4'>
        <label className='mb-1 block text-xs font-medium text-foreground'>מוטיבציה</label>
        <textarea
          value={motivation}
          onChange={(e) => setMotivation(e.target.value)}
          placeholder='מדוע המשתתף מתאים?'
          rows={3}
          className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary'
        />
      </div>

      <div className='mt-3'>
        <label className='mb-1 block text-xs font-medium text-foreground'>הערות</label>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder='הערות נוספות (אופציונלי)'
          className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary'
        />
      </div>

      {error && <p className='mt-2 text-xs text-red-600'>{error}</p>}

      <div className='mt-4 flex gap-2'>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className='flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50'
        >
          {submitting && <Loader2 size={14} className='animate-spin' />}
          הגש מועמדות
        </button>
        <button
          onClick={onCancel}
          className='rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted'
        >
          ביטול
        </button>
      </div>
    </div>
  );
}
