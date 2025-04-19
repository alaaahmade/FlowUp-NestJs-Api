import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrationDto {
  @ApiProperty({
    description: 'Email or phone number for registration',
    example: 'user@example.com or +1234567890',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|\+[0-9]{10,})$/, {
    message: 'Identifier must be a valid email or phone number (with + prefix)',
  })
  identifier: string;
}
