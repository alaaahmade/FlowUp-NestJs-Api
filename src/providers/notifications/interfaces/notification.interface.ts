export interface NotificationPayload {
  to: string | string[];
  subject?: string;
  content: string;
  templateId?: string;
  templateData?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export interface NotificationResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface NotificationProvider {
  send(payload: NotificationPayload): Promise<NotificationResponse>;
  sendBulk?(payloads: NotificationPayload[]): Promise<NotificationResponse[]>;
}
