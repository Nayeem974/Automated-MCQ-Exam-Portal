import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;

  @IsIn([Role.STUDENT, Role.TEACHER])
  role: Role.STUDENT | Role.TEACHER;
}
