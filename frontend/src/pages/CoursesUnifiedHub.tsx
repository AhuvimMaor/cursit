import { BookOpen, Check, Clock, FileText, LayoutGrid, Loader2, MapPin, Star, Upload } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { CourseInstancePhasesPanel } from '../components/CourseInstancePhasesPanel';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { toast } from '../components/Toast';
import { useApi } from '../hooks/useApi';
import type { CoursePhase, User } from '../lib/api';
import { api } from '../lib/api';
import type { AuthUser } from '../lib/auth';
import {
  anyCandidacyRegistrationOpenToday,
  isInclusiveLocalCalendarRange,
  isPastLocalCalendarEnd,
  isStrictlyBeforeLocalCalendarStart,
} from '../lib/calendarRange';
import {
  formatHebrewFullDate,
  formatHebrewMonthOnly,
  getRegistrationBounds,
  getStudyBounds,
} from '../lib/courseCycleDates';
import { Role } from '../lib/roles';
import { InstanceParticipants } from './Courses';

type HubRow = {
  instanceId: number;
  courseId: number;
  courseName: string;
  courseType: string;
  description: string;
  requirements: string | null;
  gmushHours: number | null;
  location: string | null;
  instanceName: string;
  instanceStatus: string;
  startDate: string;
  endDate: string;
  phases: CoursePhase[];
};

type CoursesUnifiedHubProps = {
  user: AuthUser;
};

type MonthGroup = { monthLabel: string; rows: HubRow[] };

function groupHubRowsByMonth(rows: HubRow[]): MonthGroup[] {
  const groups: MonthGroup[] = [];
  for (const row of rows) {
    const monthLabel = new Date(row.startDate).toLocaleDateString('he-IL', {
      month: 'long',
      year: 'numeric',
    });
    const last = groups[groups.length - 1];
    if (!last || last.monthLabel !== monthLabel) {
      groups.push({ monthLabel, rows: [row] });
    } else {
      last.rows.push(row);
    }
  }
  return groups;
}

/** מחזור בארכיון: סטטוס הסתיים או שתאריך הסיום בלוח כבר עבר (גם כשהפאנל הניהולי השאיר OPEN) */
function hubArchivedRow(row: HubRow): boolean {
  return row.instanceStatus === 'COMPLETED' || isPastLocalCalendarEnd(row.endDate);
}

/**
 * האם כרגע מותר להציג הרשמה — רק כשחלון הרישום (שלב CANDIDACY) כבר נפתח ועדיין לא נסגר.
 * בלי שלב רישום: מאפשרים (אין חלון מוגדר בשלבים).
 */
const registrationWindowAllows = (row: HubRow) => {
  const hasCand = row.phases.some((p) => p.phaseType === 'CANDIDACY_SUBMISSION');
  if (!hasCand) {
    return true;
  }
  const bounds = getRegistrationBounds(row.phases);
  if (!bounds) return false;
  if (isStrictlyBeforeLocalCalendarStart(bounds.start)) return false;
  if (isPastLocalCalendarEnd(bounds.end)) return false;
  return isInclusiveLocalCalendarRange(bounds.start, bounds.end);
};

const instanceStatusLabel = (st: string) =>
  st === 'OPEN'
    ? 'מחזור פתוח'
    : st === 'IN_PROGRESS'
      ? 'בתהליך'
      : st === 'COMPLETED'
        ? 'הסתיים'
        : st;

