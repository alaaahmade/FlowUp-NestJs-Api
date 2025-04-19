import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

export class DayDto {
  @ApiProperty({ example: 'Mon' })
  @IsString()
  day: string;

  @ApiProperty({ example: 'Mon' })
  @IsString()
  value: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  from: string;

  @ApiProperty({ example: '12:00' })
  @IsString()
  to: string;
}

export class SessionDto {
  @ApiProperty({ example: '10:00' })
  @IsString()
  from: string;

  @ApiProperty({ example: '12:00' })
  @IsString()
  to: string;
}

export class ClassDto {
  @ApiProperty({ example: 'Mon' })
  @IsString()
  day: string;

  @ApiProperty({ type: [SessionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SessionDto)
  sessions: SessionDto[];
}

export class CreateAvailabilityDto {
  @ApiPropertyOptional({ type: [DayDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DayDto)
  days?: DayDto[];

  @ApiPropertyOptional({ type: [ClassDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ClassDto)
  class?: ClassDto[];
}
