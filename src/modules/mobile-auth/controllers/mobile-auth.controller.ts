import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import {
  RegistrationDto,
  VerificationDto,
  LoginDto,
  RefreshTokenDto,
  CompleteRegistrationDto,
} from '../dto';
import {
  ApiMobileRegister,
  ApiVerifyRegistration,
  ApiCompleteRegistration,
  ApiMobileLogin,
  ApiVerifyLogin,
  ApiMobileAuthOptions,
} from '../../../swagger/decorators/api-mobile-auth.decorator';
import { Gender, Interest, getEnumOptions } from '../enums/mobile-auth.enum';
import { MobileAuthService } from '../services/mobile-auth.service';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Mobile Authentication')
@Controller('mobile/auth')
export class MobileAuthController {
  constructor(private readonly mobileAuthService: MobileAuthService) {}

  @Post('register')
  @Public()
  @ApiMobileRegister()
  async register(@Body() dto: RegistrationDto) {
    return this.mobileAuthService.initiateRegistration(dto);
  }

  @Post('verify/registration')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiVerifyRegistration()
  async verifyRegistration(@Body() dto: VerificationDto) {
    return this.mobileAuthService.verifyRegistration(dto);
  }

  @Post('complete/registration')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiCompleteRegistration()
  async completeRegistration(
    @Body() dto: CompleteRegistrationDto,
    @Req() req: Request,
  ) {
    return this.mobileAuthService.completeRegistration(
      dto,
      req.body.deviceId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiMobileLogin()
  async login(@Body() dto: LoginDto) {
    return this.mobileAuthService.initiateLogin(dto.identifier);
  }

  @Post('verify/login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiVerifyLogin()
  async verifyLogin(@Body() dto: VerificationDto, @Req() req: Request) {
    return this.mobileAuthService.verifyLogin(
      dto,
      req.body.deviceId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Returns new access and refresh tokens',
  })
  async refreshToken(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    return this.mobileAuthService.refreshToken(
      dto,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: "Returns the authenticated user's profile",
  })
  async getProfile(@CurrentUser() user: CurrentUser) {
    return this.mobileAuthService.getProfile(user.id);
  }
}
