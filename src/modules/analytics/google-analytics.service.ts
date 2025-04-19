import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { AppConfigService } from '../../config/config.service';

@Injectable()
export class GoogleAnalyticsService {
  private readonly analytics;
  private readonly logger = new Logger(GoogleAnalyticsService.name);

  constructor(private readonly appConfigService: AppConfigService) {
    const credentials = {
      client_email: this.appConfigService.config.googleAnalytics.clientEmail,
      private_key: this.appConfigService.config.googleAnalytics.privateKey,
    };

    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });

    this.analytics = google.analyticsdata({
      version: 'v1beta',
      auth,
    });
  }

  async trackEvent(params: {
    category: string;
    action: string;
    label?: string;
    value?: number;
    userId?: string;
  }) {
    try {
      const { measurementId, apiSecret } =
        this.appConfigService.config.googleAnalytics;

      const payload = {
        client_id: params.userId || 'anonymous',
        events: [
          {
            name: params.action,
            params: {
              event_category: params.category,
              event_label: params.label,
              value: params.value,
            },
          },
        ],
      };

      await fetch(
        `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );
    } catch (error) {
      this.logger.error('Failed to track event in Google Analytics', error);
    }
  }
}
