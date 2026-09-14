import { Body, Controller, Get, Param, Patch, Delete, Post, Req, UseGuards } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CoursesService } from '../courses/courses.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('exams')
export class ExamsController {
  constructor(
    private examsService: ExamsService,
    private coursesService: CoursesService,
  ) {}

  @Roles(Role.TEACHER)
  @Post()
  create(@Req() req: any, @Body() dto: CreateExamDto) {
    return this.examsService.create(req.user.userId, dto);
  }

  @Roles(Role.TEACHER)
  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateExamDto) {
    return this.examsService.update(req.user.userId, id, dto);
  }

  @Roles(Role.TEACHER)
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.examsService.remove(req.user.userId, id);
  }

  @Roles(Role.TEACHER)
  @Patch(':id/publish')
  publish(@Req() req: any, @Param('id') id: string) {
    return this.examsService.publish(req.user.userId, id);
  }

  @Roles(Role.TEACHER)
  @Patch(':id/close')
  close(@Req() req: any, @Param('id') id: string) {
    return this.examsService.close(req.user.userId, id);
  }

  @Roles(Role.ADMIN)
  @Get()
  findAllForAdmin() {
    return this.examsService.findAllForAdmin();
  }

  @Roles(Role.TEACHER)
  @Get('mine')
  findMine(@Req() req: any) {
    return this.examsService.findAllForTeacher(req.user.userId);
  }

  @Roles(Role.STUDENT)
  @Get('available')
  async findAvailable(@Req() req: any) {
    const courses = await this.coursesService.findAllForStudent(req.user.userId);
    return this.examsService.findAvailableForStudent(courses.map((c) => c.id));
  }

  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examsService.findOne(id);
  }
}
