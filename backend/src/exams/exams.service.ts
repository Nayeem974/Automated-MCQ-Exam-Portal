import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { ExamStatus } from '@prisma/client';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';

@Injectable()
export class ExamsService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  private validateRules(input: {
    questionsPerAttempt: number;
    poolSize: number;
    scheduledStart?: string | null;
    scheduledEnd?: string | null;
  }) {
    if (input.questionsPerAttempt > input.poolSize) {
      throw new BadRequestException(
        `questionsPerAttempt (${input.questionsPerAttempt}) cannot exceed the question pool size (${input.poolSize})`,
      );
    }
    if (input.scheduledStart && input.scheduledEnd) {
      if (new Date(input.scheduledEnd) <= new Date(input.scheduledStart)) {
        throw new BadRequestException('scheduledEnd must be after scheduledStart');
      }
    }
  }

  async create(createdById: string, dto: CreateExamDto) {
    this.validateRules({
      questionsPerAttempt: dto.questionsPerAttempt,
      poolSize: dto.questionIds.length,
      scheduledStart: dto.scheduledStart,
      scheduledEnd: dto.scheduledEnd,
    });

    const exam = await this.prisma.exam.create({
      data: {
        courseId: dto.courseId,
        createdById,
        title: dto.title,
        description: dto.description,
        durationMinutes: dto.durationMinutes,
        questionsPerAttempt: dto.questionsPerAttempt,
        passingMark: dto.passingMark,
        maxAttempts: dto.maxAttempts,
        revealAnswers: dto.revealAnswers ?? false,
        randomizeQuestions: dto.randomizeQuestions ?? true,
        randomizeOptions: dto.randomizeOptions ?? true,
        scheduledStart: dto.scheduledStart ? new Date(dto.scheduledStart) : undefined,
        scheduledEnd: dto.scheduledEnd ? new Date(dto.scheduledEnd) : undefined,
        pool: { create: dto.questionIds.map((questionId) => ({ questionId })) },
      },
      include: { pool: true },
    });

    await this.auditLog.log({ userId: createdById, action: 'EXAM_CREATED', entityType: 'Exam', entityId: exam.id });
    return exam;
  }

  async update(teacherId: string, id: string, dto: UpdateExamDto) {
    const exam = await this.assertOwnership(id, teacherId);

    const attemptCount = await this.prisma.attempt.count({ where: { examId: id } });
    if (attemptCount > 0) {
      throw new BadRequestException('This exam already has student attempts and can no longer be edited');
    }

    const poolSize = dto.questionIds ? dto.questionIds.length : await this.prisma.examQuestion.count({ where: { examId: id } });
    this.validateRules({
      questionsPerAttempt: dto.questionsPerAttempt ?? exam.questionsPerAttempt,
      poolSize,
      scheduledStart: dto.scheduledStart ?? exam.scheduledStart?.toISOString() ?? null,
      scheduledEnd: dto.scheduledEnd ?? exam.scheduledEnd?.toISOString() ?? null,
    });

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.questionIds) {
        await tx.examQuestion.deleteMany({ where: { examId: id } });
      }
      return tx.exam.update({
        where: { id },
        data: {
          title: dto.title ?? exam.title,
          description: dto.description ?? exam.description,
          durationMinutes: dto.durationMinutes ?? exam.durationMinutes,
          questionsPerAttempt: dto.questionsPerAttempt ?? exam.questionsPerAttempt,
          passingMark: dto.passingMark ?? exam.passingMark,
          maxAttempts: dto.maxAttempts ?? exam.maxAttempts,
          revealAnswers: dto.revealAnswers ?? exam.revealAnswers,
          randomizeQuestions: dto.randomizeQuestions ?? exam.randomizeQuestions,
          randomizeOptions: dto.randomizeOptions ?? exam.randomizeOptions,
          scheduledStart: dto.scheduledStart ? new Date(dto.scheduledStart) : exam.scheduledStart,
          scheduledEnd: dto.scheduledEnd ? new Date(dto.scheduledEnd) : exam.scheduledEnd,
          ...(dto.questionIds
            ? { pool: { create: dto.questionIds.map((questionId) => ({ questionId })) } }
            : {}),
        },
        include: { pool: true },
      });
    });

    await this.auditLog.log({ userId: teacherId, action: 'EXAM_UPDATED', entityType: 'Exam', entityId: id });
    return updated;
  }

  async remove(teacherId: string, id: string) {
    await this.assertOwnership(id, teacherId);
    const attemptCount = await this.prisma.attempt.count({ where: { examId: id } });
    if (attemptCount > 0) {
      throw new BadRequestException('This exam already has student attempts and cannot be deleted');
    }
    await this.prisma.examQuestion.deleteMany({ where: { examId: id } });
    await this.prisma.exam.delete({ where: { id } });
    await this.auditLog.log({ userId: teacherId, action: 'EXAM_DELETED', entityType: 'Exam', entityId: id });
    return { deleted: true };
  }

  async publish(teacherId: string, id: string) {
    const exam = await this.assertOwnership(id, teacherId);
    const poolSize = await this.prisma.examQuestion.count({ where: { examId: id } });
    if (poolSize < exam.questionsPerAttempt) {
      throw new BadRequestException(
        `Cannot publish: the question pool (${poolSize}) is smaller than questionsPerAttempt (${exam.questionsPerAttempt})`,
      );
    }
    const updated = await this.prisma.exam.update({ where: { id }, data: { status: ExamStatus.PUBLISHED } });
    await this.auditLog.log({ userId: teacherId, action: 'EXAM_PUBLISHED', entityType: 'Exam', entityId: id });
    return updated;
  }

  async close(teacherId: string, id: string) {
    await this.assertOwnership(id, teacherId);
    const updated = await this.prisma.exam.update({ where: { id }, data: { status: ExamStatus.CLOSED } });
    await this.auditLog.log({ userId: teacherId, action: 'EXAM_CLOSED', entityType: 'Exam', entityId: id });
    return updated;
  }

  findAllForTeacher(createdById: string) {
    return this.prisma.exam.findMany({
      where: { createdById },
      include: { pool: true, _count: { select: { attempts: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAllForAdmin() {
    return this.prisma.exam.findMany({
      include: {
        course: { select: { title: true } },
        createdBy: { select: { name: true, email: true } },
        _count: { select: { attempts: true, pool: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: { pool: { include: { question: true } }, course: true },
    });
    if (!exam) throw new NotFoundException('Exam not found');
    return exam;
  }

  // Only published exams within their schedule window are "available" to students.
  findAvailableForStudent(courseIds: string[]) {
    const now = new Date();
    return this.prisma.exam.findMany({
      where: {
        courseId: { in: courseIds },
        status: ExamStatus.PUBLISHED,
        OR: [{ scheduledStart: null }, { scheduledStart: { lte: now } }],
        AND: [{ OR: [{ scheduledEnd: null }, { scheduledEnd: { gte: now } }] }],
      },
    });
  }

  private async assertOwnership(id: string, teacherId: string) {
    const exam = await this.prisma.exam.findUnique({ where: { id } });
    if (!exam) throw new NotFoundException('Exam not found');
    if (exam.createdById !== teacherId) throw new ForbiddenException('You do not own this exam');
    return exam;
  }
}
