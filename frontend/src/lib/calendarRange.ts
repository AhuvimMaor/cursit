/** תאריכי לוח (__לא__ שעה מדויקת) להשוואה עקבית בין הגאנט לכפתור הרשמה */

type YMD = readonly [number, number, number];

const cmpYmd = (a: YMD, b: YMD): number => {
  if (a[0] !== b[0]) return a[0] - b[0];
  if (a[1] !== b[1]) return a[1] - b[1];
  return a[2] - b[2];
};

/** היום בלוח המקומי של הדפדפן */
export const todayLocalYmdPieces = (): YMD => {
  const n = new Date();
  return [n.getFullYear(), n.getMonth() + 1, n.getDate()] as const;
};

/** מתאריך API: yyyy-mm-dd או מחרוזת ISO מלאה */
export const boundsToYmdPieces = (raw: string): YMD => {
  const slice = raw.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(slice)) {
    const [y, m, d] = slice.split('-').map(Number);
    return [y, m, d] as const;
  }
  const x = new Date(raw);
  return [x.getFullYear(), x.getMonth() + 1, x.getDate()] as const;
};

/** האם יום זה (מקומי) נכלל בין תאריך התחלה לסיום בשיטת לוח */
export const isInclusiveLocalCalendarRange = (startRaw: string, endRaw: string): boolean => {
  const t = todayLocalYmdPieces();
  const s = boundsToYmdPieces(startRaw);
  const e = boundsToYmdPieces(endRaw);
  return cmpYmd(t, s) >= 0 && cmpYmd(t, e) <= 0;
};

/** האם כל החלון (יום הסיום) כבר חלף בלוח המקומי */
export const isPastLocalCalendarEnd = (endRaw: string): boolean =>
  cmpYmd(todayLocalYmdPieces(), boundsToYmdPieces(endRaw)) > 0;

/** האם היום נמצא בחלון של שלב הגשת מועמדות באחד השלבים */
export const anyCandidacyRegistrationOpenToday = (
  phases: { phaseType: string; startDate: string; endDate: string }[],
): boolean =>
  phases.some(
    (p) =>
      p.phaseType === 'CANDIDACY_SUBMISSION' &&
      isInclusiveLocalCalendarRange(p.startDate, p.endDate),
  );

/** שלב שטרם החל לפי יום ההתחלה בלוח (מקומי) */
export const isStrictlyBeforeLocalCalendarStart = (startRaw: string): boolean =>
  cmpYmd(todayLocalYmdPieces(), boundsToYmdPieces(startRaw)) < 0;
