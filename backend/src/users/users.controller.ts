import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll(@Query('role') role?: Role) {
    return this.usersService.findAll(role);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateUserDto) {
    return this.usersService.create(req.user.userId, dto);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(req.user.userId, id, dto);
  }

  @Patch(':id/active')
  setActive(@Req() req: any, @Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.usersService.setActive(req.user.userId, id, isActive);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.usersService.remove(req.user.userId, id);
  }
}
