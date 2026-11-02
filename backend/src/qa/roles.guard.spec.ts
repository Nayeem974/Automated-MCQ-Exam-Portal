import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/enums/role.enum';

function buildContext(user: unknown): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as ExecutionContext;
}

describe('RolesGuard', () => {
  function buildGuard(requiredRoles: Role[]) {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(requiredRoles),
    } as unknown as Reflector;

    return new RolesGuard(reflector);
  }

  it('allows access when no roles are required', () => {
    const guard = buildGuard([]);
    expect(guard.canActivate(buildContext(undefined))).toBe(true);
  });

  it('allows a user whose role matches the required role', () => {
    const guard = buildGuard([Role.TEACHER]);
    expect(guard.canActivate(buildContext({ role: Role.TEACHER }))).toBe(true);
  });

  it('denies a user whose role does not match', () => {
    const guard = buildGuard([Role.ADMIN]);
    expect(guard.canActivate(buildContext({ role: Role.STUDENT }))).toBe(false);
  });

  it('denies access when the request has no authenticated user', () => {
    const guard = buildGuard([Role.STUDENT]);
    expect(guard.canActivate(buildContext(undefined))).toBe(false);
  });

  it('supports multiple allowed roles', () => {
    const guard = buildGuard([Role.ADMIN, Role.TEACHER]);
    expect(guard.canActivate(buildContext({ role: Role.TEACHER }))).toBe(true);
  });
});
