import type { AuthUser } from './auth';
import { loadUser } from './auth';
import { Role } from './roles';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const normalizeApiBase = (raw: string) => {
  const trimmed = trimTrailingSlash(raw.trim());
  if (trimmed.startsWith('http') && !trimmed.endsWith('/api')) {
    return `${trimmed}/api`;
  }
  return trimmed;
};

const API_BASE =
  typeof import.meta.env.VITE_API_BASE_URL === 'string' &&
  import.meta.env.VITE_API_BASE_URL.trim().length > 0
    ? normalizeApiBase(import.meta.env.VITE_API_BASE_URL)
    : '/api';

/** תאריכי דמה יחסיים ל״היום״ (טעינת המודול) - טווח רישום פעיל והיסטוריה */
const mockDayOffset = (deltaDays: number): string => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + deltaDays);
  return d.toISOString().slice(0, 10);
};

const seedBranches: Branch[] = [
  { id: 1, name: 'ענף לוגיסטיקה' },
  { id: 2, name: 'ענף טכנולוגיה' },
  { id: 3, name: 'ענף תקשוב' },
];

const seedTeams: Team[] = [
  { id: 1, name: 'צוות אלפא', branchId: 2 },
  { id: 2, name: 'צוות בראבו', branchId: 2 },
  { id: 3, name: 'צוות גאמא', branchId: 1 },
  { id: 4, name: 'צוות דלתא', branchId: 1 },
  { id: 5, name: 'צוות הדס', branchId: 3 },
];

const seedUsers: User[] = [
  { id: 1, uniqueId: '1000000', name: 'דוד כהן', role: Role.BIS_CDR, isActive: true },
  {
    id: 2,
    uniqueId: '2000001',
    name: 'שרה לוי',
    role: Role.BRANCH_COORD,
    branchId: 2,
    branch: { id: 2, name: 'ענף טכנולוגיה' },
    isActive: true,
  },
  {
    id: 3,
    uniqueId: '3000001',
    name: 'נועה מזרחי',
    role: Role.TEAM_LEADER,
    teamId: 1,
    branchId: 2,
    team: { id: 1, name: 'צוות אלפא' },
    branch: { id: 2, name: 'ענף טכנולוגיה' },
    isActive: true,
  },
  {
    id: 4,
    uniqueId: '4000001',
    name: 'יונתן לוי',
    role: Role.TRAINEE,
    teamId: 1,
    branchId: 2,
    team: { id: 1, name: 'צוות אלפא' },
    branch: { id: 2, name: 'ענף טכנולוגיה' },
    isActive: true,
  },
  {
    id: 5,
    uniqueId: '4000002',
    name: 'מאיה אברהם',
    role: Role.TRAINEE,
    teamId: 1,
    branchId: 2,
    team: { id: 1, name: 'צוות אלפא' },
    branch: { id: 2, name: 'ענף טכנולוגיה' },
    isActive: true,
  },
  {
    id: 6,
    uniqueId: '2000002',
    name: 'יוסי אברהם',
    role: Role.BRANCH_COORD,
    branchId: 1,
    branch: { id: 1, name: 'ענף לוגיסטיקה' },
    isActive: true,
  },
  {
    id: 7,
    uniqueId: '2000003',
    name: 'מיכל דוד',
    role: Role.BRANCH_COORD,
    branchId: 3,
    branch: { id: 3, name: 'ענף תקשוב' },
    isActive: true,
  },
  {
    id: 8,
    uniqueId: '3000002',
    name: 'אורי גולן',
    role: Role.TEAM_LEADER,
    teamId: 2,
    branchId: 2,
    team: { id: 2, name: 'צוות בראבו' },
    branch: { id: 2, name: 'ענף טכנולוגיה' },
    isActive: true,
  },
  {
    id: 9,
    uniqueId: '3000003',
    name: 'תמר פרץ',
    role: Role.TEAM_LEADER,
    teamId: 3,
    branchId: 1,
    team: { id: 3, name: 'צוות גאמא' },
    branch: { id: 1, name: 'ענף לוגיסטיקה' },
    isActive: true,
  },
  {
    id: 10,
    uniqueId: '3000004',
    name: 'דניאל רוזנברג',
    role: Role.TEAM_LEADER,
    teamId: 4,
    branchId: 1,
    team: { id: 4, name: 'צוות דלתא' },
    branch: { id: 1, name: 'ענף לוגיסטיקה' },
    isActive: true,
  },
  {
    id: 11,
    uniqueId: '3000005',
    name: 'שירה כהן',
    role: Role.TEAM_LEADER,
    teamId: 5,
    branchId: 3,
    team: { id: 5, name: 'צוות הדס' },
    branch: { id: 3, name: 'ענף תקשוב' },
    isActive: true,
  },
  {
    id: 12,
    uniqueId: '4000003',
    name: 'עידו כהן',
    role: Role.TRAINEE,
    teamId: 2,
    branchId: 2,
    team: { id: 2, name: 'צוות בראבו' },
    branch: { id: 2, name: 'ענף טכנולוגיה' },
    isActive: true,
  },
  {
    id: 13,
    uniqueId: '4000004',
    name: 'רונה דוד',
    role: Role.TRAINEE,
    teamId: 3,
    branchId: 1,
    team: { id: 3, name: 'צוות גאמא' },
    branch: { id: 1, name: 'ענף לוגיסטיקה' },
    isActive: true,
  },
  {
    id: 14,
    uniqueId: '4000005',
    name: 'אלון פרידמן',
    role: Role.TRAINEE,
    teamId: 3,
    branchId: 1,
    team: { id: 3, name: 'צוות גאמא' },
    branch: { id: 1, name: 'ענף לוגיסטיקה' },
    isActive: true,
  },
  {
    id: 15,
    uniqueId: '4000006',
    name: 'שקד מזרחי',
    role: Role.TRAINEE,
    teamId: 4,
    branchId: 1,
    team: { id: 4, name: 'צוות דלתא' },
    branch: { id: 1, name: 'ענף לוגיסטיקה' },
    isActive: true,
  },
  {
    id: 16,
    uniqueId: '4000007',
    name: 'ליאור גולן',
    role: Role.TRAINEE,
    teamId: 5,
    branchId: 3,
    team: { id: 5, name: 'צוות הדס' },
    branch: { id: 3, name: 'ענף תקשוב' },
    isActive: true,
  },
  /* משתתפים בענף טכנולוגיה - דמו לרכז ענף */
  {
    id: 17,
    uniqueId: '4010001',
    name: 'איתמר כהן',
    role: Role.TRAINEE,
    teamId: 1,
    branchId: 2,
    team: { id: 1, name: 'צוות אלפא' },
    branch: { id: 2, name: 'ענף טכנולוגיה' },
    isActive: true,
  },
  {
    id: 18,
    uniqueId: '4010002',
    name: 'נועם לוי',
    role: Role.TRAINEE,
    teamId: 1,
    branchId: 2,
    team: { id: 1, name: 'צוות אלפא' },
    branch: { id: 2, name: 'ענף טכנולוגיה' },
    isActive: true,
  },
  {
    id: 19,
    uniqueId: '4010003',
    name: 'גל עדן',
    role: Role.TRAINEE,
    teamId: 2,
    branchId: 2,
    team: { id: 2, name: 'צוות בראבו' },
    branch: { id: 2, name: 'ענף טכנולוגיה' },
    isActive: true,
  },
  {
    id: 20,
    uniqueId: '4010004',
    name: 'רועי שמש',
    role: Role.TRAINEE,
    teamId: 2,
    branchId: 2,
    team: { id: 2, name: 'צוות בראבו' },
    branch: { id: 2, name: 'ענף טכנולוגיה' },
    isActive: true,
  },
  {
    id: 21,
    uniqueId: '4010005',
    name: 'טל ברק',
    role: Role.TRAINEE,
    teamId: 1,
    branchId: 2,
    team: { id: 1, name: 'צוות אלפא' },
    branch: { id: 2, name: 'ענף טכנולוגיה' },
    isActive: true,
  },
  {
    id: 22,
    uniqueId: '4010006',
    name: 'עמית נרי',
    role: Role.TRAINEE,
    teamId: 2,
    branchId: 2,
    team: { id: 2, name: 'צוות בראבו' },
    branch: { id: 2, name: 'ענף טכנולוגיה' },
    isActive: true,
  },
  {
    id: 23,
    uniqueId: '4010007',
    name: 'ירדן פז',
    role: Role.TRAINEE,
    teamId: 1,
    branchId: 2,
    team: { id: 1, name: 'צוות אלפא' },
    branch: { id: 2, name: 'ענף טכנולוגיה' },
    isActive: true,
  },
  {
    id: 24,
    uniqueId: '4010008',
    name: 'הדר קליין',
    role: Role.TRAINEE,
    teamId: 2,
    branchId: 2,
    team: { id: 2, name: 'צוות בראבו' },
    branch: { id: 2, name: 'ענף טכנולוגיה' },
    isActive: true,
  },
  {
    id: 25,
    uniqueId: '4010009',
    name: 'לירן אוזן',
    role: Role.TRAINEE,
    teamId: 1,
    branchId: 2,
    team: { id: 1, name: 'צוות אלפא' },
    branch: { id: 2, name: 'ענף טכנולוגיה' },
    isActive: true,
  },
  {
    id: 26,
    uniqueId: '4010010',
    name: 'שחר דור',
    role: Role.TRAINEE,
    teamId: 2,
    branchId: 2,
    team: { id: 2, name: 'צוות בראבו' },
    branch: { id: 2, name: 'ענף טכנולוגיה' },
    isActive: true,
  },
  {
    id: 27,
    uniqueId: '4010011',
    name: 'נדב רייך',
    role: Role.TRAINEE,
    teamId: 1,
    branchId: 2,
    team: { id: 1, name: 'צוות אלפא' },
    branch: { id: 2, name: 'ענף טכנולוגיה' },
    isActive: true,
  },
  {
    id: 28,
    uniqueId: '4010012',
    name: 'עומר סלע',
    role: Role.TRAINEE,
    teamId: 2,
    branchId: 2,
    team: { id: 2, name: 'צוות בראבו' },
    branch: { id: 2, name: 'ענף טכנולוגיה' },
    isActive: true,
  },
  {
    id: 29,
    uniqueId: '4010013',
    name: 'כרמל אש',
    role: Role.TRAINEE,
    teamId: 1,
    branchId: 2,
    team: { id: 1, name: 'צוות אלפא' },
    branch: { id: 2, name: 'ענף טכנולוגיה' },
    isActive: true,
  },
  {
    id: 30,
    uniqueId: '4010014',
    name: 'דניאל צור',
    role: Role.TRAINEE,
    teamId: 2,
    branchId: 2,
    team: { id: 2, name: 'צוות בראבו' },
    branch: { id: 2, name: 'ענף טכנולוגיה' },
    isActive: true,
  },
  {
    id: 31,
    uniqueId: '4010015',
    name: 'נטע פרי',
    role: Role.TRAINEE,
    teamId: 1,
    branchId: 2,
    team: { id: 1, name: 'צוות אלפא' },
    branch: { id: 2, name: 'ענף טכנולוגיה' },
    isActive: true,
  },
  {
    id: 32,
    uniqueId: '4010016',
    name: 'רז מור',
    role: Role.TRAINEE,
    teamId: 2,
    branchId: 2,
    team: { id: 2, name: 'צוות בראבו' },
    branch: { id: 2, name: 'ענף טכנולוגיה' },
    isActive: true,
  },
  {
    id: 33,
    uniqueId: '4010017',
    name: 'אור לבנון',
    role: Role.TRAINEE,
    teamId: 1,
    branchId: 2,
    team: { id: 1, name: 'צוות אלפא' },
    branch: { id: 2, name: 'ענף טכנולוגיה' },
    isActive: true,
  },
  {
    id: 34,
    uniqueId: '4010018',
    name: 'ליהיא גינת',
    role: Role.TRAINEE,
    teamId: 2,
    branchId: 2,
    team: { id: 2, name: 'צוות בראבו' },
    branch: { id: 2, name: 'ענף טכנולוגיה' },
    isActive: true,
  },
];

