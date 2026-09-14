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

  it('registers a new user as STUDENT regardless of any role field sent (public registration cannot self-elevate)', async () => {
    const { prisma, jwt, auditLog } = buildDeps();
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockImplementation(({ data }) => Promise.resolve({ id: 'u1', ...data }));

    const service = new AuthService(prisma as any, jwt as any, auditLog as any);
    const result = await service.register({ email: 'new@example.com', password: 'password123', name: 'New User' } as any);

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ role: Role.STUDENT }) }),
    );
    expect(result.user.role).toBe(Role.STUDENT);
    expect(result.accessToken).toBe('signed.jwt.token');
  });

  it('rejects registration when the email is already taken', async () => {
    const { prisma, jwt, auditLog } = buildDeps();
    prisma.user.findUnique.mockResolvedValue({ id: 'existing' });
    const service = new AuthService(prisma as any, jwt as any, auditLog as any);

    await expect(
      service.register({ email: 'taken@example.com', password: 'password123', name: 'X' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('logs in successfully with the correct password', async () => {
    const { prisma, jwt, auditLog } = buildDeps();
    const passwordHash = await bcrypt.hash('correct-password', 10);
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'user@example.com',
      passwordHash,
      role: Role.STUDENT,
      isActive: true,
    });
    const service = new AuthService(prisma as any, jwt as any, auditLog as any);

    const result = await service.login({ email: 'user@example.com', password: 'correct-password' });
    expect(result.accessToken).toBe('signed.jwt.token');
  });

  it('rejects login with an incorrect password', async () => {
    const { prisma, jwt, auditLog } = buildDeps();
    const passwordHash = await bcrypt.hash('correct-password', 10);
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', passwordHash, isActive: true });
    const service = new AuthService(prisma as any, jwt as any, auditLog as any);

    await expect(service.login({ email: 'user@example.com', password: 'wrong' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects login for a disabled account even with the correct password', async () => {
    const { prisma, jwt, auditLog } = buildDeps();
    const passwordHash = await bcrypt.hash('correct-password', 10);
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', passwordHash, isActive: false });
    const service = new AuthService(prisma as any, jwt as any, auditLog as any);

    await expect(service.login({ email: 'user@example.com', password: 'correct-password' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
