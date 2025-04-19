import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhatsAppService } from '../messaging/whatsapp.service';
import { VerificationCode } from './entities/verification-code.entity';
import { MailService } from '../messaging/mail.service';
import { TwilioService } from '../messaging/sms.service';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(VerificationCode)
    private verificationRepository: Repository<VerificationCode>,
    private whatsAppService: WhatsAppService,
    private mailService: MailService,
    private smsService: TwilioService,
  ) {}

  async generateCode(identifier: string): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to database with expiration (15 minutes)
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + 15);

    // Delete any existing codes for this identifier (phone or email)
    const newIdentifier = identifier.replace('sms:', '');

    try {
      await this.verificationRepository.delete({ phoneNumber: newIdentifier });
      await this.verificationRepository.delete({ email: newIdentifier });
    } catch (error) {
      console.log(error);
    }

    // Create new verification code
    const verificationCode: Partial<VerificationCode> = {
      phoneNumber: identifier.includes('+')
        ? identifier.includes('sms:')
          ? identifier.replace('sms:', '')
          : identifier
        : undefined,
      email: identifier.includes('@') ? identifier : undefined,
      code,
      expiresAt: expiration,
    };
    await this.verificationRepository.save(verificationCode);

    return code;
  }

  async sendVerificationCode(identifier: string): Promise<boolean> {
    const code = await this.generateCode(identifier);
    try {
      if (identifier.includes('@')) {
        // Send email verification
        return this.mailService.sendVerificationEmail(identifier, code);
      } else {
        // Send WhatsApp verification
        if (identifier.includes('sms:')) {
          const number = identifier.replace('sms:', '');
          return this.smsService.sendMessage(number, code);
        } else {
          return this.smsService.sendMessage(identifier, code);
        }
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async verifyCode(identifier: string, code: string): Promise<boolean> {
    // Check if it's an email or phone number

    const whereClause = identifier.includes('@')
      ? { email: identifier, code }
      : { phoneNumber: identifier, code };

    const verification = await this.verificationRepository.findOne({
      where: whereClause,
    });

    if (!verification) {
      return false;
    }

    // Check if code is expired
    if (verification.expiresAt < new Date()) {
      await this.verificationRepository.remove(verification);
      return false;
    }

    // Code is valid, remove it from database
    await this.verificationRepository.remove(verification);
    return true;
  }
}