const seedCourses: Course[] = [
  {
    id: 1,
    name: 'קורס הכשרת מנהלים',
    description: 'קורס הכשרת מנהלים בכירים',
    type: 'FOUNDATION',
    requirements: null,
    gmushHours: null,
    location: 'מרכז הדרכה ראשי',
    isPublished: true,
  },
  {
    id: 2,
    name: 'קורס סייבר מתקדם',
    description: 'הכשרה מתקדמת בעולם הסייבר',
    type: 'ADVANCED',
    requirements: 'סיום קורס בסיסי',
    gmushHours: 40,
    location: 'מרכז סייבר',
    isPublished: true,
  },
  {
    id: 3,
    name: 'קורס GIS מתקדם',
    description: 'הכשרה במערכות מידע גיאוגרפי ואנליזה מרחבית',
    type: 'ADVANCED',
    requirements: 'היכרות בסיסית עם GIS',
    gmushHours: 32,
    location: 'חדר הדרכה 3',
    isPublished: true,
  },
  {
    id: 4,
    name: 'קורס Python לאנליסטים',
    description: 'תכנות Python לצרכי אנליזה ועיבוד נתונים',
    type: 'ADVANCED',
    requirements: 'אין דרישות מקדימות',
    gmushHours: 24,
    location: 'מעבדת מחשבים',
    isPublished: true,
  },
  {
    id: 5,
    name: 'קורס ראשי צוותות',
    description: 'הכשרה לתפקיד ראש צוות',
    type: 'LEADERSHIP',
    requirements: null,
    gmushHours: null,
    location: 'מרכז הדרכה ראשי',
    isPublished: true,
  },
];

const seedInstances: CourseInstance[] = [
  {
    id: 1,
    courseId: 1,
    name: 'מחזור 42',
    startDate: '2026-03-01',
    endDate: '2026-07-07',
    status: 'OPEN',
  },
  {
    id: 2,
    courseId: 2,
    name: 'מחזור קיץ 2026',
    startDate: '2026-06-01',
    endDate: '2026-07-15',
    status: 'OPEN',
  },
  {
    id: 3,
    courseId: 3,
    name: 'מחזור 3',
    startDate: '2026-05-15',
    endDate: '2026-06-20',
    status: 'OPEN',
  },
  {
    id: 4,
    courseId: 4,
    name: 'מחזור 5',
    startDate: '2026-07-01',
    endDate: '2026-07-25',
    status: 'OPEN',
  },
  {
    id: 5,
    courseId: 5,
    name: 'מחזור 8',
    startDate: '2026-04-01',
    endDate: '2026-05-18',
    status: 'IN_PROGRESS',
  },
  {
    id: 6,
    courseId: 4,
    name: 'מחזור אביב א׳',
    /** מסונכרן לשלב COURSE (שלב 10) - כדי שתאריכי הכרטיס יתאימו לגאנט */
    startDate: mockDayOffset(14),
    endDate: mockDayOffset(52),
    status: 'OPEN',
  },
  {
    id: 7,
    courseId: 2,
    name: 'מחזור אביב סייבר',
    startDate: '2026-05-01',
    endDate: '2026-06-15',
    status: 'OPEN',
  },
  {
    id: 8,
    courseId: 5,
    name: 'מחזור ט׳',
    startDate: '2026-04-18',
    endDate: '2026-06-01',
    status: 'IN_PROGRESS',
  },
  {
    id: 9,
    courseId: 1,
    name: 'מחזור 43',
    startDate: '2026-05-05',
    endDate: '2026-09-01',
    status: 'OPEN',
  },
  {
    id: 10,
    courseId: 4,
    name: 'מחזור 6',
    startDate: '2026-05-25',
    endDate: '2026-07-10',
    status: 'OPEN',
  },
  {
    id: 11,
    courseId: 3,
    name: 'מחזור 3ב',
    startDate: '2026-06-08',
    endDate: '2026-07-22',
    status: 'OPEN',
  },
  {
    id: 12,
    courseId: 5,
    name: 'מחזור י׳',
    startDate: '2026-06-20',
    endDate: '2026-08-10',
    status: 'OPEN',
  },
  {
    id: 13,
    courseId: 2,
    name: 'מחזור קיץ ב׳',
    startDate: '2026-07-08',
    endDate: '2026-08-20',
    status: 'OPEN',
  },
  {
    id: 14,
    courseId: 2,
    name: 'מחזור - רישום פתוח עכשיו (א׳)',
    startDate: mockDayOffset(45),
    endDate: mockDayOffset(120),
    status: 'OPEN',
  },
  {
    id: 15,
    courseId: 3,
    name: 'מחזור - רישום פתוח עכשיו (ב׳)',
    startDate: mockDayOffset(50),
    endDate: mockDayOffset(110),
    status: 'OPEN',
  },
  {
    id: 16,
    courseId: 4,
    name: 'מחזור - רישום פתוח עכשיו (ג׳)',
    startDate: mockDayOffset(40),
    endDate: mockDayOffset(95),
    status: 'OPEN',
  },
  {
    id: 17,
    courseId: 2,
    name: 'מחזור נעול (הסתיים)',
    startDate: mockDayOffset(-200),
    endDate: mockDayOffset(-100),
    status: 'COMPLETED',
  },
  {
    id: 18,
    courseId: 3,
    name: 'מחזור ישן (הסתיים)',
    startDate: mockDayOffset(-350),
    endDate: mockDayOffset(-250),
    status: 'COMPLETED',
  },
  {
    id: 19,
    courseId: 2,
    name: 'מחזור חורף - ארכיון (הסתיים השנה)',
    startDate: mockDayOffset(-90),
    endDate: mockDayOffset(-38),
    status: 'COMPLETED',
  },
  {
    id: 20,
    courseId: 4,
    name: 'מחזור מוקדם - ארכיון (הסתיים השנה)',
    startDate: mockDayOffset(-70),
    endDate: mockDayOffset(-28),
    status: 'COMPLETED',
  },
];

