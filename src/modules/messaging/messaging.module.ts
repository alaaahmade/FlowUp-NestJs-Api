import { Module } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { MailService } from './mail.service';
import { TwilioService } from './sms.service';

@Module({
  providers: [WhatsAppService, MailService, TwilioService],
  exports: [WhatsAppService, MailService, TwilioService],
})
export class MessagingModule {}
