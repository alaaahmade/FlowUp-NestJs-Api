import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'Admin', description: 'The name of the role' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Has full access to the system',
    description: 'Description of the role',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: [1, 2, 3],
    description: 'List of permission IDs to assign to this role',
  })
  @IsArray()
  @ArrayNotEmpty()
  permissions: number[];
}
