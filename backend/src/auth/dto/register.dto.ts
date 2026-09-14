import { IsEmail, IsString, MinLength } from 'class-validator';

// Public self-registration always creates a STUDENT account.
// Admin and Teacher accounts are created by an admin via /users (or the seed script).
export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;
}
