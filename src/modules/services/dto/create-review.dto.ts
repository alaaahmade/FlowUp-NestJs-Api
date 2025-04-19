import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty()
  @IsString()
  serviceId: string;

  @ApiProperty()
  @IsString()
  comment: string;

  @ApiProperty()
  @IsNumber()
  rating: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isPurchased?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  attachments?: string[];
}
