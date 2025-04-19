/* eslint-disable @typescript-eslint/await-thenable */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MobileAuthController } from './controllers/mobile-auth.controller';
import { MobileAuthService } from './services/mobile-auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { MobileUser } from './entities/mobile-user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { VerificationCode } from './entities/verification-code.entity';
import { Interests } from '../interests/user-interests.entity';
import { SendGridProvider } from '../../providers/notifications/email/sendgrid.provider';
import { TwilioProvider } from '../../providers/notifications/sms/twilio.provider';
import { SocialAuthService } from './services/social-auth.service';
import { SocialAuthController } from './controllers/social-auth.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { MobileUserService } from './services/mobile-user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MobileUser,
      VerificationCode,
      RefreshToken,
      Interests,
    ]),
    PassportModule.register({ defaultStrategy: 'mobile-jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: await configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: await configService.get<string>(
            'JWT_ACCESS_EXPIRATION',
            '15m',
          ),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [MobileAuthController, SocialAuthController],
  providers: [
    MobileAuthService,
    MobileUserService,
    SocialAuthService,
    SendGridProvider,
    TwilioProvider,
    JwtStrategy,
    JwtAuthGuard,
    GoogleStrategy,
    {
      provide: 'APP_GUARD',
      useClass: JwtAuthGuard,
    },
  ],
  exports: [
    MobileAuthService,
    SocialAuthService,
    JwtAuthGuard,
    MobileUserService,
  ],
})
export class MobileAuthModule {}
