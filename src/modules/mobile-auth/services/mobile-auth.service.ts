import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, In, MoreThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  RegistrationDto,
  VerificationDto,
  RefreshTokenDto,
  CompleteRegistrationDto,
} from '../dto';
import { MobileUser } from '../entities/mobile-user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { VerificationCode } from '../entities/verification-code.entity';
import { Interests } from '../../interests/user-interests.entity';
import { randomBytes } from 'crypto';
import { SendGridProvider } from '../../../providers/notifications/email/sendgrid.provider';
import { TwilioProvider } from '../../../providers/notifications/sms/twilio.provider';
import { verificationTemplate } from '../../../providers/notifications/templates/email/verification.template';
import { smsVerificationTemplate } from '../../../providers/notifications/templates/sms/verification.template';
import { welcomeTemplate } from '../../../providers/notifications/templates/email/welcome.template';

@Injectable()
export class MobileAuthService {
  constructor(
    @InjectRepository(MobileUser)
    private readonly userRepository: Repository<MobileUser>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(VerificationCode)
    private readonly verificationCodeRepository: Repository<VerificationCode>,
    @InjectRepository(Interests)
    private readonly InterestsRepository: Repository<Interests>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sendGridProvider: SendGridProvider,
    private readonly twilioProvider: TwilioProvider,
  ) {}

  private generateVerificationCode(): string {
    return String(Math.floor(1000 + Math.random() * 9000)).padStart(4, '0');
  }

  private generateRefreshToken(): string {
    return randomBytes(40).toString('hex');
  }

  private async generateTokens(
    user: MobileUser,
    deviceId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
      {
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION', '15m'),
      },
    );

    const refreshToken = this.generateRefreshToken();
    const refreshTokenExpiration = new Date();
    refreshTokenExpiration.setDate(
      refreshTokenExpiration.getDate() +
        Number(this.configService.get('JWT_REFRESH_EXPIRATION_DAYS', '30')),
    );

    await this.refreshTokenRepository.save({
      token: refreshToken,
      user,
      expiresAt: refreshTokenExpiration,
      deviceId,
      ipAddress,
      userAgent,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: '15m',
      refreshExpiresIn: '30d',
    };
  }

  private isEmail(identifier: string): boolean {
    return identifier.includes('@');
  }

  async initiateRegistration(dto: RegistrationDto) {
    const { identifier } = dto;
    const isEmailIdentifier = this.isEmail(identifier);

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: isEmailIdentifier
        ? { email: identifier }
        : { phoneNumber: identifier },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // Generate verification code
    const code = this.generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 3); // 3 hours expiration

    // Save verification code
    await this.verificationCodeRepository.save({
      code,
      identifier,
      expiresAt,
      type: 'registration',
    });

    // Send verification code using templates
    if (isEmailIdentifier) {
      const emailContent = verificationTemplate.generateContent({
        code,
        expiresInMinutes: 180, // 3 hours in minutes
      });

      const result = await this.sendGridProvider.send({
        to: identifier,
        subject: verificationTemplate.subject,
        content: emailContent,
      });

      if (!result.success) {
        throw new InternalServerErrorException(
          'Failed to send verification email',
        );
      }
    } else {
      const smsContent = smsVerificationTemplate.generateContent({
        code,
        expiresInMinutes: 180, // 3 hours in minutes
      });

      const result = await this.twilioProvider.send({
        to: identifier,
        content: smsContent,
      });

      if (!result.success) {
        throw new InternalServerErrorException(
          'Failed to send verification SMS',
        );
      }
    }

