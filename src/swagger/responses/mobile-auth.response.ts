import { ApiProperty } from '@nestjs/swagger';

export class MobileAuthInitiateResponse {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email or phone number used for authentication',
  })
  identifier: string;

  @ApiProperty({
    example: '15 minutes',
    description: 'Time until the verification code expires',
  })
  expiresIn: string;
}

export class MobileUserResponse {
  @ApiProperty({
    example: 'uuid',
    description: 'User ID',
  })
  id: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email',
  })
  email: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'User phone number',
  })
  phoneNumber: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
  })
  fullName: string;
}

export class MobileAuthTokenResponse {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1...',
    description: 'JWT access token',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1...',
    description: 'JWT refresh token',
  })
  refreshToken: string;
}

export class MobileAuthCompleteResponse {
  @ApiProperty({
    description: 'User information',
    type: MobileUserResponse,
  })
  user: MobileUserResponse;

  @ApiProperty({
    description: 'Authentication tokens',
    type: MobileAuthTokenResponse,
  })
  tokens: MobileAuthTokenResponse;
}
