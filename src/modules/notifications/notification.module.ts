import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { FCMService } from './fcm.service';
import { AppConfigModule } from '../../config/config.module';
import { UsersModule } from '../users/users.module';
import { MobileAuthModule } from '../mobile-auth/mobile-auth.module';
import { ServicesModule } from '../services/services.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    AppConfigModule,
    UsersModule,
    MobileAuthModule,
    ServicesModule,
  ],
  providers: [NotificationService, FCMService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
