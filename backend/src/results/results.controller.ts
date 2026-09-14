import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ResultsService } from './results.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('results')
export class ResultsController {
  constructor(private resultsService: ResultsService) {}

  @Roles(Role.STUDENT)
  @Get()
  findAll(@Req() req: any) {
    return this.resultsService.findAllForStudent(req.user.userId);
  }

  @Roles(Role.TEACHER)
  @Get('exam')
  findAllForExam(@Req() req: any, @Query('examId') examId: string) {
    return this.resultsService.findAllForExam(req.user.userId, examId);
  }

  @Roles(Role.STUDENT)
  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.resultsService.findOne(req.user.userId, id);
  }
}
