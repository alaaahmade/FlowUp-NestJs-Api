import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserActivity } from './user-activity.entity';
import { UserActivityService } from './user-activity.service';
import { UserActivityController } from './user-activity.controller';
import { GoogleAnalyticsService } from '../analytics/google-analytics.service';
import { AppConfigModule } from '../../config/config.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserActivity]), AppConfigModule],
  providers: [UserActivityService, GoogleAnalyticsService],
  controllers: [UserActivityController],
  exports: [UserActivityService],
})
export class UserActivityModule {}
