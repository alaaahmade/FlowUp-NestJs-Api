import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsDateString,
  Matches,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteRegistrationDto {
  @ApiProperty({
    description: 'Identifier used during registration (email or phone)',
    example: 'user@example.com',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|\+[0-9]{10,})$/, {
    message: 'Identifier must be a valid email or phone number (with + prefix)',
  })
  identifier: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z\s]{2,50}$/, {
    message:
      'Full name must be between 2 and 50 characters and contain only letters and spaces',
  })
  fullName: string;

  @ApiProperty({
    description: 'User gender',
    example: 'male',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(male|female|other)$/, {
    message: 'Gender must be one of: male, female, other',
  })
  gender: string;

  @ApiProperty({
    description: 'User date of birth',
    example: '1990-01-01',
    format: 'YYYY-MM-DD',
  })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiProperty({
    description: 'Array of interest IDs',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  interests: number[];
}
