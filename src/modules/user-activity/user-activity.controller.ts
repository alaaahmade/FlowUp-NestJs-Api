import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserActivityService } from './user-activity.service';
import { TrackActivityDto } from './dto/track-activity.dto';
import { User } from '../auth/decorators/user.decorator';
import { UserResponse } from '../auth/interfaces/user.interface';
import { Request as ExpressRequest } from 'express';
import { User as UserEntity } from '../users/user.entity';
import { AuthProvider } from '../users/enums/auth-provider.enum';
import { Role } from '../roles/role.entity';

@ApiTags('User Activity')
@ApiBearerAuth()
@Controller('user-activity')
@UseGuards(JwtAuthGuard)
export class UserActivityController {
  constructor(private readonly activityService: UserActivityService) {}

  @Post('track')
  @ApiOperation({ summary: 'Track user activity' })
  async trackActivity(
    @User() user: UserResponse,
    @Body() dto: TrackActivityDto,
    @Req() req: ExpressRequest,
  ) {
    const userEntity: Partial<UserEntity> = {
      id: user?.id ?? 0,
      email: user?.email ?? '',
      fullName: user?.fullName ?? '',
      picture: user?.picture,
      password: '',
      provider: AuthProvider.LOCAL,
      socialId: '',
      businesses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: (user?.roles ?? []).map(
        (roleName) => ({ name: roleName }) as Role,
      ),
    };

    const activity = await this.activityService.trackActivity(
      userEntity as UserEntity,
      dto,
      req,
    );
    return {
      message: 'Activity tracked successfully',
      activity,
    };
  }

  @Get('history')
  @ApiOperation({ summary: 'Get user activity history' })
  async getActivityHistory(@User() user: UserResponse) {
    const activities = await this.activityService.getUserActivities(user.id);
    return {
      message: 'Activity history retrieved successfully',
      activities,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user activity statistics' })
  async getActivityStats(@User() user: UserResponse) {
    const stats = await this.activityService.getActivityStats(user.id);
    return {
      message: 'Activity statistics retrieved successfully',
      stats,
    };
  }
}
