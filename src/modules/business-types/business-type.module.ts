import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessTypeController } from './business-type.controller';
import { BusinessTypeService } from './business-type.service';
import { BusinessType } from './business-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessType])],
  controllers: [BusinessTypeController],
  providers: [BusinessTypeService],
  exports: [BusinessTypeService],
})
export class BusinessTypeModule {}
