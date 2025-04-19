import { Module } from '@nestjs/common';
import { AppConfigService } from './config.service';

@Module({
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}

// Re-export NestJS ConfigModule for convenience
export { ConfigModule } from '@nestjs/config';
