import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  UseGuards,
  BadRequestException,
  Body,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { User } from '../auth/decorators/user.decorator';
import { UserResponse } from '../auth/interfaces/user.interface';
import { UsersService } from '../users/users.service';
import { Service } from '../services/entities/service.entity';
import { ServicesService } from '../services/services.service';
import { MobileUserService } from '../mobile-auth/services/mobile-user.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly customerService: MobileUserService,
    private readonly serviceService: ServicesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  async create(
    @Body() createNotificationDto: CreateNotificationDto,
    @Query('targetGroup') targetGroup: string,
    @Query('targetId') targetId?: string, // comma-separated IDs (optional)
  ) {
    let customers;

    switch (targetGroup) {
      case 'ALL_BOOKED_CUSTOMERS':
        customers = await this.customerService.findAll();
        break;

      case 'CUSTOMERS_BOOKED_SERVICE':
        if (!targetId) {
          throw new BadRequestException('targetIds is required');
        }

        customers = await this.customerService.findByServiceId(+targetId);
        break;

      case 'CUSTOMERS_SPECIFIC_CLASS':
        if (!targetId) {
          throw new BadRequestException('targetIds is required');
        }
        customers = await this.customerService.getCustomersByClass(
          targetId.split(',').map(Number), // Convert each string to a number
        );
        break;

      default:
        throw new BadRequestException('Invalid targetGroup');
    }

    const notifications = await Promise.all(
      customers.map((customer) =>
        this.notificationService.createNotificationForRecipient(
          customer,
          createNotificationDto,
        ),
      ),
    );

    if (!customers.length) {
      return {
        notifications: await this.notificationService.createForComingUsers(
          createNotificationDto,
        ),
        message: 'Notification sent successfully',
      };
    }
    return {
      message: 'Notification sent successfully',
      notifications,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications for the current user' })
  async findAll(@User() user: UserResponse) {
    const notifications = await this.notificationService.findAllForUser(
      user.id,
    );
    return {
      message: 'Notifications retrieved successfully',
      notifications,
    };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markAsRead(@Param('id') id: number, @User() user: UserResponse) {
    const notification = await this.notificationService.markAsRead(id, user.id);
    return {
      message: 'Notification marked as read',
      notification,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  async remove(@Param('id') id: number, @User() user: UserResponse) {
    await this.notificationService.deleteForUser(id, user.id);
    return {
      message: 'Notification deleted successfully',
    };
  }
}
