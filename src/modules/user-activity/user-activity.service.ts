import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserActivity } from './user-activity.entity';
import { User } from '../users/user.entity';
import { GoogleAnalyticsService } from '../analytics/google-analytics.service';
import { TrackActivityDto } from './dto/track-activity.dto';
import { Request } from 'express';

@Injectable()
export class UserActivityService {
  constructor(
    @InjectRepository(UserActivity)
    private readonly activityRepository: Repository<UserActivity>,
    private readonly analyticsService: GoogleAnalyticsService,
  ) {}

  async trackActivity(
    user: User,
    dto: TrackActivityDto,
    req: Request,
  ): Promise<UserActivity> {
    // Create activity record
    const activity = this.activityRepository.create({
      user,
      type: dto.type,
      description: dto.description,
      metadata: dto.metadata,
      ipAddress:
        req.headers['x-forwarded-for']?.toString() ||
        (req.socket?.remoteAddress as string) ||
        'unknown',
      userAgent: req.headers['user-agent'],
      pageUrl: dto.pageUrl,
    });

    // Track in Google Analytics
    await this.analyticsService.trackEvent({
      category: 'User Activity',
      action: dto.type,
      label: dto.description,
      userId: user.id.toString(),
    });

    return this.activityRepository.save(activity);
  }

  async getUserActivities(userId: number): Promise<UserActivity[]> {
    return this.activityRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async getActivityStats(userId: number) {
    const stats = await this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.user_id = :userId', { userId })
      .select('activity.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('activity.type')
      .getRawMany();

    return stats;
  }
}
