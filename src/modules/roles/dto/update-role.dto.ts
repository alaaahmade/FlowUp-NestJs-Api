import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateRoleDto {
  @ApiPropertyOptional({
    example: 'Editor',
    description: 'The updated name of the role',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'Can edit content but no admin access',
    description: 'Updated description of the role',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: [1, 2],
    description: 'Updated list of permission IDs for this role',
  })
  @IsArray()
  @IsOptional()
  permissions?: number[];
}
