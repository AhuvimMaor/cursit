import type { PhaseType } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

import { backfillEventsIfMissing } from '../backfill-events.js';

const prisma = new PrismaClient();

const main = async () => {
  console.log('Seeding dev data...');

  const day = (deltaDays: number) => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + deltaDays);
    return d.toISOString().slice(0, 10);
  };

  // ── Branches ──
  const branches = await Promise.all([
    prisma.branch.create({ data: { name: 'ענף טכנולוגיה' } }),
    prisma.branch.create({ data: { name: 'ענף לוגיסטיקה' } }),
    prisma.branch.create({ data: { name: 'ענף תקשוב' } }),
  ]);
  console.log(`Created ${branches.length} branches`);

  // ── Teams ──
  const teams = await Promise.all([
    prisma.team.create({ data: { name: 'צוות אלפא', branchId: branches[0].id } }),
    prisma.team.create({ data: { name: 'צוות בראבו', branchId: branches[0].id } }),
    prisma.team.create({ data: { name: 'צוות גאמא', branchId: branches[1].id } }),
    prisma.team.create({ data: { name: 'צוות דלתא', branchId: branches[1].id } }),
    prisma.team.create({ data: { name: 'צוות הדס', branchId: branches[2].id } }),
  ]);
  console.log(`Created ${teams.length} teams`);

  // ── Users ──
  const admin = await prisma.user.create({
    data: { uniqueId: '1000000', name: 'דוד כהן', role: 'BIS_CDR' },
  });

  const coords = await Promise.all([
    prisma.user.create({
      data: {
        uniqueId: '2000001',
        name: 'שרה לוי',
        role: 'BRANCH_COORD',
        branchId: branches[0].id,
      },
    }),
    prisma.user.create({
      data: {
        uniqueId: '2000002',
        name: 'יוסי אברהם',
        role: 'BRANCH_COORD',
        branchId: branches[1].id,
      },
    }),
    prisma.user.create({
      data: {
        uniqueId: '2000003',
        name: 'מיכל דוד',
        role: 'BRANCH_COORD',
        branchId: branches[2].id,
      },
    }),
  ]);

  const teamLeaders = await Promise.all([
    prisma.user.create({
      data: {
        uniqueId: '3000001',
        name: 'נועה מזרחי',
        role: 'TEAM_LEADER',
        teamId: teams[0].id,
        branchId: branches[0].id,
      },
    }),
    prisma.user.create({
      data: {
        uniqueId: '3000002',
        name: 'אורי גולן',
        role: 'TEAM_LEADER',
        teamId: teams[1].id,
        branchId: branches[0].id,
      },
    }),
    prisma.user.create({
      data: {
        uniqueId: '3000003',
        name: 'תמר פרץ',
        role: 'TEAM_LEADER',
        teamId: teams[2].id,
        branchId: branches[1].id,
      },
    }),
    prisma.user.create({
      data: {
        uniqueId: '3000004',
        name: 'דניאל רוזנברג',
        role: 'TEAM_LEADER',
        teamId: teams[3].id,
        branchId: branches[1].id,
      },
    }),
    prisma.user.create({
      data: {
        uniqueId: '3000005',
        name: 'שירה כהן',
        role: 'TEAM_LEADER',
        teamId: teams[4].id,
        branchId: branches[2].id,
      },
    }),
  ]);

  const trainees = await Promise.all([
    prisma.user.create({
      data: {
        uniqueId: '4000001',
        name: 'יונתן לוי',
        role: 'TRAINEE',
        teamId: teams[0].id,
        branchId: branches[0].id,
      },
    }),
    prisma.user.create({
      data: {
        uniqueId: '4000002',
        name: 'מאיה אברהם',
        role: 'TRAINEE',
        teamId: teams[0].id,
        branchId: branches[0].id,
      },
    }),
    prisma.user.create({
      data: {
        uniqueId: '4000003',
        name: 'עידו כהן',
        role: 'TRAINEE',
        teamId: teams[0].id,
        branchId: branches[0].id,
      },
    }),
    prisma.user.create({
      data: {
        uniqueId: '4000004',
        name: 'רונה דוד',
        role: 'TRAINEE',
        teamId: teams[1].id,
        branchId: branches[0].id,
      },
    }),
    prisma.user.create({
      data: {
        uniqueId: '4000005',
        name: 'אלון פרידמן',
        role: 'TRAINEE',
        teamId: teams[1].id,
        branchId: branches[0].id,
      },
    }),
    prisma.user.create({
      data: {
        uniqueId: '4000006',
        name: 'שקד מזרחי',
        role: 'TRAINEE',
        teamId: teams[2].id,
        branchId: branches[1].id,
      },
    }),
    prisma.user.create({
      data: {
        uniqueId: '4000007',
        name: 'ליאור גולן',
        role: 'TRAINEE',
        teamId: teams[2].id,
        branchId: branches[1].id,
      },
    }),
    prisma.user.create({
      data: {
        uniqueId: '4000008',
        name: 'נגה רוזנברג',
        role: 'TRAINEE',
        teamId: teams[3].id,
        branchId: branches[1].id,
      },
    }),
    prisma.user.create({
      data: {
        uniqueId: '4000009',
        name: 'תומר שמעוני',
        role: 'TRAINEE',
        teamId: teams[4].id,
        branchId: branches[2].id,
      },
    }),
    prisma.user.create({
      data: {
        uniqueId: '4000010',
        name: 'הילה ברקוביץ',
        role: 'TRAINEE',
        teamId: teams[4].id,
        branchId: branches[2].id,
      },
    }),
  ]);

  console.log(
    `Created users: 1 admin, ${coords.length} coords, ${teamLeaders.length} leaders, ${trainees.length} trainees`,
  );

  // ── Courses (תואם ל־frontend mock — 5 קורסים) ──
  const cFoundation = await prisma.course.create({
    data: {
      name: 'קורס הכשרת מנהלים',
      description: 'קורס הכשרת מנהלים בכירים',
      type: 'FOUNDATION',
      location: 'מרכז הדרכה ראשי',
      isPublished: true,
    },
  });
  const cCyber = await prisma.course.create({
    data: {
      name: 'קורס סייבר מתקדם',
      description: 'הכשרה מתקדמת בעולם הסייבר',
      type: 'ADVANCED',
      requirements: 'סיום קורס בסיסי',
      gmushHours: 40,
      location: 'מרכז סייבר',
      isPublished: true,
    },
  });
  const cGis = await prisma.course.create({
    data: {
      name: 'קורס GIS מתקדם',
      description: 'הכשרה במערכות מידע גיאוגרפי ואנליזה מרחבית',
      type: 'ADVANCED',
      requirements: 'היכרות בסיסית עם GIS',
      gmushHours: 32,
      location: 'חדר הדרכה 3',
      isPublished: true,
    },
  });
  const cPython = await prisma.course.create({
    data: {
      name: 'קורס Python לאנליסטים',
      description: 'תכנות Python לצרכי אנליזה ועיבוד נתונים',
      type: 'ADVANCED',
      requirements: 'אין דרישות מקדימות',
      gmushHours: 24,
      location: 'מעבדת מחשבים',
      isPublished: true,
    },
  });
  const cLeadership = await prisma.course.create({
    data: {
      name: 'קורס ראשי צוותות',
      description: 'הכשרה לתפקיד ראש צוות',
      type: 'LEADERSHIP',
      location: 'מרכז הדרכה ראשי',
      isPublished: true,
    },
  });

  const courses = [cFoundation, cCyber, cGis, cPython, cLeadership];

  type InstSpec = {
    courseIdx: number;
    name: string;
    start: string;
    end: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'DRAFT' | 'COMPLETED';
  };

  /** סדר זהה ל־mock ב־api.ts (מחזורים 1–13) */
  const instanceSpecs: InstSpec[] = [
    { courseIdx: 0, name: 'מחזור 42', start: '2026-03-01', end: '2026-07-07', status: 'OPEN' },
    {
      courseIdx: 1,
      name: 'מחזור קיץ 2026',
      start: '2026-06-01',
      end: '2026-07-15',
      status: 'OPEN',
    },
    { courseIdx: 2, name: 'מחזור 3', start: '2026-05-15', end: '2026-06-20', status: 'OPEN' },
    { courseIdx: 3, name: 'מחזור 5', start: '2026-07-01', end: '2026-07-25', status: 'OPEN' },
    {
      courseIdx: 4,
      name: 'מחזור 8',
      start: '2026-04-01',
      end: '2026-05-18',
      status: 'IN_PROGRESS',
    },
    { courseIdx: 3, name: 'מחזור אביב א׳', start: day(16), end: day(52), status: 'OPEN' },
    {
      courseIdx: 1,
      name: 'מחזור אביב סייבר',
      start: '2026-04-05',
      end: '2026-06-15',
      status: 'OPEN',
    },
    {
      courseIdx: 4,
      name: 'מחזור ט׳',
      start: '2026-04-18',
      end: '2026-06-01',
      status: 'IN_PROGRESS',
    },
    { courseIdx: 0, name: 'מחזור 43', start: '2026-05-05', end: '2026-09-01', status: 'OPEN' },
    { courseIdx: 3, name: 'מחזור 6', start: '2026-05-25', end: '2026-07-10', status: 'OPEN' },
    { courseIdx: 2, name: 'מחזור 3ב', start: '2026-06-08', end: '2026-07-22', status: 'OPEN' },
    { courseIdx: 4, name: 'מחזור י׳', start: '2026-06-20', end: '2026-08-10', status: 'OPEN' },
    { courseIdx: 1, name: 'מחזור קיץ ב׳', start: '2026-07-08', end: '2026-08-20', status: 'OPEN' },
    {
      courseIdx: 1,
      name: 'מחזור — רישום פתוח עכשיו (א׳)',
      start: day(45),
      end: day(120),
      status: 'OPEN',
    },
    {
      courseIdx: 2,
      name: 'מחזור — רישום פתוח עכשיו (ב׳)',
      start: day(50),
      end: day(110),
      status: 'OPEN',
    },
    {
      courseIdx: 3,
      name: 'מחזור — רישום פתוח עכשיו (ג׳)',
      start: day(40),
      end: day(95),
      status: 'OPEN',
    },
    {
      courseIdx: 1,
      name: 'מחזור נעול (הסתיים)',
      start: day(-200),
      end: day(-100),
      status: 'COMPLETED',
    },
    {
      courseIdx: 2,
      name: 'מחזור ישן (הסתיים)',
      start: day(-350),
      end: day(-250),
      status: 'COMPLETED',
    },
    {
      courseIdx: 1,
      name: 'מחזור חורף — ארכיון (הסתיים השנה)',
      start: day(-90),
      end: day(-38),
      status: 'COMPLETED',
    },
    {
      courseIdx: 3,
      name: 'מחזור מוקדם — ארכיון (הסתיים השנה)',
      start: day(-70),
      end: day(-28),
      status: 'COMPLETED',
    },
  ];

  const instances = await Promise.all(
    instanceSpecs.map((spec) =>
      prisma.courseInstance.create({
        data: {
          courseId: courses[spec.courseIdx].id,
          name: spec.name,
          startDate: new Date(spec.start),
          endDate: new Date(spec.end),
          status: spec.status,
        },
      }),
    ),
  );

  const I = (idx: number) => instances[idx].id;

  type PhaseRow = {
    instIdx: number;
    name: string;
    phaseType: PhaseType;
    start: string;
    end: string;
    sortOrder: number;
  };

  const phaseRows: PhaseRow[] = [
    {
      instIdx: 0,
      name: 'הגשת מועמדות',
      phaseType: 'CANDIDACY_SUBMISSION',
      start: '2026-03-01',
      end: '2026-03-15',
      sortOrder: 1,
    },
    {
      instIdx: 0,
      name: 'לימודי המחזור (בקורס)',
      phaseType: 'COURSE',
      start: '2026-05-01',
      end: '2026-06-30',
      sortOrder: 2,
    },
    {
      instIdx: 1,
      name: 'פתיחת רישום למחזור',
      phaseType: 'CANDIDACY_SUBMISSION',
      start: '2026-05-20',
      end: '2026-05-28',
      sortOrder: 1,
    },
    {
      instIdx: 1,
      name: 'מיונים ואישורים',
      phaseType: 'TRYOUTS',
      start: '2026-05-29',
      end: '2026-06-05',
      sortOrder: 2,
    },
    {
      instIdx: 1,
      name: 'לימודי המחזור (בקורס)',
      phaseType: 'COURSE',
      start: '2026-06-06',
      end: '2026-07-15',
      sortOrder: 3,
    },
    {
      instIdx: 2,
      name: 'פתיחת רישום למחזור',
      phaseType: 'CANDIDACY_SUBMISSION',
      start: '2026-04-20',
      end: '2026-05-05',
      sortOrder: 1,
    },
    {
      instIdx: 2,
      name: 'לימודי המחזור (בקורס)',
      phaseType: 'COURSE',
      start: '2026-05-15',
      end: '2026-06-20',
      sortOrder: 2,
    },
    {
      instIdx: 3,
      name: 'לימודי המחזור (בקורס)',
      phaseType: 'COURSE',
      start: '2026-07-01',
      end: '2026-07-25',
      sortOrder: 1,
    },
    {
      instIdx: 5,
      name: 'פתיחת רישום למחזור',
      phaseType: 'CANDIDACY_SUBMISSION',
      start: day(-14),
      end: day(14),
      sortOrder: 1,
    },
    {
      instIdx: 5,
      name: 'לימודי המחזור (בקורס)',
      phaseType: 'COURSE',
      start: day(16),
      end: day(52),
      sortOrder: 2,
    },
    {
      instIdx: 6,
      name: 'פתיחת רישום למחזור',
      phaseType: 'CANDIDACY_SUBMISSION',
      start: '2026-04-05',
      end: '2026-04-14',
      sortOrder: 1,
    },
    {
      instIdx: 6,
      name: 'מיונים',
      phaseType: 'TRYOUTS',
      start: '2026-04-16',
      end: '2026-04-28',
      sortOrder: 2,
    },
    {
      instIdx: 7,
      name: 'הכנת צוות מוביל',
      phaseType: 'STAFF_PREP',
      start: '2026-04-18',
      end: '2026-05-01',
      sortOrder: 1,
    },
    {
      instIdx: 7,
      name: 'לימודי המחזור (בקורס)',
      phaseType: 'COURSE',
      start: '2026-05-03',
      end: '2026-06-01',
      sortOrder: 2,
    },
    {
      instIdx: 8,
      name: 'הגשת מועמדות',
      phaseType: 'CANDIDACY_SUBMISSION',
      start: '2026-05-05',
      end: '2026-05-18',
      sortOrder: 1,
    },
    {
      instIdx: 8,
      name: 'לימודי המחזור (בקורס)',
      phaseType: 'COURSE',
      start: '2026-06-01',
      end: '2026-08-30',
      sortOrder: 2,
    },
    {
      instIdx: 9,
      name: 'פתיחת רישום',
      phaseType: 'CANDIDACY_SUBMISSION',
      start: '2026-05-25',
      end: '2026-06-02',
      sortOrder: 1,
    },
    {
      instIdx: 9,
      name: 'לימודי המחזור (בקורס)',
      phaseType: 'COURSE',
      start: '2026-06-05',
      end: '2026-07-08',
      sortOrder: 2,
    },
    {
      instIdx: 10,
      name: 'פתיחת רישום למחזור',
      phaseType: 'CANDIDACY_SUBMISSION',
      start: '2026-06-08',
      end: '2026-06-15',
      sortOrder: 1,
    },
    {
      instIdx: 10,
      name: 'לימודי המחזור (בקורס)',
      phaseType: 'COURSE',
      start: '2026-06-18',
      end: '2026-07-20',
      sortOrder: 2,
    },
    {
      instIdx: 11,
      name: 'הגשת מועמדות',
      phaseType: 'CANDIDACY_SUBMISSION',
      start: '2026-06-20',
      end: '2026-06-28',
      sortOrder: 1,
    },
    {
      instIdx: 11,
      name: 'הכשרה',
      phaseType: 'COMMANDER_COURSE',
      start: '2026-07-01',
      end: '2026-08-05',
      sortOrder: 2,
    },
    {
      instIdx: 12,
      name: 'פתיחת רישום למחזור',
      phaseType: 'CANDIDACY_SUBMISSION',
      start: '2026-07-08',
      end: '2026-07-15',
      sortOrder: 1,
    },
    {
      instIdx: 12,
      name: 'לימודי המחזור (בקורס)',
      phaseType: 'COURSE',
      start: '2026-07-18',
      end: '2026-08-18',
      sortOrder: 2,
    },
    {
      instIdx: 13,
      name: 'פתיחת רישום למחזור',
      phaseType: 'CANDIDACY_SUBMISSION',
      start: day(-5),
      end: day(14),
      sortOrder: 1,
    },
    {
      instIdx: 13,
      name: 'מיונים',
      phaseType: 'TRYOUTS',
      start: day(16),
      end: day(28),
      sortOrder: 2,
    },
    {
      instIdx: 13,
      name: 'לימודי המחזור (בקורס)',
      phaseType: 'COURSE',
      start: day(45),
      end: day(115),
      sortOrder: 3,
    },
    {
      instIdx: 14,
      name: 'פתיחת רישום למחזור',
      phaseType: 'CANDIDACY_SUBMISSION',
      start: day(0),
      end: day(21),
      sortOrder: 1,
    },
    {
      instIdx: 14,
      name: 'מיונים',
      phaseType: 'TRYOUTS',
      start: day(23),
      end: day(35),
      sortOrder: 2,
    },
    {
      instIdx: 14,
      name: 'לימודי המחזור (בקורס)',
      phaseType: 'COURSE',
      start: day(48),
      end: day(108),
      sortOrder: 3,
    },
    {
      instIdx: 15,
      name: 'פתיחת רישום למחזור',
      phaseType: 'CANDIDACY_SUBMISSION',
      start: day(-3),
      end: day(12),
      sortOrder: 1,
    },
    {
      instIdx: 15,
      name: 'לימודי המחזור (בקורס)',
      phaseType: 'COURSE',
      start: day(18),
      end: day(90),
      sortOrder: 2,
    },
    {
      instIdx: 16,
      name: 'פתיחת רישום (היסטוריה)',
      phaseType: 'CANDIDACY_SUBMISSION',
      start: day(-190),
      end: day(-175),
      sortOrder: 1,
    },
    {
      instIdx: 16,
      name: 'לימודי המחזור (בקורס)',
      phaseType: 'COURSE',
      start: day(-172),
      end: day(-102),
      sortOrder: 2,
    },
    {
      instIdx: 17,
      name: 'פתיחת רישום (היסטוריה)',
      phaseType: 'CANDIDACY_SUBMISSION',
      start: day(-340),
      end: day(-310),
      sortOrder: 1,
    },
    {
      instIdx: 17,
      name: 'לימודי המחזור (בקורס)',
      phaseType: 'COURSE',
      start: day(-305),
      end: day(-252),
      sortOrder: 2,
    },
    {
      instIdx: 18,
      name: 'פתיחת רישום (היסטוריה)',
      phaseType: 'CANDIDACY_SUBMISSION',
      start: day(-115),
      end: day(-95),
      sortOrder: 1,
    },
    {
      instIdx: 18,
      name: 'לימודי המחזור (בקורס)',
      phaseType: 'COURSE',
      start: day(-90),
      end: day(-38),
      sortOrder: 2,
    },
    {
      instIdx: 19,
      name: 'פתיחת רישום (היסטוריה)',
      phaseType: 'CANDIDACY_SUBMISSION',
      start: day(-100),
      end: day(-78),
      sortOrder: 1,
    },
    {
      instIdx: 19,
      name: 'לימודי המחזור (בקורס)',
      phaseType: 'COURSE',
      start: day(-70),
      end: day(-28),
      sortOrder: 2,
    },
  ];

  await prisma.coursePhase.createMany({
    data: phaseRows.map((p) => ({
      courseInstanceId: I(p.instIdx),
      name: p.name,
      phaseType: p.phaseType,
      startDate: new Date(p.start),
      endDate: new Date(p.end),
      sortOrder: p.sortOrder,
    })),
  });

  const mgrInstance = instances[0];

  console.log(
    `Created ${courses.length} courses, ${instances.length} instances, ${phaseRows.length} phases`,
  );

  // ── Candidacies ──
  await prisma.commandCandidacy.createMany({
    data: [
      {
        courseInstanceId: mgrInstance.id,
        candidateId: trainees[0].id,
        submittedById: teamLeaders[0].id,
        status: 'PENDING',
        motivation: 'בעל יכולות מנהיגות טבעיות. מוביל את הצוות בצורה יוצאת מן הכלל.',
        commanderNotes: 'ממליץ בחום. מתאים לתפקיד ניהולי.',
      },
      {
        courseInstanceId: mgrInstance.id,
        candidateId: trainees[1].id,
        submittedById: teamLeaders[0].id,
        status: 'COORD_REVIEWED',
        motivation: 'בעלת מוטיבציה גבוהה ויכולת למידה מהירה.',
        commanderNotes: 'מומלצת. שיפור משמעותי בחצי שנה אחרונה.',
      },
      {
        courseInstanceId: mgrInstance.id,
        candidateId: trainees[5].id,
        submittedById: teamLeaders[2].id,
        status: 'APPROVED',
        motivation: 'מוביל בצוות. ביצועים מצוינים.',
        commanderNotes: 'מתאים מאוד.',
        reviewedById: admin.id,
        reviewNotes: 'מאושר. ביצועים מצוינים.',
      },
    ],
  });

  console.log('Created 3 sample candidacies');

  // ── Registrations (מחזורים מתקדמים + דוגמאות על מחזורים נוספים — כולם רואים אותה קטלוג) ──
  await prisma.courseRegistration.createMany({
    data: [
      { courseInstanceId: I(1), userId: trainees[0].id, status: 'PENDING_TL' },
      {
        courseInstanceId: I(1),
        userId: trainees[3].id,
        status: 'PENDING_BIS',
        coordApprovedById: coords[0].id,
        coordApprovedAt: new Date(),
        coordPriority: 1,
        coordNotes: 'עדיפות גבוהה. מתאים.',
      },
      {
        courseInstanceId: I(2),
        userId: trainees[5].id,
        status: 'APPROVED',
        coordApprovedById: coords[1].id,
        coordApprovedAt: new Date(),
        coordPriority: 1,
        bisApprovedById: admin.id,
        bisApprovedAt: new Date(),
        bisNotes: 'מאושר.',
      },
      {
        courseInstanceId: I(3),
        userId: trainees[8].id,
        status: 'REJECTED',
        rejectionReason: 'אין מקום במחזור הנוכחי. נא לנסות שוב במחזור הבא.',
      },
      { courseInstanceId: I(2), userId: trainees[2].id, status: 'PENDING_TL' },
      { courseInstanceId: I(5), userId: trainees[1].id, status: 'PENDING_COORD' },
      {
        courseInstanceId: I(6),
        userId: trainees[4].id,
        status: 'PENDING_BIS',
        coordApprovedById: coords[0].id,
        coordApprovedAt: new Date(),
        coordPriority: 2,
        coordNotes: 'מומלץ — דמו',
      },
      { courseInstanceId: I(7), userId: trainees[0].id, status: 'PENDING_TL' },
      { courseInstanceId: I(9), userId: trainees[3].id, status: 'PENDING_COORD' },
      { courseInstanceId: I(10), userId: trainees[1].id, status: 'PENDING_TL' },
      { courseInstanceId: I(12), userId: trainees[2].id, status: 'APPROVED' },
    ],
  });

  console.log('Created sample registrations across instances');

  // ── Info Pages ──
  await prisma.infoPage.createMany({
    data: [
      {
        slug: 'tryouts-info',
        title: 'מידע על המיונים',
        content: `# מיונים — מה צפוי?\n\n## השלבים\n1. **הגשת מועמדות** — ראש הצוות מגיש מועמדות עבור משתתפים מתאימים\n2. **סינון ראשוני** — הרכז הענפי עובר ומתעדף\n3. **אישור** — מנהל המערכת מאשר סופית\n4. **מיונים** — שלב המיונים עצמו (3-5 ימים)\n\n## איך להתכונן?\n- כושר גופני\n- ידע מקצועי — חזרה על חומר הקורס הבסיסי\n- מנהיגות — תרגול הובלת צוות`,
        sortOrder: 1,
        isPublished: true,
      },
      {
        slug: 'advanced-courses-info',
        title: 'מידע על קורסים מתקדמים',
        content: `# קורסים מתקדמים\n\n## תהליך הרישום\n1. בחר קורס מהקטלוג\n2. מלא את הטפסים הנדרשים\n3. הבקשה תעבור לאישור הרכז הענפי\n4. לאחר אישור ענפי — אישור סופי\n\n## שעות גמו"ש\nכל קורס מזכה בשעות גמו"ש בהתאם להיקפו.`,
        sortOrder: 2,
        isPublished: true,
      },
    ],
  });

  console.log('Created 2 info pages');

  await backfillEventsIfMissing(prisma);
  console.log('Backfilled Event rows for candidacies/registrations');

  console.log('Seed complete!');
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
