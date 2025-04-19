import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../src/modules/users/users.controller';
import { UsersService } from '../../src/modules/users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../src/modules/users/user.entity';
import { Permission } from '../../src/modules/permissions/permission.entity';
import { CreateUserDto } from '../../src/modules/users/dto/create-user.dto';
import { UpdateUserDto } from '../../src/modules/users/dto/update-user.dto';
import { NotFoundException } from '@nestjs/common';
import { Role } from '../../src/modules/roles/role.entity';
import { CustomRequest } from '../../src/modules/users/users.controller';
import { JwtService } from '@nestjs/jwt';
import { PermissionsGuard } from '../../src/modules/auth/guards/permissions.guard';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

const createMockRequest = (user: Partial<User>): CustomRequest =>
  ({
    user: user as User,
    route: { permissions: [] },
    get: jest.fn().mockReturnValue(''),
    header: jest.fn().mockReturnValue(''),
    accepts: jest.fn().mockReturnValue(true),
  }) as unknown as CustomRequest;

// Add mock guards
const mockJwtAuthGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

const mockPermissionsGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockPermission: Permission = {
    id: 1,
    name: 'Create User',
    description: 'Can create new users',
    key: 'create_user',
    resource: 'users',
    action: 'create',
    roles: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRole: Role = {
    id: 1,
    name: 'Admin',
    description: 'Administrator role',
    permissions: [mockPermission],
    users: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'hashedPassword123',
    roles: [mockRole],
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockUser),
            find: jest.fn().mockResolvedValue([mockUser]),
            create: jest.fn().mockReturnValue(mockUser),
            save: jest.fn().mockResolvedValue(mockUser),
            update: jest.fn().mockResolvedValue(true),
            delete: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: getRepositoryToken(Permission),
          useValue: {
            findOne: jest.fn().mockResolvedValue({ name: 'view_users' }),
          },
        },
        {
          provide: getRepositoryToken(Role),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockRole),
            find: jest.fn().mockResolvedValue([mockRole]),
            create: jest.fn().mockReturnValue(mockRole),
            save: jest.fn().mockResolvedValue(mockRole),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock_token'),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(PermissionsGuard)
      .useValue(mockPermissionsGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('getProfile', () => {
    it('should return user profile', () => {
      const req = createMockRequest(mockUser);
      expect(controller.getProfile(req)).toEqual({
        message: 'Protected route',
        user: mockUser,
      });
    });
  });

  describe('testUserPermissions', () => {
    it('should test user permissions successfully', async () => {
      const req = createMockRequest({ id: 1 } as User);
      const result = await controller.testUserPermissions(req);
      expect(result.message).toBe('Access granted');
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123',
      };

      const result = await controller.createUser(createUserDto);
      expect(result.message).toBe('User created successfully');
      expect(result.user).toHaveProperty('id');
    });

    it('should handle errors when creating user', async () => {
      jest
        .spyOn(usersService, 'create')
        .mockRejectedValue(new Error('Database error'));

      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123',
      };

      await expect(controller.createUser(createUserDto)).rejects.toThrow();
    });
  });

  describe('findAllUsers', () => {
    it('should return all users', async () => {
      const result = await controller.findAllUsers();
      expect(result.message).toBe('Users retrieved successfully');
      expect(result.users).toBeInstanceOf(Array);
    });
  });

  describe('findOneUser', () => {
    it('should return a single user', async () => {
      const result = await controller.findOneUser(1);
      expect(result.message).toBe('User retrieved successfully');
      expect(result.user).toHaveProperty('id', 1);
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(null);
      await expect(controller.findOneUser(999)).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const result = await controller.updateUser(1, updateUserDto);
      expect(result.message).toBe('User updated successfully');
      expect(result.user).toHaveProperty('id');
    });
  });

  describe('removeUser', () => {
    it('should delete a user', async () => {
      const result = await controller.removeUser(1);
      expect(result.message).toBe('User deleted successfully');
    });

    it('should handle errors when deleting user', async () => {
      jest
        .spyOn(usersService, 'remove')
        .mockRejectedValue(new Error('Database error'));

      await expect(controller.removeUser(1)).rejects.toThrow();
    });
  });
});
