import { SmsTemplate } from '../types/sms.types';

export interface VerificationSmsData {
  code: string;
  expiresInMinutes: number;
}

export const smsVerificationTemplate: SmsTemplate<VerificationSmsData> = {
  generateContent: (data) => {
    return `YourPassJo Verification Code: ${data.code}. This code will expire in ${data.expiresInMinutes} minutes. Do not share this code with anyone.`;
  },
};
