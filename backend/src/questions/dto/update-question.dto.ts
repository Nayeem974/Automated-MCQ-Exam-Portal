import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateQuestionDto } from './create-question.dto';

// courseId is fixed at creation time; everything else is editable.
export class UpdateQuestionDto extends PartialType(OmitType(CreateQuestionDto, ['courseId'] as const)) {}
