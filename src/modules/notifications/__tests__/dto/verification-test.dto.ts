import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNumber } from 'class-validator';

export class VerificationTestDto {
  @ApiProperty({
    description: 'Email address of the recipient',
    example: 'user@example.com',
  })
  @IsEmail()
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
