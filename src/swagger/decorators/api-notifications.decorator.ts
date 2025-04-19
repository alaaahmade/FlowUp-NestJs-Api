import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import {
  ApiNotificationResponse,
  ApiNotificationListResponse,
  ApiEmailTestResponse,
} from '../responses/notification.response';
import { CreateNotificationDto } from '../../modules/notifications/dto/create-notification.dto';
import { EmailTestDto } from '../../modules/notifications/__tests__/dto/email-test.dto';
import { WelcomeTestDto } from '../../modules/notifications/__tests__/dto/welcome-test.dto';
import { VerificationTestDto } from '../../modules/notifications/__tests__/dto/verification-test.dto';
import { PasswordResetTestDto } from '../../modules/notifications/__tests__/dto/password-reset-test.dto';

export const ApiCreateNotification = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new notification' }),
    ApiBody({ type: () => CreateNotificationDto }),
    ApiResponse({
      status: 201,
      description: 'Notification created successfully',
      type: ApiNotificationResponse,
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid notification data',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
    }),
  );
};

export const ApiGetNotifications = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Get all notifications for the current user' }),
    ApiResponse({
      status: 200,
      description: 'Notifications retrieved successfully',
      type: ApiNotificationListResponse,
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
    }),
  );
};

export const ApiMarkNotificationAsRead = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Mark a notification as read' }),
    ApiResponse({
      status: 200,
      description: 'Notification marked as read',
      type: ApiNotificationResponse,
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
    }),
    ApiResponse({
      status: 404,
      description: 'Notification not found',
    }),
  );
};

export const ApiDeleteNotification = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a notification' }),
    ApiResponse({
      status: 200,
      description: 'Notification deleted successfully',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
    }),
    ApiResponse({
      status: 404,
      description: 'Notification not found',
    }),
  );
};

export const ApiTestEmail = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Test email using templates',
      description:
        'Send a test email using available templates. The email will use the specified template layout with the provided data.',
    }),
    ApiBody({ type: () => EmailTestDto }),
    ApiResponse({
      status: 200,
      description: 'Email sent successfully',
      type: ApiEmailTestResponse,
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid email parameters provided',
    }),
    ApiResponse({
      status: 500,
      description: 'Failed to send email due to server error',
    }),
  );
};

export const ApiTestWelcomeEmail = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Test welcome email template',
      description:
        'Send a test welcome email using the welcome template. This template is used when new users join the platform.',
    }),
    ApiBody({ type: () => WelcomeTestDto }),
    ApiResponse({
      status: 200,
      description: 'Welcome email sent successfully',
      type: ApiEmailTestResponse,
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid email parameters provided',
    }),
    ApiResponse({
      status: 500,
      description: 'Failed to send email due to server error',
    }),
  );
};

export const ApiTestVerificationEmail = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Test verification email template',
      description:
        'Send a test verification email using the verification template. This template is used for email verification and security codes.',
    }),
    ApiBody({ type: () => VerificationTestDto }),
    ApiResponse({
      status: 200,
      description: 'Verification email sent successfully',
      type: ApiEmailTestResponse,
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid email parameters provided',
    }),
    ApiResponse({
      status: 500,
      description: 'Failed to send email due to server error',
    }),
  );
};

export const ApiTestPasswordResetEmail = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Test password reset email template',
      description:
        'Send a test password reset email using the password reset template. This template is used when users request to reset their password.',
    }),
    ApiBody({ type: () => PasswordResetTestDto }),
    ApiResponse({
      status: 200,
      description: 'Password reset email sent successfully',
      type: ApiEmailTestResponse,
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid email parameters provided',
    }),
    ApiResponse({
      status: 500,
      description: 'Failed to send email due to server error',
    }),
  );
};
