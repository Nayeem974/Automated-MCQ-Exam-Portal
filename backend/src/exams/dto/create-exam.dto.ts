import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateExamDto {
  @IsUUID()
  courseId: string;

  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(1, { message: 'Duration must be at least 1 minute' })
  durationMinutes: number;

  @IsInt()
  @Min(1)
  questionsPerAttempt: number;

  @IsNumber()
  @Min(0)
  @Max(100, { message: 'Passing mark is a percentage between 0 and 100' })
  passingMark: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxAttempts?: number;

  @IsOptional()
  @IsBoolean()
  revealAnswers?: boolean;

  @IsOptional()
  @IsBoolean()
  randomizeQuestions?: boolean;

  @IsOptional()
  @IsBoolean()
  randomizeOptions?: boolean;

  @IsOptional()
  @IsDateString()
  scheduledStart?: string;

  @IsOptional()
  @IsDateString()
  scheduledEnd?: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Select at least one question for the pool' })
  @IsUUID('4', { each: true })
  questionIds: string[];
}
