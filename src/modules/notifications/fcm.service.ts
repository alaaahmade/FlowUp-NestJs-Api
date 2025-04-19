  import { Injectable, Logger } from '@nestjs/common';
  import * as admin from 'firebase-admin';
  import { AppConfigService } from '../../config/config.service';
  import { MessagingPayload } from 'firebase-admin/lib/messaging/messaging-api';

  @Injectable()
  export class FCMService {
    private readonly logger = new Logger(FCMService.name);

    constructor(private readonly configService: AppConfigService) {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: configService.config.firebase.projectId,
            clientEmail: configService.config.firebase.clientEmail,
            privateKey: configService.config.firebase.privateKey.replace(
              /\\n/g,
              '\n',
            ),
          }),
        });
      }
    }

    async sendToDevice(
      token: string,
      notification: {
        title: string;
        body: string;
        data?: Record<string, string>;
      },
    ) {
      try {
        const message: admin.messaging.Message = {
          notification: {
            title: notification.title,
            body: notification.body,
          },
          data: notification.data,
          token,
        };

        const response = await admin.messaging().send(message);
        this.logger.log(`Successfully sent message: ${response}`);
        return response;
      } catch (error) {
        this.logger.error('Error sending message:', error);
        throw error;
      }
    }

    async sendToMultipleDevices(
      tokens: string[],
      notification: MessagingPayload,
    ) {
      try {
        const response = await admin.messaging().sendEachForMulticast({
          tokens,
          ...notification,
        });
        return response;
      } catch (error) {
        this.logger.error('Error sending messages:', error);
        throw error;
      }
    }

    async sendMulticastNotification(message: admin.messaging.MulticastMessage) {
      try {
        const response = await admin.messaging().sendEachForMulticast({
          tokens: message.tokens,
          notification: message.notification,
          data: message.data,
        });
        return response;
      } catch (error) {
        this.logger.error('Error sending multicast notification:', error);
        throw error;
      }
    }
  }
