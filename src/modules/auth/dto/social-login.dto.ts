import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNotEmpty } from 'class-validator';

export enum SocialProvider {
  GOOGLE = 'google',
  APPLE = 'apple',
}

export class SocialLoginDto {
  @ApiProperty({
    example: 'google',
    enum: SocialProvider,
    description: 'Social login provider',
  })
  @IsEnum(SocialProvider)
  provider: SocialProvider;

  @ApiProperty({
    example: 'token_from_social_provider',
    description: 'Access token from social provider',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
