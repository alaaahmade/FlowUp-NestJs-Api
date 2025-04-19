import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SendGridProvider } from './email/sendgrid.provider';
import { NotificationConfig } from './config/notification.config';
import * as Joi from 'joi';

const envValidationSchema = Joi.object({
  // SendGrid Configuration (required for email)
  SENDGRID_API_KEY: Joi.string()
    .required()
    .description('SendGrid API key for sending emails'),
  SENDGRID_FROM_EMAIL: Joi.string()
    .email()
    .required()
    .description('Verified sender email address for SendGrid'),
  SENDGRID_SMTP_HOST: Joi.string()
    .default('smtp.sendgrid.net')
    .description('SendGrid SMTP host'),
  SENDGRID_SMTP_PORT: Joi.number()
    .valid(25, 465, 587)
    .default(587)
    .description('SendGrid SMTP port'),
  SENDGRID_SMTP_SECURE: Joi.boolean()
    .default(false)
    .description('Whether to use SSL/TLS for SMTP'),
  SENDGRID_SMTP_USER: Joi.string()
    .default('apikey')
    .description('SendGrid SMTP username (usually "apikey")'),
  SENDGRID_SMTP_PASS: Joi.string()
    .required()
    .description('SendGrid SMTP password (same as API key)'),

  // Twilio Configuration (optional for SMS/WhatsApp)
  TWILIO_ACCOUNT_SID: Joi.string().description(
    'Twilio Account SID for SMS/WhatsApp',
  ),
  TWILIO_AUTH_TOKEN: Joi.string().description(
    'Twilio Auth Token for SMS/WhatsApp',
  ),
  TWILIO_SMS_FROM: Joi.string().description(
    'Twilio phone number for sending SMS',
  ),
  TWILIO_WHATSAPP_FROM: Joi.string().description(
    'Twilio WhatsApp number for sending WhatsApp messages',
  ),
}).unknown(true);

@Global()
@Module({})
export class NotificationProviderModule {
  static forRoot(): DynamicModule {
    return {
      module: NotificationProviderModule,
      imports: [
        ConfigModule.forRoot({
          validationSchema: envValidationSchema,
          validationOptions: {
            allowUnknown: true,
            abortEarly: false,
          },
        }),
      ],
      providers: [
        SendGridProvider,
        {
          provide: 'NOTIFICATION_CONFIG',
          useFactory: (configService: ConfigService) => ({
            email: {
              provider: 'sendgrid',
              apiKey: configService.getOrThrow<string>('SENDGRID_API_KEY'),
              from: configService.getOrThrow<string>('SENDGRID_FROM_EMAIL'),
              smtp: {
                host: configService.get<string>(
                  'SENDGRID_SMTP_HOST',
                  'smtp.sendgrid.net',
                ),
                port: configService.get<number>('SENDGRID_SMTP_PORT', 587),
                secure: configService.get<boolean>(
                  'SENDGRID_SMTP_SECURE',
                  false,
                ),
                auth: {
                  user: configService.get<string>(
                    'SENDGRID_SMTP_USER',
                    'apikey',
                  ),
                  pass: configService.getOrThrow<string>('SENDGRID_SMTP_PASS'),
                },
              },
            },
            ...(configService.get('TWILIO_ACCOUNT_SID') && {
              sms: {
                provider: 'twilio',
                accountSid: configService.get<string>('TWILIO_ACCOUNT_SID'),
                authToken: configService.get<string>('TWILIO_AUTH_TOKEN'),
                from: configService.get<string>('TWILIO_SMS_FROM'),
              },
              whatsapp: {
                provider: 'twilio',
                accountSid: configService.get<string>('TWILIO_ACCOUNT_SID'),
                authToken: configService.get<string>('TWILIO_AUTH_TOKEN'),
                from: configService.get<string>('TWILIO_WHATSAPP_FROM'),
              },
            }),
          }),
          inject: [ConfigService],
        },
      ],
      exports: [SendGridProvider],
    };
  }

  static forRootAsync(options: {
    useFactory: (
      ...args: any[]
    ) => Promise<NotificationConfig> | NotificationConfig;
    inject?: any[];
  }): DynamicModule {
    return {
      module: NotificationProviderModule,
      imports: [ConfigModule],
      providers: [
        SendGridProvider,
        {
          provide: 'NOTIFICATION_CONFIG',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ],
      exports: [SendGridProvider],
    };
  }
}
