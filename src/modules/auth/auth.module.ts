/* eslint-disable @typescript-eslint/await-thenable */
import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';
import { AppleStrategy } from './strategies/apple.strategy';
import { AppConfigModule } from '../../config/config.module';
import { VerificationService } from './verification.service';
import { VerificationCode } from './entities/verification-code.entity';
import { MessagingModule } from '../messaging/messaging.module';

@Module({
  imports: [
    AppConfigModule,
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([User, Role, VerificationCode]),
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: await configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn:
            (await configService.get<string>('JWT_EXPIRES_IN')) || '3600s',
        },
      }),
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MessagingModule,
  ],
  providers: [
    AuthService,
    GoogleStrategy,
    AppleStrategy,
    JwtStrategy,
    VerificationService,
  ],
  controllers: [AuthController],
  exports: [AuthService, VerificationService],
})
export class AuthModule {}
