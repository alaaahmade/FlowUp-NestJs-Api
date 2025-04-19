import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class BookingCreateDto {
  @IsNumber()
  @IsNotEmpty()
  readonly serviceId: number;

  @IsNumber()
  @IsNotEmpty()
  readonly classId: number;

  @IsNumber()
  @IsOptional()
  readonly sessionId?: number;
}
