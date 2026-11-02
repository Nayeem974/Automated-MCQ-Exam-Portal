import { EvaluationService } from '../evaluation/evaluation.service';

function buildService(attempt: any) {
  const prisma = {
    attempt: {
      findUnique: jest.fn().mockResolvedValue(attempt),
    },
    question: {
      findUnique: jest.fn().mockImplementation(({ where }: any) =>
        Promise.resolve({
          id: where.id,
          marks: 1,
          negativeMarks: 0,
        }),
      ),
    },
    answer: {
      update: jest.fn().mockResolvedValue({}),
    },
    result: {
      upsert: jest.fn().mockImplementation(({ create }) =>
        Promise.resolve(create),
      ),
    },
  };

  return new EvaluationService(prisma as any);
}

describe('EvaluationService — score and grade boundaries', () => {
  it('passes exactly at the 50% passing boundary', async () => {
    const attempt = {
      id: 'attempt-1',
      questionOrder: ['q1', 'q2'],
      answers: [
        {
          id: 'a1',
          questionId: 'q1',
          question: {
            id: 'q1',
            marks: 1,
            negativeMarks: 0,
          },
          selectedOptionId: 'o1',
          selectedOption: {
            isCorrect: true,
          },
        },
        {
          id: 'a2',
          questionId: 'q2',
          question: {
            id: 'q2',
            marks: 1,
            negativeMarks: 0,
          },
          selectedOptionId: 'o2',
          selectedOption: {
            isCorrect: false,
          },
        },
      ],
      exam: {
        passingMark: 50,
      },
    };

    const result = await buildService(attempt).evaluateAttempt('attempt-1');

    expect(result.percentage).toBe(50);
    expect(result.passed).toBe(true);
    expect(result.grade).toBe('D');
  });

  it('fails immediately below the 50% passing boundary', async () => {
    const attempt = {
      id: 'attempt-1',
      questionOrder: ['q1', 'q2'],
      answers: [
        {
          id: 'a1',
          questionId: 'q1',
          question: {
            id: 'q1',
            marks: 1,
            negativeMarks: 0,
          },
          selectedOptionId: 'o1',
          selectedOption: {
            isCorrect: true,
          },
        },
        {
          id: 'a2',
          questionId: 'q2',
          question: {
            id: 'q2',
            marks: 1,
            negativeMarks: 0.00002,
          },
          selectedOptionId: 'o2',
          selectedOption: {
            isCorrect: false,
          },
        },
      ],
      exam: {
        passingMark: 50,
      },
    };

    const result = await buildService(attempt).evaluateAttempt('attempt-1');

    expect(result.percentage).toBeCloseTo(49.999, 6);
    expect(result.passed).toBe(false);
    expect(result.grade).toBe('F');
  });

  it.each([
    [90, 'A+'],
    [80, 'A'],
    [70, 'B'],
    [60, 'C'],
    [50, 'D'],
    [49.999, 'F'],
  ])(
    'maps representative percentage %s to grade %s',
    async (percentage, grade) => {
      const questionIds = Array.from(
        { length: 100 },
        (_, index) => `q${index + 1}`,
      );

      const answers: any[] = [];

      if (percentage === 49.999) {
        // 50 correct = 50 marks
        for (let i = 0; i < 50; i++) {
          const questionId = questionIds[i];

          answers.push({
            id: `a-${questionId}`,
            questionId,
            question: {
              id: questionId,
              marks: 1,
              negativeMarks: 0,
            },
            selectedOptionId: `o-${questionId}`,
            selectedOption: {
              isCorrect: true,
            },
          });
        }

        // One wrong answer = -0.001
        answers.push({
          id: 'a-q51',
          questionId: 'q51',
          question: {
            id: 'q51',
            marks: 1,
            negativeMarks: 0.001,
          },
          selectedOptionId: 'o-q51',
          selectedOption: {
            isCorrect: false,
          },
        });
      } else {
        const correctCount = Number(percentage);

        for (let i = 0; i < correctCount; i++) {
          const questionId = questionIds[i];

          answers.push({
            id: `a-${questionId}`,
            questionId,
            question: {
              id: questionId,
              marks: 1,
              negativeMarks: 0,
            },
            selectedOptionId: `o-${questionId}`,
            selectedOption: {
              isCorrect: true,
            },
          });
        }
      }

      const attempt = {
        id: 'attempt-1',
        questionOrder: questionIds,
        answers,
        exam: {
          passingMark: 0,
        },
      };

      const result = await buildService(attempt).evaluateAttempt(
        'attempt-1',
      );

      expect(result.grade).toBe(grade);
    },
  );

  it('counts an unanswered question separately and awards zero marks', async () => {
    const attempt = {
      id: 'attempt-1',
      questionOrder: ['q1', 'q2'],
      answers: [
        {
          id: 'a1',
          questionId: 'q1',
          question: {
            id: 'q1',
            marks: 1,
            negativeMarks: 0.25,
          },
          selectedOptionId: 'o1',
          selectedOption: {
            isCorrect: true,
          },
        },
      ],
      exam: {
        passingMark: 50,
      },
    };

    const result = await buildService(attempt).evaluateAttempt('attempt-1');

    expect(result.correctCount).toBe(1);
    expect(result.wrongCount).toBe(0);
    expect(result.unansweredCount).toBe(1);
    expect(result.score).toBe(1);
    expect(result.maxScore).toBe(2);
  });
});