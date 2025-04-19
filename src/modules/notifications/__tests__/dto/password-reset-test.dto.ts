import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNumber } from 'class-validator';

export class PasswordResetTestDto {
  @ApiProperty({
    description: 'Email address of the recipient',
    example: 'user@example.com',
  })
  @IsEmail()
  to: string;

  @ApiProperty({
    description: 'Password reset link',
    example: 'https://example.com/reset-password?token=abc123',
  })
  @IsString()
  resetLink: string;

  @ApiProperty({
    description: 'Link expiration time in minutes',
    example: 60,
  })
  @IsNumber()
  expiresInMinutes: number;
}
