import { BadRequestException } from '@nestjs/common';
import { ExamsService } from './exams.service';

describe('ExamsService — exam rule validation', () => {
  function buildService() {
    const prisma = {
      exam: { create: jest.fn().mockResolvedValue({ id: 'e1' }) },
    };
    const auditLog = { log: jest.fn().mockResolvedValue(undefined) };
    return { service: new ExamsService(prisma as any, auditLog as any), prisma };
  }

  it('rejects when questionsPerAttempt exceeds the selected question pool', async () => {
    const { service } = buildService();
    await expect(
      service.create('teacher-1', {
        courseId: 'c1',
        title: 'Midterm',
        durationMinutes: 30,
        questionsPerAttempt: 10,
        passingMark: 50,
        questionIds: ['q1', 'q2', 'q3'], // only 3 available, asking for 10
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects when scheduledEnd is not after scheduledStart', async () => {
    const { service } = buildService();
    await expect(
      service.create('teacher-1', {
        courseId: 'c1',
        title: 'Midterm',
        durationMinutes: 30,
        questionsPerAttempt: 1,
        passingMark: 50,
        questionIds: ['q1'],
        scheduledStart: '2026-01-02T10:00:00.000Z',
        scheduledEnd: '2026-01-01T10:00:00.000Z', // before start
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('accepts a well-formed exam configuration', async () => {
    const { service, prisma } = buildService();
    await service.create('teacher-1', {
      courseId: 'c1',
      title: 'Midterm',
      durationMinutes: 30,
      questionsPerAttempt: 2,
      passingMark: 50,
      questionIds: ['q1', 'q2', 'q3'],
    } as any);
    expect(prisma.exam.create).toHaveBeenCalled();
  });
});
