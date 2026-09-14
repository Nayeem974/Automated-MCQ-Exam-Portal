import { Module } from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { AttemptsController } from './attempts.controller';
import { EvaluationModule } from '../evaluation/evaluation.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [EvaluationModule, AnalyticsModule],
  providers: [AttemptsService],
  controllers: [AttemptsController],
  exports: [AttemptsService],
})
export class AttemptsModule {}
