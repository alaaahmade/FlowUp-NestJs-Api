import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Optional DO_DB variables
  DO_DB_HOST: Joi.string().optional(),
  DO_DB_PORT: Joi.number().optional(),
  DO_DB_USER: Joi.string().optional(),
  DO_DB_PASSWORD: Joi.string().optional(),
  DO_DB_NAME: Joi.string().optional(),
  DO_DB_CA_CERT: Joi.string().allow('').optional(),

  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('3600s'),

  // SMTP - Make optional for development
  SMTP_HOST: Joi.string().optional(),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().optional(),
  SMTP_PASS: Joi.string().optional(),
  SMTP_FROM: Joi.string().email().optional(),

  // Google OAuth - Make optional for development
  GOOGLE_CLIENT_ID: Joi.string().optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().optional(),
  GOOGLE_CALLBACK_URL: Joi.string().uri().optional(),

  // Apple Sign In - Make optional for development
  APPLE_CLIENT_ID: Joi.string().optional(),
  APPLE_TEAM_ID: Joi.string().optional(),
  APPLE_KEY_ID: Joi.string().optional(),
  APPLE_PRIVATE_KEY: Joi.string().optional(),
  APPLE_PRIVATE_KEY_PATH: Joi.string().optional(),
  APPLE_CALLBACK_URL: Joi.string().uri().optional(),

  // Google Analytics - Make optional for development
  GOOGLE_ANALYTICS_CLIENT_EMAIL: Joi.string().optional(),
  GOOGLE_ANALYTICS_PRIVATE_KEY: Joi.string().optional(),
  GA_MEASUREMENT_ID: Joi.string().optional(),
  GA_API_SECRET: Joi.string().optional(),

  // Firebase - Make optional for development
  FIREBASE_PROJECT_ID: Joi.string().optional(),
  FIREBASE_CLIENT_EMAIL: Joi.string().optional(),
  FIREBASE_PRIVATE_KEY: Joi.string().optional(),

  // App
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
  PORT: Joi.number().default(3000),
  PRODUCT: Joi.string().default('YourPass'),
});
