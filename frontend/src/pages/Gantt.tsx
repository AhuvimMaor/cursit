import { Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useCallback, useState } from 'react';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import type { CoursePhase } from '../lib/api';
import { api } from '../lib/api';
import type { AuthUser } from '../lib/auth';
import { Role } from '../lib/roles';

const PHASE_COLORS: Record<string, string> = {
  CANDIDACY_SUBMISSION: 'bg-amber-400',
  TRYOUTS: 'bg-blue-500',
  COMMANDER_COURSE: 'bg-emerald-500',
  STAFF_PREP: 'bg-orange-400',
  COURSE: 'bg-indigo-500',
  SUMMARY_WEEK: 'bg-purple-500',
  OTHER: 'bg-gray-400',
};

const PHASE_TYPE_LABELS: Record<string, string> = {
  CANDIDACY_SUBMISSION: 'הגשת מועמדות',
  TRYOUTS: 'מיונים',
  COMMANDER_COURSE: 'הכשרה',
  STAFF_PREP: 'הכנת צוות',
  COURSE: 'הקורס',
  SUMMARY_WEEK: 'סיכומים',
  OTHER: 'אחר',
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' });

const toInputDate = (d: string) => new Date(d).toISOString().split('T')[0];

type GanttProps = {
  user: AuthUser;
};

export const Gantt = ({ user }: GanttProps) => {
  const fetcher = useCallback(() => api.getGantt(), []);
  const { data: instances, loading, refetch } = useApi(fetcher);
  const isAdmin = user.role === Role.BIS_CDR;

  if (loading) return <LoadingSpinner />;

  const allInstances = instances ?? [];
  const withPhases = allInstances.filter((i) => i.phases.length > 0);
  const withoutPhases = isAdmin ? allInstances.filter((i) => i.phases.length === 0) : [];

  if (allInstances.length === 0) {
    return (
      <div className='space-y-6'>
        <h1 className='text-2xl font-bold text-foreground'>גאנט קורסים</h1>
        <p className='text-sm text-muted-foreground'>אין מחזורים פעילים</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>גאנט קורסים</h1>
        <p className='mt-1 text-sm text-muted-foreground'>לוח זמנים — קורסים ומחזורים פעילים</p>
      </div>

      <div className='space-y-6'>
        {withPhases.map((inst) => (
          <CourseGanttCard key={inst.id} inst={inst} isAdmin={isAdmin} onRefresh={refetch} />
        ))}

        {withoutPhases.length > 0 && (
          <div>
            <h2 className='mb-3 text-sm font-medium text-muted-foreground'>
              מחזורים ללא שלבים מוגדרים
            </h2>
            <div className='space-y-3'>
              {withoutPhases.map((inst) => (
                <CourseGanttCard key={inst.id} inst={inst} isAdmin={isAdmin} onRefresh={refetch} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

type CourseGanttCardProps = {
  inst: { id: number; name: string; course: { name: string }; phases: CoursePhase[] };
  isAdmin: boolean;
  onRefresh: () => void;
};

function CourseGanttCard({ inst, isAdmin, onRefresh }: CourseGanttCardProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPhase, setEditingPhase] = useState<CoursePhase | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleDelete = async (phaseId: number) => {
    if (!confirm('למחוק שלב זה?')) return;
    setDeleting(phaseId);
    try {
      await api.deletePhase(phaseId);
      onRefresh();
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className='rounded-xl border border-border bg-white p-5 shadow-sm'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <h3 className='text-base font-semibold text-foreground'>{inst.course.name}</h3>
          <span className='rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground'>
            {inst.name}
          </span>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingPhase(null);
            }}
            className='flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20'
          >
            <Plus size={14} />
            הוסף שלב
          </button>
        )}
      </div>

      {showAddForm && (
        <PhaseForm
          instanceId={inst.id}
          onDone={() => {
            setShowAddForm(false);
            onRefresh();
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {editingPhase && (
        <PhaseForm
          instanceId={inst.id}
          phase={editingPhase}
          onDone={() => {
            setEditingPhase(null);
            onRefresh();
          }}
          onCancel={() => setEditingPhase(null)}
        />
      )}

      {inst.phases.length === 0 && !showAddForm ? (
        <p className='py-4 text-center text-xs text-muted-foreground'>
          אין שלבים — לחץ "הוסף שלב" כדי להתחיל
        </p>
      ) : (
        <div className='space-y-2'>
          {inst.phases
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
            .map((phase) => {
              const color = PHASE_COLORS[phase.phaseType] ?? 'bg-gray-400';
              const isActive =
                new Date() >= new Date(phase.startDate) && new Date() <= new Date(phase.endDate);
              const isPast = new Date() > new Date(phase.endDate);

              return (
                <div
                  key={phase.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                    isActive
                      ? 'border-primary/30 bg-primary/5'
                      : isPast
                        ? 'border-border/50 bg-muted/30'
                        : 'border-border'
                  }`}
                >
                  <div className={`h-3 w-3 shrink-0 rounded-full ${color}`} />
                  <div className='min-w-[120px]'>
                    <p
                      className={`text-sm font-medium ${isPast ? 'text-muted-foreground' : 'text-foreground'}`}
                    >
                      {phase.name}
                    </p>
                    <p className='text-[10px] text-muted-foreground'>
                      {PHASE_TYPE_LABELS[phase.phaseType]}
                    </p>
                  </div>
                  <div className='flex-1' />
                  <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                    <span>{formatDate(phase.startDate)}</span>
                    <span>—</span>
                    <span>{formatDate(phase.endDate)}</span>
                  </div>
                  {isActive && (
                    <span className='rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary'>
                      עכשיו
                    </span>
                  )}
                  {isAdmin && (
                    <div className='flex gap-1'>
                      <button
                        onClick={() => {
                          setEditingPhase(phase);
                          setShowAddForm(false);
                        }}
                        className='rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground'
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(phase.id)}
                        disabled={deleting === phase.id}
                        className='rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-500'
                      >
                        {deleting === phase.id ? (
                          <Loader2 size={14} className='animate-spin' />
                        ) : (
                          <Trash2 size={14} />
                        )}
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
}

type PhaseFormProps = {
  instanceId: number;
  phase?: CoursePhase;
  onDone: () => void;
  onCancel: () => void;
};

function PhaseForm({ instanceId, phase, onDone, onCancel }: PhaseFormProps) {
  const isEdit = !!phase;
  const [name, setName] = useState(phase?.name ?? '');
  const [phaseType, setPhaseType] = useState(phase?.phaseType ?? 'COURSE');
  const [startDate, setStartDate] = useState(phase ? toInputDate(phase.startDate) : '');
  const [endDate, setEndDate] = useState(phase ? toInputDate(phase.endDate) : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name || !startDate || !endDate) {
      setError('יש למלא את כל השדות');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (isEdit && phase) {
        await api.updatePhase(phase.id, { name, phaseType, startDate, endDate });
      } else {
        await api.createPhase(instanceId, { name, phaseType, startDate, endDate });
      }
      onDone();
    } catch {
      setError('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='mb-4 rounded-lg border-2 border-primary/20 bg-primary/5 p-4'>
      <div className='mb-3 flex items-center justify-between'>
        <h4 className='text-sm font-semibold text-foreground'>
          {isEdit ? 'עריכת שלב' : 'הוספת שלב חדש'}
        </h4>
        <button onClick={onCancel} className='text-muted-foreground hover:text-foreground'>
          <X size={16} />
        </button>
      </div>

      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>שם השלב</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='w-full rounded-lg border border-border bg-white px-3 py-1.5 text-sm outline-none focus:border-primary'
          />
        </div>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>סוג</label>
          <select
            value={phaseType}
            onChange={(e) => setPhaseType(e.target.value)}
            className='w-full rounded-lg border border-border bg-white px-3 py-1.5 text-sm outline-none focus:border-primary'
          >
            {Object.entries(PHASE_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>תאריך התחלה</label>
          <input
            type='date'
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className='w-full rounded-lg border border-border bg-white px-3 py-1.5 text-sm outline-none focus:border-primary'
          />
        </div>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>תאריך סיום</label>
          <input
            type='date'
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className='w-full rounded-lg border border-border bg-white px-3 py-1.5 text-sm outline-none focus:border-primary'
          />
        </div>
      </div>

      {error && <p className='mt-2 text-xs text-red-600'>{error}</p>}

      <div className='mt-3 flex gap-2'>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className='flex items-center gap-1 rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-white hover:bg-primary/90 disabled:opacity-50'
        >
          {saving && <Loader2 size={12} className='animate-spin' />}
          {isEdit ? 'שמור' : 'הוסף'}
        </button>
        <button
          onClick={onCancel}
          className='rounded-lg border border-border px-4 py-1.5 text-xs text-muted-foreground hover:bg-muted'
        >
          ביטול
        </button>
      </div>
    </div>
  );
}
