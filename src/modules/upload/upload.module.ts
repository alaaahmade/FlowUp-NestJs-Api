// src/upload/upload.module.ts
import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { ProvidersModule } from '../../providers/providers.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    ProvidersModule,
    MulterModule.register({
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
      },
    }),
  ],
  controllers: [UploadController],
})
export class UploadModule {}
