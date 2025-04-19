import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class TwilioService {
  private twilioClient: Twilio;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    // const from = this.configService.get<string>('TWILIO__SMS_FROM_NUMBER');
    this.twilioClient = new Twilio(accountSid, authToken);
  }

  async sendMessage(to: string, code: string): Promise<boolean> {
    try {
      const fromNumber = this.configService.get<string>(
        'TWILIO_WHATSAPP_NUMBER',
      );
      const message = await this.twilioClient.messages.create({
        body: `Your verification code is: ${code}`,
        from: fromNumber,
        to,
      });
      console.log(message);

      return true;
    } catch (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }
}
