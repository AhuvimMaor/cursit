import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const students = [
  { name: 'נועה כהן', email: 'noa@cursit.dev' },
  { name: 'יונתן לוי', email: 'yonatan@cursit.dev' },
  { name: 'מאיה אברהם', email: 'maya@cursit.dev' },
  { name: 'עידו מזרחי', email: 'ido@cursit.dev' },
  { name: 'שירה גולן', email: 'shira@cursit.dev' },
  { name: 'אורי דוד', email: 'ori@cursit.dev' },
  { name: 'תמר רוזנברג', email: 'tamar@cursit.dev' },
  { name: 'דניאל פרץ', email: 'daniel@cursit.dev' },
];

const missions = [
  {
    title: 'HTML & CSS Basics',
    description: 'Build a personal portfolio page using semantic HTML and CSS flexbox/grid',
    maxScore: 100,
  },
  {
    title: 'JavaScript Fundamentals',
    description: 'Implement a todo list with DOM manipulation, event handling, and local storage',
    maxScore: 100,
  },
  {
    title: 'React Components',
    description: 'Create a weather dashboard with reusable components, props, and state management',
    maxScore: 100,
  },
  {
    title: 'TypeScript Migration',
    description: 'Convert an existing JavaScript project to TypeScript with strict mode enabled',
    maxScore: 100,
  },
  {
    title: 'REST API Design',
    description: 'Design and implement a RESTful API for a bookstore with CRUD operations',
    maxScore: 100,
  },
  {
    title: 'Database Modeling',
    description: 'Design a normalized database schema for an e-commerce platform with Prisma',
    maxScore: 100,
  },
  {
    title: 'Authentication & Auth',
    description: 'Implement JWT-based authentication with role-based access control',
    maxScore: 100,
  },
  {
    title: 'Final Project',
    description: 'Full-stack application with CI/CD pipeline, testing, and deployment',
    maxScore: 200,
  },
];

const scoreData = [
  // noa - strong student
  { studentIdx: 0, missionIdx: 0, score: 95, comment: 'עבודה מצוינת, שימוש נכון ב-grid' },
  { studentIdx: 0, missionIdx: 1, score: 88, comment: 'חסר error handling בכמה מקומות' },
  { studentIdx: 0, missionIdx: 2, score: 92, comment: null },
  { studentIdx: 0, missionIdx: 3, score: 90, comment: 'strict mode מלא, יפה מאוד' },
  { studentIdx: 0, missionIdx: 4, score: 85, comment: null },
  // yonatan - average
  { studentIdx: 1, missionIdx: 0, score: 78, comment: null },
  { studentIdx: 1, missionIdx: 1, score: 72, comment: 'צריך לשפר את הקוד הנקי' },
  { studentIdx: 1, missionIdx: 2, score: 80, comment: null },
  { studentIdx: 1, missionIdx: 3, score: 65, comment: 'הרבה any types, צריך לתקן' },
  // maya - excellent
  { studentIdx: 2, missionIdx: 0, score: 100, comment: 'מושלם!' },
  { studentIdx: 2, missionIdx: 1, score: 97, comment: null },
  { studentIdx: 2, missionIdx: 2, score: 95, comment: 'שימוש מעולה ב-custom hooks' },
  { studentIdx: 2, missionIdx: 3, score: 98, comment: null },
  { studentIdx: 2, missionIdx: 4, score: 94, comment: null },
  { studentIdx: 2, missionIdx: 5, score: 92, comment: 'סכמה נורמלית ומסודרת' },
  // ido - struggling
  { studentIdx: 3, missionIdx: 0, score: 60, comment: 'צריך לחזור על flexbox' },
  { studentIdx: 3, missionIdx: 1, score: 55, comment: 'הגשה מאוחרת, חסרים פיצ׳רים' },
  { studentIdx: 3, missionIdx: 2, score: 62, comment: null },
  // shira - good
  { studentIdx: 4, missionIdx: 0, score: 85, comment: null },
  { studentIdx: 4, missionIdx: 1, score: 82, comment: null },
  { studentIdx: 4, missionIdx: 2, score: 88, comment: 'דיזיין יפה' },
  { studentIdx: 4, missionIdx: 3, score: 79, comment: null },
  { studentIdx: 4, missionIdx: 4, score: 83, comment: null },
  { studentIdx: 4, missionIdx: 5, score: 86, comment: null },
  { studentIdx: 4, missionIdx: 6, score: 90, comment: 'אימפלמנטציה נקייה של JWT' },
  // ori - improving
  { studentIdx: 5, missionIdx: 0, score: 65, comment: null },
  { studentIdx: 5, missionIdx: 1, score: 70, comment: null },
  { studentIdx: 5, missionIdx: 2, score: 78, comment: 'שיפור משמעותי!' },
  { studentIdx: 5, missionIdx: 3, score: 82, comment: null },
  // tamar - consistent
  { studentIdx: 6, missionIdx: 0, score: 87, comment: null },
  { studentIdx: 6, missionIdx: 1, score: 85, comment: null },
  { studentIdx: 6, missionIdx: 2, score: 89, comment: null },
  { studentIdx: 6, missionIdx: 3, score: 86, comment: null },
  { studentIdx: 6, missionIdx: 4, score: 88, comment: null },
  // daniel - late starter
  { studentIdx: 7, missionIdx: 0, score: 70, comment: 'הצטרף מאוחר לקורס' },
  { studentIdx: 7, missionIdx: 1, score: 75, comment: null },
];

const main = async () => {
  console.log('Seeding dev data...');

  const createdStudents = await Promise.all(
    students.map((s) =>
      prisma.student.upsert({
        where: { email: s.email },
        update: s,
        create: s,
      }),
    ),
  );
  console.log(`Created ${createdStudents.length} students`);

  const createdMissions = await Promise.all(
    missions.map((m, idx) =>
      prisma.mission.upsert({
        where: { id: idx + 1 },
        update: m,
        create: m,
      }),
    ),
  );
  console.log(`Created ${createdMissions.length} missions`);

  for (const s of scoreData) {
    const studentId = createdStudents[s.studentIdx].id;
    const missionId = createdMissions[s.missionIdx].id;
    await prisma.score.upsert({
      where: { studentId_missionId: { studentId, missionId } },
      update: { score: s.score, comment: s.comment },
      create: { studentId, missionId, score: s.score, comment: s.comment },
    });
  }
  console.log(`Created ${scoreData.length} scores`);

  console.log('Seed complete!');
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
