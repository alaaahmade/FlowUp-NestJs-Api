import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    example: [1, 2],
    description: 'Array of role IDs to assign to the user',
  })
  @IsArray()
  @IsOptional()
  roles?: number[];

  @ApiPropertyOptional({
    example: 'newemail@example.com',
    description: 'The updated email of the user',
  })
  email?: string;

  @ApiPropertyOptional({
    example: 'Doe',
    description: 'Updated full name of the user',
  })
  fullName?: string;

  @ApiPropertyOptional({
    example: 'newpassword123',
    description: 'Updated password (hashed in backend)',
  })
  password?: string;

  @ApiPropertyOptional({
    example: '1990-01-01',
    description: 'Updated date of birth of the user',
  })
  dateOfBirth?: string;

  @ApiPropertyOptional({
    example: 'male',
    description: 'Updated gender of the user',
  })
  gender?: string;
}
