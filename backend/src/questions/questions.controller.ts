import { Body, Controller, Get, Post, Patch, Delete, Param, Query, Req, UseGuards } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TEACHER)
@Controller('questions')
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateQuestionDto) {
    return this.questionsService.create(req.user.userId, dto);
  }

  @Get()
  findByCourse(
    @Query('courseId') courseId: string,
    @Query('search') search?: string,
    @Query('difficulty') difficulty?: string,
  ) {
    return this.questionsService.findByCourse(courseId, search, difficulty);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateQuestionDto) {
    return this.questionsService.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.questionsService.remove(req.user.userId, id);
  }
}
