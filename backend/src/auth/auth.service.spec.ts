import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { Role } from '../common/enums/role.enum';

describe('AuthService', () => {
  function buildDeps() {
    const prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };
    const jwt = { sign: jest.fn().mockReturnValue('signed.jwt.token') };
    const auditLog = { log: jest.fn().mockResolvedValue(undefined) };
    return { prisma, jwt, auditLog };
  }

  it('registers a new STUDENT account when STUDENT is selected', async () => {
    const { prisma, jwt, auditLog } = buildDeps();
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockImplementation(({ data }) => Promise.resolve({ id: 'u1', ...data }));

    const service = new AuthService(prisma as any, jwt as any, auditLog as any);
    const result = await service.register({
      email: 'new@example.com',
      password: 'password123',
      name: 'New Student',
      role: Role.STUDENT,
    });

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: Role.STUDENT }),
      }),
    );
    expect(result.user.role).toBe(Role.STUDENT);
  });

  it('registers a new TEACHER account when TEACHER is selected', async () => {
    const { prisma, jwt, auditLog } = buildDeps();
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockImplementation(({ data }) => Promise.resolve({ id: 'u2', ...data }));

    const service = new AuthService(prisma as any, jwt as any, auditLog as any);
    const result = await service.register({
      email: 'teacher@example.com',
      password: 'password123',
      name: 'New Teacher',
      role: Role.TEACHER,
    });

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: Role.TEACHER }),
      }),
    );
    expect(result.user.role).toBe(Role.TEACHER);
  });

  it('rejects registration when the requested role is ADMIN', async () => {
    const { prisma, jwt, auditLog } = buildDeps();
    prisma.user.findUnique.mockResolvedValue(null);
    const service = new AuthService(prisma as any, jwt as any, auditLog as any);

    await expect(
      service.register({
        email: 'admin@example.com',
        password: 'password123',
        name: 'Admin',
        role: Role.ADMIN,
      } as any),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('rejects registration when the email is already taken', async () => {
    const { prisma, jwt, auditLog } = buildDeps();
    prisma.user.findUnique.mockResolvedValue({ id: 'existing' });
    const service = new AuthService(prisma as any, jwt as any, auditLog as any);

    await expect(
      service.register({
        email: 'taken@example.com',
        password: 'password123',
        name: 'X',
        role: Role.STUDENT,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('logs in successfully when the selected role matches the account role', async () => {
    const { prisma, jwt, auditLog } = buildDeps();
    const passwordHash = await bcrypt.hash('correct-password', 10);
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'user@example.com',
      passwordHash,
      role: Role.TEACHER,
      isActive: true,
    });
    const service = new AuthService(prisma as any, jwt as any, auditLog as any);

    const result = await service.login({
      email: 'user@example.com',
      password: 'correct-password',
      role: Role.TEACHER,
    });

    expect(result.accessToken).toBe('signed.jwt.token');
    expect(result.user.role).toBe(Role.TEACHER);
  });

  it('logs in successfully as ADMIN when the selected role matches the account role', async () => {
    const { prisma, jwt, auditLog } = buildDeps();
    const passwordHash = await bcrypt.hash('admin-password', 10);
    prisma.user.findUnique.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
    });
    const service = new AuthService(prisma as any, jwt as any, auditLog as any);

    const result = await service.login({
      email: 'admin@example.com',
      password: 'admin-password',
      role: Role.ADMIN,
    });

    expect(result.accessToken).toBe('signed.jwt.token');
    expect(result.user.role).toBe(Role.ADMIN);
  });

  it('rejects login when the selected role does not match the account role', async () => {
    const { prisma, jwt, auditLog } = buildDeps();
    const passwordHash = await bcrypt.hash('correct-password', 10);
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'user@example.com',
      passwordHash,
      role: Role.TEACHER,
      isActive: true,
    });
    const service = new AuthService(prisma as any, jwt as any, auditLog as any);

    await expect(
      service.login({
        email: 'user@example.com',
        password: 'correct-password',
        role: Role.STUDENT,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects login with an incorrect password', async () => {
    const { prisma, jwt, auditLog } = buildDeps();
    const passwordHash = await bcrypt.hash('correct-password', 10);
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      passwordHash,
      role: Role.STUDENT,
      isActive: true,
    });
    const service = new AuthService(prisma as any, jwt as any, auditLog as any);

    await expect(
      service.login({
        email: 'user@example.com',
        password: 'wrong',
        role: Role.STUDENT,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects login for a disabled account even with the correct password', async () => {
    const { prisma, jwt, auditLog } = buildDeps();
    const passwordHash = await bcrypt.hash('correct-password', 10);
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      passwordHash,
      role: Role.STUDENT,
      isActive: false,
    });
    const service = new AuthService(prisma as any, jwt as any, auditLog as any);

    await expect(
      service.login({
        email: 'user@example.com',
        password: 'correct-password',
        role: Role.STUDENT,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
