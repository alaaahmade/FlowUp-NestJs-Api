import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateBusinessDto {
  @ApiProperty({
    example: 'Tech Solutions Inc.',
    description: 'The name of the business',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '123 Business Street, City, Country',
    description: 'Physical address of the business',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    example: 'contact@techsolutions.com',
    description: 'Contact email for the business',
  })
  @IsEmail()
  contactEmail: string;

  @ApiProperty({
    example: '+1-234-567-8900',
    description: 'Contact phone number for the business',
  })
  @IsString()
  @IsNotEmpty()
  contactNumber: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the business type',
  })
  @IsNumber()
  typeId: number;

  @ApiProperty({
    example: 1,
    description: 'The owner of the business',
  })
  @IsNumber()
  owner: number;
}
