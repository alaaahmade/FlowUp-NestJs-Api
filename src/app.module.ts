import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './database/database.config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { BusinessModule } from './modules/businesses/business.module';
import { BusinessTypeModule } from './modules/business-types/business-type.module';
import { Role } from './modules/roles/role.entity';
import { Permission } from './modules/permissions/permission.entity';
import { RoleModule } from './modules/roles/role.module';
import { PermissionModule } from './modules/permissions/permission.module';
import { AppConfigModule } from './config/config.module';
import { RoleSeedService } from './database/seeds/role.seed';
import { validationSchema } from './config/validation.schema';
import { ServicesModule } from './modules/services/services.module';
import { NotificationProviderModule } from './providers/notifications/notification.module';
import { NotificationTestModule } from './modules/notifications/__tests__/notification-test.module';
import { MobileAuthModule } from './modules/mobile-auth/mobile-auth.module';
import { InterestsModule } from './modules/interests/interests.module';
import { NotificationModule } from './modules/notifications/notification.module';
import { AdvertisementModule } from './modules/advertisements/advertisement.module';
import { SubscriptionsModule } from './modules/Subscriptions/subscriptions.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    TypeOrmModule.forRoot(databaseConfig()),
    TypeOrmModule.forFeature([Role, Permission]),
    NotificationProviderModule.forRoot(),
    NotificationTestModule,
    UsersModule,
    AuthModule,
    RoleModule,
    PermissionModule,
    BusinessModule,
    BusinessTypeModule,
    AppConfigModule,
    ServicesModule,
    MobileAuthModule,
    InterestsModule,
    NotificationModule,
    AdvertisementModule,
    SubscriptionsModule,
    UploadModule,
  ],
  providers: [RoleSeedService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly roleSeedService: RoleSeedService) {}

  async onModuleInit() {
    await this.roleSeedService.seed();
  }
}
