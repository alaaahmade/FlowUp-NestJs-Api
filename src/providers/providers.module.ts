// src/providers/providers.module.ts
import { Module } from '@nestjs/common';
import { AppConfigModule } from '../config/config.module';
import { S3Provider } from './s3/s3.provider';

@Module({
  imports: [AppConfigModule],
  providers: [S3Provider],
  exports: [S3Provider],
})
export class ProvidersModule {}
