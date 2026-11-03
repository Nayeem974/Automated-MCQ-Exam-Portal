import { IsEmail, IsIn, IsString } from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  // Admin can log in, but Admin is intentionally excluded from public registration.
  @IsIn([Role.ADMIN, Role.STUDENT, Role.TEACHER])
  role: Role.ADMIN | Role.STUDENT | Role.TEACHER;
}
