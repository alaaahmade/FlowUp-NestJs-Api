import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Logger,
  Get,
  Res,
  UseGuards,
  Req,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SocialAuthDto } from './dto/social-auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { SocialProvider } from './dto/social-login.dto';
import { LoginResponse, registerResponse } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { VerificationService } from './verification.service';
import { SendVerificationDto } from './dto/send-verification.dto';
import { Public } from './decorators/public.decorator';

interface JwtPayload {
  id: number;
  email: string;
  roles: string[];
}

interface RequestWithUser extends Request {
  user: JwtPayload;
}

interface GoogleUser {
  accessToken: string;
  firstName: string;
  lastName: string;
  email: string;
  picture?: string;
}

interface AppleUser {
  accessToken: string;
  firstName: string;
  lastName: string;
  email: string;
}

@ApiTags('Auth') // Swagger: Group all authentication routes under "Auth"
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  private readonly COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  };

  constructor(
    private readonly authService: AuthService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private verificationService: VerificationService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register new user for all methods : email & phone',
  })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async register(
    @Body() createUserDto: CreateUserDto,
    @Query('method')
    method: string,
  ): Promise<registerResponse> {
    if (method === 'phone') {
      try {
        const isValid = await this.verificationService.verifyCode(
          String(createUserDto.phoneNumber),
          String(createUserDto.verificationCode),
        );

        if (!isValid) {
          throw new HttpException(
            'Invalid or expired verification code',
            HttpStatus.BAD_REQUEST,
          );
        }

        // Then register the user with type-safe properties
        const userData = {
          email: String(createUserDto.email),
          password: String(createUserDto.password),
          fullName: createUserDto.fullName
            ? String(createUserDto.fullName)
            : '',
          phoneNumber: String(createUserDto.phoneNumber),
          phoneVerified: true,
        } as CreateUserDto;

        const user = await this.authService.register(userData);

        return {
          success: true,
          message: 'User registered successfully',
          user: { ...user, roles: user.roles.map((role) => role.name) },
        };
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }
        throw new HttpException(
          'Error registering user',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } else if (method === 'email') {
      try {
        const isValid = await this.verificationService.verifyCode(
          String(createUserDto.email),
          String(createUserDto.verificationCode),
        );

        if (!isValid) {
          throw new HttpException(
            'Invalid or expired verification code',
            HttpStatus.BAD_REQUEST,
          );
        }

        // Then register the user with type-safe properties
        const userData = {
          email: String(createUserDto.email),
          password: String(createUserDto.password),
          fullName: createUserDto.fullName
            ? String(createUserDto.fullName)
            : '',
          emailVerified: true,
        } as CreateUserDto;

        const user = await this.authService.register(userData);

        return {
          success: true,
          message: 'User registered successfully',
          user: { ...user, roles: user.roles.map((role) => role.name) },
        };
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }
        throw new HttpException(
          'Error registering user',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } else {
      if (!createUserDto.email || !createUserDto.password) {
        throw new HttpException(
          'Email and password are required',
          HttpStatus.BAD_REQUEST,
        );
      }
      const user = await this.authService.register(createUserDto);
      return {
        success: true,
        message: 'User registered successfully',
        user: { ...user, roles: user.roles.map((role) => role.name) },
      };
    }
  }

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Log in a user: for All methods : email & phone' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto, @Query('method') method: string) {
    try {
      if (method === 'email') {
        try {
          // First verify the code
          const isValid = await this.verificationService.verifyCode(
            String(loginDto.email),
            String(loginDto.verificationCode),
          );

          if (!isValid) {
            throw new HttpException(
              'Invalid or expired verification code',
              HttpStatus.BAD_REQUEST,
            );
          }

          // Find the user by email
          const user = await this.userRepository.findOne({
            where: { email: loginDto.email },
            relations: ['roles'],
          });

          if (!user) {
            throw new HttpException(
              'User not found. Please register first.',
              HttpStatus.NOT_FOUND,
            );
          }

          // Generate JWT token
          const token = await this.authService.generateToken(user);

          return {
            accessToken: token,
            user: {
              id: user.id,
              email: user.email,
              fullName: user.fullName,
              roles: user.roles.map((role) => role.name),
              picture: user.picture,
            },
          };
        } catch (error) {
          if (error instanceof HttpException) {
            throw error;
          }
          throw new HttpException(
            'Error during login',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      } else if (method === 'phone') {
        try {
          // First verify the code
          const isValid = await this.verificationService.verifyCode(
            String(loginDto.phoneNumber),
            String(loginDto.verificationCode),
          );

          if (!isValid) {
            throw new HttpException(
              'Invalid or expired verification code',
              HttpStatus.BAD_REQUEST,
            );
          }

          // Find the user by email
          const user = await this.userRepository.findOne({
            where: { email: loginDto.phoneNumber },
            relations: ['roles'],
          });

          if (!user) {
            throw new HttpException(
              'User not found. Please register first.',
              HttpStatus.NOT_FOUND,
            );
          }

          // Generate JWT token
          const token = await this.authService.generateToken(user);

          return {
            accessToken: token,
            user: {
              id: user.id,
              email: user.email,
              fullName: user.fullName,
              roles: user.roles.map((role) => role.name),
              picture: user.picture,
            },
          };
        } catch (error) {
          if (error instanceof HttpException) {
            throw error;
          }
          throw new HttpException(
            'Error during login',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      } else {
        if (!loginDto.email || !loginDto.password) {
          throw new HttpException(
            'Email and password are required',
            HttpStatus.BAD_REQUEST,
          );
        }
        const user = await this.authService.validateUser(
          loginDto.email,
          loginDto.password,
        );

        if (!user) {
          throw new UnauthorizedException('Invalid credentials');
        }

        const result = await this.authService.login(user);

        return {
          message: 'Login successful',
          accessToken: result.access_token,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            roles: user.roles,
            picture: user.picture,
          },
        };
      }
    } catch (error) {
      this.logger.error('Login failed:', error);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request a password reset' })
  @ApiResponse({
    status: 200,
    description: 'Password reset request successful',
  })
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset the user password' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(token, newPassword);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth() // Swagger: Requires authentication
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@Req() req: RequestWithUser) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: req.user.id },
        relations: ['roles', 'roles.permissions'],
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return {
        status: 'success',
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            roles: user.roles.map((role) => role.name),
            picture: user.picture,
            permissions: user.roles.flatMap((role) =>
              role.permissions.map((p) => p.name),
            ),
          },
        },
      };
    } catch (error) {
      this.logger.error('Error fetching current user:', error);
      throw error;
    }
  }

  @Post('logout')
  @ApiOperation({ summary: 'Log out the current user' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  logout(@Res() response: Response) {
    response.clearCookie('token', this.COOKIE_OPTIONS);
    return response.json({
      message: 'Logged out successfully',
    });
  }

  @Post('social/login')
  @ApiOperation({ summary: 'Login with social provider' })
  @ApiResponse({ status: 200, description: 'Social login successful' })
  async socialLogin(
    @Body() socialAuthDto: SocialAuthDto,
  ): Promise<LoginResponse> {
    return this.authService.socialAuth(socialAuthDto, false);
  }

  @Post('social/signup')
  @ApiOperation({ summary: 'Sign up with social provider' })
  @ApiResponse({ status: 201, description: 'Social signup successful' })
  @ApiResponse({ status: 400, description: 'Invalid data or user exists' })
  async socialSignup(
    @Body() socialAuthDto: SocialAuthDto,
  ): Promise<LoginResponse> {
    return this.authService.socialAuth(socialAuthDto, true);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth flow' })
  async googleAuth(): Promise<void> {
    // Initiates the Google OAuth2 flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthCallback(
    @Req() req: { user: GoogleUser },
  ): Promise<LoginResponse> {
    return this.authService.socialAuth(
      {
        provider: SocialProvider.GOOGLE,
        token: req.user.accessToken,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
      },
      true,
    );
  }

  @Get('apple')
  @UseGuards(AuthGuard('apple'))
  @ApiOperation({ summary: 'Initiate Apple Sign In flow' })
  async appleAuth(): Promise<void> {
    // Initiates the Apple Sign In flow
  }

  @Post('apple/callback')
  @UseGuards(AuthGuard('apple'))
  @ApiOperation({ summary: 'Apple Sign In callback' })
  async appleAuthCallback(
    @Req() req: { user: AppleUser },
  ): Promise<LoginResponse> {
    return this.authService.socialAuth(
      {
        provider: SocialProvider.APPLE,
        token: req.user.accessToken,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
      },
      true,
    );
  }

  @Post('verification')
  @ApiOperation({ summary: 'Send and verify verification code via WhatsApp' })
  @ApiResponse({
    status: 200,
    description:
      'Verification code sent successfully or Verification code verified  successfully',
  })
  @ApiResponse({ status: 500, description: 'Failed to send verification code' })
  @ApiBody({ type: SendVerificationDto })
  async verification(
    @Body() body: SendVerificationDto,
    @Query('method') method: string,
  ) {
    if (method === 'send-phone') {
      if (!body.phoneNumber) {
        throw new HttpException(
          'Phone number is required',
          HttpStatus.BAD_REQUEST,
        );
      }
      try {
        const success = await this.verificationService.sendVerificationCode(
          body.phoneNumber,
        );

        if (!success) {
          throw new HttpException(
            'Failed to send verification code',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        return {
          success: true,
          message: 'Verification code sent successfully',
        };
      } catch (error) {
        this.logger.error('Error sending verification code:', error);
      }
    } else if (method === 'verify-phone') {
      if (!body.phoneNumber || !body.code) {
        throw new HttpException(
          'Phone number and code are required',
          HttpStatus.BAD_REQUEST,
        );
      }
      try {
        const isValid = await this.verificationService.verifyCode(
          String(body.phoneNumber),
          String(body.code),
        );

        if (!isValid) {
          throw new HttpException(
            'Invalid or expired verification code',
            HttpStatus.BAD_REQUEST,
          );
        }

        return {
          success: true,
          verified: true,
        };
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }
        throw new HttpException(
          'Error verifying code',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } else if (method === 'send-email') {
      if (!body.email) {
        throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
      }
      try {
        const success = await this.verificationService.sendVerificationCode(
          body.email,
        );

        if (!success) {
          throw new HttpException(
            'Failed to send verification code',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        return {
          success: true,
          message: 'Verification code sent successfully',
        };
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }
        throw new HttpException(
          'Error sending verification code',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } else if (method === 'verify-email') {
      if (!body.email || !body.code) {
        throw new HttpException(
          'Email and code are required',
          HttpStatus.BAD_REQUEST,
        );
      }
      try {
        const isValid = await this.verificationService.verifyCode(
          String(body.email),
          String(body.code),
        );

        if (!isValid) {
          throw new HttpException(
            'Invalid or expired verification code',
            HttpStatus.BAD_REQUEST,
          );
        }

        return {
          success: true,
          verified: true,
        };
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }
        throw new HttpException(
          'Error verifying code',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
