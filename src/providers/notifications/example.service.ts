import { Injectable } from '@nestjs/common';
import { SendGridProvider } from './email/sendgrid.provider';
import {
  welcomeTemplate,
  verificationTemplate,
  passwordResetTemplate,
  WelcomeEmailData,
  VerificationEmailData,
  PasswordResetEmailData,
} from './templates/email';

@Injectable()
export class NotificationExampleService {
  constructor(private readonly emailProvider: SendGridProvider) {}

  async sendWelcomeEmail(email: string, data: WelcomeEmailData) {
    return this.emailProvider.send({
      to: email,
      subject: welcomeTemplate.subject,
      content: welcomeTemplate.generateContent(data),
    });
  }

  async sendVerificationCode(email: string, data: VerificationEmailData) {
    return this.emailProvider.send({
      to: email,
      subject: verificationTemplate.subject,
      content: verificationTemplate.generateContent(data),
    });
  }

  async sendPasswordReset(email: string, data: PasswordResetEmailData) {
    return this.emailProvider.send({
      to: email,
      subject: passwordResetTemplate.subject,
      content: passwordResetTemplate.generateContent(data),
    });
  }
}
