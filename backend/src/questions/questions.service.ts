import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  // Enforced on every create/update: a normal single-answer MCQ must have
  // exactly one correct option, and at least two options total.
  private validateOptions(options: { isCorrect: boolean }[]) {
    if (options.length < 2) throw new BadRequestException('A question needs at least 2 options');
    const correctCount = options.filter((o) => o.isCorrect).length;
    if (correctCount !== 1) {
      throw new BadRequestException('Exactly one option must be marked as the correct answer');
    }
  }

  async create(createdById: string, dto: CreateQuestionDto) {
    this.validateOptions(dto.options);

    const question = await this.prisma.question.create({
      data: {
        courseId: dto.courseId,
        createdById,
        text: dto.text,
        explanation: dto.explanation,
        difficulty: dto.difficulty,
        marks: dto.marks ?? 1,
        negativeMarks: dto.negativeMarks ?? 0,
        options: { create: dto.options },
      },
      include: { options: true },
    });

    await this.auditLog.log({
      userId: createdById,
      action: 'QUESTION_CREATED',
      entityType: 'Question',
      entityId: question.id,
    });
    return question;
  }

  findByCourse(courseId: string, search?: string, difficulty?: string) {
    return this.prisma.question.findMany({
      where: {
        courseId,
        ...(search ? { text: { contains: search, mode: 'insensitive' } } : {}),
        ...(difficulty ? { difficulty: difficulty as any } : {}),
      },
      include: { options: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const question = await this.prisma.question.findUnique({ where: { id }, include: { options: true } });
    if (!question) throw new NotFoundException('Question not found');
    return question;
  }

  async update(userId: string, id: string, dto: UpdateQuestionDto) {
    const question = await this.assertOwnership(id, userId);
    if (dto.options) this.validateOptions(dto.options);

    // Options are replaced wholesale on edit rather than diffed — simpler
    // and safe here because an edited question isn't mid-attempt (once an
    // exam attempt captures answers, this only affects future attempts).
    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.options) {
        await tx.option.deleteMany({ where: { questionId: id } });
      }
      return tx.question.update({
        where: { id },
        data: {
          text: dto.text ?? question.text,
          explanation: dto.explanation ?? question.explanation,
          difficulty: dto.difficulty ?? question.difficulty,
          marks: dto.marks ?? question.marks,
          negativeMarks: dto.negativeMarks ?? question.negativeMarks,
          ...(dto.options ? { options: { create: dto.options } } : {}),
        },
        include: { options: true },
      });
    });

    await this.auditLog.log({ userId, action: 'QUESTION_UPDATED', entityType: 'Question', entityId: id });
    return updated;
  }

  async remove(userId: string, id: string) {
    await this.assertOwnership(id, userId);

    const usedInExam = await this.prisma.examQuestion.count({ where: { questionId: id } });
    if (usedInExam > 0) {
      throw new BadRequestException(
        'This question is used in one or more exams and cannot be deleted. Remove it from those exams first.',
      );
    }

    await this.prisma.question.delete({ where: { id } });
    await this.auditLog.log({ userId, action: 'QUESTION_DELETED', entityType: 'Question', entityId: id });
    return { deleted: true };
  }

  private async assertOwnership(id: string, userId: string) {
    const question = await this.prisma.question.findUnique({ where: { id } });
    if (!question) throw new NotFoundException('Question not found');
    if (question.createdById !== userId) throw new ForbiddenException('You do not own this question');
    return question;
  }
}
