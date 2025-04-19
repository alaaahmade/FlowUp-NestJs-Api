import {
  Body,
  Controller,
  Post,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SendGridProvider } from '../../../providers/notifications/email/sendgrid.provider';
import { EmailTestDto } from './dto/email-test.dto';
import { WelcomeTestDto } from './dto/welcome-test.dto';
import { VerificationTestDto } from './dto/verification-test.dto';
import { PasswordResetTestDto } from './dto/password-reset-test.dto';
import { ApiEmailTestResponse } from '../../../swagger/responses/notification.response';
import {
  welcomeTemplate,
  verificationTemplate,
  passwordResetTemplate,
} from '../../../providers/notifications/templates/email';
import {
  ApiTestEmail,
  ApiTestWelcomeEmail,
  ApiTestVerificationEmail,
  ApiTestPasswordResetEmail,
} from '../../../swagger/decorators/api-notifications.decorator';
import { TwilioProvider } from '../../../providers/notifications/sms/twilio.provider';
import { SmsVerificationTestDto } from './dto/sms-verification-test.dto';
import { smsVerificationTemplate } from '../../../providers/notifications/templates/sms/verification.template';

@ApiTags('Notifications')
@Controller('testing/notifications')
export class NotificationTestController {
  private readonly logger = new Logger(NotificationTestController.name);

  constructor(
    private readonly sendGridProvider: SendGridProvider,
    private readonly twilioProvider: TwilioProvider,
  ) {}

  @Post('email/welcome/test')
  @ApiTestWelcomeEmail()
  async testWelcomeEmail(
    @Body() welcomeTestDto: WelcomeTestDto,
  ): Promise<ApiEmailTestResponse> {
    try {
      this.logger.debug(
        `Generating welcome email for: ${JSON.stringify(welcomeTestDto)}`,
      );

      const emailContent = welcomeTemplate.generateContent({
        name: welcomeTestDto.name.trim(),
      });

      this.logger.debug(`Generated email content: ${emailContent}`);

      const result = await this.sendGridProvider.send({
        to: welcomeTestDto.to,
        subject: welcomeTemplate.subject,
        content: emailContent,
      });

      return {
        success: result.success,
        messageId: result.messageId,
        error: result.error,
      };
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        error: error.message || 'Failed to send welcome test email',
      };
    }
  }

  @Post('email/verification/test')
  @ApiTestVerificationEmail()
  async testVerificationEmail(
    @Body() verificationTestDto: VerificationTestDto,
  ): Promise<ApiEmailTestResponse> {
    try {
      const result = await this.sendGridProvider.send({
        to: verificationTestDto.to,
        subject: verificationTemplate.subject,
        content: verificationTemplate.generateContent({
          code: verificationTestDto.code,
          expiresInMinutes: verificationTestDto.expiresInMinutes,
        }),
      });

      return {
        success: result.success,
        messageId: result.messageId,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to send verification test email',
      };
    }
  }

  @Post('email/password-reset/test')
  @ApiTestPasswordResetEmail()
  async testPasswordResetEmail(
    @Body() passwordResetTestDto: PasswordResetTestDto,
  ): Promise<ApiEmailTestResponse> {
    try {
      const result = await this.sendGridProvider.send({
        to: passwordResetTestDto.to,
        subject: passwordResetTemplate.subject,
        content: passwordResetTemplate.generateContent({
          resetLink: passwordResetTestDto.resetLink,
          expiresInMinutes: passwordResetTestDto.expiresInMinutes,
        }),
      });

      return {
        success: result.success,
        messageId: result.messageId,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to send password reset test email',
      };
    }
  }

  @Post('sms/verification/test')
  @ApiOperation({ summary: 'Test SMS verification message' })
  @ApiResponse({ status: 200, description: 'SMS sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Failed to send SMS' })
  async testSmsVerification(@Body() dto: SmsVerificationTestDto) {
    this.logger.log(`Sending test SMS verification to ${dto.to}`);

    try {
      const content = smsVerificationTemplate.generateContent({
        code: dto.code,
        expiresInMinutes: dto.expiresInMinutes,
      });

      this.logger.debug(`Generated SMS content: ${content}`);

      const result = await this.twilioProvider.send({
        to: dto.to,
        content,
      });

      return {
        success: true,
        message: 'SMS verification sent successfully',
        result,
      };
    } catch (error) {
      this.logger.error('Failed to send SMS verification', error.stack);
      throw new InternalServerErrorException('Failed to send SMS verification');
    }
  }
}