const seedPhases: CoursePhase[] = [
  {
    id: 1,
    courseInstanceId: 1,
    name: 'הגשת מועמדות',
    phaseType: 'CANDIDACY_SUBMISSION',
    startDate: '2026-03-01',
    endDate: '2026-03-15',
    description: null,
    sortOrder: 1,
  },
  {
    id: 41,
    courseInstanceId: 1,
    name: 'מיונים',
    phaseType: 'TRYOUTS',
    startDate: '2026-03-16',
    endDate: '2026-04-28',
    description: null,
    sortOrder: 2,
  },
  {
    id: 2,
    courseInstanceId: 1,
    name: 'לימודי המחזור (בקורס)',
    phaseType: 'COURSE',
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    description: null,
    sortOrder: 3,
  },
  {
    id: 3,
    courseInstanceId: 2,
    name: 'פתיחת רישום למחזור',
    phaseType: 'CANDIDACY_SUBMISSION',
    startDate: '2026-05-20',
    endDate: '2026-05-28',
    description: null,
    sortOrder: 1,
  },
  {
    id: 4,
    courseInstanceId: 2,
    name: 'מיונים ואישורים',
    phaseType: 'TRYOUTS',
    startDate: '2026-05-29',
    endDate: '2026-06-05',
    description: null,
    sortOrder: 2,
  },
  {
    id: 5,
    courseInstanceId: 2,
    name: 'לימודי המחזור (בקורס)',
    phaseType: 'COURSE',
    startDate: '2026-06-06',
    endDate: '2026-07-15',
    description: null,
    sortOrder: 3,
  },
  {
    id: 6,
    courseInstanceId: 3,
    name: 'פתיחת רישום למחזור',
    phaseType: 'CANDIDACY_SUBMISSION',
    startDate: '2026-04-20',
    endDate: '2026-05-05',
    description: null,
    sortOrder: 1,
  },
  {
    id: 42,
    courseInstanceId: 3,
    name: 'מיונים',
    phaseType: 'TRYOUTS',
    startDate: '2026-05-06',
    endDate: '2026-05-14',
    description: null,
    sortOrder: 2,
  },
  {
    id: 7,
    courseInstanceId: 3,
    name: 'לימודי המחזור (בקורס)',
    phaseType: 'COURSE',
    startDate: '2026-05-15',
    endDate: '2026-06-20',
    description: null,
    sortOrder: 3,
  },
  {
    id: 43,
    courseInstanceId: 4,
    name: 'פתיחת רישום למחזור',
    phaseType: 'CANDIDACY_SUBMISSION',
    startDate: '2026-06-01',
    endDate: '2026-06-15',
    description: null,
    sortOrder: 1,
  },
  {
    id: 44,
    courseInstanceId: 4,
    name: 'מיונים',
    phaseType: 'TRYOUTS',
    startDate: '2026-06-16',
    endDate: '2026-06-28',
    description: null,
    sortOrder: 2,
  },
  {
    id: 8,
    courseInstanceId: 4,
    name: 'לימודי המחזור (בקורס)',
    phaseType: 'COURSE',
    startDate: '2026-07-01',
    endDate: '2026-07-25',
    description: null,
    sortOrder: 3,
  },
  {
    id: 9,
    courseInstanceId: 6,
    name: 'פתיחת רישום למחזור',
    phaseType: 'CANDIDACY_SUBMISSION',
    startDate: mockDayOffset(-20),
    endDate: mockDayOffset(-2),
    description: null,
    sortOrder: 1,
  },
  {
    id: 45,
    courseInstanceId: 6,
    name: 'מיונים',
    phaseType: 'TRYOUTS',
    startDate: mockDayOffset(0),
    endDate: mockDayOffset(12),
    description: null,
    sortOrder: 2,
  },
  {
    id: 10,
    courseInstanceId: 6,
    name: 'לימודי המחזור (בקורס)',
    phaseType: 'COURSE',
    startDate: mockDayOffset(14),
    endDate: mockDayOffset(52),
    description: null,
    sortOrder: 3,
  },
  {
    id: 11,
    courseInstanceId: 7,
    name: 'פתיחת רישום למחזור',
    phaseType: 'CANDIDACY_SUBMISSION',
    startDate: '2026-04-05',
    endDate: '2026-04-14',
    description: null,
    sortOrder: 1,
  },
  {
    id: 12,
    courseInstanceId: 7,
    name: 'מיונים',
    phaseType: 'TRYOUTS',
    startDate: '2026-04-16',
    endDate: '2026-04-28',
    description: null,
    sortOrder: 2,
  },
  {
    id: 46,
    courseInstanceId: 7,
    name: 'לימודי המחזור (בקורס)',
    phaseType: 'COURSE',
    startDate: '2026-05-01',
    endDate: '2026-06-15',
    description: null,
    sortOrder: 3,
  },
  {
    id: 51,
    courseInstanceId: 5,
    name: 'פתיחת רישום למחזור',
    phaseType: 'CANDIDACY_SUBMISSION',
    startDate: '2026-03-01',
    endDate: '2026-03-20',
    description: null,
    sortOrder: 1,
  },
  {
    id: 52,
    courseInstanceId: 5,
    name: 'מיונים',
    phaseType: 'TRYOUTS',
    startDate: '2026-03-22',
    endDate: '2026-03-28',
    description: null,
    sortOrder: 2,
  },
  {
    id: 53,
    courseInstanceId: 5,
    name: 'לימודי המחזור (בקורס)',
    phaseType: 'COURSE',
    startDate: '2026-04-01',
    endDate: '2026-05-18',
    description: null,
    sortOrder: 3,
  },
  {
    id: 13,
    courseInstanceId: 8,
    name: 'פתיחת רישום למחזור',
    phaseType: 'CANDIDACY_SUBMISSION',
    startDate: '2026-04-18',
    endDate: '2026-04-26',
    description: null,
    sortOrder: 1,
  },
  {
    id: 54,
    courseInstanceId: 8,
    name: 'מיונים',
    phaseType: 'TRYOUTS',
    startDate: '2026-04-28',
    endDate: '2026-05-02',
    description: null,
    sortOrder: 2,
  },
  {
    id: 14,
    courseInstanceId: 8,
    name: 'לימודי המחזור (בקורס)',
    phaseType: 'COURSE',
    startDate: '2026-05-04',
    endDate: '2026-06-01',
    description: null,
    sortOrder: 3,
  },
  {
    id: 15,
    courseInstanceId: 9,
    name: 'הגשת מועמדות',
    phaseType: 'CANDIDACY_SUBMISSION',
    startDate: '2026-05-05',
    endDate: '2026-05-18',
    description: null,
    sortOrder: 1,
  },
  {
    id: 55,
    courseInstanceId: 9,
    name: 'מיונים',
    phaseType: 'TRYOUTS',
    startDate: '2026-05-19',
    endDate: '2026-05-28',
    description: null,
    sortOrder: 2,
  },
  {
    id: 16,
    courseInstanceId: 9,
    name: 'לימודי המחזור (בקורס)',
    phaseType: 'COURSE',
    startDate: '2026-06-01',
    endDate: '2026-08-30',
    description: null,
    sortOrder: 3,
  },
  {
    id: 17,
    courseInstanceId: 10,
    name: 'פתיחת רישום',
    phaseType: 'CANDIDACY_SUBMISSION',
    startDate: '2026-05-25',
    endDate: '2026-06-02',
    description: null,
    sortOrder: 1,
  },
  {
    id: 56,
    courseInstanceId: 10,
    name: 'מיונים',
    phaseType: 'TRYOUTS',
    startDate: '2026-06-03',
    endDate: '2026-06-04',
    description: null,
    sortOrder: 2,
  },
  {
    id: 18,
    courseInstanceId: 10,
    name: 'לימודי המחזור (בקורס)',
    phaseType: 'COURSE',
    startDate: '2026-06-05',
    endDate: '2026-07-08',
    description: null,
    sortOrder: 3,
  },
  {
    id: 19,
    courseInstanceId: 11,
    name: 'פתיחת רישום למחזור',
    phaseType: 'CANDIDACY_SUBMISSION',
    startDate: '2026-06-08',
    endDate: '2026-06-15',
    description: null,
    sortOrder: 1,
  },
  {
    id: 57,
    courseInstanceId: 11,
    name: 'מיונים',
    phaseType: 'TRYOUTS',
    startDate: '2026-06-16',
    endDate: '2026-06-17',
    description: null,
    sortOrder: 2,
  },
  {
    id: 20,
    courseInstanceId: 11,
    name: 'לימודי המחזור (בקורס)',
    phaseType: 'COURSE',
    startDate: '2026-06-18',
    endDate: '2026-07-20',
    description: null,
    sortOrder: 3,
  },
  {
    id: 21,
    courseInstanceId: 12,
    name: 'הגשת מועמדות',
    phaseType: 'CANDIDACY_SUBMISSION',
    startDate: '2026-06-20',
    endDate: '2026-06-28',
    description: null,
    sortOrder: 1,
  },
  {
    id: 58,
    courseInstanceId: 12,
    name: 'מיונים',
    phaseType: 'TRYOUTS',
    startDate: '2026-06-29',
    endDate: '2026-06-30',
    description: null,
    sortOrder: 2,
  },
  {
    id: 22,
    courseInstanceId: 12,
    name: 'הכשרה',
    phaseType: 'COMMANDER_COURSE',
    startDate: '2026-07-01',
    endDate: '2026-08-05',
    description: null,
    sortOrder: 3,
  },
  {
    id: 23,
    courseInstanceId: 13,
    name: 'פתיחת רישום למחזור',
    phaseType: 'CANDIDACY_SUBMISSION',
    startDate: '2026-07-08',
    endDate: '2026-07-15',
    description: null,
    sortOrder: 1,
  },
  {
    id: 59,
    courseInstanceId: 13,
    name: 'מיונים',
    phaseType: 'TRYOUTS',
    startDate: '2026-07-16',
    endDate: '2026-07-17',
    description: null,
    sortOrder: 2,
  },
  {
    id: 24,
    courseInstanceId: 13,
    name: 'לימודי המחזור (בקורס)',
    phaseType: 'COURSE',
    startDate: '2026-07-18',
    endDate: '2026-08-18',
    description: null,
    sortOrder: 3,
  },
  {
    id: 25,
    courseInstanceId: 14,
    name: 'פתיחת רישום למחזור',
    phaseType: 'CANDIDACY_SUBMISSION',
    startDate: mockDayOffset(-5),
    endDate: mockDayOffset(14),
    description: null,
    sortOrder: 1,
  },
  {
    id: 26,
    courseInstanceId: 14,
    name: 'מיונים',
    phaseType: 'TRYOUTS',
    startDate: mockDayOffset(16),
    endDate: mockDayOffset(28),
    description: null,
    sortOrder: 2,
  },
  {
    id: 27,
    courseInstanceId: 14,
    name: 'לימודי המחזור (בקורס)',
    phaseType: 'COURSE',
    startDate: mockDayOffset(45),
    endDate: mockDayOffset(115),
    description: null,
    sortOrder: 3,
  },
  {
    id: 28,
    courseInstanceId: 15,
    name: 'פתיחת רישום למחזור',
    phaseType: 'CANDIDACY_SUBMISSION',
    startDate: mockDayOffset(0),
    endDate: mockDayOffset(21),
    description: null,
    sortOrder: 1,
  },
  {
    id: 29,
    courseInstanceId: 15,
    name: 'מיונים',
    phaseType: 'TRYOUTS',
    startDate: mockDayOffset(23),
    endDate: mockDayOffset(35),
    description: null,
    sortOrder: 2,
  },
  {
    id: 30,
    courseInstanceId: 15,
    name: 'לימודי המחזור (בקורס)',
    phaseType: 'COURSE',
    startDate: mockDayOffset(48),
    endDate: mockDayOffset(108),
    description: null,
    sortOrder: 3,
  },
  {
    id: 31,
    courseInstanceId: 16,
    name: 'פתיחת רישום למחזור',
    phaseType: 'CANDIDACY_SUBMISSION',
    startDate: mockDayOffset(-3),
    endDate: mockDayOffset(12),
    description: null,
    sortOrder: 1,
  },
  {
    id: 60,
    courseInstanceId: 16,
    name: 'מיונים',
    phaseType: 'TRYOUTS',
    startDate: mockDayOffset(13),
    endDate: mockDayOffset(17),
    description: null,
    sortOrder: 2,
  },
  {
    id: 32,
    courseInstanceId: 16,
    name: 'לימודי המחזור (בקורס)',
    phaseType: 'COURSE',
    startDate: mockDayOffset(18),
    endDate: mockDayOffset(90),
    description: null,
    sortOrder: 3,
  },
  {
    id: 33,
    courseInstanceId: 17,
    name: 'פתיחת רישום (היסטוריה)',
    phaseType: 'CANDIDACY_SUBMISSION',
    startDate: mockDayOffset(-190),
    endDate: mockDayOffset(-175),
    description: null,
    sortOrder: 1,
  },
  {
    id: 61,
    courseInstanceId: 17,
    name: 'מיונים',
    phaseType: 'TRYOUTS',
    startDate: mockDayOffset(-174),
    endDate: mockDayOffset(-173),
    description: null,
    sortOrder: 2,
  },
  {
    id: 34,
    courseInstanceId: 17,
    name: 'לימודי המחזור (בקורס)',
    phaseType: 'COURSE',
    startDate: mockDayOffset(-172),
    endDate: mockDayOffset(-102),
    description: null,
    sortOrder: 3,
  },
  {
    id: 35,
    courseInstanceId: 18,
    name: 'פתיחת רישום (היסטוריה)',
    phaseType: 'CANDIDACY_SUBMISSION',
    startDate: mockDayOffset(-340),
    endDate: mockDayOffset(-310),
    description: null,
    sortOrder: 1,
  },
  {
    id: 62,
    courseInstanceId: 18,
    name: 'מיונים',
    phaseType: 'TRYOUTS',
    startDate: mockDayOffset(-309),
    endDate: mockDayOffset(-306),
    description: null,
    sortOrder: 2,
  },
  {
    id: 36,
    courseInstanceId: 18,
    name: 'לימודי המחזור (בקורס)',
    phaseType: 'COURSE',
    startDate: mockDayOffset(-305),
    endDate: mockDayOffset(-252),
    description: null,
    sortOrder: 3,
  },
  {
    id: 37,
    courseInstanceId: 19,
    name: 'פתיחת רישום (היסטוריה)',
    phaseType: 'CANDIDACY_SUBMISSION',
    startDate: mockDayOffset(-115),
    endDate: mockDayOffset(-95),
    description: null,
    sortOrder: 1,
  },
  {
    id: 63,
    courseInstanceId: 19,
    name: 'מיונים',
    phaseType: 'TRYOUTS',
    startDate: mockDayOffset(-94),
    endDate: mockDayOffset(-91),
    description: null,
    sortOrder: 2,
  },
  {
    id: 38,
    courseInstanceId: 19,
    name: 'לימודי המחזור (בקורס)',
    phaseType: 'COURSE',
    startDate: mockDayOffset(-90),
    endDate: mockDayOffset(-38),
    description: null,
    sortOrder: 3,
  },
  {
    id: 39,
    courseInstanceId: 20,
    name: 'פתיחת רישום (היסטוריה)',
    phaseType: 'CANDIDACY_SUBMISSION',
    startDate: mockDayOffset(-100),
    endDate: mockDayOffset(-78),
    description: null,
    sortOrder: 1,
  },
  {
    id: 64,
    courseInstanceId: 20,
    name: 'מיונים',
    phaseType: 'TRYOUTS',
    startDate: mockDayOffset(-77),
    endDate: mockDayOffset(-71),
    description: null,
    sortOrder: 2,
  },
  {
    id: 40,
    courseInstanceId: 20,
    name: 'לימודי המחזור (בקורס)',
    phaseType: 'COURSE',
    startDate: mockDayOffset(-70),
    endDate: mockDayOffset(-28),
    description: null,
    sortOrder: 3,
  },
];

