import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerificationDto {
  @ApiProperty({
    description: 'Identifier used for registration/login (email or phone)',
    example: 'user@example.com',
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({
    description: 'Verification code (4 digits)',
    example: '1234',
  })
  @IsString()
  @IsNotEmpty()
  @Length(4, 4)
  @Matches(/^[0-9]{4}$/, {
    message: 'Code must be exactly 4 digits',
  })
  code: string;
}
