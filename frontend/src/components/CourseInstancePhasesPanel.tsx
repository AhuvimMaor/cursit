import { Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';

import type { CoursePhase } from '../lib/api';
import { api } from '../lib/api';
import {
  isInclusiveLocalCalendarRange,
  isPastLocalCalendarEnd,
  isStrictlyBeforeLocalCalendarStart,
} from '../lib/calendarRange';
import { ConfirmDialog } from './ConfirmDialog';

export const PHASE_COLORS: Record<string, string> = {
  CANDIDACY_SUBMISSION: 'bg-amber-400',
  TRYOUTS: 'bg-blue-500',
  COMMANDER_COURSE: 'bg-emerald-500',
  STAFF_PREP: 'bg-orange-400',
  COURSE: 'bg-indigo-500',
  SUMMARY_WEEK: 'bg-purple-500',
  OTHER: 'bg-gray-400',
};

const PHASE_BORDER: Record<string, string> = {
  CANDIDACY_SUBMISSION: 'border-amber-300',
  TRYOUTS: 'border-blue-300',
  COMMANDER_COURSE: 'border-emerald-300',
  STAFF_PREP: 'border-orange-300',
  COURSE: 'border-indigo-300',
  SUMMARY_WEEK: 'border-purple-300',
  OTHER: 'border-gray-300',
};

export const PHASE_TYPE_LABELS: Record<string, string> = {
  CANDIDACY_SUBMISSION: 'הגשת מועמדות',
  TRYOUTS: 'מיונים',
  COMMANDER_COURSE: 'הכשרה',
  STAFF_PREP: 'הכנת צוות',
  COURSE: 'הקורס',
  SUMMARY_WEEK: 'סיכומים',
  OTHER: 'אחר',
};

/** תאריך yyyy-mm-dd בלי הזזת אזור */
const formatDateShort = (d: string) =>
  new Date(`${d.slice(0, 10)}T12:00:00`).toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'short',
  });

const toInputDate = (d: string) => d.slice(0, 10);

type CourseInstancePhasesPanelProps = {
  instanceId: number;
  phases: CoursePhase[];
  isAdmin: boolean;
  onRefresh: () => void;
  /** כותרת משנה מעל רשת השלבים */
  showSectionTitles?: boolean;
};