const seedRegistrationsCore: CourseRegistration[] = [
  {
    id: 1,
    courseInstanceId: 2,
    userId: 4,
    status: 'PENDING_TL',
    formData: null,
    coordPriority: null,
    coordNotes: null,
    bisNotes: null,
    rejectionReason: null,
  },
  {
    id: 2,
    courseInstanceId: 2,
    userId: 5,
    status: 'APPROVED',
    formData: null,
    coordPriority: 1,
    coordNotes: 'עדיפות גבוהה',
    bisNotes: 'מאושר',
    rejectionReason: null,
  },
  {
    id: 3,
    courseInstanceId: 3,
    userId: 12,
    status: 'PENDING_COORD',
    formData: null,
    coordPriority: null,
    coordNotes: null,
    bisNotes: null,
    rejectionReason: null,
  },
  {
    id: 4,
    courseInstanceId: 4,
    userId: 13,
    status: 'PENDING_BIS',
    formData: null,
    coordPriority: 2,
    coordNotes: 'מומלץ למחזור הבא',
    bisNotes: null,
    rejectionReason: null,
  },
  {
    id: 5,
    courseInstanceId: 2,
    userId: 14,
    status: 'REJECTED',
    formData: null,
    coordPriority: null,
    coordNotes: null,
    bisNotes: null,
    rejectionReason: 'אין מקום במחזור הנוכחי',
  },
  {
    id: 6,
    courseInstanceId: 5,
    userId: 15,
    status: 'APPROVED',
    formData: null,
    coordPriority: 1,
    coordNotes: 'עדיפות גבוהה',
    bisNotes: 'מאושר',
    rejectionReason: null,
  },
  {
    id: 7,
    courseInstanceId: 5,
    userId: 16,
    status: 'PENDING_TL',
    formData: null,
    coordPriority: null,
    coordNotes: null,
    bisNotes: null,
    rejectionReason: null,
  },
  /* —— ענף טכנולוגיה (branchId 2): דמו לרכז ענף - כל סטטוסי רישום —— */
  {
    id: 8,
    courseInstanceId: 4,
    userId: 4,
    status: 'PENDING_COORD',
    formData: null,
    coordPriority: null,
    coordNotes: null,
    bisNotes: null,
    rejectionReason: null,
  },
  {
    id: 9,
    courseInstanceId: 3,
    userId: 5,
    status: 'PENDING_BIS',
    formData: null,
    coordPriority: 2,
    coordNotes: 'הועבר לאישור סופי - עדיפות בינונית',
    bisNotes: null,
    rejectionReason: null,
  },
  {
    id: 10,
    courseInstanceId: 2,
    userId: 12,
    status: 'REJECTED',
    formData: null,
    coordPriority: null,
    coordNotes: 'לא מתאים למחזור',
    bisNotes: null,
    rejectionReason: 'אין מקום פנוי במחזור',
  },
  {
    id: 11,
    courseInstanceId: 5,
    userId: 4,
    status: 'PENDING_BIS',
    formData: null,
    coordPriority: 1,
    coordNotes: 'מומלץ בחום לאישור סופי',
    bisNotes: null,
    rejectionReason: null,
  },
  {
    id: 12,
    courseInstanceId: 4,
    userId: 12,
    status: 'APPROVED',
    formData: null,
    coordPriority: 1,
    coordNotes: 'עבר ועדת ענף',
    bisNotes: 'מאושר סופית',
    rejectionReason: null,
  },
  {
    id: 13,
    courseInstanceId: 5,
    userId: 5,
    status: 'PENDING_TL',
    formData: null,
    coordPriority: null,
    coordNotes: null,
    bisNotes: null,
    rejectionReason: null,
  },
  {
    id: 14,
    courseInstanceId: 1,
    userId: 12,
    status: 'PENDING_COORD',
    formData: null,
    coordPriority: null,
    coordNotes: null,
    bisNotes: null,
    rejectionReason: null,
  },
  /* משתתפים נוספים בענף 2 - רישום לכל אחד (דמו לרכז) */
  {
    id: 15,
    courseInstanceId: 2,
    userId: 17,
    status: 'PENDING_TL',
    formData: null,
    coordPriority: null,
    coordNotes: null,
    bisNotes: null,
    rejectionReason: null,
  },
  {
    id: 16,
    courseInstanceId: 3,
    userId: 18,
    status: 'PENDING_COORD',
    formData: null,
    coordPriority: null,
    coordNotes: null,
    bisNotes: null,
    rejectionReason: null,
  },
  {
    id: 17,
    courseInstanceId: 4,
    userId: 19,
    status: 'PENDING_BIS',
    formData: null,
    coordPriority: 2,
    coordNotes: 'מומלץ - ממתין לאישור סופי',
    bisNotes: null,
    rejectionReason: null,
  },
  {
    id: 18,
    courseInstanceId: 5,
    userId: 20,
    status: 'APPROVED',
    formData: null,
    coordPriority: 1,
    coordNotes: 'תואם לדרישות',
    bisNotes: 'אושר',
    rejectionReason: null,
  },
  {
    id: 19,
    courseInstanceId: 2,
    userId: 21,
    status: 'REJECTED',
    formData: null,
    coordPriority: null,
    coordNotes: null,
    bisNotes: null,
    rejectionReason: 'לא עומד בקריטריונים',
  },
  {
    id: 20,
    courseInstanceId: 3,
    userId: 22,
    status: 'PENDING_TL',
    formData: null,
    coordPriority: null,
    coordNotes: null,
    bisNotes: null,
    rejectionReason: null,
  },
  {
    id: 21,
    courseInstanceId: 4,
    userId: 23,
    status: 'PENDING_COORD',
    formData: null,
    coordPriority: null,
    coordNotes: null,
    bisNotes: null,
    rejectionReason: null,
  },
  {
    id: 22,
    courseInstanceId: 5,
    userId: 24,
    status: 'PENDING_BIS',
    formData: null,
    coordPriority: 3,
    coordNotes: 'להחלטת מנהל מערכת',
    bisNotes: null,
    rejectionReason: null,
  },
  {
    id: 23,
    courseInstanceId: 2,
    userId: 25,
    status: 'APPROVED',
    formData: null,
    coordPriority: 2,
    coordNotes: 'בינוני-גבוה',
    bisNotes: 'מאושר',
    rejectionReason: null,
  },
  {
    id: 24,
    courseInstanceId: 3,
    userId: 26,
    status: 'REJECTED',
    formData: null,
    coordPriority: null,
    coordNotes: null,
    bisNotes: null,
    rejectionReason: 'מחזור מלא',
  },
  {
    id: 25,
    courseInstanceId: 4,
    userId: 27,
    status: 'PENDING_TL',
    formData: null,
    coordPriority: null,
    coordNotes: null,
    bisNotes: null,
    rejectionReason: null,
  },
  {
    id: 26,
    courseInstanceId: 5,
    userId: 28,
    status: 'PENDING_COORD',
    formData: null,
    coordPriority: null,
    coordNotes: null,
    bisNotes: null,
    rejectionReason: null,
  },
  {
    id: 27,
    courseInstanceId: 2,
    userId: 29,
    status: 'PENDING_BIS',
    formData: null,
    coordPriority: 1,
    coordNotes: 'עדיפות גבוהה',
    bisNotes: null,
    rejectionReason: null,
  },
  {
    id: 28,
    courseInstanceId: 3,
    userId: 30,
    status: 'APPROVED',
    formData: null,
    coordPriority: 1,
    coordNotes: 'מצטיין',
    bisNotes: 'אושר סופית',
    rejectionReason: null,
  },
  {
    id: 29,
    courseInstanceId: 4,
    userId: 31,
    status: 'REJECTED',
    formData: null,
    coordPriority: null,
    coordNotes: null,
    bisNotes: null,
    rejectionReason: 'חוסר בניסיון',
  },
  {
    id: 30,
    courseInstanceId: 5,
    userId: 32,
    status: 'PENDING_TL',
    formData: null,
    coordPriority: null,
    coordNotes: null,
    bisNotes: null,
    rejectionReason: null,
  },
  {
    id: 31,
    courseInstanceId: 2,
    userId: 33,
    status: 'PENDING_COORD',
    formData: null,
    coordPriority: null,
    coordNotes: null,
    bisNotes: null,
    rejectionReason: null,
  },
  {
    id: 32,
    courseInstanceId: 3,
    userId: 34,
    status: 'PENDING_BIS',
    formData: null,
    coordPriority: 2,
    coordNotes: 'מומלץ',
    bisNotes: null,
    rejectionReason: null,
  },
];

