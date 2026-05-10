export type PhaseLike = { phaseType: string; startDate: string; endDate: string };

const ymd = (raw: string) => raw.slice(0, 10);

const minYmd = (a: string, b: string) => (ymd(a) < ymd(b) ? ymd(a) : ymd(b));
const maxYmd = (a: string, b: string) => (ymd(a) > ymd(b) ? ymd(a) : ymd(b));

/** מסדר תאריך התחלה/סיום כרונולוגית (מניעת הצגה הפוכה) */
export function chronologicalRange(start: string, end: string): { start: string; end: string } {
  const a = ymd(start);
  const b = ymd(end);
  return a <= b ? { start: a, end: b } : { start: b, end: a };
}

/** איחוד טווח לפי כל השלבים מאותו סוג */
export function mergePhaseBounds(
  phases: PhaseLike[],
  phaseType: string,
): { start: string; end: string } | null {
  const list = phases.filter((p) => p.phaseType === phaseType);
  if (list.length === 0) return null;
  let start = ymd(list[0].startDate);
  let end = ymd(list[0].endDate);
  for (const p of list) {
    start = minYmd(start, p.startDate);
    end = maxYmd(end, p.endDate);
  }
  return chronologicalRange(start, end);
}

/** תאריכי לימודי המחזור (שלב COURSE או COMMANDER_COURSE), אחרת תאריכי המחזור מה־API */
export function getStudyBounds(
  phases: PhaseLike[],
  instanceStart: string,
  instanceEnd: string,
): { start: string; end: string } {
  const raw =
    mergePhaseBounds(phases, 'COURSE') ??
    mergePhaseBounds(phases, 'COMMANDER_COURSE') ??
    chronologicalRange(ymd(instanceStart), ymd(instanceEnd));
  return raw;
}

export function getRegistrationBounds(phases: PhaseLike[]) {
  return mergePhaseBounds(phases, 'CANDIDACY_SUBMISSION');
}

/** תאריך בלוח מקומי — בלי הזזת אזור מ־ISO */
export function formatHebrewFullDate(iso: string): string {
  return new Date(`${ymd(iso)}T12:00:00`).toLocaleDateString('he-IL');
}

/** חודש בלבד (לתג הכרטיס — בלי לחזור על מספר היום) */
export function formatHebrewMonthOnly(iso: string): string {
  return new Date(`${ymd(iso)}T12:00:00`).toLocaleDateString('he-IL', { month: 'long' });
}