    return { identifier, expiresIn: '3h' };
  }

  async verifyRegistration(dto: VerificationDto) {
    const verificationCode = await this.verificationCodeRepository.findOne({
      where: {
        code: dto.code,
        identifier: dto.identifier,
        type: 'registration',
        isUsed: false,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!verificationCode) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    // Mark verification code as used
    verificationCode.isUsed = true;
    await this.verificationCodeRepository.save(verificationCode);

    return { success: true, identifier: dto.identifier };
  }

  async completeRegistration(
    dto: CompleteRegistrationDto,
    deviceId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // Check if identifier has been verified
    const verificationCode = await this.verificationCodeRepository.findOne({
      where: {
        identifier: dto.identifier,
        type: 'registration',
        isUsed: true,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!verificationCode) {
      throw new UnauthorizedException(
        'Identifier not verified. Please verify your identifier first.',
      );
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: this.isEmail(dto.identifier)
        ? { email: dto.identifier }
        : { phoneNumber: dto.identifier },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // Find customer interests by IDs
    const interests = await this.InterestsRepository.findBy({
      id: In(dto.interests),
    });

    // Create new user
    const userData: DeepPartial<MobileUser> = {
      email: dto.identifier.includes('@') ? dto.identifier : undefined,
      phoneNumber: dto.identifier.includes('@') ? undefined : dto.identifier,
      fullName: dto.fullName,
      gender: dto.gender,
      dateOfBirth: new Date(dto.dateOfBirth),
      isEmailVerified: dto.identifier.includes('@'),
      isPhoneVerified: !dto.identifier.includes('@'),
      interests: interests,
    };

    const user = this.userRepository.create(userData);
    const savedUser = await this.userRepository.save(user);

    // Send welcome email if user registered with email
    if (dto.identifier.includes('@')) {
      const welcomeContent = welcomeTemplate.generateContent({
        name: dto.fullName,
      });

      const result = await this.sendGridProvider.send({
        to: dto.identifier,
        subject: welcomeTemplate.subject,
        content: welcomeContent,
      });

      if (!result.success) {
        throw new InternalServerErrorException('Failed to send welcome email');
      }
    }

    // Generate tokens
    const tokens = await this.generateTokens(
      savedUser,
      deviceId,
      ipAddress,
      userAgent,
    );

    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        fullName: savedUser.fullName,
        interests: interests.map(interest => ({
          id: interest.id,
          name: interest.name,
        })),
      },
      ...tokens,
    };
  }

  async initiateLogin(identifier: string) {
    const user = await this.userRepository.findOne({
      where: [{ email: identifier }, { phoneNumber: identifier }],
    });

    if (!user) {
      throw new NotFoundException('Invalid credentials');
    }

    // Generate verification code
    const code = this.generateVerificationCode();

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 3); // 3 hours expiration

    // Save verification code
    await this.verificationCodeRepository.save({
      code,
      identifier,
      expiresAt,
      type: 'login',
      userId: user.id,
    });

    // Send verification code using templates
    if (user.email === identifier) {
      const emailContent = verificationTemplate.generateContent({
        code,
        expiresInMinutes: 180, // 3 hours in minutes
      });

      const result = await this.sendGridProvider.send({
        to: user.email,
        subject: verificationTemplate.subject,
        content: emailContent,
      });

      if (!result.success) {
        throw new InternalServerErrorException(
          'Unable to send verification email. Please try again later.',
        );
      }
    } else {
      const smsContent = smsVerificationTemplate.generateContent({
        code,
        expiresInMinutes: 180, // 3 hours in minutes
      });

      const result = await this.twilioProvider.send({
        to: user.phoneNumber,
        content: smsContent,
      });

      if (!result.success) {
        throw new InternalServerErrorException(
          'Unable to send verification SMS. Please try again later.',
        );
      }
    }

    return { identifier, expiresIn: '3h' };
  }

  async verifyLogin(
    dto: VerificationDto,
    deviceId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const verificationCode = await this.verificationCodeRepository.findOne({
      where: {
        code: dto.code,
        identifier: dto.identifier,
        type: 'login',
        isUsed: false,
        expiresAt: MoreThan(new Date()),
      },
      relations: ['user'],
    });

    if (!verificationCode || !verificationCode.user) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    // Mark verification code as used
    verificationCode.isUsed = true;
    await this.verificationCodeRepository.save(verificationCode);

    // Generate tokens
    const tokens = await this.generateTokens(
      verificationCode.user,
      deviceId,
      ipAddress,
      userAgent,
    );

    return {
      user: {
        id: verificationCode.user.id,
        email: verificationCode.user.email,
        fullName: verificationCode.user.fullName,
      },
      ...tokens,
    };
  }

  async refreshToken(
    dto: RefreshTokenDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const refreshTokenEntity = await this.refreshTokenRepository.findOne({
      where: {
        token: dto.refreshToken,
        isRevoked: false,
        expiresAt: MoreThan(new Date()),
      },
      relations: ['user'],
    });

    if (!refreshTokenEntity || !refreshTokenEntity.user) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Revoke the old refresh token
    refreshTokenEntity.isRevoked = true;
    await this.refreshTokenRepository.save(refreshTokenEntity);

    // Generate new tokens
    return this.generateTokens(
      refreshTokenEntity.user,
      dto.deviceId || refreshTokenEntity.deviceId,
      ipAddress,
      userAgent,
    );
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'phoneNumber', 'fullName', 'gender'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