/** רישומים חסרים (משתמש×מחזור) לענף טכנולוגיה - ממלא את הדמו לרכז ענף בלי כפילויות */
const buildBranchRegistrationGaps = (
  core: CourseRegistration[],
  startId: number,
): CourseRegistration[] => {
  const statuses: CourseRegistration['status'][] = [
    'PENDING_TL',
    'PENDING_COORD',
    'PENDING_BIS',
    'APPROVED',
    'REJECTED',
  ];
  /** בלי 33 (אור לבנון) - נשאר בלי רישומי גאפ כדי לאפשר בדיקת ״הירשם״ ידנית */
  const branchTraineeIds = [
    4, 5, 12, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 34,
  ];
  const instanceIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const occupied = new Set(core.map((r) => `${r.userId}:${r.courseInstanceId}`));
  let nextId = startId;
  let si = 0;
  const out: CourseRegistration[] = [];
  for (const userId of branchTraineeIds) {
    for (const courseInstanceId of instanceIds) {
      const key = `${userId}:${courseInstanceId}`;
      if (occupied.has(key)) continue;
      occupied.add(key);
      const status = statuses[si % statuses.length];
      si += 1;
      const coordPriority = status === 'PENDING_BIS' || status === 'APPROVED' ? (si % 3) + 1 : null;
      out.push({
        id: nextId++,
        courseInstanceId,
        userId,
        status,
        formData: null,
        coordPriority,
        coordNotes: status === 'PENDING_BIS' || status === 'APPROVED' ? 'הערת רכז (דמו)' : null,
        bisNotes: status === 'APPROVED' ? 'אושר סופית (דמו)' : null,
        rejectionReason: status === 'REJECTED' ? 'לא יאושר במחזור זה (דמו)' : null,
      });
    }
  }
  return out;
};

const seedRegistrations: CourseRegistration[] = [
  ...seedRegistrationsCore,
  ...buildBranchRegistrationGaps(seedRegistrationsCore, 33),
];

const seedCandidaciesCore: CommandCandidacy[] = [
  {
    id: 1,
    courseInstanceId: 1,
    candidateId: 4,
    submittedById: 3,
    status: 'PENDING',
    motivation: 'בעל יכולות מנהיגות טבעיות',
    commanderNotes: 'ממליץ בחום',
    reviewNotes: null,
    reviewedById: null,
  },
  {
    id: 2,
    courseInstanceId: 1,
    candidateId: 5,
    submittedById: 3,
    status: 'COORD_REVIEWED',
    motivation: 'מוטיבציה גבוהה ויכולת למידה מהירה',
    commanderNotes: 'מומלצת',
    reviewNotes: null,
    reviewedById: null,
  },
  {
    id: 3,
    courseInstanceId: 1,
    candidateId: 13,
    submittedById: 9,
    status: 'APPROVED',
    motivation: 'מוביל בצוות עם ביצועים גבוהים',
    commanderNotes: 'מתאים מאוד',
    reviewNotes: 'מאושר סופית',
    reviewedById: 1,
  },
  {
    id: 4,
    courseInstanceId: 5,
    candidateId: 16,
    submittedById: 11,
    status: 'REJECTED',
    motivation: 'נדרש חיזוק מקצועי לפני יציאה לקורס',
    commanderNotes: 'פוטנציאל טוב לעתיד',
    reviewNotes: 'נדחה למחזור הבא',
    reviewedById: 1,
  },
];

/** מועמדויות נוספות בענף 2 - דמו לרכז ענף */
const seedCandidaciesExtra: CommandCandidacy[] = Array.from({ length: 16 }, (_, i) => {
  const statuses: CommandCandidacy['status'][] = [
    'PENDING',
    'COORD_REVIEWED',
    'PENDING',
    'REJECTED',
    'PENDING',
    'COORD_REVIEWED',
    'APPROVED',
    'PENDING',
    'PENDING',
    'COORD_REVIEWED',
    'PENDING',
    'APPROVED',
    'PENDING',
    'REJECTED',
    'COORD_REVIEWED',
    'PENDING',
  ];
  const status = statuses[i % statuses.length];
  const candidateId = 17 + (i % 8);
  const courseInstanceId = i < 8 ? 2 + (i % 4) : 1;
  return {
    id: 5 + i,
    courseInstanceId,
    candidateId,
    submittedById: i % 2 === 0 ? 3 : 8,
    status,
    motivation: `רצון להתקדם לקורס פיקוד - בקשה ${i + 1}`,
    commanderNotes: 'מומלץ מהשטח',
    reviewNotes: status === 'APPROVED' ? 'אושר בדיקה' : status === 'REJECTED' ? 'נדחה בדמו' : null,
    reviewedById: status === 'APPROVED' || status === 'REJECTED' ? 1 : null,
  };
});

const seedCandidacies: CommandCandidacy[] = [...seedCandidaciesCore, ...seedCandidaciesExtra];

const seedInfo: InfoPage[] = [
  {
    id: 1,
    slug: 'tryouts-info',
    title: 'מידע על המיונים',
    content: 'מידע ועדכונים',
    sortOrder: 1,
    isPublished: true,
  },
  {
    id: 2,
    slug: 'advanced-courses-info',
    title: 'מידע על קורסים מתקדמים',
    content: 'כל תהליך הרישום',
    sortOrder: 2,
    isPublished: true,
  },
  {
    id: 3,
    slug: 'schedule-info',
    title: 'מידע על לוח זמנים',
    content: 'עדכוני מועדים, שינויים והודעות מערכת',
    sortOrder: 3,
    isPublished: true,
  },
  {
    id: 4,
    slug: 'commander-guidelines',
    title: 'הנחיות לראשי צוותים',
    content: 'דגשים לתהליך המלצה ואישור משתתפים',
    sortOrder: 4,
    isPublished: true,
  },
];

const seedEvents: EventLog[] = [
  {
    id: 1,
    userId: 1,
    action: 'LOGIN',
    entityType: 'USER',
    entityId: 1,
    details: null,
    createdAt: new Date().toISOString(),
    user: { id: 1, name: 'דוד כהן', role: 'BIS_CDR' },
  },
  {
    id: 2,
    userId: 3,
    action: 'SUBMIT_CANDIDACY',
    entityType: 'COMMAND_CANDIDACY',
    entityId: 2,
    details: { courseInstanceId: 1 },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    user: { id: 3, name: 'נועה מזרחי', role: 'TEAM_LEADER' },
  },
  {
    id: 3,
    userId: 6,
    action: 'PRIORITIZE_REGISTRATION',
    entityType: 'COURSE_REGISTRATION',
    entityId: 4,
    details: { coordPriority: 2 },
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    user: { id: 6, name: 'יוסי אברהם', role: 'BRANCH_COORD' },
  },
  {
    id: 4,
    userId: 1,
    action: 'APPROVE_REGISTRATION_FINAL',
    entityType: 'COURSE_REGISTRATION',
    entityId: 6,
    details: { bisNotes: 'מאושר' },
    createdAt: new Date(Date.now() - 21600000).toISOString(),
    user: { id: 1, name: 'דוד כהן', role: 'BIS_CDR' },
  },
];

