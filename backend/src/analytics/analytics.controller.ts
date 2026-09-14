import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Roles(Role.ADMIN)
  @Get('admin/summary')
  adminSummary() {
    return this.analyticsService.adminSummary();
  }

  @Roles(Role.TEACHER)
  @Get('exams/:examId/summary')
  examSummary(@Param('examId') examId: string) {
    return this.analyticsService.examSummary(examId);
  }

  @Roles(Role.TEACHER)
  @Get('exams/:examId/questions')
  questionPerformance(@Param('examId') examId: string) {
    return this.analyticsService.questionPerformance(examId);
  }
}
