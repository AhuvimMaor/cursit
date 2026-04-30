import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const main = async () => {
  console.log('Seeding dev data...');

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

  // ── Courses ──
  const foundationCourses = await Promise.all([
    prisma.course.create({
      data: {
        name: 'קורס הכשרת מנהלים',
        description: 'קורס הכשרת מנהלים בכירים. כולל מיונים, הכשרה, והקורס עצמו.',
        type: 'FOUNDATION',
        location: 'מרכז הדרכה ראשי',
        isPublished: true,
      },
    }),
    prisma.course.create({
      data: {
        name: 'קורס הכשרה בסיסי',
        description: 'קורס הכשרה בסיסי למשתתפים חדשים. כולל מיונים ושלבי הכנה.',
        type: 'FOUNDATION',
        location: 'מרכז הדרכה ראשי',
        isPublished: true,
      },
    }),
  ]);

  const advancedCourses = await Promise.all([
    prisma.course.create({
      data: {
        name: 'קורס סייבר מתקדם',
        description: 'הכשרה מתקדמת בעולם הסייבר. כולל תרגול מעשי והתמודדות עם תרחישים אמיתיים.',
        type: 'ADVANCED',
        requirements: 'סיום קורס סייבר בסיסי, ניסיון של 6 חודשים לפחות',
        gmushHours: 40,
        location: 'מרכז סייבר',
        isPublished: true,
      },
    }),
    prisma.course.create({
      data: {
        name: 'קורס GIS מתקדם',
        description: 'הכשרה במערכות מידע גיאוגרפי. עבודה עם כלים מתקדמים ואנליזה מרחבית.',
        type: 'ADVANCED',
        requirements: 'היכרות בסיסית עם מערכות GIS',
        gmushHours: 32,
        location: 'חדר הדרכה 3',
        isPublished: true,
      },
    }),
    prisma.course.create({
      data: {
        name: 'קורס Python לאנליסטים',
        description: 'תכנות Python לצרכי אנליזה ועיבוד נתונים. כולל Pandas, NumPy ותרגול מעשי.',
        type: 'ADVANCED',
        requirements: 'אין דרישות מקדימות',
        gmushHours: 24,
        location: 'מעבדת מחשבים',
        isPublished: true,
      },
    }),
    prisma.course.create({
      data: {
        name: 'קורס ניהול פרויקטים',
        description: 'מתודולוגיות ניהול פרויקטים, Agile ו-Scrum.',
        type: 'ADVANCED',
        gmushHours: 16,
        isPublished: true,
      },
    }),
  ]);

  const leadershipCourses = await Promise.all([
    prisma.course.create({
      data: {
        name: 'קורס ראשי צוותות',
        description: 'קורס הכשרה לתפקיד ראש צוות. מנהיגות, ניהול אנשים, ותכנון עבודה.',
        type: 'LEADERSHIP',
        location: 'מרכז הדרכה ראשי',
        isPublished: true,
      },
    }),
    prisma.course.create({
      data: {
        name: 'קורס מנהלי ביניים',
        description: 'הכשרה למנהלי ביניים. אסטרטגיה, קבלת החלטות, וניהול צוותות מרובים.',
        type: 'LEADERSHIP',
        location: 'מרכז הדרכה ראשי',
        isPublished: true,
      },
    }),
  ]);

  console.log(
    `Created ${foundationCourses.length} foundation + ${advancedCourses.length} advanced + ${leadershipCourses.length} leadership courses`,
  );

  // ── Course Instances ──
  const mgrInstance = await prisma.courseInstance.create({
    data: {
      courseId: foundationCourses[0].id,
      name: 'מחזור 42',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-07-07'),
      status: 'OPEN',
    },
  });

  const tlInstance = await prisma.courseInstance.create({
    data: {
      courseId: foundationCourses[1].id,
      name: 'מחזור 8',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-05-18'),
      status: 'OPEN',
    },
  });

  const cyberInstance = await prisma.courseInstance.create({
    data: {
      courseId: advancedCourses[0].id,
      name: 'מחזור קיץ 2026',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-07-15'),
      status: 'OPEN',
    },
  });

  const gisInstance = await prisma.courseInstance.create({
    data: {
      courseId: advancedCourses[1].id,
      name: 'מחזור 3',
      startDate: new Date('2026-05-15'),
      endDate: new Date('2026-06-20'),
      status: 'OPEN',
    },
  });

  const pythonInstance = await prisma.courseInstance.create({
    data: {
      courseId: advancedCourses[2].id,
      name: 'מחזור 5',
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-07-25'),
      status: 'OPEN',
    },
  });

  console.log('Created 5 course instances');

  // ── Gantt Phases ──
  await prisma.coursePhase.createMany({
    data: [
      {
        courseInstanceId: mgrInstance.id,
        name: 'הגשת מועמדות',
        phaseType: 'CANDIDACY_SUBMISSION',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-15'),
        sortOrder: 1,
      },
      {
        courseInstanceId: mgrInstance.id,
        name: 'מיונים',
        phaseType: 'TRYOUTS',
        startDate: new Date('2026-03-20'),
        endDate: new Date('2026-03-25'),
        sortOrder: 2,
      },
      {
        courseInstanceId: mgrInstance.id,
        name: 'הכשרה',
        phaseType: 'COMMANDER_COURSE',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2026-04-15'),
        sortOrder: 3,
      },
      {
        courseInstanceId: mgrInstance.id,
        name: 'הכנת צוות',
        phaseType: 'STAFF_PREP',
        startDate: new Date('2026-04-16'),
        endDate: new Date('2026-04-20'),
        sortOrder: 4,
      },
      {
        courseInstanceId: mgrInstance.id,
        name: 'הקורס',
        phaseType: 'COURSE',
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-06-30'),
        sortOrder: 5,
      },
      {
        courseInstanceId: mgrInstance.id,
        name: 'שבוע סיכומים',
        phaseType: 'SUMMARY_WEEK',
        startDate: new Date('2026-07-01'),
        endDate: new Date('2026-07-07'),
        sortOrder: 6,
      },
    ],
  });

  await prisma.coursePhase.createMany({
    data: [
      {
        courseInstanceId: tlInstance.id,
        name: 'רישום',
        phaseType: 'CANDIDACY_SUBMISSION',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2026-04-20'),
        sortOrder: 1,
      },
      {
        courseInstanceId: tlInstance.id,
        name: 'הקורס',
        phaseType: 'COURSE',
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-05-15'),
        sortOrder: 2,
      },
      {
        courseInstanceId: tlInstance.id,
        name: 'סיכום',
        phaseType: 'SUMMARY_WEEK',
        startDate: new Date('2026-05-16'),
        endDate: new Date('2026-05-18'),
        sortOrder: 3,
      },
    ],
  });

  console.log('Created Gantt phases');

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

  // ── Registrations ──
  await prisma.courseRegistration.createMany({
    data: [
      { courseInstanceId: cyberInstance.id, userId: trainees[0].id, status: 'PENDING_TL' },
      {
        courseInstanceId: cyberInstance.id,
        userId: trainees[3].id,
        status: 'PENDING_BIS',
        coordApprovedById: coords[0].id,
        coordApprovedAt: new Date(),
        coordPriority: 1,
        coordNotes: 'עדיפות גבוהה. מתאים.',
      },
      {
        courseInstanceId: gisInstance.id,
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
        courseInstanceId: pythonInstance.id,
        userId: trainees[8].id,
        status: 'REJECTED',
        rejectionReason: 'אין מקום במחזור הנוכחי. נא לנסות שוב במחזור הבא.',
      },
      { courseInstanceId: gisInstance.id, userId: trainees[2].id, status: 'PENDING_TL' },
    ],
  });

  console.log('Created 5 sample registrations');

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
  console.log('Seed complete!');
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
