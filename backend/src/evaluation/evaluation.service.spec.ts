import { EvaluationService } from './evaluation.service';

// Mirrors the pipeline doc's negative-marking example (section 7) at a
// smaller scale: 2 correct, 1 wrong, 1 unanswered, out of 4 one-mark
// questions with -0.25 negative marking.
//   score = 2*1 - 1*0.25 = 1.75
//   percentage = 1.75 / 4 * 100 = 43.75
describe('EvaluationService', () => {
  function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}) {
    const questions = [
      { id: 'q1', marks: 1, negativeMarks: 0.25 },
      { id: 'q2', marks: 1, negativeMarks: 0.25 },
      { id: 'q3', marks: 1, negativeMarks: 0.25 },
      { id: 'q4', marks: 1, negativeMarks: 0.25 },
    ];

    const answers = [
      { id: 'a1', questionId: 'q1', question: questions[0], selectedOption: { isCorrect: true } },
      { id: 'a2', questionId: 'q2', question: questions[1], selectedOption: { isCorrect: true } },
      { id: 'a3', questionId: 'q3', question: questions[2], selectedOption: { isCorrect: false } },
      // q4 intentionally has no answer row -> counts as unanswered
    ];

    const attempt = {
      id: 'attempt-1',
      questionOrder: questions.map((q) => q.id),
      answers,
      exam: { passingMark: 50 },
    };

    return {
      attempt: { findUnique: jest.fn().mockResolvedValue(attempt) },
      question: { findUnique: jest.fn().mockResolvedValue(questions[3]) },
      answer: { update: jest.fn().mockResolvedValue({}) },
      result: {
        upsert: jest.fn().mockImplementation(({ create }) => Promise.resolve(create)),
      },
      ...overrides,
    };
  }

  it('computes score, percentage, and pass/fail exactly per the negative-marking rules', async () => {
    const prisma = buildPrismaMock();
    const service = new EvaluationService(prisma as any);

    const result = await service.evaluateAttempt('attempt-1');

    expect(result.score).toBeCloseTo(1.75);
    expect(result.maxScore).toBe(4);
    expect(result.percentage).toBeCloseTo(43.75);
    expect(result.correctCount).toBe(2);
    expect(result.wrongCount).toBe(1);
    expect(result.unansweredCount).toBe(1);
    expect(result.passed).toBe(false); // 43.75% < 50% passing mark
  });

  it('passes when percentage meets the exam passing mark', async () => {
    const prisma = buildPrismaMock();
    prisma.attempt.findUnique = jest.fn().mockResolvedValue({
      id: 'attempt-2',
      questionOrder: ['q1', 'q2'],
      answers: [
        { id: 'a1', questionId: 'q1', question: { id: 'q1', marks: 1, negativeMarks: 0 }, selectedOption: { isCorrect: true } },
        { id: 'a2', questionId: 'q2', question: { id: 'q2', marks: 1, negativeMarks: 0 }, selectedOption: { isCorrect: true } },
      ],
      exam: { passingMark: 50 },
    });
    const service = new EvaluationService(prisma as any);

    const result = await service.evaluateAttempt('attempt-2');
    expect(result.percentage).toBe(100);
    expect(result.passed).toBe(true);
  });
});
