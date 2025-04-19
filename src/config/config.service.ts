import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from './config.interface';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get config(): Config {
    return {
      s3: {
        bucket: this.getString('STORAGE_BUCKET'),
        region: this.getString('STORAGE_REGION'),
        accessKeyId: this.getString('STORAGE_ACCESS_KEY_ID'),
        secretAccessKey: this.getString('STORAGE_SECRET_ACCESS_KEY'),
        endpoint: this.getString('STORAGE_ENDPOINT'),
      },
      app: {
        port: this.getNumber('PORT'),
        nodeEnv: this.getString('NODE_ENV'),
      },
      database: {
        host: this.getString('DO_DB_HOST'),
        port: this.getNumber('DO_DB_PORT'),
        username: this.getString('DO_DB_USER'),
        password: this.getString('DO_DB_PASSWORD'),
        database: this.getString('DO_DB_NAME'),
      },
      jwt: {
        secret: this.getString('JWT_SECRET'),
        expiresIn: this.getString('JWT_EXPIRES_IN'),
      },
      smtp: {
        host: this.getString('SMTP_HOST'),
        port: this.getNumber('SMTP_PORT'),
        user: this.getString('SMTP_USER'),
        pass: this.getString('SMTP_PASS'),
        from: this.getString('SMTP_FROM'),
      },
      google: {
        clientId: this.getString('GOOGLE_CLIENT_ID'),
        clientSecret: this.getString('GOOGLE_CLIENT_SECRET'),
        callbackUrl: this.getString('GOOGLE_CALLBACK_URL'),
      },
      apple: {
        clientId: this.getString('APPLE_CLIENT_ID'),
        teamId: this.getString('APPLE_TEAM_ID'),
        keyId: this.getString('APPLE_KEY_ID'),
        privateKeyPath: this.getString('APPLE_PRIVATE_KEY_PATH'),
        callbackUrl: this.getString('APPLE_CALLBACK_URL'),
      },
      googleAnalytics: {
        clientEmail: this.getString('GOOGLE_ANALYTICS_CLIENT_EMAIL'),
        privateKey: this.getString('GOOGLE_ANALYTICS_PRIVATE_KEY'),
        measurementId: this.getString('GA_MEASUREMENT_ID'),
        apiSecret: this.getString('GA_API_SECRET'),
      },
      firebase: {
        projectId: this.getString('FIREBASE_PROJECT_ID'),
        clientEmail: this.getString('FIREBASE_CLIENT_EMAIL'),
        privateKey: this.getString('FIREBASE_PRIVATE_KEY'),
      },
      stripe: {
        secretKey: this.getString('STRIPE_SECRET_KEY'),
        webhookSecret: this.getString('STRIPE_WEBHOOK_SECRET'),
      },

      subscription: {
        creditBerJOD: this.getNumber('CREDIT_PER_JOD'),
      },
    };
  }

  private getString(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`Config error - missing env.${key}`);
    }
    return value;
  }

  private getNumber(key: string): number {
    const value = this.configService.get<number>(key);
    if (value === undefined) {
      throw new Error(`Config error - missing env.${key}`);
    }
    return value;
  }
}