const mockDb = {
  users: seedUsers,
  branches: seedBranches,
  teams: seedTeams,
  courses: seedCourses,
  instances: seedInstances,
  phases: seedPhases,
  registrations: seedRegistrations,
  candidacies: seedCandidacies,
  infoPages: seedInfo,
  events: seedEvents,
};

const nextMockId = <T extends { id: number }>(rows: T[]) =>
  rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

const parseMockBody = (options?: RequestInit): Record<string, unknown> => {
  try {
    return JSON.parse((options?.body as string) ?? '{}') as Record<string, unknown>;
  } catch {
    return {};
  }
};

const mockPathname = (url: string) => url.split('?')[0];

const hydrateUser = (raw: User): User => {
  const branch =
    raw.branchId != null ? mockDb.branches.find((b) => b.id === raw.branchId) : undefined;
  const team = raw.teamId != null ? mockDb.teams.find((t) => t.id === raw.teamId) : undefined;
  return {
    ...raw,
    branch: branch ? { id: branch.id, name: branch.name } : undefined,
    team: team ? { id: team.id, name: team.name } : undefined,
  };
};

const hydrateAuthUser = (raw: User): AuthUser => {
  const h = hydrateUser(raw);
  return {
    id: h.id,
    uniqueId: h.uniqueId,
    name: h.name,
    role: h.role as Role,
    teamId: h.teamId ?? null,
    branchId: h.branchId ?? null,
    team: h.team ?? null,
    branch: h.branch ?? null,
  };
};

const branchesWithTeams = (): Branch[] =>
  mockDb.branches.map((b) => ({
    ...b,
    teams: mockDb.teams.filter((t) => t.branchId === b.id),
  }));

const pushMockEvent = (
  action: string,
  entityType: string,
  entityId: number | null,
  details: Record<string, unknown> | null = null,
) => {
  const actor = loadUser();
  mockDb.events.push({
    id: nextMockId(mockDb.events),
    userId: actor?.id ?? 1,
    action,
    entityType,
    entityId,
    details,
    createdAt: new Date().toISOString(),
    user: actor
      ? { id: actor.id, name: actor.name, role: actor.role as string }
      : { id: 1, name: 'מערכת', role: 'BIS_CDR' },
  });
};

const withRelations = () => {
  const courseById = new Map(mockDb.courses.map((course) => [course.id, course]));
  const userById = new Map(mockDb.users.map((user) => [user.id, hydrateUser(user)]));
  const instanceById = new Map(mockDb.instances.map((instance) => [instance.id, instance]));

  const registrations = mockDb.registrations.map((registration) => ({
    ...registration,
    user: userById.get(registration.userId),
    courseInstance: {
      ...instanceById.get(registration.courseInstanceId)!,
      course: courseById.get(instanceById.get(registration.courseInstanceId)!.courseId),
    },
  }));

  const candidacies = mockDb.candidacies.map((candidacy) => ({
    ...candidacy,
    candidate: userById.get(candidacy.candidateId),
    submittedBy: userById.get(candidacy.submittedById),
    courseInstance: {
      ...instanceById.get(candidacy.courseInstanceId)!,
      course: courseById.get(instanceById.get(candidacy.courseInstanceId)!.courseId),
    },
  }));

  const gantt = mockDb.instances
    .filter((instance) => ['OPEN', 'IN_PROGRESS', 'COMPLETED'].includes(instance.status))
    .map((instance) => ({
      ...instance,
      course: courseById.get(instance.courseId)!,
      phases: mockDb.phases
        .filter((phase) => phase.courseInstanceId === instance.id)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    }));

  return { registrations, candidacies, gantt };
};

const shouldUseMockData = () =>
  import.meta.env.VITE_USE_MOCK === 'true' ||
  (import.meta.env.PROD &&
    (!import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL.trim().length === 0));

