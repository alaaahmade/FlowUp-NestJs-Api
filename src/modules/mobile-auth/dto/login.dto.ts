import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsPhoneNumber,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'User email address or phone number',
    example: 'user@example.com',
  })
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.identifier && o.identifier.includes('@'))
  @IsEmail()
  @ValidateIf((o) => o.identifier && !o.identifier.includes('@'))
  @IsPhoneNumber()
  identifier: string;
}
