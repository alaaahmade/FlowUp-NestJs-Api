import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../modules/users/user.entity';
import { Role } from '../modules/roles/role.entity';
import { Permission } from '../modules/permissions/permission.entity';
import { Business } from '../modules/businesses/business.entity';
import { BusinessType } from '../modules/business-types/business-type.entity';
import * as fs from 'fs';
import * as path from 'path';

export const databaseConfig = (): TypeOrmModuleOptions => {
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

  return {
    type: 'postgres',
    host: process.env.DO_DB_HOST || 'localhost',
    port: Number(process.env.DO_DB_PORT) || 5432,
    username: process.env.DO_DB_USER || 'postgres',
    password: process.env.DO_DB_PASSWORD || 'postgres',
    database: process.env.DO_DB_NAME || 'FlowUp',
    entities: [User, Role, Permission, Business, BusinessType],
    synchronize: true, // ⚠️ Disable in production
    ssl: sslConfig,
  };
};
