import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
@Controller('attempts')
export class AttemptsController {
  constructor(private attemptsService: AttemptsService) {}

  // Starts a new attempt, or transparently resumes an in-progress one for
  // this student+exam if it exists (see AttemptsService.start).
  @Post('start/:examId')
  start(@Req() req: any, @Param('examId') examId: string) {
    return this.attemptsService.start(req.user.userId, examId);
  }

  @Get(':id')
  getView(@Req() req: any, @Param('id') attemptId: string) {
    return this.attemptsService.getAttemptView(req.user.userId, attemptId);
  }

  @Post(':id/answer')
  saveAnswer(
    @Req() req: any,
    @Param('id') attemptId: string,
    @Body() body: { questionId: string; selectedOptionId: string | null },
  ) {
    return this.attemptsService.saveAnswer(req.user.userId, attemptId, body.questionId, body.selectedOptionId);
  }

  @Post(':id/submit')
  submit(@Req() req: any, @Param('id') attemptId: string) {
    return this.attemptsService.submit(req.user.userId, attemptId);
  }
}
