import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token received during login',
    example: 'abc123...',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  @ApiProperty({
    description: 'Device identifier for tracking',
    example: 'device-123',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  deviceId?: string;
}
