import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  HttpException,
  HttpStatus,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { User } from './user.entity';
import { Permission } from '../permissions/permission.entity';
// import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { RoleGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Custom Request Interfaces
export interface CustomRoute {
  permissions: Permission[];
}

export interface CustomRequest extends Request {
  user?: User;
  route: CustomRoute;
}

interface CustomError {
  message: string;
}

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('users')
export class UsersController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    private readonly usersService: UsersService,
  ) {}

  @Get('profile')
  @ApiOperation({ summary: 'Retrieve logged-in user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Req() req: CustomRequest) {
    return {
      message: 'Protected route',
      user: req.user,
    };
  }

  @Get('test-permissions')
  @ApiOperation({ summary: 'Test user permissions' })
  @ApiResponse({ status: 200, description: 'Access granted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async testUserPermissions(@Req() req: CustomRequest) {
    req.route = req.route || { permissions: [] as Permission[] };

    const permission = await this.permissionRepository.findOne({
      where: { name: 'view_users' },
    });

    if (!permission) {
      return { message: 'Required permission not found', statusCode: 404 };
    }

    req.route.permissions = [permission];

    const userId: number | undefined = req.user?.id;

    if (!userId) {
      return { message: 'Unauthorized', statusCode: 401 };
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      return { message: 'User not found', statusCode: 404 };
    }

    return {
      message: 'Access granted',
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles.map((role) => role.name),
        permissions: user.roles.flatMap((role) =>
          role.permissions.map((p) => p.name),
        ),
      },
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBody({ type: CreateUserDto }) // Swagger: Define the expected request body
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);
      return {
        message: 'User created successfully',
        user,
      };
    } catch (error: unknown) {
      const customError = error as CustomError;
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to create user',
          message: customError.message || 'Unknown error',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAllUsers() {
    try {
      const users = await this.usersService.findAll();
      return {
        message: 'Users retrieved successfully',
        users,
      };
    } catch (error: unknown) {
      const customError = error as CustomError;
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to retrieve users',
          message: customError.message || 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/customers')
  @ApiOperation({ summary: 'Retrieve all customers' })
  @ApiResponse({ status: 200, description: 'customers retrieved successfully' })
  async findAllCustomers() {
    try {
      const users = await this.usersService.findCustomers();
      return {
        message: 'Users retrieved successfully',
        users,
      };
    } catch (error: unknown) {
      const customError = error as CustomError;
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to retrieve users',
          message: customError.message || 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('/customers/:id')
  @ApiOperation({ summary: 'Retrieve all customers' })
  @ApiResponse({ status: 200, description: 'customers retrieved successfully' })
  async deleteCustomer(@Param('id') id: string) {
    try {
      await this.usersService.deleteCustomer(id);
      return {
        message: 'Users retrieved successfully',
      };
    } catch (error: unknown) {
      const customError = error as CustomError;
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to retrieve users',
          message: customError.message || 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', example: 1, description: 'User ID' })
  async findOneUser(@Param('id') id: number) {
    try {
      const user = await this.usersService.findOne(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return {
        message: 'User retrieved successfully',
        user,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to retrieve user',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiParam({ name: 'id', example: 1, description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      const updatedUser = await this.usersService.update(id, updateUserDto);
      return {
        message: 'User updated successfully',
        user: updatedUser,
      };
    } catch (error: unknown) {
      const customError = error as CustomError;
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to update user',
          message: customError.message || 'Unknown error',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiParam({ name: 'id', example: 1, description: 'User ID' })
  async removeUser(@Param('id') id: number) {
    try {
      await this.usersService.remove(id);
      return {
        message: 'User deleted successfully',
      };
    } catch (error: unknown) {
      const customError = error as CustomError;
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to delete user',
          message: customError.message || 'Unknown error',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
