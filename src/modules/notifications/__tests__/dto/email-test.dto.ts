import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsObject } from 'class-validator';

export class EmailTestDto {
  @ApiProperty({
    description: 'Email address of the recipient',
    example: 'user@example.com',
  })
  @IsEmail()
  to: string;

  @ApiProperty({
    description: 'Name of the recipient',
    example: 'John Doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Additional template data (optional)',
    example: { code: '123456' },
    required: false,
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  additionalData?: Record<string, any>;
}
