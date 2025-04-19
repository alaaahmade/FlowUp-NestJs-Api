import { IsString, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAdvertisementDto {
  @ApiProperty({ description: 'Image URL for the advertisement' })
  @IsUrl()
  @IsString()
  image: string;

  @ApiProperty({ description: 'Link URL for the advertisement' })
  @IsString()
  link: string;

  @ApiProperty({ description: 'Type of advertisement' })
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Title of the advertisement (required for search type)',
  })
  @IsString()
  @IsOptional()
  title?: string;
}
