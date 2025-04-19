/* eslint-disable @typescript-eslint/require-await */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { UserResponse } from 'src/modules/auth/interfaces/user.interface';
import { CreateNotificationDto } from 'src/modules/notifications/dto/create-notification.dto';
import { NotificationController } from 'src/modules/notifications/notification.controller';
import { NotificationType } from 'src/modules/notifications/notification.entity';
import { NotificationService } from 'src/modules/notifications/notification.service';

describe('NotificationController', () => {
  let controller: NotificationController;
  let service: NotificationService;

  const mockNotificationService = {
    create: jest.fn(async () => ({
      id: 1,
      message: 'Test notification',
    })),

    findAllForUser: jest.fn(async () => [
      { id: 1, message: 'Test notification' },
    ]),
    markAsRead: jest.fn(async () => ({
      id: 1,
      message: 'Test notification',
      read: true,
    })),
    deleteForUser: jest.fn(async () => undefined),
  };

  const mockUser: UserResponse = {
    id: 1,
    email: 'user@example.com',
    roles: ['user'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<NotificationController>(NotificationController);
    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a notification', async () => {
      const createNotificationDto: CreateNotificationDto = {
        message: 'Test notification',
        type: NotificationType.GENERAL,
        title: 'Test Title',
        body: 'Test Body',
      };
      const result = await controller.create(mockUser, createNotificationDto);
      expect(result).toEqual({
        message: 'Notification created successfully',
        notification: { id: 1, message: 'Test notification' },
      });
      expect(mockNotificationService.create).toHaveBeenCalledWith(
        mockUser,
        createNotificationDto,
      );
    });
  });

  describe('findAll', () => {
    it('should return all notifications for the current user', async () => {
      const result = await controller.findAll(mockUser);
      expect(result).toEqual({
        message: 'Notifications retrieved successfully',
        notifications: [{ id: 1, message: 'Test notification' }],
      });
      expect(jest.spyOn(service, 'findAllForUser')).toHaveBeenCalledWith(
        mockUser.id,
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const result = await controller.markAsRead(1, mockUser);
      expect(result).toEqual({
        message: 'Notification marked as read',
        notification: { id: 1, message: 'Test notification', read: true },
      });
      expect(jest.spyOn(service, 'markAsRead')).toHaveBeenCalledWith(
        1,
        mockUser.id,
      );
    });
  });

  describe('remove', () => {
    it('should delete a notification', async () => {
      const result = await controller.remove(1, mockUser);
      expect(result).toEqual({
        message: 'Notification deleted successfully',
      });
      expect(jest.spyOn(service, 'deleteForUser')).toHaveBeenCalledWith(
        1,
        mockUser.id,
      );
    });
  });
});
