import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class WelcomeTestDto {
  @ApiProperty({
    description: 'Email address of the recipient',
    example: 'user@example.com',
  })
  @IsEmail()
  to: string;

  @ApiProperty({
    description: 'Name of the recipient',
    example: 'John Doe',
  })
  @IsString()
  name: string;
}
