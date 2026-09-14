import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OptionDto } from './option.dto';
import { Difficulty } from '../questions.constants';

export class CreateQuestionDto {
  @IsUUID()
  courseId: string;

  @IsString()
  @MinLength(3)
  text: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @IsOptional()
  @IsNumber()
  @Min(0.25)
  marks?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  negativeMarks?: number;

  @IsArray()
  @ArrayMinSize(2, { message: 'A question needs at least 2 options' })
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options: OptionDto[];
}
