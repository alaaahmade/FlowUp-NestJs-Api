import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from '@sendgrid/mail';
import {
  NotificationProvider,
  NotificationPayload,
  NotificationResponse,
} from '../interfaces/notification.interface';

@Injectable()
export class SendGridProvider implements NotificationProvider {
  private readonly client: MailService;
  private readonly fromEmail: string;
  private readonly logger = new Logger(SendGridProvider.name);

  constructor(private readonly configService: ConfigService) {
    this.client = new MailService();

    const apiKey = this.configService.getOrThrow<string>('SENDGRID_API_KEY');
    this.client.setApiKey(apiKey);

    const fromEmail = this.configService.getOrThrow<string>(
      'SENDGRID_FROM_EMAIL',
    );
    this.fromEmail = fromEmail;

    this.logger.log(
      `SendGrid provider initialized with from email: ${this.fromEmail}`,
    );
  }

  async send(payload: NotificationPayload): Promise<NotificationResponse> {
    try {
      const msg = {
        to: payload.to,
        from: this.fromEmail,
        subject: payload.subject,
        text: payload.content,
        html: payload.content,
        ...(payload.templateId && {
          templateId: payload.templateId,
          dynamicTemplateData: payload.templateData,
        }),
        ...(payload.attachments && {
          attachments: payload.attachments.map((attachment) => ({
            filename: attachment.filename,
            content: attachment.content.toString('base64'),
            type: attachment.contentType,
            disposition: 'attachment',
          })),
        }),
      };

      const [response] = await this.client.send(msg);

      this.logger.debug(
        `Email sent successfully to ${Array.isArray(payload.to) ? payload.to.join(', ') : payload.to}`,
      );

      return {
        success: response.statusCode >= 200 && response.statusCode < 300,
        messageId: response.headers['x-message-id'],
      };
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendBulk(
    payloads: NotificationPayload[],
  ): Promise<NotificationResponse[]> {
    return Promise.all(payloads.map((payload) => this.send(payload)));
  }
}
