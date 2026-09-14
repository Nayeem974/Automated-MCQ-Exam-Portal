import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttemptStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  // Recomputes class stats AND writes competition-style ranks (ties share a
  // rank; the next distinct score skips accordingly, e.g. 1,1,3,4).
  async examSummary(examId: string) {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new NotFoundException('Exam not found');

    const results = await this.prisma.result.findMany({
      where: { attempt: { examId } },
      orderBy: { score: 'desc' },
    });

    if (results.length === 0) {
      return { examId, attempts: 0, classAverage: 0, highestScore: 0, lowestScore: 0, passRate: 0 };
    }

    let rank = 0;
    let previousScore: number | null = null;
    for (let i = 0; i < results.length; i++) {
      if (results[i].score !== previousScore) rank = i + 1;
      previousScore = results[i].score;
      await this.prisma.result.update({ where: { id: results[i].id }, data: { rank } });
    }

    const scores = results.map((r) => r.score);
    const classAverage = scores.reduce((a, b) => a + b, 0) / scores.length;
    const passRate = (results.filter((r) => r.passed).length / results.length) * 100;

    return {
      examId,
      attempts: results.length,
      classAverage,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      passRate,
    };
  }

  // Per-question performance so a teacher can spot ambiguous/miscalibrated
  // questions (section 8's "Question Analysis").
  async questionPerformance(examId: string) {
    const examQuestions = await this.prisma.examQuestion.findMany({
      where: { examId },
      include: { question: true },
    });

    return Promise.all(
      examQuestions.map(async ({ question }) => {
        const answers = await this.prisma.answer.findMany({
          where: { questionId: question.id, attempt: { examId } },
        });
        const correct = answers.filter((a) => a.isCorrect).length;
        return {
          questionId: question.id,
          text: question.text,
          timesAnswered: answers.length,
          percentCorrect: answers.length ? (correct / answers.length) * 100 : 0,
        };
      }),
    );
  }

  // Admin-facing platform totals (section 2: "View Overall Stat"). All
  // real database counts, no static/placeholder numbers.
  async adminSummary() {
    const [totalStudents, totalTeachers, totalAdmins, totalCourses, totalExams, totalAttempts, publishedExams] =
      await Promise.all([
        this.prisma.user.count({ where: { role: 'STUDENT' } }),
        this.prisma.user.count({ where: { role: 'TEACHER' } }),
        this.prisma.user.count({ where: { role: 'ADMIN' } }),
        this.prisma.course.count(),
        this.prisma.exam.count(),
        this.prisma.attempt.count(),
        this.prisma.exam.count({ where: { status: 'PUBLISHED' } }),
      ]);

    const completedAttempts = await this.prisma.attempt.count({
      where: { status: { in: [AttemptStatus.SUBMITTED, AttemptStatus.AUTO_SUBMITTED] } },
    });

    return {
      totalStudents,
      totalTeachers,
      totalAdmins,
      totalCourses,
      totalExams,
      publishedExams,
      totalAttempts,
      completedAttempts,
    };
  }
}
