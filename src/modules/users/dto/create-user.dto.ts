import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  MinLength,
  IsArray,
  IsOptional,
  IsNumber,
  IsIn,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'The email of the user',
    uniqueItems: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Doe',
    description: 'The full name of the user',
  })
  @IsString()
  fullName: string;

  @ApiProperty({
    example: 'Male',
    description: 'The gender for the user',
  })
  @IsString()
  @IsIn(['male', 'female'])
  gender: string;

  @ApiProperty({
    example: '1990-01-01',
    description: 'The date of birth for the user',
  })
  @IsString()
  dateOfBirth?: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'The password for the user (should be hashed before storage)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    example: [1, 2],
    description: 'Array of role IDs to assign to the user',
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  roles?: number[];
}