const mockFetchJson = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const method = options?.method ?? 'GET';
  const pathname = mockPathname(url);
  const user = loadUser();
  const body = parseMockBody(options);
  const { registrations, candidacies, gantt } = withRelations();

  if (method === 'GET' && pathname === '/auth/me') {
    if (!user) throw new Error('Not authenticated');
    const row = mockDb.users.find((u) => u.id === user.id);
    return (row ? hydrateAuthUser(row) : user) as T;
  }
  if (method === 'GET' && pathname === '/auth/users') {
    return mockDb.users
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, 'he'))
      .map(hydrateUser) as T;
  }
  if (method === 'GET' && pathname.startsWith('/auth/team/')) {
    const parts = pathname.split('/');
    const teamId = Number(parts[3]);
    return mockDb.users
      .filter((u) => u.teamId === teamId && u.role === Role.TRAINEE)
      .map(hydrateUser) as T;
  }
  if (method === 'POST' && pathname === '/auth/login') {
    const uniqueId = body.uniqueId as string;
    const found = mockDb.users.find((u) => u.uniqueId === uniqueId);
    if (!found) throw new Error('User not found');
    pushMockEvent('LOGIN', 'USER', found.id, null);
    return hydrateAuthUser(found) as T;
  }
  if (method === 'POST' && pathname === '/auth/users') {
    const newUser: User = {
      id: nextMockId(mockDb.users),
      uniqueId: String(body.uniqueId),
      name: String(body.name),
      role: body.role as Role,
      teamId: body.teamId != null ? Number(body.teamId) : undefined,
      branchId: body.branchId != null ? Number(body.branchId) : undefined,
      isActive: true,
    };
    mockDb.users.push(newUser);
    pushMockEvent('CREATE', 'USER', newUser.id, { uniqueId: newUser.uniqueId });
    return hydrateUser(newUser) as T;
  }
  const patchUserMatch = pathname.match(/^\/auth\/users\/(\d+)$/);
  if (method === 'PATCH' && patchUserMatch) {
    const id = Number(patchUserMatch[1]);
    const row = mockDb.users.find((u) => u.id === id);
    if (!row) return {} as T;
    if (body.name !== undefined) row.name = String(body.name);
    if (body.role !== undefined) row.role = body.role as Role;
    if (body.teamId !== undefined)
      row.teamId = body.teamId === null ? undefined : Number(body.teamId);
    if (body.branchId !== undefined)
      row.branchId = body.branchId === null ? undefined : Number(body.branchId);
    if (body.isActive !== undefined) row.isActive = Boolean(body.isActive);
    pushMockEvent('UPDATE', 'USER', id, null);
    return hydrateUser(row) as T;
  }

  if (method === 'GET' && pathname === '/branches') return branchesWithTeams() as T;
  if (method === 'POST' && pathname === '/branches') {
    const b: Branch = { id: nextMockId(mockDb.branches), name: String(body.name) };
    mockDb.branches.push(b);
    pushMockEvent('CREATE', 'BRANCH', b.id, { name: b.name });
    return b as T;
  }
  if (method === 'POST' && pathname === '/branches/teams') {
    const t: Team = {
      id: nextMockId(mockDb.teams),
      name: String(body.name),
      branchId: Number(body.branchId),
    };
    mockDb.teams.push(t);
    pushMockEvent('CREATE', 'TEAM', t.id, { name: t.name, branchId: t.branchId });
    return t as T;
  }

  if (method === 'GET' && pathname === '/courses') {
    const showDraftInstances = user?.role === 'BIS_CDR';
    return mockDb.courses.map((course) => ({
      ...course,
      instances: mockDb.instances.filter(
        (instance) =>
          instance.courseId === course.id && (showDraftInstances || instance.status !== 'DRAFT'),
      ),
    })) as T;
  }
  const getCourseMatch = pathname.match(/^\/courses\/(\d+)$/);
  if (method === 'GET' && getCourseMatch) {
    const id = Number(getCourseMatch[1]);
    const course = mockDb.courses.find((c) => c.id === id);
    if (!course) return {} as T;
    return {
      ...course,
      instances: mockDb.instances.filter((i) => i.courseId === id),
    } as T;
  }
  if (method === 'POST' && pathname === '/courses') {
    const course: Course = {
      id: nextMockId(mockDb.courses),
      name: String(body.name),
      description: String(body.description),
      type: (body.type as Course['type']) ?? 'ADVANCED',
      requirements: body.requirements != null ? String(body.requirements) : null,
      gmushHours: body.gmushHours != null ? Number(body.gmushHours) : null,
      location: body.location != null ? String(body.location) : null,
      isPublished: Boolean(body.isPublished),
    };
    mockDb.courses.push(course);
    pushMockEvent('CREATE', 'COURSE', course.id, { name: course.name });
    return course as T;
  }
  if (method === 'PATCH' && getCourseMatch) {
    const id = Number(getCourseMatch[1]);
    const course = mockDb.courses.find((c) => c.id === id);
    if (!course) return {} as T;
    if (body.name !== undefined) course.name = String(body.name);
    if (body.description !== undefined) course.description = String(body.description);
    if (body.type !== undefined) course.type = body.type as Course['type'];
    if (body.requirements !== undefined)
      course.requirements =
        body.requirements === null || body.requirements === '' ? null : String(body.requirements);
    if (body.gmushHours !== undefined)
      course.gmushHours = body.gmushHours === null ? null : Number(body.gmushHours);
    if (body.location !== undefined)
      course.location =
        body.location === null || body.location === '' ? null : String(body.location);
    if (body.isPublished !== undefined) course.isPublished = Boolean(body.isPublished);
    pushMockEvent('UPDATE', 'COURSE', id, null);
    return course as T;
  }
  const postInstanceMatch = pathname.match(/^\/courses\/(\d+)\/instances$/);
  if (method === 'POST' && postInstanceMatch) {
    const courseId = Number(postInstanceMatch[1]);
    const inst: CourseInstance = {
      id: nextMockId(mockDb.instances),
      courseId,
      name: String(body.name),
      startDate: String(body.startDate),
      endDate: String(body.endDate),
      status: 'OPEN',
    };
    mockDb.instances.push(inst);
    pushMockEvent('CREATE', 'INSTANCE', inst.id, { courseId, name: inst.name });
    return inst as T;
  }

  if (method === 'GET' && pathname === '/gantt') return gantt as T;
  const postPhaseMatch = pathname.match(/^\/gantt\/instances\/(\d+)\/phases$/);
  if (method === 'POST' && postPhaseMatch) {
    const courseInstanceId = Number(postPhaseMatch[1]);
    const phase: CoursePhase = {
      id: nextMockId(mockDb.phases),
      courseInstanceId,
      name: String(body.name),
      phaseType: String(body.phaseType),
      startDate: String(body.startDate),
      endDate: String(body.endDate),
      description: body.description != null ? String(body.description) : null,
      sortOrder: body.sortOrder != null ? Number(body.sortOrder) : 0,
    };
    mockDb.phases.push(phase);
    pushMockEvent('CREATE', 'PHASE', phase.id, { courseInstanceId });
    return phase as T;
  }
  const phaseIdMatch = pathname.match(/^\/gantt\/phases\/(\d+)$/);
  if (method === 'PATCH' && phaseIdMatch) {
    const id = Number(phaseIdMatch[1]);
    const phase = mockDb.phases.find((p) => p.id === id);
    if (!phase) return {} as T;
    if (body.name !== undefined) phase.name = String(body.name);
    if (body.phaseType !== undefined) phase.phaseType = String(body.phaseType);
    if (body.startDate !== undefined) phase.startDate = String(body.startDate);
    if (body.endDate !== undefined) phase.endDate = String(body.endDate);
    pushMockEvent('UPDATE', 'PHASE', id, null);
    return phase as T;
  }
  if (method === 'DELETE' && phaseIdMatch) {
    const id = Number(phaseIdMatch[1]);
    const idx = mockDb.phases.findIndex((p) => p.id === id);
    if (idx !== -1) mockDb.phases.splice(idx, 1);
    pushMockEvent('DELETE', 'PHASE', id, null);
    return undefined as T;
  }

  if (method === 'GET' && pathname === '/registrations/mine')
    return registrations.filter((r) => r.userId === user?.id) as T;
  if (method === 'GET' && pathname === '/registrations/team')
    return registrations.filter(
      (r) => r.user?.teamId === user?.teamId && r.status === 'PENDING_TL',
    ) as T;
  if (method === 'GET' && pathname === '/registrations/branch') {
    const branchId = user?.branchId;
    /** בדמו כוללים גם PENDING_TL כדי שכל כפתורי הסינון יראו נתונים בענף (בפרודקשן לרכז בדרך כלל לא מוצג TL). */
    const branchStatuses: CourseRegistration['status'][] = [
      'PENDING_TL',
      'PENDING_COORD',
      'PENDING_BIS',
      'APPROVED',
      'REJECTED',
    ];
    return registrations.filter(
      (r) => r.user?.branchId === branchId && branchStatuses.includes(r.status),
    ) as T;
  }
  if (method === 'GET' && pathname === '/registrations/all') return registrations as T;
  if (method === 'GET' && pathname.startsWith('/registrations/by-instance/')) {
    const instanceId = Number(pathname.split('/').pop());
    return registrations.filter((r) => r.courseInstanceId === instanceId) as T;
  }
  const regIdAction = pathname.match(
    /^\/registrations\/(\d+)\/(approve-tl|prioritize|approve-final|reject)$/,
  );
  if (method === 'PATCH' && regIdAction) {
    const id = Number(regIdAction[1]);
    const action = regIdAction[2];
    const reg = mockDb.registrations.find((r) => r.id === id);
    if (!reg) return {} as T;
    if (action === 'approve-tl') {
      reg.status = 'PENDING_COORD';
      pushMockEvent('REVIEW', 'REGISTRATION', id, { step: 'approve-tl' });
    } else if (action === 'prioritize') {
      reg.status = 'PENDING_BIS';
      if (body.coordPriority != null) reg.coordPriority = Number(body.coordPriority);
      if (body.coordNotes !== undefined)
        reg.coordNotes = body.coordNotes ? String(body.coordNotes) : null;
      pushMockEvent('REVIEW', 'REGISTRATION', id, { step: 'prioritize' });
    } else if (action === 'approve-final') {
      reg.status = 'APPROVED';
      if (body.bisNotes !== undefined) reg.bisNotes = body.bisNotes ? String(body.bisNotes) : null;
      pushMockEvent('APPROVE', 'REGISTRATION', id, null);
    } else if (action === 'reject') {
      reg.status = 'REJECTED';
      if (body.rejectionReason !== undefined)
        reg.rejectionReason = body.rejectionReason ? String(body.rejectionReason) : null;
      pushMockEvent('REJECT', 'REGISTRATION', id, null);
    }
    const { registrations: regs2 } = withRelations();
    return regs2.find((r) => r.id === id) as T;
  }
  if (method === 'POST' && pathname === '/registrations/advanced') {
    const courseInstanceId = Number(body.courseInstanceId);
    const newReg: CourseRegistration = {
      id: nextMockId(mockDb.registrations),
      courseInstanceId,
      userId: user?.id ?? 0,
      status: 'PENDING_TL',
      formData: (body.formData as Record<string, unknown>) ?? null,
      coordPriority: null,
      coordNotes: null,
      bisNotes: null,
      rejectionReason: null,
    };
    mockDb.registrations.push(newReg);
    pushMockEvent('REGISTER', 'REGISTRATION', newReg.id, { courseInstanceId });
    const { registrations: regs2 } = withRelations();
    return regs2.find((r) => r.id === newReg.id) as T;
  }
  if (method === 'POST' && pathname === '/registrations/manual') {
    const courseInstanceId = Number(body.courseInstanceId);
    const userId = Number(body.userId);
    const status = (body.status as CourseRegistration['status']) ?? 'APPROVED';
    const newReg: CourseRegistration = {
      id: nextMockId(mockDb.registrations),
      courseInstanceId,
      userId,
      status,
      formData: null,
      coordPriority: null,
      coordNotes: null,
      bisNotes: null,
      rejectionReason: null,
    };
    mockDb.registrations.push(newReg);
    pushMockEvent('REGISTER', 'REGISTRATION', newReg.id, {
      manual: true,
      userId,
      courseInstanceId,
    });
    const { registrations: regs2 } = withRelations();
    return regs2.find((r) => r.id === newReg.id) as T;
  }

  if (method === 'POST' && pathname === '/candidacy/submit') {
    const c: CommandCandidacy = {
      id: nextMockId(mockDb.candidacies),
      courseInstanceId: Number(body.courseInstanceId),
      candidateId: Number(body.candidateId),
      submittedById: user?.id ?? 0,
      status: 'PENDING',
      motivation: body.motivation != null ? String(body.motivation) : null,
      commanderNotes: body.commanderNotes != null ? String(body.commanderNotes) : null,
      reviewNotes: null,
      reviewedById: null,
    };
    mockDb.candidacies.push(c);
    pushMockEvent('SUBMIT', 'CANDIDACY', c.id, null);
    const { candidacies: c2 } = withRelations();
    return c2.find((x) => x.id === c.id) as T;
  }
  const candidacyIdAction = pathname.match(/^\/candidacy\/(\d+)\/(coord-review|approve|reject)$/);
  if (method === 'PATCH' && candidacyIdAction) {
    const id = Number(candidacyIdAction[1]);
    const act = candidacyIdAction[2];
    const row = mockDb.candidacies.find((c) => c.id === id);
    if (!row) return {} as T;
    if (act === 'coord-review') row.status = 'COORD_REVIEWED';
    if (act === 'approve') {
      row.status = 'APPROVED';
      row.reviewedById = user?.id ?? 1;
      row.reviewNotes = body.reviewNotes != null ? String(body.reviewNotes) : null;
      pushMockEvent('APPROVE', 'CANDIDACY', id, null);
    }
    if (act === 'reject') {
      row.status = 'REJECTED';
      row.reviewedById = user?.id ?? 1;
      row.reviewNotes = body.reviewNotes != null ? String(body.reviewNotes) : null;
      pushMockEvent('REJECT', 'CANDIDACY', id, null);
    }
    const { candidacies: c2 } = withRelations();
    return c2.find((x) => x.id === id) as T;
  }
  if (method === 'GET' && pathname === '/candidacy/my-submissions')
    return candidacies.filter((c) => c.submittedById === user?.id) as T;
  if (method === 'GET' && pathname === '/candidacy/branch')
    return candidacies.filter((c) => c.candidate?.branchId === user?.branchId) as T;
  if (method === 'GET' && pathname === '/candidacy/all') return candidacies as T;

  if (method === 'GET' && pathname === '/info') return [...mockDb.infoPages] as T;
  if (method === 'GET' && pathname.startsWith('/info/') && pathname !== '/info') {
    const slug = pathname.split('/').pop();
    return (mockDb.infoPages.find((p) => p.slug === slug) ?? mockDb.infoPages[0]) as T;
  }

  if (method === 'GET' && pathname.startsWith('/events')) {
    const params = new URLSearchParams(url.split('?')[1] ?? '');
    let list = [...mockDb.events].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const action = params.get('action');
    if (action) list = list.filter((e) => e.action === action);
    const entityType = params.get('entityType');
    if (entityType) list = list.filter((e) => e.entityType === entityType);
    const uid = params.get('userId');
    if (uid) list = list.filter((e) => e.userId === Number(uid));
    const limit = Number(params.get('limit') ?? '200');
    return list.slice(0, limit) as T;
  }

  return {} as T;
};

