import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationStatus } from './notification.entity';
import { User } from '../users/user.entity';
import { FCMService } from './fcm.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { MobileUser } from '../mobile-auth/entities/mobile-user.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly fcmService: FCMService,
  ) {}

  async createForMobileUser(
    user: MobileUser,
    dto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      mobileUser: user,
      ...dto,
    });

    console.log(user);

    if (user.fcmToken) {
      try {
        await this.fcmService.sendToDevice(user.fcmToken, {
          title: dto.title,
          body: dto.body,
          data: dto.data,
        });
        notification.status = NotificationStatus.SENT;
      } catch (error) {
        notification.status = NotificationStatus.FAILED;
        notification.error = error.message;
      }
    }

    return this.notificationRepository.save(notification);
  }

  async createNotificationForRecipient(
    recipient: MobileUser,
    dto: CreateNotificationDto,
  ): Promise<Notification> {
    return this.createForMobileUser(recipient, dto);
  }

  async findAllForUser(userId: number): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: number, userId: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.status = NotificationStatus.READ;
    return this.notificationRepository.save(notification);
  }

  async deleteForUser(id: number, userId: number): Promise<void> {
    const result = await this.notificationRepository.delete({
      id,
      user: { id: userId },
    });

    if (!result.affected) {
      throw new NotFoundException('Notification not found');
    }
  }

  async createForComingUsers(
    dto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      ...dto,
      status: NotificationStatus.PENDING,
    });

    return await this.notificationRepository.save(notification);
  }
}
