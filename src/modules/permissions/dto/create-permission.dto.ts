import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    example: 'Create User',
    description: 'Name of the permission',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Allows creating new users',
    description: 'Description of what the permission allows',
  })
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'create_user',
    description: 'Unique permission key (lowercase letters & underscores only)',
    pattern: '^[a-z_]+$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z_]+$/, {
    message:
      'Permission key must contain only lowercase letters and underscores',
  })
  key: string;

  @ApiProperty({
    example: 'users',
    description: 'Resource this permission applies to',
  })
  @IsString()
  @IsNotEmpty()
  resource: string;

  @ApiProperty({
    example: 'create',
    description: 'Action type',
    enum: ['create', 'read', 'update', 'delete'],
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(create|read|update|delete)$/)
  action: string;
}
