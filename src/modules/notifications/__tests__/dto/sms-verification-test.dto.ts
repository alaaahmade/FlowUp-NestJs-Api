import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Matches } from 'class-validator';

export class SmsVerificationTestDto {
  @ApiProperty({
    description: 'Phone number to send the SMS to (E.164 format)',
    example: '+1234567890',
  })
  @IsString()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format (e.g., +1234567890)',
  })
  to: string;

  @ApiProperty({
    description: 'Verification code',
    example: '123456',
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Code expiration time in minutes',
    example: 30,
  })
  @IsNumber()
  expiresInMinutes: number;
}
