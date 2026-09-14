import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { AttemptStatus, ExamStatus } from '@prisma/client';
import { EvaluationService } from '../evaluation/evaluation.service';
import { AnalyticsService } from '../analytics/analytics.service';

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// One entry per question in the attempt's frozen order, with the option
// display order frozen alongside it — this is what makes a refresh (or a
// slow connection) show the exact same question/option layout every time.
interface QuestionOrderEntry {
  questionId: string;
  optionIds: string[];
}

@Injectable()
export class AttemptsService {
  constructor(
    private prisma: PrismaService,
    private evaluation: EvaluationService,
    private analytics: AnalyticsService,
  ) {}

  // Section 5 of the pipeline: pick a random subset of the question pool,
  // shuffle question order AND option order, then freeze both into
  // `questionOrder` for the lifetime of the attempt.
  async start(studentId: string, examId: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      include: { pool: { include: { question: { include: { options: true } } } } },
    });
    if (!exam) throw new NotFoundException('Exam not found');
    if (exam.status !== ExamStatus.PUBLISHED) throw new BadRequestException('This exam is not published');

    const now = new Date();
    if (exam.scheduledStart && now < exam.scheduledStart) {
      throw new BadRequestException('This exam has not started yet');
    }
    if (exam.scheduledEnd && now > exam.scheduledEnd) {
      throw new BadRequestException('This exam has already ended');
    }

    // Resume an in-progress attempt rather than starting a fresh one.
    const existing = await this.prisma.attempt.findFirst({
      where: { examId, studentId, status: AttemptStatus.IN_PROGRESS },
    });
    if (existing) {
      const expired = this.hasExpired(existing.startedAt, exam.durationMinutes);
      if (!expired) return existing;
      await this.finalizeExpired(existing.id);
      // fall through — the expired attempt is now closed, so a fresh one may be allowed below
    }

    if (exam.maxAttempts) {
      const usedAttempts = await this.prisma.attempt.count({
        where: { examId, studentId, status: { not: AttemptStatus.IN_PROGRESS } },
      });
      if (usedAttempts >= exam.maxAttempts) {
        throw new BadRequestException(`Maximum attempts (${exam.maxAttempts}) reached for this exam`);
      }
    }

    const poolQuestions = exam.pool.map((p) => p.question);
    const selectedQuestions = exam.randomizeQuestions
      ? shuffle(poolQuestions).slice(0, exam.questionsPerAttempt)
      : poolQuestions.slice(0, exam.questionsPerAttempt);

    const questionOrder: QuestionOrderEntry[] = selectedQuestions.map((q) => ({
      questionId: q.id,
      optionIds: (exam.randomizeOptions ? shuffle(q.options) : q.options).map((o) => o.id),
    }));

    const attempt = await this.prisma.attempt.create({
      data: {
        examId,
        studentId,
        questionOrder: questionOrder as any,
        status: AttemptStatus.IN_PROGRESS,
      },
    });
    return attempt;
  }

  // Full state needed to render the exam-taking UI: frozen question/option
  // order, remaining time computed server-side, and any answers already saved.
  async getAttemptView(studentId: string, attemptId: string): Promise<any> {
    const attempt = await this.assertOwnership(attemptId, studentId);
    const exam = await this.prisma.exam.findUniqueOrThrow({ where: { id: attempt.examId } });

    if (attempt.status === AttemptStatus.IN_PROGRESS && this.hasExpired(attempt.startedAt, exam.durationMinutes)) {
      await this.finalizeExpired(attempt.id);
      return this.getAttemptView(studentId, attemptId); // re-read as SUBMITTED
    }

    const order = attempt.questionOrder as unknown as QuestionOrderEntry[];
    const questions = await this.prisma.question.findMany({
      where: { id: { in: order.map((o) => o.questionId) } },
      include: { options: { select: { id: true, text: true } } }, // isCorrect never sent to the client mid-exam
    });
    const questionById = new Map(questions.map((q) => [q.id, q]));

    const answers = await this.prisma.answer.findMany({ where: { attemptId } });
    const answerByQuestion = new Map(answers.map((a) => [a.questionId, a.selectedOptionId]));

    const orderedQuestions = order.map((entry) => {
      const q = questionById.get(entry.questionId)!;
      const optionById = new Map(q.options.map((o) => [o.id, o]));
      return {
        id: q.id,
        text: q.text,
        marks: q.marks,
        options: entry.optionIds.map((oid) => optionById.get(oid)!),
        selectedOptionId: answerByQuestion.get(q.id) ?? null,
      };
    });

    const elapsedSeconds = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000);
    const totalSeconds = exam.durationMinutes * 60;
    const remainingSeconds = attempt.status === AttemptStatus.IN_PROGRESS ? Math.max(0, totalSeconds - elapsedSeconds) : 0;

    return {
      attemptId: attempt.id,
      examId: exam.id,
      examTitle: exam.title,
      status: attempt.status,
      remainingSeconds,
      questions: orderedQuestions,
    };
  }

  // Auto-saves a single answer. Rejects question/option IDs that aren't
  // actually part of this attempt's frozen set — prevents a tampered
  // client from writing answers to arbitrary questions.
  async saveAnswer(studentId: string, attemptId: string, questionId: string, selectedOptionId: string | null) {
    const attempt = await this.assertOwnership(attemptId, studentId);
    await this.assertActiveAndNotExpired(attempt);

    const order = attempt.questionOrder as unknown as QuestionOrderEntry[];
    const entry = order.find((o) => o.questionId === questionId);
    if (!entry) throw new BadRequestException('This question is not part of your exam attempt');
    if (selectedOptionId && !entry.optionIds.includes(selectedOptionId)) {
      throw new BadRequestException('Invalid option for this question');
    }

    return this.prisma.answer.upsert({
      where: { attemptId_questionId: { attemptId: attempt.id, questionId } },
      update: { selectedOptionId },
      create: { attemptId: attempt.id, questionId, selectedOptionId },
    });
  }

  // Manual submission by the student.
  async submit(studentId: string, attemptId: string) {
    const attempt = await this.assertOwnership(attemptId, studentId);
    await this.assertActiveAndNotExpired(attempt);

    await this.prisma.attempt.update({
      where: { id: attemptId },
      data: { status: AttemptStatus.SUBMITTED, submittedAt: new Date() },
    });
    const result = await this.evaluation.evaluateAttempt(attemptId);
    await this.analytics.examSummary(attempt.examId); // recomputes ranks for the exam
    return result;
  }

  // Section 6: server-side timer enforcement. Runs periodically and
  // auto-submits any attempt whose exam duration has elapsed, independent
  // of whether the student's browser is even open.
  @Cron(CronExpression.EVERY_30_SECONDS)
  async autoSubmitExpiredAttempts() {
    const inProgress = await this.prisma.attempt.findMany({
      where: { status: AttemptStatus.IN_PROGRESS },
      include: { exam: true },
    });

    const examIdsToRerank = new Set<string>();
    for (const attempt of inProgress) {
      if (this.hasExpired(attempt.startedAt, attempt.exam.durationMinutes)) {
        await this.finalizeExpired(attempt.id);
        examIdsToRerank.add(attempt.examId);
      }
    }
    for (const examId of examIdsToRerank) {
      await this.analytics.examSummary(examId);
    }
  }

  private hasExpired(startedAt: Date, durationMinutes: number): boolean {
    return Date.now() >= startedAt.getTime() + durationMinutes * 60_000;
  }

  private async finalizeExpired(attemptId: string) {
    await this.prisma.attempt.update({
      where: { id: attemptId },
      data: { status: AttemptStatus.AUTO_SUBMITTED, submittedAt: new Date() },
    });
    await this.evaluation.evaluateAttempt(attemptId);
  }

  private async assertOwnership(attemptId: string, studentId: string) {
    const attempt = await this.prisma.attempt.findUnique({ where: { id: attemptId } });
    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.studentId !== studentId) throw new ForbiddenException('This is not your exam attempt');
    return attempt;
  }

  private async assertActiveAndNotExpired(attempt: { id: string; status: AttemptStatus; startedAt: Date; examId: string }) {
    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('This attempt has already been submitted');
    }
    const exam = await this.prisma.exam.findUniqueOrThrow({ where: { id: attempt.examId } });
    if (this.hasExpired(attempt.startedAt, exam.durationMinutes)) {
      await this.finalizeExpired(attempt.id);
      throw new BadRequestException('Time is up — this attempt was automatically submitted');
    }
  }
}
