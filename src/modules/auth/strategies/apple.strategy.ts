import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-apple';
import { AppConfigService } from '../../../config/config.service';

interface AppleProfile {
  email: string;
  name: {
    firstName: string;
    lastName: string;
  };
}

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy as any, 'apple') {
  constructor(private readonly appConfigService: AppConfigService) {
    try {
      super({
        clientID: appConfigService.config.apple.clientId,
        teamID: appConfigService.config.apple.teamId,
        keyID: appConfigService.config.apple.keyId,
        keyFilePath: appConfigService.config.apple.privateKeyPath,
        callbackURL: appConfigService.config.apple.callbackUrl,
        scope: ['email', 'name'],
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new Error('Failed to initialize Apple strategy');
    }
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: AppleProfile,
    done: VerifyCallback,
  ): void {
    const user = {
      email: profile.email,
      firstName: profile.name?.firstName || '',
      lastName: profile.name?.lastName || '',
      picture: '',
      accessToken,
    };

    done(null, user);
  }
}
