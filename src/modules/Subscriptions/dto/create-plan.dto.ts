// dto/update-plan.dto.ts
import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, IsBoolean } from 'class-validator';

export class CreatePlanDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  amountJOD: number;

  @IsOptional()
  @IsNumber()
  credits: number;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;
}

export class UpdatePlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  amountJOD?: number;

  @IsOptional()
  @IsNumber()
  credits?: number;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;
}
