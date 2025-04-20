import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../modules/users/user.entity';
import { Role } from '../modules/roles/role.entity';
import { Permission } from '../modules/permissions/permission.entity';
import { Business } from '../modules/businesses/business.entity';
import { BusinessType } from '../modules/business-types/business-type.entity';
import { Service } from '../modules/services/entities/service.entity';
import { ServiceReview } from '../modules/services/entities/service-review.entity';
import { ServiceCategory } from '../modules/services/entities/service-category.entity';
import { ServiceRating } from '../modules/services/entities/service-rating.entity';
import { VerificationCode } from '../modules/auth/entities/verification-code.entity';
import { Availability } from '../modules/services/entities/service-availability.entity';
import { Day } from '../modules/services/entities/service-day.entity';
import { Class } from '../modules/services/entities/service-classes.entity';
import { Session } from '../modules/services/entities/service-session.entity';
import { Notification } from '../modules/notifications/notification.entity';
import { Booking } from '../modules/booking/booking.entity';
import { MobileUser } from '../modules/mobile-auth/entities/mobile-user.entity';
import { RefreshToken } from '../modules/mobile-auth/entities/refresh-token.entity';
import { VerificationCode as MobileVerificationCode } from '../modules/mobile-auth/entities/verification-code.entity';
import { Interests } from '../modules/interests/user-interests.entity';
import { Advertisement } from '../modules/advertisements/advertisement.entity';
import { Subscriptions } from '../modules/Subscriptions/entities/subscriptions.entity';
import { Plans } from '../modules/Subscriptions/entities/subscriptions-planes';

export const databaseConfig = (): TypeOrmModuleOptions => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Configure SSL only for production environments
  const sslConfig = isProduction ? { rejectUnauthorized: false } : undefined;

  return {
    type: 'postgres',
    host: process.env.DO_DB_HOST || 'localhost',
    port: Number(process.env.DO_DB_PORT || 5432),
    username: process.env.DO_DB_USER || 'postgres',
    password: process.env.DO_DB_PASSWORD || 'postgres',
    database: process.env.DO_DB_NAME || 'FlowUpFlowUp',
    ssl: {
      rejectUnauthorized: false, // ⚠️ Only use this in development
    },
    entities: [
      User,
      Role,
      Permission,
      Business,
      BusinessType,
      Service,
      ServiceReview,
      ServiceCategory,
      Plans,
      ServiceRating,
      VerificationCode,
      Availability,
      Day,
      Class,
      Session,
      Notification,
      Advertisement,
      Booking,
      MobileUser,
      RefreshToken,
      MobileVerificationCode,
      Interests,
      Subscriptions,
    ],

    synchronize: true,
    logging: ['error', 'warn', 'migration'],
    // logging: true,
  };
};
