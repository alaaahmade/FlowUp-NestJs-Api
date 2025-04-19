import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import {
  NotificationProvider,
  NotificationPayload,
  NotificationResponse,
} from '../interfaces/notification.interface';

@Injectable()
export class TwilioProvider implements NotificationProvider {
  private readonly client: Twilio;
  private readonly fromNumber: string;
  private readonly senderId: string | undefined;
  private readonly logger = new Logger(TwilioProvider.name);

  constructor(private readonly configService: ConfigService) {
    const accountSid =
      this.configService.getOrThrow<string>('TWILIO_ACCOUNT_SID');
    const authToken =
      this.configService.getOrThrow<string>('TWILIO_AUTH_TOKEN');
    const fromNumber = this.configService.getOrThrow<string>('TWILIO_SMS_FROM');
    const senderId = this.configService.get<string>('TWILIO_SENDER_ID');

    // Validate Account SID format
    if (!accountSid.startsWith('AC')) {
      throw new Error(
        `Invalid Twilio Account SID format. Account SID must start with 'AC'. Current value: ${accountSid.substring(0, 4)}...`,
      );
    }

    try {
      this.client = new Twilio(accountSid, authToken);
      this.fromNumber = fromNumber;
      this.senderId = senderId;

      this.logger.log(
        `Twilio provider initialized with from number: ${this.fromNumber} and sender ID: ${this.senderId || 'not set'}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to initialize Twilio client: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async send(payload: NotificationPayload): Promise<NotificationResponse> {
    try {
      const messageOptions: any = {
        to: Array.isArray(payload.to) ? payload.to[0] : payload.to,
        body: payload.content,
      };

      // Use sender ID if available, otherwise fall back to phone number
      if (this.senderId) {
        messageOptions.from = this.senderId;
      } else {
        messageOptions.from = this.fromNumber;
      }

      const message = await this.client.messages.create(messageOptions);

      this.logger.debug(
        `SMS sent successfully to ${Array.isArray(payload.to) ? payload.to[0] : payload.to}, SID: ${message.sid}`,
      );

      return {
        success: true,
        messageId: message.sid,
      };
    } catch (error) {
      this.logger.error(`Failed to send SMS: ${error.message}`, error.stack);
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
