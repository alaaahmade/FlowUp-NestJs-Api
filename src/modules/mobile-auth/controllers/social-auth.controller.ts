import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SocialAuthService } from '../services/social-auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Public } from '../decorators/public.decorator';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import {
  GoogleAuthDto,
  AppleAuthDto,
  SocialAuthResponseDto,
} from '../dto/social-auth.dto';

@ApiTags('Social Authentication')
@Controller('mobile/auth/social')
export class SocialAuthController {
  private googleClient: OAuth2Client;

  constructor(
    private readonly socialAuthService: SocialAuthService,
    private readonly configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get('GOOGLE_CLIENT_ID'),
    );
  }

  @Public()
  @Post('google/token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate with Google',
    description: 'Authenticate a user using their Google account credentials',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully authenticated with Google',
    type: SocialAuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid Google token',
  })
  async googleLogin(
    @Body() googleAuthDto: GoogleAuthDto,
  ): Promise<SocialAuthResponseDto> {
    try {
      console.log(
        'this.configService.get',
        this.configService.get('GOOGLE_CLIENT_ID'),
      );
      const ticket = await this.googleClient.verifyIdToken({
        idToken: googleAuthDto.idToken,
        audience: this.configService.get('GOOGLE_CLIENT_ID'),
      });

      console.log(
        'this.configService.get',
        this.configService.get('GOOGLE_CLIENT_ID'),
      );
      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid Google token');
      }

      const user = {
        email: payload.email!,
        firstName: payload.given_name || '',
        lastName: payload.family_name || '',
        picture: payload.picture,
        googleId: payload.sub,
      };

      return this.socialAuthService.validateGoogleUser(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  @Public()
  @Post('apple/token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate with Apple',
    description: 'Authenticate a user using their Apple account credentials',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully authenticated with Apple',
    type: SocialAuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid Apple token',
  })
  async appleLogin(
    @Body() appleAuthDto: AppleAuthDto,
  ): Promise<SocialAuthResponseDto> {
    try {
      // TODO: Implement Apple Sign In validation
      // This will be similar to Google but with Apple-specific validation
      return this.socialAuthService.validateAppleUser({
        email: appleAuthDto.idToken, // This will be replaced with actual email from token verification
        firstName: appleAuthDto.firstName,
        lastName: appleAuthDto.lastName,
        appleId: '', // Will be populated from token
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid Apple token');
    }
  }

  // Health check endpoint
  @Public()
  @Get('status')
  getStatus() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
