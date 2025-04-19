import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationTestController } from './notification-test.controller';
import { SendGridProvider } from '../../../providers/notifications/email/sendgrid.provider';
import { NotificationProviderModule } from '../../../providers/notifications/notification.module';
import { TwilioProvider } from '../../../providers/notifications/sms/twilio.provider';

@Module({
  imports: [ConfigModule, NotificationProviderModule.forRoot()],
  controllers: [NotificationTestController],
  providers: [
    SendGridProvider,
    TwilioProvider,
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: (configService: ConfigService) => {
        // Skip Firebase initialization in test module
        return null;
      },
      inject: [ConfigService],
    },
  ],
})
export class NotificationTestModule {}
