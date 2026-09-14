import { BadRequestException } from '@nestjs/common';
import { QuestionsService } from './questions.service';

describe('QuestionsService — option validation', () => {
  function buildService() {
    const prisma = {
      question: { create: jest.fn().mockResolvedValue({ id: 'q1' }) },
    };
    const auditLog = { log: jest.fn().mockResolvedValue(undefined) };
    return { service: new QuestionsService(prisma as any, auditLog as any), prisma };
  }

  it('rejects a question with fewer than 2 options', async () => {
    const { service } = buildService();
    await expect(
      service.create('teacher-1', {
        courseId: 'c1',
        text: 'Only one option?',
        options: [{ text: 'A', isCorrect: true }],
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a question with zero correct options', async () => {
    const { service } = buildService();
    await expect(
      service.create('teacher-1', {
        courseId: 'c1',
        text: 'No correct answer marked',
        options: [
          { text: 'A', isCorrect: false },
          { text: 'B', isCorrect: false },
        ],
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a question with more than one correct option', async () => {
    const { service } = buildService();
    await expect(
      service.create('teacher-1', {
        courseId: 'c1',
        text: 'Two correct answers',
        options: [
          { text: 'A', isCorrect: true },
          { text: 'B', isCorrect: true },
        ],
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('accepts a well-formed question with exactly one correct option', async () => {
    const { service, prisma } = buildService();
    await service.create('teacher-1', {
      courseId: 'c1',
      text: 'What is the output of 2 + 2?',
      options: [
        { text: '3', isCorrect: false },
        { text: '4', isCorrect: true },
        { text: '5', isCorrect: false },
        { text: '6', isCorrect: false },
      ],
    } as any);
    expect(prisma.question.create).toHaveBeenCalled();
  });
});
