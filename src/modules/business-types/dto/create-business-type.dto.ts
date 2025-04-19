import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBusinessTypeDto {
  @ApiProperty({
    example: 'Retail',
    description: 'The name of the business type',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Retail businesses selling directly to consumers',
    description: 'A description of the business type',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
