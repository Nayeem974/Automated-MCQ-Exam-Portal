import 'reflect-metadata';
import { validate } from 'class-validator';
import { BadRequestException } from '@nestjs/common';
import { CreateExamDto } from '../exams/dto/create-exam.dto';
import { ExamsService } from '../exams/exams.service';

const UUIDS = [
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
];

function validExamDto(overrides: Partial<CreateExamDto> = {}): CreateExamDto {
  return Object.assign(new CreateExamDto(), {
    courseId: UUIDS[0],
    title: 'CSE Midterm',
    durationMinutes: 1,
    questionsPerAttempt: 1,
    passingMark: 50,
    questionIds: [UUIDS[1]],
    ...overrides,
  });
}

describe('Exam validation — boundary and business-rule tests', () => {
  it('accepts passingMark = 0', async () => {
    await expect(validate(validExamDto({ passingMark: 0 }))).resolves.toHaveLength(0);
  });

  it('accepts passingMark = 100', async () => {
    await expect(validate(validExamDto({ passingMark: 100 }))).resolves.toHaveLength(0);
  });

  it('rejects passingMark below 0', async () => {
    const errors = await validate(validExamDto({ passingMark: -0.01 }));
    expect(errors.some((error) => error.property === 'passingMark')).toBe(true);
  });

  it('rejects passingMark above 100', async () => {
    const errors = await validate(validExamDto({ passingMark: 100.01 }));
    expect(errors.some((error) => error.property === 'passingMark')).toBe(true);
  });

  it('rejects durationMinutes = 0', async () => {
    const errors = await validate(validExamDto({ durationMinutes: 0 }));
    expect(errors.some((error) => error.property === 'durationMinutes')).toBe(true);
  });

  it('accepts durationMinutes = 1', async () => {
    await expect(validate(validExamDto({ durationMinutes: 1 }))).resolves.toHaveLength(0);
  });

  it('accepts questionsPerAttempt exactly equal to the question pool size', async () => {
    const prisma = {
      exam: { create: jest.fn().mockResolvedValue({ id: 'e1' }) },
    };
    const auditLog = { log: jest.fn().mockResolvedValue(undefined) };
    const service = new ExamsService(prisma as any, auditLog as any);

    await expect(
      service.create('teacher-1', {
        ...validExamDto({ questionsPerAttempt: 2 }),
        questionIds: [UUIDS[1], UUIDS[2]],
      } as any),
    ).resolves.toEqual({ id: 'e1' });
  });

  it('rejects questionsPerAttempt when it exceeds the question pool by one', async () => {
    const prisma = {
      exam: { create: jest.fn() },
    };
    const auditLog = { log: jest.fn() };
    const service = new ExamsService(prisma as any, auditLog as any);

    await expect(
      service.create('teacher-1', {
        ...validExamDto({ questionsPerAttempt: 2 }),
        questionIds: [UUIDS[1]],
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.exam.create).not.toHaveBeenCalled();
  });
});
