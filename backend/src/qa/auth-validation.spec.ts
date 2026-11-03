import 'reflect-metadata';
import { validate } from 'class-validator';
import { LoginDto } from '../auth/dto/login.dto';
import { RegisterDto } from '../auth/dto/register.dto';

describe('Auth DTO validation — equivalence partitions and boundaries', () => {
  it('accepts a syntactically valid email/password login', async () => {
    const dto = Object.assign(new LoginDto(), {
      email: 'student@example.com',
      password: 'password123',
      role: 'STUDENT',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects an invalid email partition', async () => {
    const dto = Object.assign(new LoginDto(), {
      email: 'not-an-email',
      password: 'password123',
      role: 'STUDENT',
    });

    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'email')).toBe(true);
  });

  it('accepts the minimum eight-character registration password', async () => {
    const dto = Object.assign(new RegisterDto(), {
      email: 'student@example.com',
      password: '12345678',
      name: 'Student',
      role: 'STUDENT',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects a seven-character registration password at the lower boundary', async () => {
    const dto = Object.assign(new RegisterDto(), {
      email: 'student@example.com',
      password: '1234567',
      name: 'Student',
      role: 'STUDENT',
    });

    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'password')).toBe(true);
  });
});
