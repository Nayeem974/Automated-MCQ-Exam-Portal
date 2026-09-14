import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  async create(teacherId: string, dto: CreateCourseDto) {
    const course = await this.prisma.course.create({
      data: { title: dto.title, description: dto.description, teacherId },
    });
    await this.auditLog.log({ userId: teacherId, action: 'COURSE_CREATED', entityType: 'Course', entityId: course.id });
    return course;
  }

  findAllForTeacher(teacherId: string) {
    return this.prisma.course.findMany({
      where: { teacherId },
      include: { _count: { select: { questions: true, exams: true, enrollments: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAllForStudent(studentId: string) {
    return this.prisma.course.findMany({
      where: { enrollments: { some: { studentId } } },
    });
  }

  findAll() {
    return this.prisma.course.findMany({
      include: {
        teacher: { select: { name: true, email: true } },
        _count: { select: { questions: true, exams: true, enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { teacher: { select: { id: true, name: true, email: true } } },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async update(teacherId: string, id: string, dto: UpdateCourseDto) {
    const course = await this.assertOwnership(id, teacherId);
    const updated = await this.prisma.course.update({
      where: { id },
      data: { title: dto.title ?? course.title, description: dto.description ?? course.description },
    });
    await this.auditLog.log({ userId: teacherId, action: 'COURSE_UPDATED', entityType: 'Course', entityId: id });
    return updated;
  }

  async remove(teacherId: string, id: string) {
    await this.assertOwnership(id, teacherId);

    const [questionCount, examCount] = await Promise.all([
      this.prisma.question.count({ where: { courseId: id } }),
      this.prisma.exam.count({ where: { courseId: id } }),
    ]);
    if (questionCount || examCount) {
      throw new BadRequestException(
        'This course still has questions or exams attached. Remove those first, or leave the course in place.',
      );
    }

    await this.prisma.enrollment.deleteMany({ where: { courseId: id } });
    await this.prisma.course.delete({ where: { id } });
    await this.auditLog.log({ userId: teacherId, action: 'COURSE_DELETED', entityType: 'Course', entityId: id });
    return { deleted: true };
  }

  async enroll(studentId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    return this.prisma.enrollment.upsert({
      where: { studentId_courseId: { studentId, courseId } },
      update: {},
      create: { studentId, courseId },
    });
  }

  // Confirms the course exists and belongs to this teacher; used before
  // any mutating action so a teacher can't edit another teacher's course.
  private async assertOwnership(courseId: string, teacherId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.teacherId !== teacherId) throw new ForbiddenException('You do not own this course');
    return course;
  }
}
