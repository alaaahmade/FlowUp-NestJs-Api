import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { Service } from './entities/service.entity';
import { ServiceReview } from './entities/service-review.entity';
import { ServiceCategory } from './entities/service-category.entity';
import { ServiceRating } from './entities/service-rating.entity';
import { User } from '../users/user.entity';
import { Availability } from './entities/service-availability.entity';
import { Day } from './entities/service-day.entity';
import { Class } from './entities/service-classes.entity';
import { Session } from './entities/service-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Service,
      ServiceReview,
      ServiceCategory,
      ServiceRating,
      User,
      Availability,
      Day,
      Class,
      Session,
    ]),
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
