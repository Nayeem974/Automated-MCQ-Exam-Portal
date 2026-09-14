import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { Role } from '../common/enums/role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const SALT_ROUNDS = 10;
const SAFE_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  findAll(role?: Role) {
    return this.prisma.user.findMany({
      where: role ? { role } : undefined,
      select: SAFE_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: SAFE_SELECT });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(actingAdminId: string, dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: { email: dto.email, passwordHash, name: dto.name, role: dto.role },
      select: SAFE_SELECT,
    });

    await this.auditLog.log({
      userId: actingAdminId,
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: user.id,
      metadata: { role: user.role },
    });
    return user;
  }

  async update(actingAdminId: string, id: string, dto: UpdateUserDto) {
    await this.findOne(id);

    if (dto.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (existing && existing.id !== id) throw new ConflictException('Email already in use');
    }

    const data: Record<string, unknown> = {};
    if (dto.email) data.email = dto.email;
    if (dto.name) data.name = dto.name;
    if (dto.role) data.role = dto.role;
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.prisma.user.update({ where: { id }, data, select: SAFE_SELECT });
    await this.auditLog.log({
      userId: actingAdminId,
      action: 'USER_UPDATED',
      entityType: 'User',
      entityId: id,
      metadata: { fields: Object.keys(data) },
    });
    return user;
  }

  async setActive(actingAdminId: string, id: string, isActive: boolean) {
    await this.findOne(id);
    const user = await this.prisma.user.update({ where: { id }, data: { isActive }, select: SAFE_SELECT });
    await this.auditLog.log({
      userId: actingAdminId,
      action: isActive ? 'USER_ENABLED' : 'USER_DISABLED',
      entityType: 'User',
      entityId: id,
    });
    return user;
  }

  // Deleting is only safe when the user has no dependent records (courses
  // taught, questions/exams authored, attempts). Otherwise we tell the
  // caller to disable the account instead of deleting it.
  async remove(actingAdminId: string, id: string) {
    await this.findOne(id);

    const [coursesTaught, questionsCreated, examsCreated, attempts] = await Promise.all([
      this.prisma.course.count({ where: { teacherId: id } }),
      this.prisma.question.count({ where: { createdById: id } }),
      this.prisma.exam.count({ where: { createdById: id } }),
      this.prisma.attempt.count({ where: { studentId: id } }),
    ]);

    if (coursesTaught || questionsCreated || examsCreated || attempts) {
      throw new BadRequestException(
        'This user has existing courses, questions, exams, or exam attempts and cannot be deleted. Disable the account instead.',
      );
    }

    await this.prisma.enrollment.deleteMany({ where: { studentId: id } });
    await this.prisma.user.delete({ where: { id } });
    await this.auditLog.log({ userId: actingAdminId, action: 'USER_DELETED', entityType: 'User', entityId: id });
    return { deleted: true };
  }
}
