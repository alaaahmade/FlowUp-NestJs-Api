import { ApiProperty } from '@nestjs/swagger';
import { Notification } from '../../modules/notifications/notification.entity';

export class ApiNotificationResponse {
  @ApiProperty({
    description: 'Response message',
    example: 'Notification created successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Notification data',
    type: () => Notification,
  })
  notification: Notification;
}

export class ApiNotificationListResponse {
  @ApiProperty({
    description: 'Response message',
    example: 'Notifications retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'List of notifications',
    type: () => [Notification],
  })
  notifications: Notification[];
}

export class ApiEmailTestResponse {
  @ApiProperty({
    description: 'Whether the email was sent successfully',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'SendGrid message ID for tracking',
    example: 'abc123def456',
    required: false,
    nullable: true,
  })
  messageId?: string;

  @ApiProperty({
    description: 'Error message if the email failed to send',
    example: 'Failed to authenticate with SendGrid',
    required: false,
    nullable: true,
  })
  error?: string;
}