export const CourseInstancePhasesPanel = ({
  instanceId,
  phases,
  isAdmin,
  onRefresh,
  showSectionTitles = true,
}: CourseInstancePhasesPanelProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPhase, setEditingPhase] = useState<CoursePhase | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const handleDelete = async (phaseId: number) => {
    setDeleting(phaseId);
    try {
      await api.deletePhase(phaseId);
      onRefresh();
    } finally {
      setDeleting(null);
      setConfirmDeleteId(null);
    }
  };

  const sortedPhases = [...phases].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );

  return (
    <div className='flex flex-col gap-3'>
      {isAdmin && (
        <div className='flex justify-end'>
          <button
            type='button'
            onClick={() => {
              setShowAddForm(true);
              setEditingPhase(null);
            }}
            className='flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90'
          >
            <Plus size={14} strokeWidth={2.5} />
            שלב
          </button>
        </div>
      )}

      {showAddForm && (
        <PhaseForm
          instanceId={instanceId}
          onDone={() => {
            setShowAddForm(false);
            onRefresh();
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {editingPhase && (
        <PhaseForm
          instanceId={instanceId}
          phase={editingPhase}
          onDone={() => {
            setEditingPhase(null);
            onRefresh();
          }}
          onCancel={() => setEditingPhase(null)}
        />
      )}

      {showSectionTitles && sortedPhases.length > 0 && (
        <div>
          <p className='text-xs font-semibold text-foreground'>לוח זמנים וגאנט - שלבי המחזור</p>
          <p className='text-[11px] text-muted-foreground'>
            כל ריבוע הוא שלב; צבע מסמן סוג. מנהל מערכת יכול לערוך.
          </p>
        </div>
      )}

      {sortedPhases.length === 0 && !showAddForm ? (
        <p className='rounded-lg border border-dashed border-border bg-muted/20 py-6 text-center text-xs text-muted-foreground'>
          אין שלבים מוגדרים למחזור זה
          {isAdmin ? ' - לחץ &quot;שלב&quot; כדי להוסיף' : ''}
        </p>
      ) : (
        <ul className='grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3'>
          {sortedPhases.map((phase) => {
            const color = PHASE_COLORS[phase.phaseType] ?? 'bg-gray-400';
            const border = PHASE_BORDER[phase.phaseType] ?? 'border-gray-200';
            const isActive = isInclusiveLocalCalendarRange(phase.startDate, phase.endDate);
            const isPast = isPastLocalCalendarEnd(phase.endDate);
            const isFuture = isStrictlyBeforeLocalCalendarStart(phase.startDate);

            return (
              <li key={phase.id}>
                <div
                  className={`flex h-full min-h-[7.5rem] flex-col rounded-xl border bg-white p-3 shadow-sm transition ${border} ${
                    isActive
                      ? 'ring-2 ring-primary/25'
                      : isPast
                        ? 'opacity-80'
                        : 'hover:border-slate-300'
                  }`}
                >
                  <div className={`mb-2 h-1 w-full rounded-full ${color}`} aria-hidden />
                  <p
                    className={`line-clamp-2 text-sm font-semibold leading-snug ${
                      isPast ? 'text-muted-foreground' : 'text-foreground'
                    }`}
                  >
                    {phase.name}
                  </p>
                  <p className='mt-1 text-[10px] font-medium text-muted-foreground'>
                    {PHASE_TYPE_LABELS[phase.phaseType] ?? phase.phaseType}
                  </p>
                  <p
                    className={`mt-auto pt-2 text-xs font-bold tabular-nums leading-snug sm:text-[13px] ${
                      isPast ? 'text-slate-700' : 'text-slate-900'
                    }`}
                  >
                    {formatDateShort(phase.startDate)} – {formatDateShort(phase.endDate)}
                  </p>
                  <div className='mt-1.5 flex flex-wrap items-center gap-1.5'>
                    {isActive && (
                      <span className='rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary'>
                        עכשיו
                      </span>
                    )}
                    {isFuture && !isActive && (
                      <span className='rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-900'>
                        בקרוב
                      </span>
                    )}
                    {isPast && !isActive && (
                      <span className='rounded-full bg-slate-200/90 px-2 py-0.5 text-[10px] font-semibold text-slate-700'>
                        עבר
                      </span>
                    )}
                  </div>
                  {isAdmin && (
                    <div className='mt-2 flex justify-end gap-0.5 border-t border-border/60 pt-2'>
                      <button
                        type='button'
                        title='עריכה'
                        onClick={() => {
                          setEditingPhase(phase);
                          setShowAddForm(false);
                        }}
                        className='rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground'
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type='button'
                        title='מחיקה'
                        onClick={() => setConfirmDeleteId(phase.id)}
                        disabled={deleting === phase.id}
                        className='rounded-md p-1.5 text-muted-foreground transition hover:bg-red-50 hover:text-red-600'
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
              </li>
            );
          })}
        </ul>
      )}
      <ConfirmDialog
        open={confirmDeleteId !== null}
        onConfirm={() => confirmDeleteId !== null && handleDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
        title='מחיקת שלב'
        message='האם למחוק שלב זה? פעולה זו אינה הפיכה.'
        confirmLabel='מחק'
        variant='danger'
      />
    </div>
  );
};

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
    <div className='rounded-xl border-2 border-primary/20 bg-primary/[0.06] p-3 sm:p-4'>
      <div className='mb-3 flex items-center justify-between'>
        <h4 className='text-sm font-semibold text-foreground'>
          {isEdit ? 'עריכת שלב' : 'הוספת שלב חדש'}
        </h4>
        <button
          type='button'
          onClick={onCancel}
          className='rounded-md p-1 text-muted-foreground hover:bg-white/80 hover:text-foreground'
        >
          <X size={16} />
        </button>
      </div>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        <div className='sm:col-span-2'>
          <label className='mb-1 block text-xs font-medium text-foreground'>שם השלב</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20'
          />
        </div>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>סוג</label>
          <select
            value={phaseType}
            onChange={(e) => setPhaseType(e.target.value)}
            className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary'
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
            className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary'
          />
        </div>
        <div>
          <label className='mb-1 block text-xs font-medium text-foreground'>תאריך סיום</label>
          <input
            type='date'
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary'
          />
        </div>
      </div>

      {error && <p className='mt-2 text-xs text-red-600'>{error}</p>}

      <div className='mt-3 flex flex-wrap gap-2'>
        <button
          type='button'
          onClick={handleSubmit}
          disabled={saving}
          className='flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-50'
        >
          {saving && <Loader2 size={12} className='animate-spin' />}
          {isEdit ? 'שמור' : 'הוסף'}
        </button>
        <button
          type='button'
          onClick={onCancel}
          className='rounded-lg border border-border bg-white px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted'
        >
          ביטול
        </button>
      </div>
    </div>
  );
}
