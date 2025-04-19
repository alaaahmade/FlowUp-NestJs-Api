import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateInterestsDto {
  @ApiProperty({ example: 'Fitness' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Fitness and gym related services' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'fitness-icon' })
  @IsString()
  @IsOptional()
  image?: string;
}

export class UpdateInterestsDto extends PartialType(CreateInterestsDto) {}
