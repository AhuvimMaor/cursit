import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const main = async () => {
  console.log('Seeding ביס 60 dev data...');

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
  const bisCdr = await prisma.user.create({
    data: { uniqueId: '1000000', name: 'סא"ל דוד כהן', role: 'BIS_CDR' },
  });

  const coords = await Promise.all([
    prisma.user.create({
      data: {
        uniqueId: '2000001',
        name: 'רס"ן שרה לוי',
        role: 'BRANCH_COORD',
        branchId: branches[0].id,
      },
    }),
    prisma.user.create({
      data: {
        uniqueId: '2000002',
        name: 'רס"ן יוסי אברהם',
        role: 'BRANCH_COORD',
        branchId: branches[1].id,
      },
    }),
    prisma.user.create({
      data: {
        uniqueId: '2000003',
        name: 'רס"ן מיכל דוד',
        role: 'BRANCH_COORD',
        branchId: branches[2].id,
      },
    }),
  ]);

  const teamLeaders = await Promise.all([
    prisma.user.create({
      data: {
        uniqueId: '3000001',
        name: 'סמ"ר נועה מזרחי',
        role: 'TEAM_LEADER',
        teamId: teams[0].id,
        branchId: branches[0].id,
      },
    }),
    prisma.user.create({
      data: {
        uniqueId: '3000002',
        name: 'סמ"ר אורי גולן',
        role: 'TEAM_LEADER',
        teamId: teams[1].id,
        branchId: branches[0].id,
      },
    }),
    prisma.user.create({
      data: {
        uniqueId: '3000003',
        name: 'סמ"ר תמר פרץ',
        role: 'TEAM_LEADER',
        teamId: teams[2].id,
        branchId: branches[1].id,
      },
    }),
    prisma.user.create({
      data: {
        uniqueId: '3000004',
        name: 'סמ"ר דניאל רוזנברג',
        role: 'TEAM_LEADER',
        teamId: teams[3].id,
        branchId: branches[1].id,
      },
    }),
    prisma.user.create({
      data: {
        uniqueId: '3000005',
        name: 'סמ"ר שירה כהן',
        role: 'TEAM_LEADER',
        teamId: teams[4].id,
        branchId: branches[2].id,
      },
    }),
  ]);

  const trainees = await Promise.all([
    // צוות אלפא
    prisma.user.create({
      data: {
        uniqueId: '4000001',
        name: 'טוראי יונתן לוי',
        role: 'TRAINEE',
        teamId: teams[0].id,
        branchId: branches[0].id,
      },
    }),
    prisma.user.create({
      data: {
        uniqueId: '4000002',
        name: 'טוראי מאיה אברהם',
        role: 'TRAINEE',
        teamId: teams[0].id,
        branchId: branches[0].id,
      },
    }),
    prisma.user.create({
      data: {
        uniqueId: '4000003',
        name: 'טוראי עידו כהן',
        role: 'TRAINEE',
        teamId: teams[0].id,
        branchId: branches[0].id,
      },
    }),
    // צוות בראבו
    prisma.user.create({
      data: {
        uniqueId: '4000004',
        name: 'טוראי רונה דוד',
        role: 'TRAINEE',
        teamId: teams[1].id,
        branchId: branches[0].id,
      },
    }),
    prisma.user.create({
      data: {
        uniqueId: '4000005',
        name: 'טוראי אלון פרידמן',
        role: 'TRAINEE',
        teamId: teams[1].id,
        branchId: branches[0].id,
      },
    }),
    // צוות גאמא
    prisma.user.create({
      data: {
        uniqueId: '4000006',
        name: 'טוראי שקד מזרחי',
        role: 'TRAINEE',
        teamId: teams[2].id,
        branchId: branches[1].id,
      },
    }),
    prisma.user.create({
      data: {
        uniqueId: '4000007',
        name: 'טוראי ליאור גולן',
        role: 'TRAINEE',
        teamId: teams[2].id,
        branchId: branches[1].id,
      },
    }),
    // צוות דלתא
    prisma.user.create({
      data: {
        uniqueId: '4000008',
        name: 'טוראי נגה רוזנברג',
        role: 'TRAINEE',
        teamId: teams[3].id,
        branchId: branches[1].id,
      },
    }),
    // צוות הדס
    prisma.user.create({
      data: {
        uniqueId: '4000009',
        name: 'טוראי תומר שמעוני',
        role: 'TRAINEE',
        teamId: teams[4].id,
        branchId: branches[2].id,
      },
    }),
    prisma.user.create({
      data: {
        uniqueId: '4000010',
        name: 'טוראי הילה ברקוביץ',
        role: 'TRAINEE',
        teamId: teams[4].id,
        branchId: branches[2].id,
      },
    }),
  ]);

  console.log(
    `Created users: 1 BIS_CDR, ${coords.length} BRANCH_COORD, ${teamLeaders.length} TEAM_LEADER, ${trainees.length} TRAINEE`,
  );

  // ── Courses ──
  const foundationCourses = await Promise.all([
    prisma.course.create({
      data: {
        name: 'קורס מ"פים',
        description: 'קורס הכשרת מפקדי פלוגות. כולל מיונים, הכשרת פיקוד, והקורס עצמו.',
        type: 'FOUNDATION',
        location: 'בסיס הדרכה מרכזי',
        isPublished: true,
      },
    }),
    prisma.course.create({
      data: {
        name: 'קורס רש"צים',
        description: 'קורס הכשרת ראשי צוותים. תפקיד פיקודי ראשון.',
        type: 'FOUNDATION',
        location: 'בסיס הדרכה מרכזי',
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
        description: 'מתודולוגיות ניהול פרויקטים, Agile ו-Scrum. מותאם לעולם הצבאי.',
        type: 'ADVANCED',
        gmushHours: 16,
        isPublished: true,
      },
    }),
  ]);

  console.log(
    `Created ${foundationCourses.length} foundation + ${advancedCourses.length} advanced courses`,
  );

  // ── Course Instances ──
  const mfpInstance = await prisma.courseInstance.create({
    data: {
      courseId: foundationCourses[0].id,
      name: 'מחזור 42',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-07-07'),
      status: 'OPEN',
    },
  });

  const rashatzInstance = await prisma.courseInstance.create({
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

  // ── Gantt Phases (קורס מ"פים מחזור 42) ──
  await prisma.coursePhase.createMany({
    data: [
      {
        courseInstanceId: mfpInstance.id,
        name: 'הגשת מועמדות',
        phaseType: 'CANDIDACY_SUBMISSION',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-15'),
        sortOrder: 1,
      },
      {
        courseInstanceId: mfpInstance.id,
        name: 'מיונים לפיקוד',
        phaseType: 'TRYOUTS',
        startDate: new Date('2026-03-20'),
        endDate: new Date('2026-03-25'),
        sortOrder: 2,
      },
      {
        courseInstanceId: mfpInstance.id,
        name: 'קורס פיקוד',
        phaseType: 'COMMANDER_COURSE',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2026-04-15'),
        sortOrder: 3,
      },
      {
        courseInstanceId: mfpInstance.id,
        name: 'הכנת סגל',
        phaseType: 'STAFF_PREP',
        startDate: new Date('2026-04-16'),
        endDate: new Date('2026-04-20'),
        sortOrder: 4,
      },
      {
        courseInstanceId: mfpInstance.id,
        name: 'הקורס',
        phaseType: 'COURSE',
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-06-30'),
        sortOrder: 5,
      },
      {
        courseInstanceId: mfpInstance.id,
        name: 'שבוע סיכומים',
        phaseType: 'SUMMARY_WEEK',
        startDate: new Date('2026-07-01'),
        endDate: new Date('2026-07-07'),
        sortOrder: 6,
      },
    ],
  });

  // ── Gantt Phases (קורס רש"צים מחזור 8) ──
  await prisma.coursePhase.createMany({
    data: [
      {
        courseInstanceId: rashatzInstance.id,
        name: 'רישום',
        phaseType: 'CANDIDACY_SUBMISSION',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2026-04-20'),
        sortOrder: 1,
      },
      {
        courseInstanceId: rashatzInstance.id,
        name: 'הקורס',
        phaseType: 'COURSE',
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-05-15'),
        sortOrder: 2,
      },
      {
        courseInstanceId: rashatzInstance.id,
        name: 'סיכום',
        phaseType: 'SUMMARY_WEEK',
        startDate: new Date('2026-05-16'),
        endDate: new Date('2026-05-18'),
        sortOrder: 3,
      },
    ],
  });

  console.log('Created Gantt phases');

  // ── Command Candidacies (sample) ──
  await prisma.commandCandidacy.createMany({
    data: [
      {
        courseInstanceId: mfpInstance.id,
        candidateId: trainees[0].id,
        submittedById: teamLeaders[0].id,
        status: 'PENDING',
        motivation: 'חייל מצטיין עם יכולות פיקודיות טבעיות. מוביל את הצוות בצורה יוצאת מן הכלל.',
        commanderNotes: 'ממליץ בחום. מתאים לתפקיד פיקודי.',
      },
      {
        courseInstanceId: mfpInstance.id,
        candidateId: trainees[1].id,
        submittedById: teamLeaders[0].id,
        status: 'COORD_REVIEWED',
        motivation: 'חיילת בעלת מוטיבציה גבוהה ויכולת למידה מהירה.',
        commanderNotes: 'מומלצת. שיפור משמעותי בחצי שנה אחרונה.',
      },
      {
        courseInstanceId: mfpInstance.id,
        candidateId: trainees[5].id,
        submittedById: teamLeaders[2].id,
        status: 'APPROVED',
        motivation: 'חייל מוביל בצוות. ביצועים מצוינים במבצעים.',
        commanderNotes: 'מתאים מאוד.',
        reviewedById: bisCdr.id,
        reviewNotes: 'מאושר. ביצועים מצוינים.',
      },
    ],
  });

  console.log('Created 3 sample candidacies');

  // ── Course Registrations (sample) ──
  await prisma.courseRegistration.createMany({
    data: [
      {
        courseInstanceId: cyberInstance.id,
        userId: trainees[0].id,
        status: 'PENDING_COORD',
      },
      {
        courseInstanceId: cyberInstance.id,
        userId: trainees[3].id,
        status: 'PENDING_BIS',
        coordApprovedById: coords[0].id,
        coordApprovedAt: new Date(),
        coordPriority: 1,
        coordNotes: 'עדיפות גבוהה. חייל מתאים.',
      },
      {
        courseInstanceId: gisInstance.id,
        userId: trainees[5].id,
        status: 'APPROVED',
        coordApprovedById: coords[1].id,
        coordApprovedAt: new Date(),
        coordPriority: 1,
        bisApprovedById: bisCdr.id,
        bisApprovedAt: new Date(),
        bisNotes: 'מאושר.',
      },
      {
        courseInstanceId: pythonInstance.id,
        userId: trainees[8].id,
        status: 'REJECTED',
        rejectionReason: 'אין מקום במחזור הנוכחי. נא לנסות שוב במחזור הבא.',
      },
      {
        courseInstanceId: gisInstance.id,
        userId: trainees[2].id,
        status: 'PENDING_COORD',
      },
    ],
  });

  console.log('Created 5 sample registrations');

  // ── Info Pages ──
  await prisma.infoPage.createMany({
    data: [
      {
        slug: 'tryouts-info',
        title: 'מידע על מיונים לפיקוד',
        content: `# מיונים לפיקוד — מה צפוי?\n\n## השלבים\n1. **הגשת מועמדות** — הרש"צ מגיש מועמדות עבור חניכים מתאימים\n2. **סינון ראשוני** — קה"ד ענפי עובר ומתעדף\n3. **אישור** — מפקד הביס מאשר סופית\n4. **מיונים** — שלב המיונים עצמו (3-5 ימים)\n\n## איך להתכונן?\n- כושר גופני — ריצות, שכיבות סמיכה, מתח\n- ידע מקצועי — חזרה על חומר הקורס הבסיסי\n- מנהיגות — תרגול הובלת צוות`,
        sortOrder: 1,
        isPublished: true,
      },
      {
        slug: 'advanced-courses-info',
        title: 'מידע על קורסים מתקדמים',
        content: `# קורסים מתקדמים\n\n## תהליך הרישום\n1. בחר קורס מהקטלוג\n2. מלא את הטפסים הנדרשים\n3. הבקשה תעבור לאישור קה"ד ענפי\n4. לאחר אישור ענפי — אישור סופי ע"י מפקד הביס\n\n## שעות גמו"ש\nכל קורס מזכה בשעות גמו"ש בהתאם להיקפו.`,
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
