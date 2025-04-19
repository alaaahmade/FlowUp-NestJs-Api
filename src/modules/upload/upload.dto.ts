// src/storage/dto/upload-file.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { Multer } from 'multer';

export class UploadFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File to upload',
  })
  file: Multer.File;

  @ApiProperty({
    description: 'Optional folder path inside the bucket',
    required: false,
    example: 'images/profiles',
  })
  @IsString()
  @IsOptional()
  folder?: string;
}

export class DeleteFileDto {
  @ApiProperty({
    description: 'The URL of the file to delete',
    example:
      'https://stgs3yourpass.fra1.digitaloceanspaces.com/stgs3yourpass/images/123456789-profile.jpg',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  fileUrl: string;
}
