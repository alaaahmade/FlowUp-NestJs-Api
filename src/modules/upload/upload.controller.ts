// src/upload/upload.controller.ts
import { S3Provider } from '../../providers/s3/s3.provider';
import {
  Controller,
  Post,
  UploadedFile,
  Delete,
  Body,
  BadRequestException,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { Public } from '../auth/decorators/public.decorator';

@Public()
@Controller('upload')
export class UploadController {
  constructor(private readonly s3Provider: S3Provider) {}

  @Post('image')
  async uploadImage(@UploadedFile() file: Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Validate file type
    const validMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (!validMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, GIF and WebP are allowed.',
      );
    }

    // Limit file size (e.g., 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds the limit of 5MB');
    }

    const fileUrl = await this.s3Provider.uploadFile(file, 'images');
    return { url: fileUrl };
  }

  @Delete('image')
  async deleteImage(@Body('fileUrl') fileUrl: string) {
    if (!fileUrl) {
      throw new BadRequestException('File URL is required');
    }

    await this.s3Provider.deleteFile(fileUrl);
    return { message: 'File deleted successfully' };
  }
}
