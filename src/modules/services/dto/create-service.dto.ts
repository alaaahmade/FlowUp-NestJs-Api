import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsDate,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAvailabilityDto } from './create-availability.dto';

class RatingDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  starCount: number;

  @ApiProperty()
  @IsNumber()
  reviewCount: number;
}

export class CreateServiceDto {
  @ApiProperty({ example: 'Gym Session' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  hours?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsNumber()
  @IsOptional()
  credits?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAvailabilityDto)
  availability?: CreateAvailabilityDto;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  publish?: boolean;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  category?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isFuture?: boolean;

  @ApiPropertyOptional()
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  date?: Date;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  class?: boolean;

  @ApiPropertyOptional({ type: [RatingDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RatingDto)
  ratings?: RatingDto[];

  @ApiPropertyOptional({
    example: 'fitness',
    description: 'The type of service',
  })
  @IsString()
  @IsOptional()
  type?: string;
}