export const CoursesUnifiedHub = ({ user }: CoursesUnifiedHubProps) => {
  const fetchCourses = useCallback(() => api.getCourses(), []);
  const fetchGantt = useCallback(() => api.getGantt(), []);
  const regFetcher = useCallback(
    () => (user.role === Role.TRAINEE ? api.getMyRegistrations() : Promise.resolve([])),
    [user.role],
  );

  const { data: courses, loading: loadingCourses } = useApi(fetchCourses);
  const { data: gantt, loading: loadingGantt, refetch: refetchGantt } = useApi(fetchGantt);
  const { data: myRegs, refetch: refetchRegs } = useApi(regFetcher);

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [registering, setRegistering] = useState<number | null>(null);
  const [registered, setRegistered] = useState<Set<number>>(new Set());
  const [registerModalId, setRegisterModalId] = useState<number | null>(null);
  const [regFiles, setRegFiles] = useState<File[]>([]);
  const [candidacyInstanceId, setCandidacyInstanceId] = useState<number | null>(null);

  const isAdmin = user.role === Role.BIS_CDR;

  const phasesByInstance = useMemo(() => {
    const m = new Map<number, CoursePhase[]>();
    for (const gi of gantt ?? []) {
      m.set(gi.id, gi.phases ?? []);
    }
    return m;
  }, [gantt]);

  const hubRows = useMemo(() => {
    if (!courses) return [];
    const isTrainee = user.role === Role.TRAINEE;
    const displayed = isTrainee ? courses.filter((c) => c.type === 'ADVANCED') : courses;
    const active = (st: string) => st === 'OPEN' || st === 'IN_PROGRESS' || st === 'COMPLETED';
    const out: HubRow[] = [];
    for (const c of displayed) {
      for (const inst of c.instances ?? []) {
        if (!active(inst.status)) continue;
        out.push({
          instanceId: inst.id,
          courseId: c.id,
          courseName: c.name,
          courseType: c.type,
          description: c.description,
          requirements: c.requirements ?? null,
          gmushHours: c.gmushHours ?? null,
          location: c.location ?? null,
          instanceName: inst.name,
          instanceStatus: inst.status,
          startDate: inst.startDate,
          endDate: inst.endDate,
          phases: phasesByInstance.get(inst.id) ?? [],
        });
      }
    }
    out.sort((a, b) => {
      const archivedLast = (r: HubRow) => (hubArchivedRow(r) ? 1 : 0);
      if (archivedLast(a) !== archivedLast(b)) return archivedLast(a) - archivedLast(b);
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
    return out;
  }, [courses, user.role, phasesByInstance]);

  const groupedActiveByMonth = useMemo(() => {
    const activeRows = hubRows.filter((r) => !hubArchivedRow(r));
    return groupHubRowsByMonth(activeRows);
  }, [hubRows]);

  const groupedArchivedByMonth = useMemo(() => {
    const done = hubRows.filter((r) => hubArchivedRow(r));
    return groupHubRowsByMonth(done);
  }, [hubRows]);

  const typeLabel = (type: string) =>
    type === 'FOUNDATION' ? 'קורס יסוד' : type === 'LEADERSHIP' ? 'קורס ניהול' : 'קורס מתקדם';
  const typeColor = (type: string) =>
    type === 'FOUNDATION'
      ? 'bg-blue-100 text-blue-700'
      : type === 'LEADERSHIP'
        ? 'bg-purple-100 text-purple-700'
        : 'bg-emerald-100 text-emerald-700';

  const getRegStatus = (instanceId: number) => {
    const reg = myRegs?.find((r) => r.courseInstanceId === instanceId);
    if (reg) return reg.status;
    if (registered.has(instanceId)) return 'PENDING_COORD';
    return null;
  };

  const statusLabel: Record<string, string> = {
    PENDING_COORD: 'ממתין לאישור',
    PENDING_BIS: 'בתהליך אישור',
    APPROVED: 'אושר ✓',
    REJECTED: 'נדחה',
  };

  const openRegisterModal = (instanceId: number) => {
    setRegisterModalId(instanceId);
    setRegFiles([]);
  };

  const handleRegister = async (instanceId: number) => {
    setRegistering(instanceId);
    try {
      const result = await api.registerAdvanced({ courseInstanceId: instanceId });
      for (const f of regFiles) {
        await api.uploadFile('registration', result.id, f);
      }
      setRegistered((prev) => new Set(prev).add(instanceId));
      setRegisterModalId(null);
      setRegFiles([]);
      refetchRegs();
    } catch {
      // ignore
    } finally {
      setRegistering(null);
    }
  };

  const showRegister =
    user.role === Role.TRAINEE || user.role === Role.TEAM_LEADER
      ? (row: HubRow) =>
          !hubArchivedRow(row) &&
          row.instanceStatus === 'OPEN' &&
          registrationWindowAllows(row) &&
          ((user.role === Role.TRAINEE && row.courseType === 'ADVANCED') ||
            (user.role === Role.TEAM_LEADER && row.courseType === 'LEADERSHIP'))
      : () => false;

  const renderMonthSectionList = (groups: MonthGroup[], mutedArchiveSection: boolean) =>
    groups.map(({ monthLabel, rows }) => {
      return (
        <section
          key={`${mutedArchiveSection ? 'archive' : 'active'}-${monthLabel}`}
          className={`scroll-mt-4 ${mutedArchiveSection ? 'opacity-[0.98]' : ''}`}
        >
          <div
            className={`mb-4 flex flex-wrap items-end justify-between gap-2 border-b pb-3 ${
              mutedArchiveSection ? 'border-slate-400/55' : 'border-border'
            }`}
          >
            <h2
              className={`flex items-center gap-2 text-base font-bold ${
                mutedArchiveSection ? 'text-slate-600' : 'text-foreground'
              }`}
            >
              <Clock
                size={18}
                className={mutedArchiveSection ? 'text-slate-500' : 'text-primary'}
              />
              {monthLabel}
            </h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                mutedArchiveSection
                  ? 'bg-slate-300/55 text-slate-800'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {rows.length} מחזורים בחודש
            </span>
          </div>

          <div className='grid grid-cols-1 gap-2.5 overflow-visible sm:grid-cols-2 sm:gap-3 lg:grid-cols-4'>
            {rows.map((row) => {
              const rowRegStatus = getRegStatus(row.instanceId);
              const regStatus = showRegister(row) ? rowRegStatus : null;
              const study = getStudyBounds(row.phases, row.startDate, row.endDate);
              const regBounds = getRegistrationBounds(row.phases);
              const studyStartCal = new Date(`${study.start}T12:00:00`);
              const archived = hubArchivedRow(row);
              const isDone = mutedArchiveSection || archived;
              const regOpenBadge =
                !archived &&
                row.instanceStatus === 'OPEN' &&
                anyCandidacyRegistrationOpenToday(row.phases);

              return (
                <div key={row.instanceId} className='relative flex min-w-0 flex-col gap-2.5'>
                  <div
                    className={`flex min-h-0 flex-col rounded-xl border transition-all cursor-pointer ${
                      isDone
                        ? 'border-dashed border-slate-400 bg-gradient-to-br from-slate-200/85 to-slate-100/60 shadow-inner hover:bg-slate-100/85'
                        : 'border-border bg-white shadow-sm hover:border-slate-300 hover:shadow-md'
                    }`}
                    role='button'
                    tabIndex={0}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('[data-no-card-expand]')) return;
                      setExpandedId(row.instanceId);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpandedId(row.instanceId);
                      }
                    }}
                  >
                    <div
                      className={`flex flex-1 flex-col p-3 text-right ${
                        isDone ? 'text-slate-800' : ''
                      }`}
                    >
                      <div className='mb-2 flex items-start justify-between gap-1.5'>
                        <div
                          className={`flex min-h-[2.75rem] min-w-[2.75rem] flex-col items-center justify-center rounded-lg bg-gradient-to-b ring-1 ${
                            isDone
                              ? 'from-slate-300/60 to-slate-200/50 text-slate-700 ring-slate-300'
                              : 'from-primary/12 to-primary/5 text-primary ring-primary/15'
                          }`}
                        >
                          <span
                            className={`text-base font-bold tabular-nums leading-none ${isDone ? '' : 'text-primary'}`}
                          >
                            {studyStartCal.getDate()}
                          </span>
                          <span
                            className={`mt-0.5 text-[9px] font-medium leading-tight ${isDone ? 'text-slate-600' : 'text-primary/80'}`}
                          >
                            {formatHebrewMonthOnly(study.start)}
                          </span>
                        </div>
                      </div>

                      <p
                        className={`line-clamp-2 min-h-[2.25rem] text-xs font-bold leading-snug ${
                          isDone ? 'text-slate-700' : 'text-foreground'
                        }`}
                      >
                        {row.courseName}
                      </p>
                      <p
                        className={`mt-0.5 line-clamp-1 text-[11px] font-semibold ${isDone ? 'text-slate-600' : 'text-primary'}`}
                      >
                        {row.instanceName}
                      </p>

                      <div className='mt-1.5 flex flex-wrap gap-1'>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${typeColor(row.courseType)}`}
                        >
                          {typeLabel(row.courseType)}
                        </span>
                        {archived ? (
                          <span className='rounded-md bg-slate-500/25 px-2 py-0.5 text-[10px] font-bold text-slate-800 ring-1 ring-slate-400/70'>
                            ארכיון · הסתיים
                          </span>
                        ) : (
                          <>
                            <span className='rounded-md bg-white/65 px-2 py-0.5 text-[10px] font-medium text-muted-foreground ring-1 ring-slate-200/70'>
                              {instanceStatusLabel(row.instanceStatus)}
                            </span>
                            {regOpenBadge && (
                              <span className='rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800'>
                                חלון רישום פתוח היום
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      <div
                        className={`mt-2 rounded-md px-2 py-1.5 ${isDone ? 'bg-slate-300/30' : 'bg-primary/[0.06]'}`}
                      >
                        <p
                          className={`text-[9px] font-bold uppercase tracking-wide ${isDone ? 'text-slate-600' : 'text-primary/90'}`}
                        >
                          לימודי המחזור
                        </p>
                        <p
                          className={`mt-0.5 text-[10px] font-semibold tabular-nums leading-snug ${isDone ? 'text-slate-800' : 'text-foreground'}`}
                        >
                          {formatHebrewFullDate(study.start)} - {formatHebrewFullDate(study.end)}
                        </p>
                      </div>
                      <div className='mt-1.5'>
                        <p className='text-[9px] font-semibold text-muted-foreground'>
                          רישום למחזור
                        </p>
                        {regBounds ? (
                          <p
                            className={`mt-0.5 text-[10px] font-semibold tabular-nums leading-snug ${isDone ? 'text-slate-700' : 'text-foreground'}`}
                          >
                            {formatHebrewFullDate(regBounds.start)} -{' '}
                            {formatHebrewFullDate(regBounds.end)}
                          </p>
                        ) : (
                          <p
                            className={`mt-0.5 text-[9px] leading-snug ${isDone ? 'text-slate-600' : 'text-muted-foreground'}`}
                          >
                            לא הוגדר חלון רישום בשלבים
                          </p>
                        )}
                      </div>
                      {row.location && (
                        <p className='mt-1.5 line-clamp-1 text-[10px] text-muted-foreground'>
                          <MapPin size={10} className='inline shrink-0 opacity-70' /> {row.location}
                        </p>
                      )}

                      <div
                        className={`mt-auto flex flex-wrap items-center justify-between gap-1.5 border-t pt-2 ${
                          isDone ? 'border-slate-300/70' : 'border-border/60'
                        }`}
                        data-no-card-expand
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <span className='text-[10px] font-medium text-muted-foreground'>פרטים</span>
                        <div className='flex items-center gap-1.5'>
                          {showRegister(row) && !regStatus && (
                            <button
                              type='button'
                              onClick={() => openRegisterModal(row.instanceId)}
                              className='rounded-lg bg-primary px-2.5 py-1 text-[11px] font-bold text-white hover:bg-primary/90 disabled:opacity-50'
                            >
                              הירשם
                            </button>
                          )}
                          {showRegister(row) && regStatus && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                regStatus === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : regStatus === 'REJECTED'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {regStatus === 'APPROVED' && <Check size={10} className='inline' />}{' '}
                              {statusLabel[regStatus] ?? regStatus}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      );
    });

  if (loadingCourses || loadingGantt) return <LoadingSpinner />;
  if (!courses) return null;

  return (
    <div className='space-y-5'>
      <div className='flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-border/80 bg-white/60 px-3 py-2 text-xs text-muted-foreground'>
        <LayoutGrid size={15} className='shrink-0 text-primary' />
        <span>
          {hubRows.length} מחזורים - פעילים למעלה, בתחתית בלוק ארכיון כשתאריך הסיום עבר או שהסטטוס
          הסתיים. לחיצה על כרטיס פותחת לוח וגאנט.
        </span>
      </div>

      {hubRows.length === 0 ? (
        <div className='rounded-xl border border-border bg-white p-10 text-center shadow-sm'>
          <BookOpen className='mx-auto mb-2 h-8 w-8 text-muted-foreground/60' />
          <p className='text-sm text-muted-foreground'>
            אין מחזורים להצגה (פתוחים, בתהליך או שהסתיימו)
          </p>
        </div>
      ) : (
        <div className='space-y-10'>
          {renderMonthSectionList(groupedActiveByMonth, false)}
          {groupedArchivedByMonth.length > 0 && (
            <div
              aria-label='מחזורים שהסתיימו'
              className='rounded-2xl border-2 border-dashed border-slate-400 bg-slate-200/65 px-4 py-6 shadow-inner sm:px-6 sm:py-8'
            >
              <div className='mb-5 border-b border-slate-400/50 pb-3'>
                <h2 className='text-lg font-bold text-slate-800'>ארכיון - מחזורים שהסתיימו</h2>
                <p className='mt-1 text-xs leading-relaxed text-slate-600'>
                  מחזורים שהסתיימו לפי תאריך או לפי סטטוס - לא ניתן להירשם או לנהל מחזור כאן.
                </p>
              </div>
              <div className='space-y-10'>
                {renderMonthSectionList(groupedArchivedByMonth, true)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Registration modal with file upload */}
      <Modal
        open={registerModalId !== null}
        onClose={() => {
          setRegisterModalId(null);
          setRegFiles([]);
        }}
        title='הרשמה למחזור'
        size='sm'
      >
        <div className='space-y-4'>
          <p className='text-sm text-muted-foreground'>
            ניתן לצרף קבצים לבקשת הרישום (אישור מפקד, מסמכים נוספים)
          </p>
          <div>
            <label className='mb-1 block text-xs font-medium text-foreground'>
              קבצים מצורפים (אופציונלי)
            </label>
            <label className='flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 px-4 py-4 transition-colors hover:border-primary/40 hover:bg-primary/5'>
              <Upload size={20} className='text-muted-foreground' />
              <span className='text-xs font-medium text-muted-foreground'>לחץ לבחירת קבצים</span>
              <span className='text-[10px] text-muted-foreground/60'>PDF, Word, Excel, תמונות</span>
              <input
                type='file'
                multiple
                accept='.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp'
                onChange={(e) => setRegFiles(Array.from(e.target.files ?? []))}
                className='hidden'
              />
            </label>
            {regFiles.length > 0 && (
              <div className='mt-2 space-y-1'>
                {regFiles.map((f, i) => (
                  <div key={i} className='flex items-center gap-2 rounded-md bg-muted/40 px-2 py-1.5 text-xs text-foreground'>
                    <Star size={12} className='shrink-0 text-muted-foreground' />
                    <span className='truncate'>{f.name}</span>
                    <span className='shrink-0 text-muted-foreground'>({(f.size / 1024).toFixed(0)} KB)</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className='flex justify-end gap-2 pt-2'>
            <button
              type='button'
              onClick={() => {
                setRegisterModalId(null);
                setRegFiles([]);
              }}
              className='rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted'
            >
              ביטול
            </button>
            <button
              type='button'
              onClick={() => registerModalId && handleRegister(registerModalId)}
              disabled={registering !== null}
              className='flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50'
            >
              {registering !== null && <Loader2 size={14} className='animate-spin' />}
              שלח בקשת רישום
            </button>
          </div>
        </div>
      </Modal>

      {/* Candidacy submission modal */}
      {candidacyInstanceId !== null && (
        <CandidacyQuickForm
          instanceId={candidacyInstanceId}
          user={user}
          onClose={() => setCandidacyInstanceId(null)}
        />
      )}

      {/* Course detail modal */}
      {(() => {
        const selectedRow = hubRows.find((r) => r.instanceId === expandedId);
        if (!selectedRow) return null;
        const rowRegStatus = getRegStatus(selectedRow.instanceId);
        return (
          <Modal
            open={!!selectedRow}
            onClose={() => setExpandedId(null)}
            title={`${selectedRow.courseName} - ${selectedRow.instanceName}`}
            size='lg'
          >
            <div className='space-y-4'>
              <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-3'>
                <div>
                  <p className='text-lg font-bold text-foreground'>{selectedRow.courseName}</p>
                  <p className='text-sm font-semibold text-primary'>{selectedRow.instanceName}</p>
                </div>
                <div className='flex shrink-0 flex-wrap items-center gap-2'>
                  {showRegister(selectedRow) && rowRegStatus == null && (
                    <button
                      type='button'
                      onClick={() => openRegisterModal(selectedRow.instanceId)}
                      className='rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50'
                    >
                      הירשם למחזור
                    </button>
                  )}
                  {(user.role === Role.TEAM_LEADER || user.role === Role.BIS_CDR) &&
                    (selectedRow.courseType === 'FOUNDATION' ||
                      selectedRow.courseType === 'LEADERSHIP') && (
                      <button
                        type='button'
                        onClick={() => {
                          setExpandedId(null);
                          setCandidacyInstanceId(selectedRow.instanceId);
                        }}
                        className='rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-amber-600'
                      >
                        הגש מועמדות לפיקוד
                      </button>
                    )}
                  {rowRegStatus != null && (
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        rowRegStatus === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : rowRegStatus === 'REJECTED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {rowRegStatus === 'APPROVED' && <Check size={12} className='inline' />}{' '}
                      {statusLabel[rowRegStatus] ?? rowRegStatus}
                    </span>
                  )}
                </div>
              </div>

              <p className='text-sm leading-relaxed text-muted-foreground'>
                {selectedRow.description}
              </p>

              <div className='flex flex-wrap gap-3 text-xs text-muted-foreground'>
                {selectedRow.gmushHours != null && selectedRow.gmushHours > 0 && (
                  <span className='flex items-center gap-1'>
                    <Clock size={12} />
                    {selectedRow.gmushHours} שעות גמו&quot;ש
                  </span>
                )}
                {selectedRow.location && (
                  <span className='flex items-center gap-1'>
                    <MapPin size={12} />
                    {selectedRow.location}
                  </span>
                )}
                {selectedRow.requirements && (
                  <span className='flex items-center gap-1'>
                    <Star size={12} />
                    דרישות מקדימות
                  </span>
                )}
              </div>

              {selectedRow.requirements && (
                <p className='rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground'>
                  {selectedRow.requirements}
                </p>
              )}

              <CourseInstancePhasesPanel
                instanceId={selectedRow.instanceId}
                phases={selectedRow.phases}
                isAdmin={isAdmin}
                onRefresh={refetchGantt}
                showSectionTitles
              />

              {isAdmin && (
                <div className='rounded-xl border border-border bg-muted/10 p-1'>
                  <InstanceParticipants
                    instanceId={selectedRow.instanceId}
                    instanceName={selectedRow.instanceName}
                  />
                </div>
              )}
            </div>
          </Modal>
        );
      })()}
    </div>
  );
};

type CandidacyQuickFormProps = {
  instanceId: number;
  user: AuthUser;
  onClose: () => void;
};

function CandidacyQuickForm({ instanceId, user, onClose }: CandidacyQuickFormProps) {
  const membersFetcher = useCallback(
    () =>
      user.role === Role.BIS_CDR
        ? api.getUsers().then((users) => users.filter((u) => u.role === Role.TRAINEE))
        : user.teamId
          ? api.getTeamMembers(user.teamId)
          : Promise.resolve([]),
    [user],
  );
  const { data: members, loading } = useApi(membersFetcher);

  const [candidateId, setCandidateId] = useState('');
  const [motivation, setMotivation] = useState('');
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!candidateId) {
      setError('יש לבחור מועמד');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const result = await api.submitCandidacy({
        courseInstanceId: instanceId,
        candidateId: Number(candidateId),
        motivation: motivation || undefined,
        commanderNotes: notes || undefined,
      });
      for (const f of files) {
        await api.uploadFile('candidacy', result.id, f);
      }
      toast.success('המועמדות הוגשה בהצלחה');
      onClose();
    } catch {
      setError('שגיאה בהגשת המועמדות');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open onClose={onClose} title='הגשת מועמדות לפיקוד' size='lg'>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className='space-y-4'>
          <div>
            <label className='mb-1 block text-xs font-medium text-foreground'>בחר מועמד</label>
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
            <label className='mb-1 block text-xs font-medium text-foreground'>מוטיבציה</label>
            <textarea
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder='מדוע המועמד מתאים?'
              rows={3}
              className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary'
            />
          </div>

          <div>
            <label className='mb-1 block text-xs font-medium text-foreground'>הערות מפקד</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder='אופציונלי'
              className='w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary'
            />
          </div>

          <div>
            <label className='mb-1 block text-xs font-medium text-foreground'>קבצים מצורפים</label>
            <label className='flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 px-4 py-4 transition-colors hover:border-primary/40 hover:bg-primary/5'>
              <Upload size={20} className='text-muted-foreground' />
              <span className='text-xs font-medium text-muted-foreground'>לחץ לבחירת קבצים</span>
              <span className='text-[10px] text-muted-foreground/60'>PDF, Word, Excel, תמונות</span>
              <input
                type='file'
                multiple
                accept='.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp'
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                className='hidden'
              />
            </label>
            {files.length > 0 && (
              <div className='mt-2 space-y-1'>
                {files.map((f, i) => (
                  <div key={i} className='flex items-center gap-2 rounded-md bg-muted/40 px-2 py-1.5 text-xs text-foreground'>
                    <FileText size={12} className='shrink-0 text-muted-foreground' />
                    <span className='truncate'>{f.name}</span>
                    <span className='shrink-0 text-muted-foreground'>({(f.size / 1024).toFixed(0)} KB)</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className='text-xs text-red-600'>{error}</p>}

          <div className='flex justify-end gap-2 pt-1'>
            <button
              type='button'
              onClick={onClose}
              className='rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted'
            >
              ביטול
            </button>
            <button
              type='button'
              onClick={handleSubmit}
              disabled={submitting}
              className='flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50'
            >
              {submitting && <Loader2 size={14} className='animate-spin' />}
              הגש מועמדות
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
