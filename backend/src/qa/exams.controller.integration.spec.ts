import { Test, TestingModule } from '@nestjs/testing';
import { ExamsController } from '../exams/exams.controller';
import { ExamsService } from '../exams/exams.service';
import { CoursesService } from '../courses/courses.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

const UUIDS = {
  course: '11111111-1111-4111-8111-111111111111',
  q1: '22222222-2222-4222-8222-222222222222',
  q2: '33333333-3333-4333-8333-333333333333',
};

describe('Exam API integration — controller + service', () => {
  let controller: ExamsController;
  const prisma = {
    exam: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const auditLog = { log: jest.fn().mockResolvedValue(undefined) };
  const coursesService = { findAllForStudent: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamsController],
      providers: [
        ExamsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
        { provide: CoursesService, useValue: coursesService },
      ],
    }).compile();

    controller = module.get(ExamsController);
  });

  it('creates an exam through the controller and persists the pool through ExamsService', async () => {
    prisma.exam.create.mockResolvedValue({
      id: 'exam-1',
      title: 'CSE Midterm',
      pool: [{ questionId: UUIDS.q1 }, { questionId: UUIDS.q2 }],
    });

    const result = await controller.create(
      { user: { userId: 'teacher-1' } },
      {
        courseId: UUIDS.course,
        title: 'CSE Midterm',
        durationMinutes: 30,
        questionsPerAttempt: 2,
        passingMark: 50,
        questionIds: [UUIDS.q1, UUIDS.q2],
      } as any,
    );

    expect(result).toEqual({
      id: 'exam-1',
      title: 'CSE Midterm',
      pool: [{ questionId: UUIDS.q1 }, { questionId: UUIDS.q2 }],
    });

    expect(prisma.exam.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          courseId: UUIDS.course,
          createdById: 'teacher-1',
          questionsPerAttempt: 2,
        }),
      }),
    );

    expect(auditLog.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'EXAM_CREATED', userId: 'teacher-1' }),
    );
  });

  it('passes a student course selection from CoursesService into the available-exam lookup', async () => {
    coursesService.findAllForStudent.mockResolvedValue([
      { id: UUIDS.course },
      { id: '44444444-4444-4444-8444-444444444444' },
    ]);
    prisma.exam.findMany.mockResolvedValue([{ id: 'exam-1', status: 'PUBLISHED' }]);

    const result = await controller.findAvailable({ user: { userId: 'student-1' } });

    expect(result).toEqual([{ id: 'exam-1', status: 'PUBLISHED' }]);
    expect(prisma.exam.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          courseId: {
            in: [UUIDS.course, '44444444-4444-4444-8444-444444444444'],
          },
        }),
      }),
    );
  });
});
