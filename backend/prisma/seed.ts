// Development seed data. Run with: npm run prisma:seed
// Creates: 1 admin, 2 teachers, 5 students, 2 courses, a question bank per
// course, and one published, ready-to-take exam.
//
// IMPORTANT: these are development-only credentials. Never reuse them,
// and never seed this data against a production database.
import { PrismaClient, Role, Difficulty } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const DEV_PASSWORD = 'Password123!'; // same password for every seeded account, for convenience

async function hash(pw: string) {
  return bcrypt.hash(pw, 10);
}

async function main() {
  console.log('Seeding database...');

  const passwordHash = await hash(DEV_PASSWORD);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { email: 'admin@example.com', name: 'Ada Admin', role: Role.ADMIN, passwordHash },
  });

  const teacher1 = await prisma.user.upsert({
    where: { email: 'teacher@example.com' },
    update: {},
    create: { email: 'teacher@example.com', name: 'Tariq Teacher', role: Role.TEACHER, passwordHash },
  });
  const teacher2 = await prisma.user.upsert({
    where: { email: 'teacher2@example.com' },
    update: {},
    create: { email: 'teacher2@example.com', name: 'Tina Teacher', role: Role.TEACHER, passwordHash },
  });

  const students = await Promise.all(
    [1, 2, 3, 4, 5].map((n) =>
      prisma.user.upsert({
        where: { email: `student${n}@example.com` },
        update: {},
        create: { email: `student${n}@example.com`, name: `Student ${n}`, role: Role.STUDENT, passwordHash },
      }),
    ),
  );

  const csCourse = await prisma.course.create({
    data: {
      title: 'CSE101 — Introduction to Programming',
      description: 'Fundamentals of programming with a focus on problem solving.',
      teacherId: teacher1.id,
    },
  });
  const sdCourse = await prisma.course.create({
    data: {
      title: 'Software Development Lab',
      description: 'Hands-on lab building a full-stack application.',
      teacherId: teacher2.id,
    },
  });

  // Enroll all 5 students in both courses.
  await Promise.all(
    students.flatMap((s) => [
      prisma.enrollment.create({ data: { studentId: s.id, courseId: csCourse.id } }),
      prisma.enrollment.create({ data: { studentId: s.id, courseId: sdCourse.id } }),
    ]),
  );

  // Question bank for CSE101 — enough for a real randomized exam.
  const questionDefs: { text: string; difficulty: Difficulty; options: [string, boolean][] }[] = [
    { text: 'What is the output of 2 + 2?', difficulty: Difficulty.EASY, options: [['3', false], ['4', true], ['5', false], ['6', false]] },
    { text: 'Which data structure uses LIFO order?', difficulty: Difficulty.EASY, options: [['Queue', false], ['Stack', true], ['Array', false], ['Tree', false]] },
    { text: 'What does HTML stand for?', difficulty: Difficulty.EASY, options: [['HyperText Markup Language', true], ['HighText Machine Language', false], ['HyperText Made Language', false], ['Home Tool Markup Language', false]] },
    { text: 'What is the time complexity of binary search?', difficulty: Difficulty.MEDIUM, options: [['O(n)', false], ['O(log n)', true], ['O(n^2)', false], ['O(1)', false]] },
    { text: 'Which keyword declares a constant in JavaScript?', difficulty: Difficulty.EASY, options: [['var', false], ['let', false], ['const', true], ['static', false]] },
    { text: 'In relational databases, what does a primary key guarantee?', difficulty: Difficulty.MEDIUM, options: [['Sorted order', false], ['Uniqueness', true], ['Fast writes', false], ['Normalization', false]] },
    { text: 'Which HTTP method is idempotent?', difficulty: Difficulty.MEDIUM, options: [['POST', false], ['PUT', true], ['PATCH', false], ['CONNECT', false]] },
    { text: 'What does REST stand for?', difficulty: Difficulty.EASY, options: [['Representational State Transfer', true], ['Remote State Transfer', false], ['Representational Style Transfer', false], ['Remote Style Transfer', false]] },
    { text: 'Which sorting algorithm has the best average-case time complexity?', difficulty: Difficulty.HARD, options: [['Bubble sort', false], ['Quicksort', true], ['Selection sort', false], ['Insertion sort', false]] },
    { text: 'What is a race condition?', difficulty: Difficulty.HARD, options: [['A CPU scheduling algorithm', false], ['Two threads competing for a shared resource unsafely', true], ['A type of deadlock', false], ['A network protocol', false]] },
  ];

  const questions = await Promise.all(
    questionDefs.map((q) =>
      prisma.question.create({
        data: {
          courseId: csCourse.id,
          createdById: teacher1.id,
          text: q.text,
          difficulty: q.difficulty,
          marks: 1,
          negativeMarks: 0.25,
          options: { create: q.options.map(([text, isCorrect]) => ({ text, isCorrect })) },
        },
      }),
    ),
  );

  // A published exam drawing 5 of the 10 questions per attempt.
  const exam = await prisma.exam.create({
    data: {
      courseId: csCourse.id,
      createdById: teacher1.id,
      title: 'CSE101 Midterm',
      description: 'Covers programming fundamentals, data structures, and the web basics discussed in class.',
      durationMinutes: 15,
      questionsPerAttempt: 5,
      passingMark: 50,
      revealAnswers: true,
      randomizeQuestions: true,
      randomizeOptions: true,
      status: 'PUBLISHED',
      pool: { create: questions.map((q) => ({ questionId: q.id })) },
    },
  });

  console.log('\nSeed complete.\n');
  console.log('Dev login credentials (all use the same password):');
  console.log(`  Password: ${DEV_PASSWORD}\n`);
  console.log(`  Admin:    admin@example.com`);
  console.log(`  Teacher:  teacher@example.com  (owns "${csCourse.title}" and the published "${exam.title}" exam)`);
  console.log(`  Teacher:  teacher2@example.com (owns "${sdCourse.title}")`);
  for (let i = 1; i <= 5; i++) console.log(`  Student:  student${i}@example.com`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
