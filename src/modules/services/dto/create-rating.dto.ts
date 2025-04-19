import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateRatingDto {
  @ApiProperty({ example: '1 Star' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 9911 })
  @IsNumber()
  starCount: number;

  @ApiProperty({ example: 1947 })
  @IsNumber()
  reviewCount: number;
}
