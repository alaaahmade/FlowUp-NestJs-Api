import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '123456',
    description: 'Verification code sent to the email',
  })
  verificationCode?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '+12345678901',
    description: 'Phone number with country code',
  })
  phoneNumber?: string;
}
