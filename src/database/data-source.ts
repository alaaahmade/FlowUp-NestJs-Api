import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../modules/users/user.entity';
import { Role } from '../modules/roles/role.entity';
import { Permission } from '../modules/permissions/permission.entity';
import { Business } from '../modules/businesses/business.entity';
import { BusinessType } from '../modules/business-types/business-type.entity';
import * as fs from 'fs';
import * as path from 'path';
import { VerificationCode } from '../modules/auth/entities/verification-code.entity';
import { Booking } from '../modules/booking/booking.entity';
import { Service } from '../modules/services/entities/service.entity';
import { Availability } from '../modules/services/entities/service-availability.entity';
import { Day } from '../modules/services/entities/service-day.entity';
import { Session } from '../modules/services/entities/service-session.entity';
import { Class } from '../modules/services/entities/service-classes.entity';
import { ServiceRating } from '../modules/services/entities/service-rating.entity';
import { ServiceReview } from '../modules/services/entities/service-review.entity';
import { ServiceCategory } from '../modules/services/entities/service-category.entity';
import { Interests } from '../modules/interests/user-interests.entity';
import { MobileUser } from '../modules/mobile-auth/entities/mobile-user.entity';
import { RefreshToken } from '../modules/mobile-auth/entities/refresh-token.entity';
import { Advertisement } from '../modules/advertisements/advertisement.entity';
import { Subscriptions } from '../modules/Subscriptions/entities/subscriptions.entity';
import { Plans } from '../modules/Subscriptions/entities/subscriptions-planes';

dotenv.config();

const certPath = path.join(process.cwd(), 'secrets', 'ca-certificate.crt');
let sslConfig: boolean | { ca: string; rejectUnauthorized: boolean } = false;

// Check for certificate in environment variable first
if (process.env.DO_DB_CA_CERT) {
  sslConfig = {
    ca: process.env.DO_DB_CA_CERT,
    rejectUnauthorized: true,
  };
}
// If not in env var, check for certificate file
else if (fs.existsSync(certPath)) {
  sslConfig = {
    ca: fs.readFileSync(certPath).toString(),
    rejectUnauthorized: true,
  };
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DO_DB_HOST || 'localhost',
  port: Number(process.env.DO_DB_PORT) || 5432,
  username: process.env.DO_DB_USER || 'postgres',
  password: process.env.DO_DB_PASSWORD || 'postgres',
  database: process.env.DO_DB_NAME || 'FlowUp',
  synchronize: true,
  logging: false,
  ssl: {
    rejectUnauthorized: false, // ⚠️ Only use this in development
  },
  entities: [
    User,
    Role,
    Permission,
    Business,
    BusinessType,
    VerificationCode,
    Booking,
    Service,
    Availability,
    Day,
    Session,
    Class,
    ServiceRating,
    ServiceReview,
    ServiceCategory,
    Interests,
    MobileUser,
    RefreshToken,
    Advertisement,
    Subscriptions,
    Plans,
  ],
  migrations: [],
  subscribers: [],
});

// Only for development/debugging
if (process.env.NODE_ENV !== 'production') {
  AppDataSource.initialize()
    .then(() => console.log('✅ Database connected!'))
    .catch((error) => console.error('❌ Database connection error:', error));
}
