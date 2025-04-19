import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SocialProvider } from './social-login.dto';

export class SocialAuthDto {
  @ApiProperty({ enum: SocialProvider })
  @IsEnum(SocialProvider)
  provider: SocialProvider;

  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  picture?: string;
}
