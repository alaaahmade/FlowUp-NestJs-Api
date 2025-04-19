import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { Role } from '../roles/role.entity';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import appleSignin from 'apple-signin-auth';
import { SocialProvider } from './dto/social-login.dto';
import { AuthProvider } from '../users/user.entity';
import { Logger } from '@nestjs/common';
import { SocialAuthDto } from './dto/social-auth.dto';
import { AppConfigService } from '../../config/config.service';
import { UserResponse, LoginResponse } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import {
  SocialUser,
  GooglePayload,
  ApplePayload,
} from './interfaces/social-auth.interface';

export interface TokenPayload {
  id: number;
  email: string;
  roles: string[];
}

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly configService: ConfigService,
    private readonly appConfigService: AppConfigService,
  ) {
    const googleConfig = this.appConfigService.config.google;
    if (
      typeof googleConfig.clientId === 'string' &&
      typeof googleConfig.clientSecret === 'string' &&
      typeof googleConfig.callbackUrl === 'string'
    ) {
      this.googleClient = new OAuth2Client(
        googleConfig.clientId,
        googleConfig.clientSecret,
        googleConfig.callbackUrl,
      );
    } else {
      throw new Error('Invalid Google client ID configuration');
    }
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserResponse | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;

      return {
        ...result,
        roles: result.roles.map((role) => role.name),
      } as UserResponse;
    }
    return null;
  }

  login(user: UserResponse): Promise<{ access_token: string }> {
    const payload = {
      email: user.email,
      sub: user.id,
      id: user.id,
      roles: user.roles,
    };
    return Promise.resolve({
      access_token: this.jwtService.sign(payload),
    });
  }

  /**
   * Registers a new user in the system.
   *
   * @param createUserDto The {@link CreateUserDto} with the user's information.
   *
   * @throws {UnauthorizedException} If a user with the same email already exists.
   * @throws {NotFoundException} If the default user role (user) does not exist.
   *
   * @returns The registered user.
/*************  ✨ Windsurf Command ⭐  *************/
  /*******  60910e0e-e40b-4e31-9146-8965648f427e  *******/
  async register(createUserDto: CreateUserDto): Promise<User> {
    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    // Get default role (user role)
    const defaultRole = await this.roleRepository.findOne({
      where: { name: 'user' },
      relations: ['permissions'],
    });

    if (!defaultRole) {
      throw new NotFoundException('Default user role not found');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create new user
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      roles: [defaultRole],
    });

    return this.userRepository.save(user);
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate reset token
    const resetToken = uuidv4();
    user.resetToken = resetToken;
    user.resetTokenExpires = new Date(Date.now() + 3600 * 1000); // 1 hour expiration
    await this.userRepository.save(user);

    // Send email with reset link
    await this.sendResetEmail(user.email, resetToken);

    return { message: 'Password reset email sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: { resetToken: token },
    });

    if (
      !user ||
      !user.resetTokenExpires ||
      new Date() > new Date(user.resetTokenExpires)
    ) {
      throw new BadRequestException('Invalid or expired reset token.');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await this.userRepository.save(user);

    return { message: 'Password has been reset successfully.' };
  }

  private async sendResetEmail(email: string, token: string): Promise<void> {
    // ✅ Define environment variables safely with defaults
    const smtpHost = process.env.SMTP_HOST ?? 'smtp.example.com';
    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const smtpUser = process.env.SMTP_USER ?? '';
    const smtpPass = process.env.SMTP_PASS ?? '';
    const smtpFrom = process.env.SMTP_FROM ?? 'noreply@example.com';

    // ✅ Explicitly define transporter type
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false, // Use `true` for SSL/TLS if required
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // ✅ Ensure token is properly embedded in the reset link
    const resetLink = `https://yourdomain.com/reset-password?token=${encodeURIComponent(token)}`;

    await transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject: 'Password Reset Request',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link is valid for 1 hour.</p>`,
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async generateToken(user: User): Promise<string> {
    const payload = {
      id: user.id,
      email: user.email,
      roles: user.roles.map((role) => role.name),
    };

    return this.jwtService.sign(payload);
  }

  async socialAuth(
    socialAuthDto: SocialAuthDto,
    isSignup: boolean = false,
  ): Promise<LoginResponse> {
    try {
      let socialUser: SocialUser;
      let provider: AuthProvider;

      switch (socialAuthDto.provider) {
        case SocialProvider.GOOGLE:
          // eslint-disable-next-line no-case-declarations
          const googlePayload = await this.verifyGoogleToken(
            socialAuthDto.token,
          );

          socialUser = {
            id: googlePayload.sub,
            email: googlePayload.email,
            fullName: `${socialAuthDto.firstName} ${socialAuthDto.lastName}`,
            picture: socialAuthDto.picture as string,
          };
          provider = AuthProvider.GOOGLE;
          break;
        case SocialProvider.APPLE:
          socialUser = await this.verifyAppleToken(socialAuthDto.token);
          provider = AuthProvider.APPLE;
          break;
        default:
          throw new BadRequestException('Unsupported social provider');
      }

      let user = await this.userRepository.findOne({
        where: [
          { email: socialUser.email },
          { socialId: socialUser.id, provider },
        ],
        relations: ['roles'],
      });

      // Handle signup attempt for existing user
      if (user && isSignup) {
        // Instead of throwing an error, return a helpful response
        return {
          accessToken: await this.generateToken(user),
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            picture: user.picture,
            roles: user.roles.map((role) => role.name),
          },
        };
      }

      // Handle login for non-existent user
      if (!user && !isSignup) {
        throw new NotFoundException('Account not found. Please sign up first.');
      }

      if (user && !isSignup) {
        // Login flow - update existing user
        user.provider = provider;
        user.socialId = socialUser.id;
        user.picture = socialUser.picture || user.picture;
        await this.userRepository.save(user);
      } else if (!user && isSignup) {
        // Signup flow - create new user
        const defaultRole = await this.roleRepository.findOne({
          where: { name: 'user' },
        });

        if (!defaultRole) {
          throw new NotFoundException('Default user role not found');
        }

        user = await this.userRepository.save({
          email: socialUser.email,
          fullName: socialUser.fullName,
          picture: `${socialUser.picture}`,
          provider,
          socialId: socialUser.id,
          roles: [defaultRole],
        });
      }
      if (!user) {
        throw new Error('Failed to create or retrieve user');
      }

      return {
        accessToken: await this.generateToken(user),
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          picture: user.picture,
          roles: user.roles.map((role) => role.name),
        },
      };
    } catch (error) {
      this.logger.error('Social authentication failed:', error);

      // Provide more specific error messages based on the error type
      if (error instanceof NotFoundException) {
        throw error; // Rethrow NotFoundException with its message
      } else if (error instanceof ConflictException) {
        throw error; // Rethrow ConflictException with its message
      } else {
        throw new UnauthorizedException(
          'Authentication failed. Please try again.',
        );
      }
    }
  }

  async verifyGoogleToken(token: string): Promise<GooglePayload> {
    try {
      // Create a new OAuth2Client without specifying the audience
      const client = new OAuth2Client();

      // Verify the token with options to skip audience validation
      const ticket = await client.verifyIdToken({
        idToken: token,
        // Remove the audience parameter to skip audience validation
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Empty payload');
      }

      return {
        sub: payload.sub,
        email: payload.email || '',
        firstName: payload.given_name || '',
        lastName: payload.family_name || '',
        picture: payload.picture || '',
      };
    } catch (error) {
      this.logger.error('Google token verification failed:', error);
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  private async verifyAppleToken(token: string): Promise<SocialUser> {
    try {
      const appleUser = (await appleSignin.verifyIdToken(token, {
        audience: this.appConfigService.config.apple.clientId,
      })) as ApplePayload;

      return {
        id: appleUser.sub,
        email: appleUser.email || '',
        firstName: '',
        lastName: '',
        picture: '',
      };
    } catch (error) {
      console.log(error);

      throw new UnauthorizedException('Invalid Apple token');
    }
  }
}
