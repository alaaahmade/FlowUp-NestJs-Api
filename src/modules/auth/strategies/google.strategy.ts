import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AppConfigService } from '../../../config/config.service';

interface GoogleProfile {
  emails: Array<{ value: string }>;
  name: {
    givenName: string;
    familyName: string;
  };
  photos?: Array<{ value: string }>;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(private configService: AppConfigService) {
    // Initialize with default values first
    super({
      clientID: 'dummy-id',
      clientSecret: 'dummy-secret',
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });

    try {
      const config = configService.config.google;

      // Check if all required config is present
      if (!config.clientId || !config.clientSecret || !config.callbackUrl) {
        Logger.warn(
          'Google OAuth is not properly configured. Strategy will not work.',
        );
        return;
      }

      // Re-initialize with actual config
      Object.defineProperty(this, '_verify', {
        value: this.validate.bind(this),
      });
      Object.defineProperty(this, '_options', {
        value: {
          clientID: config.clientId,
          clientSecret: config.clientSecret,
          callbackURL: config.callbackUrl,
          scope: ['email', 'profile'],
        },
      });
    } catch (error) {
      this.logger.error('Failed to initialize Google strategy', error);
    }
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback,
  ): any {
    // This method won't be called if strategy isn't properly configured
    const { emails, name, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos?.[0]?.value,
      accessToken,
    };

    done(null, user);
  }
}
