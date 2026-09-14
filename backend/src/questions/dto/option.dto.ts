import { IsBoolean, IsString, MinLength } from 'class-validator';

export class OptionDto {
  @IsString()
  @MinLength(1)
  text: string;

  @IsBoolean()
  isCorrect: boolean;
}
