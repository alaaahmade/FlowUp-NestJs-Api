import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';
import { Business } from './business.entity';
import { User } from '../users/user.entity';
import { BusinessType } from '../business-types/business-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Business, User, BusinessType])],
  controllers: [BusinessController],
  providers: [BusinessService],
  exports: [BusinessService],
})
export class BusinessModule {}
