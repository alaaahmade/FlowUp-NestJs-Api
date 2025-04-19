import {
  IsString,
  IsEmail,
  MinLength,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'The email of the user',
    uniqueItems: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'The password of the user',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The full name of the user',
  })
  @IsString()
  fullName: string;

  @ApiProperty({
    example: 'male',
    description: 'The gender of the user',
  })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiProperty({
    example: '1990-01-01',
    description: 'The date of birth of the user',
  })
  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @IsBoolean()
  @IsOptional()
  phoneVerified?: boolean;

  @ApiPropertyOptional({
    example: '+14155552671',
    description: 'User phone number',
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsBoolean()
  @IsOptional()
  emailVerified?: boolean;

  @IsString()
  @IsOptional()
  picture?: string;

  @IsString()
  @IsOptional()
  verificationCode?: string;
}
