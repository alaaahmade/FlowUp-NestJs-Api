import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class WhatsAppService {
  private readonly client: twilio.Twilio;
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.client = new twilio.Twilio(accountSid, authToken);
  }

  async sendVerificationCode(
    phoneNumber: string,
    code: string,
  ): Promise<boolean> {
    try {
      const fromNumber = this.configService.get<string>(
        'TWILIO_WHATSAPP_NUMBER',
      );

      await this.client.messages.create({
        body: `Your YourPass verification code is: ${code}`,
        from: `whatsapp:${fromNumber}`,
        to: `whatsapp:${phoneNumber}`,
      });

      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to send WhatsApp message: ${error.message}`,
          error.stack,
        );
      } else {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        this.logger.error(`Failed to send WhatsApp message: ${error}`);
      }
      return false;
    }
  }
}
