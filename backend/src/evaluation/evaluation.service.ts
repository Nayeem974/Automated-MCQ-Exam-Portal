import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Simple percentage -> letter grade scale. Adjust to your institution's rules.
function gradeFor(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
}

@Injectable()
export class EvaluationService {
  constructor(private prisma: PrismaService) {}

  // Mirrors section 7's worked example:
  //   correct: +marks, wrong: -negativeMarks, unanswered: 0
  //   percentage = finalScore / totalPossible * 100
  //   pass/fail is decided against the exam's configured passingMark (%)
  async evaluateAttempt(attemptId: string) {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: { include: { question: true, selectedOption: true } },
        exam: true,
      },
    });
    if (!attempt) throw new NotFoundException('Attempt not found');

    const questionIds: string[] = Array.isArray(attempt.questionOrder)
      ? (attempt.questionOrder as any[]).map((entry) =>
          typeof entry === 'string' ? entry : entry.questionId,
        )
      : [];

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    let finalScore = 0;
    let totalPossible = 0;

    for (const questionId of questionIds) {
      const answer = attempt.answers.find((a) => a.questionId === questionId);
      const question = answer?.question ?? (await this.prisma.question.findUnique({ where: { id: questionId } }));
      if (!question) continue;

      totalPossible += question.marks;

      if (!answer || !answer.selectedOptionId) {
        unansweredCount++;
        if (answer) {
          await this.prisma.answer.update({
            where: { id: answer.id },
            data: { isCorrect: null, marksAwarded: 0 },
          });
        }
        continue;
      }

      const isCorrect = answer.selectedOption?.isCorrect ?? false;
      const marksAwarded = isCorrect ? question.marks : -question.negativeMarks;
      finalScore += marksAwarded;
      isCorrect ? correctCount++ : wrongCount++;

      await this.prisma.answer.update({
        where: { id: answer.id },
        data: { isCorrect, marksAwarded },
      });
    }

    const percentage = totalPossible > 0 ? (finalScore / totalPossible) * 100 : 0;
    const passed = percentage >= attempt.exam.passingMark;

    return this.prisma.result.upsert({
      where: { attemptId },
      update: {
        score: finalScore,
        maxScore: totalPossible,
        percentage,
        grade: gradeFor(percentage),
        passed,
        correctCount,
        wrongCount,
        unansweredCount,
      },
      create: {
        attemptId,
        score: finalScore,
        maxScore: totalPossible,
        percentage,
        grade: gradeFor(percentage),
        passed,
        correctCount,
        wrongCount,
        unansweredCount,
      },
    });
  }
}
