import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, IsOptional, IsEmail } from 'class-validator';

export class SendVerificationDto {
  @ApiProperty({
    example: '+14155552671 or example@example.com',
    description: 'Phone number with country code',
  })
  @IsString()
  @IsOptional()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format (e.g., +14155552671)',
  })
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  @IsEmail()
  email?: string;
}
