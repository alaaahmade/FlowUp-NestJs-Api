import * as Joi from 'joi';

export interface NotificationConfig {
  email: {
    provider: 'sendgrid';
    apiKey: string;
    from: string;
    smtp: {
      host: string;
      port: number;
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
    };
  };
  sms?: {
    provider: 'twilio';
    accountSid: string;
    authToken: string;
    from: string;
  };
  whatsapp?: {
    provider: 'twilio';
    accountSid: string;
    authToken: string;
    from: string;
  };
}

export const notificationConfigValidationSchema = Joi.object({
  email: Joi.object({
    provider: Joi.string().valid('sendgrid').required(),
    apiKey: Joi.string().required(),
    from: Joi.string().email().required(),
    smtp: Joi.object({
      host: Joi.string().required(),
      port: Joi.number().valid(25, 465, 587).required(),
      secure: Joi.boolean().required(),
      auth: Joi.object({
        user: Joi.string().required(),
        pass: Joi.string().required(),
      }).required(),
    }).required(),
  }).required(),
  sms: Joi.object({
    provider: Joi.string().valid('twilio').required(),
    accountSid: Joi.string(),
    authToken: Joi.string(),
    from: Joi.string(),
  }).optional(),
  whatsapp: Joi.object({
    provider: Joi.string().valid('twilio').required(),
    accountSid: Joi.string(),
    authToken: Joi.string(),
    from: Joi.string(),
  }).optional(),
});
