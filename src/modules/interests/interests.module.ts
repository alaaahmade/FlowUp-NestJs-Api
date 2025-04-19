import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterestsController } from './interests.controller';
import { Interests } from './user-interests.entity';
import { MobileUser } from '../mobile-auth/entities/mobile-user.entity';
import { InterestsService } from './interests.service';

@Module({
  imports: [TypeOrmModule.forFeature([Interests, MobileUser])],
  controllers: [InterestsController],
  providers: [InterestsService],
  exports: [InterestsService],
})
export class InterestsModule {}
