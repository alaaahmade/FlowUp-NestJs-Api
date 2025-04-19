import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscriptions } from './entities/subscriptions.entity';
import { MobileUser } from '../mobile-auth/entities/mobile-user.entity';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { rawBodyMiddleware } from './middlewares/raw-body.middleware';
import { AppConfigModule } from '../../config/config.module';
import { Plans } from './entities/subscriptions-planes';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscriptions, MobileUser, Plans]),
    AppConfigModule,
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
})
export class SubscriptionsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(rawBodyMiddleware()) // Apply middleware
      .forRoutes('subscriptions/webhook'); // Only for this route
  }
}
