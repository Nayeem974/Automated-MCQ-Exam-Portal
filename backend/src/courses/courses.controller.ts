import { Body, Controller, Get, Post, Patch, Delete, Param, Req, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Roles(Role.TEACHER)
  @Post()
  create(@Req() req: any, @Body() dto: CreateCourseDto) {
    return this.coursesService.create(req.user.userId, dto);
  }

  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Roles(Role.TEACHER)
  @Get('mine')
  findMineAsTeacher(@Req() req: any) {
    return this.coursesService.findAllForTeacher(req.user.userId);
  }

  @Roles(Role.STUDENT)
  @Get('enrolled')
  findMineAsStudent(@Req() req: any) {
    return this.coursesService.findAllForStudent(req.user.userId);
  }

  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Roles(Role.TEACHER)
  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.update(req.user.userId, id, dto);
  }

  @Roles(Role.TEACHER)
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.coursesService.remove(req.user.userId, id);
  }

  @Roles(Role.STUDENT)
  @Post(':id/enroll')
  enroll(@Req() req: any, @Param('id') courseId: string) {
    return this.coursesService.enroll(req.user.userId, courseId);
  }
}