const fetchJson = async <T>(url: string, options?: RequestInit): Promise<T> => {
  if (shouldUseMockData()) {
    return mockFetchJson<T>(url, options);
  }

  const user = loadUser();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(user ? { 'x-user-id': String(user.id) } : {}),
    ...((options?.headers as Record<string, string>) ?? {}),
  };

  try {
    const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  } catch (error) {
    if (import.meta.env.PROD) {
      return mockFetchJson<T>(url, options);
    }
    throw error;
  }
};

// ── Types ──

export type Branch = {
  id: number;
  name: string;
  teams?: Team[];
};

export type Team = {
  id: number;
  name: string;
  branchId: number;
};

export type User = AuthUser & { isActive?: boolean };

export type Course = {
  id: number;
  name: string;
  description: string;
  type: 'FOUNDATION' | 'ADVANCED' | 'LEADERSHIP';
  requirements: string | null;
  gmushHours: number | null;
  location: string | null;
  isPublished: boolean;
  instances?: CourseInstance[];
};

export type CourseInstance = {
  id: number;
  courseId: number;
  name: string;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  course?: Course;
  phases?: CoursePhase[];
};

export type CoursePhase = {
  id: number;
  courseInstanceId: number;
  name: string;
  phaseType: string;
  startDate: string;
  endDate: string;
  description: string | null;
  sortOrder: number;
};

export type GanttInstance = CourseInstance & {
  course: Course;
  phases: CoursePhase[];
};

export type CommandCandidacy = {
  id: number;
  courseInstanceId: number;
  candidateId: number;
  submittedById: number;
  status: 'PENDING' | 'COORD_REVIEWED' | 'APPROVED' | 'REJECTED';
  motivation: string | null;
  commanderNotes: string | null;
  reviewNotes: string | null;
  reviewedById: number | null;
  candidate?: User & { team?: Team };
  submittedBy?: User;
  courseInstance?: CourseInstance & { course?: Course };
};

export type CourseRegistration = {
  id: number;
  courseInstanceId: number;
  userId: number;
  status: 'PENDING_TL' | 'PENDING_COORD' | 'PENDING_BIS' | 'APPROVED' | 'REJECTED';
  formData: Record<string, unknown> | null;
  coordPriority: number | null;
  coordNotes: string | null;
  bisNotes: string | null;
  rejectionReason: string | null;
  user?: User & { team?: Team; branch?: Branch };
  courseInstance?: CourseInstance & { course?: Course };
};

export type AttachedFile = {
  id: number;
  registrationId: number | null;
  candidacyId: number | null;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  uploadedById: number;
  uploadedBy?: { name: string };
  expiresAt: string | null;
  createdAt: string;
};

export type RegistrationFile = AttachedFile;

export type InfoPage = {
  id: number;
  slug: string;
  title: string;
  content: string;
  sortOrder: number;
  isPublished: boolean;
};

export type EventLog = {
  id: number;
  userId: number;
  action: string;
  entityType: string;
  entityId: number | null;
  details: Record<string, unknown> | null;
  createdAt: string;
  user?: { id: number; name: string; role: string };
};

// ── API ──

export const api = {
  // Auth
  login: (uniqueId: string) =>
    fetchJson<AuthUser>('/auth/login', { method: 'POST', body: JSON.stringify({ uniqueId }) }),
  getMe: () => fetchJson<AuthUser>('/auth/me'),
  getUsers: () => fetchJson<User[]>('/auth/users'),
  getTeamMembers: (teamId: number) => fetchJson<User[]>(`/auth/team/${teamId}/members`),
  createUser: (data: {
    uniqueId: string;
    name: string;
    role: string;
    teamId?: number;
    branchId?: number;
  }) => fetchJson<User>('/auth/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (
    id: number,
    data: {
      name?: string;
      role?: string;
      teamId?: number | null;
      branchId?: number | null;
      isActive?: boolean;
    },
  ) => fetchJson<User>(`/auth/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Branches
  getBranches: () => fetchJson<Branch[]>('/branches'),
  createBranch: (name: string) =>
    fetchJson<Branch>('/branches', { method: 'POST', body: JSON.stringify({ name }) }),
  createTeam: (name: string, branchId: number) =>
    fetchJson<Team>('/branches/teams', {
      method: 'POST',
      body: JSON.stringify({ name, branchId }),
    }),

  // Courses
  getCourses: () => fetchJson<Course[]>('/courses'),
  getCourse: (id: number) => fetchJson<Course>(`/courses/${id}`),
  createCourse: (data: {
    name: string;
    description: string;
    type: string;
    requirements?: string;
    gmushHours?: number;
    location?: string;
    isPublished?: boolean;
  }) => fetchJson<Course>('/courses', { method: 'POST', body: JSON.stringify(data) }),
  updateCourse: (id: number, data: Partial<Course>) =>
    fetchJson<Course>(`/courses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  createInstance: (courseId: number, data: { name: string; startDate: string; endDate: string }) =>
    fetchJson<CourseInstance>(`/courses/${courseId}/instances`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Gantt
  getGantt: () => fetchJson<GanttInstance[]>('/gantt'),
  createPhase: (
    instanceId: number,
    data: {
      name: string;
      phaseType: string;
      startDate: string;
      endDate: string;
      sortOrder?: number;
    },
  ) =>
    fetchJson<CoursePhase>(`/gantt/instances/${instanceId}/phases`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePhase: (
    phaseId: number,
    data: Partial<{ name: string; phaseType: string; startDate: string; endDate: string }>,
  ) =>
    fetchJson<CoursePhase>(`/gantt/phases/${phaseId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deletePhase: (phaseId: number) =>
    fetchJson<void>(`/gantt/phases/${phaseId}`, { method: 'DELETE' }),

  // Candidacy
  submitCandidacy: (data: {
    courseInstanceId: number;
    candidateId: number;
    motivation?: string;
    commanderNotes?: string;
  }) =>
    fetchJson<CommandCandidacy>('/candidacy/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMyCandidacySubmissions: () => fetchJson<CommandCandidacy[]>('/candidacy/my-submissions'),
  getBranchCandidacies: () => fetchJson<CommandCandidacy[]>('/candidacy/branch'),
  getAllCandidacies: () => fetchJson<CommandCandidacy[]>('/candidacy/all'),
  coordReviewCandidacy: (id: number) =>
    fetchJson<CommandCandidacy>(`/candidacy/${id}/coord-review`, { method: 'PATCH' }),
  approveCandidacy: (id: number, reviewNotes?: string) =>
    fetchJson<CommandCandidacy>(`/candidacy/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ reviewNotes }),
    }),
  rejectCandidacy: (id: number, reviewNotes?: string) =>
    fetchJson<CommandCandidacy>(`/candidacy/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reviewNotes }),
    }),

  // Registrations
  getInstanceRegistrations: (instanceId: number) =>
    fetchJson<CourseRegistration[]>(`/registrations/by-instance/${instanceId}`),
  registerManual: (data: { courseInstanceId: number; userId: number; status?: string }) =>
    fetchJson<CourseRegistration>('/registrations/manual', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  registerAdvanced: (data: { courseInstanceId: number; formData?: Record<string, unknown> }) =>
    fetchJson<CourseRegistration>('/registrations/advanced', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMyRegistrations: () => fetchJson<CourseRegistration[]>('/registrations/mine'),
  getTeamRegistrations: () => fetchJson<CourseRegistration[]>('/registrations/team'),
  approveRegistrationTl: (id: number, tlNotes?: string) =>
    fetchJson<CourseRegistration>(`/registrations/${id}/approve-tl`, {
      method: 'PATCH',
      body: JSON.stringify({ tlNotes }),
    }),
  getBranchRegistrations: () => fetchJson<CourseRegistration[]>('/registrations/branch'),
  getAllRegistrations: () => fetchJson<CourseRegistration[]>('/registrations/all'),
  prioritizeRegistration: (id: number, data: { coordNotes?: string; coordPriority?: number }) =>
    fetchJson<CourseRegistration>(`/registrations/${id}/prioritize`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  approveRegistrationFinal: (id: number, bisNotes?: string) =>
    fetchJson<CourseRegistration>(`/registrations/${id}/approve-final`, {
      method: 'PATCH',
      body: JSON.stringify({ bisNotes }),
    }),
  rejectRegistration: (id: number, rejectionReason?: string) =>
    fetchJson<CourseRegistration>(`/registrations/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ rejectionReason }),
    }),

  // Files
  getFiles: (entityType: 'registration' | 'candidacy', entityId: number) =>
    fetchJson<AttachedFile[]>(`/files/list/${entityType}/${entityId}`),
  getRegistrationFiles: (registrationId: number) =>
    fetchJson<AttachedFile[]>(`/files/list/registration/${registrationId}`),
  uploadFile: async (
    entityType: 'registration' | 'candidacy',
    entityId: number,
    file: File,
  ): Promise<AttachedFile> => {
    const formData = new FormData();
    formData.append('file', file);
    const user = JSON.parse(localStorage.getItem('bisli_user') || '{}');
    const res = await fetch(`${API_BASE}/files/upload/${entityType}/${entityId}`, {
      method: 'POST',
      headers: { 'x-user-id': String(user.id || '') },
      body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  getFileDownloadUrl: (fileId: number) => `${API_BASE}/files/download/${fileId}`,
  getFileViewUrl: (fileId: number) => `${API_BASE}/files/view/${fileId}`,
  deleteFile: (fileId: number) => fetchJson<void>(`/files/${fileId}`, { method: 'DELETE' }),

  // Info
  getInfoPages: () => fetchJson<InfoPage[]>('/info'),
  getInfoPage: (slug: string) => fetchJson<InfoPage>(`/info/${slug}`),

  // Events / Audit Log
  getEvents: (params?: {
    action?: string;
    entityType?: string;
    userId?: string;
    limit?: string;
  }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetchJson<EventLog[]>(`/events${query ? `?${query}` : ''}`);
  },

  // Search
  searchAll: () =>
    Promise.all([api.getUsers(), api.getCourses(), api.getGantt()]).then(
      ([users, courses, gantt]) => ({
        users,
        courses,
        gantt,
      }),
    ),
};
