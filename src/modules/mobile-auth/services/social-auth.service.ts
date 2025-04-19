import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MobileUser } from '../entities/mobile-user.entity';
import { ConfigService } from '@nestjs/config';

interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
  googleId: string;
}

interface AppleUser {
  email: string;
  firstName?: string;
  lastName?: string;
  appleId: string;
}

@Injectable()
export class SocialAuthService {
  constructor(
    @InjectRepository(MobileUser)
    private readonly userRepository: Repository<MobileUser>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateGoogleUser(googleUser: GoogleUser) {
    let user = await this.userRepository.findOne({
      where: [{ googleId: googleUser.googleId }, { email: googleUser.email }],
    });

    console.log('user', user);
    if (!user) {
      // Create new user
      user = this.userRepository.create({
        email: googleUser.email,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        profilePicture: googleUser.picture,
        googleId: googleUser.googleId,
        isEmailVerified: true,
      });
      await this.userRepository.save(user);
    } else if (!user.googleId) {
      // Link Google account to existing user
      user.googleId = googleUser.googleId;
      user.isEmailVerified = true;
      await this.userRepository.save(user);
    }

    return this.generateTokens(user);
  }

  async validateAppleUser(appleUser: AppleUser) {
    let user = await this.userRepository.findOne({
      where: [{ appleId: appleUser.appleId }, { email: appleUser.email }],
    });

    if (!user) {
      // Create new user
      user = this.userRepository.create({
        email: appleUser.email,
        firstName: appleUser.firstName,
        lastName: appleUser.lastName,
        appleId: appleUser.appleId,
        isEmailVerified: true, // Apple accounts have verified emails
      });
      await this.userRepository.save(user);
    } else if (!user.appleId) {
      // Link Apple account to existing user
      user.appleId = appleUser.appleId;
      user.isEmailVerified = true;
      await this.userRepository.save(user);
    }

    return this.generateTokens(user);
  }

  private generateTokens(user: MobileUser) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION'),
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
      },
    };
  }
}
