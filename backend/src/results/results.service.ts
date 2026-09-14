import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResultsService {
  constructor(private prisma: PrismaService) {}

  findAllForStudent(studentId: string) {
    return this.prisma.result.findMany({
      where: { attempt: { studentId } },
      include: { attempt: { include: { exam: { select: { title: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Full detail for one of the student's own results. Per-question
  // correct/wrong review is only included if the exam's teacher enabled
  // `revealAnswers` — otherwise the student only sees their own selection,
  // never the correct answer.
  async findOne(studentId: string, resultId: string) {
    const result = await this.prisma.result.findUnique({
      where: { id: resultId },
      include: {
        attempt: {
          include: {
            exam: true,
            answers: { include: { question: true, selectedOption: true } },
          },
        },
      },
    });
    if (!result) throw new NotFoundException('Result not found');
    if (result.attempt.studentId !== studentId) throw new ForbiddenException();

    const revealAnswers = result.attempt.exam.revealAnswers;
    const order = (result.attempt.questionOrder as any[]).map((e) => (typeof e === 'string' ? e : e.questionId));

    const questions = await this.prisma.question.findMany({
      where: { id: { in: order } },
      include: { options: true },
    });
    const questionById = new Map(questions.map((q) => [q.id, q]));

    const review = order.map((questionId) => {
      const q = questionById.get(questionId)!;
      const answer = result.attempt.answers.find((a) => a.questionId === questionId);
      return {
        questionId,
        text: q.text,
        options: q.options.map((o) => ({
          id: o.id,
          text: o.text,
          // Correct-answer and explanation are withheld unless the teacher opted in.
          ...(revealAnswers ? { isCorrect: o.isCorrect } : {}),
        })),
        selectedOptionId: answer?.selectedOptionId ?? null,
        isCorrect: revealAnswers ? answer?.isCorrect ?? null : undefined,
        explanation: revealAnswers ? q.explanation : undefined,
      };
    });

    return {
      id: result.id,
      examTitle: result.attempt.exam.title,
      score: result.score,
      maxScore: result.maxScore,
      percentage: result.percentage,
      grade: result.grade,
      passed: result.passed,
      correctCount: result.correctCount,
      wrongCount: result.wrongCount,
      unansweredCount: result.unansweredCount,
      rank: result.rank,
      submittedAt: result.attempt.submittedAt,
      revealAnswers,
      review,
    };
  }

  // Teacher view: every result for one of their exams (used by the
  // analytics/results page — names included since the teacher owns the class).
  async findAllForExam(teacherId: string, examId: string) {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new NotFoundException('Exam not found');
    if (exam.createdById !== teacherId) throw new ForbiddenException('You do not own this exam');

    return this.prisma.result.findMany({
      where: { attempt: { examId } },
      include: { attempt: { include: { student: { select: { name: true, email: true } } } } },
      orderBy: { score: 'desc' },
    });
  }
}
