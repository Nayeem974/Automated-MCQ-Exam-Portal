import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  // Fire-and-forget style logging; failures here should never break the
  // calling request, so we swallow errors after logging to stderr.
  async log(params: {
    userId?: string | null;
    action: string;
    entityType?: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: params.userId ?? undefined,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          metadata: params.metadata as any,
        },
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Audit log write failed:', err);
    }
  }

  findAll(limit = 100) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { user: { select: { name: true, email: true, role: true } } },
    });
  }
}
