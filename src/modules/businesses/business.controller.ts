import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User as UserEntity } from '../users/user.entity';
import { User } from '../auth/decorators/user.decorator';
import { UserResponse } from '../auth/dto/user-response.dto';
import { Business } from './business.entity';

@ApiTags('Businesses') // ✅ Groups endpoints under "Businesses" in Swagger
@ApiBearerAuth() // ✅ Adds Authorization header in Swagger
@Controller('businesses')
@UseGuards(JwtAuthGuard)
export class BusinessController {
  constructor(
    private readonly businessService: BusinessService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  @ApiOperation({ summary: 'Create a new business' }) // ✅ Description for Swagger
  @ApiResponse({ status: 201, description: 'Business created successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Post()
  async create(
    @Body() createBusinessDto: CreateBusinessDto,
    @User() user: UserResponse,
  ): Promise<Business> {
    try {
      const userEntity = await this.userRepository.findOne({
        where: { id: user.id },
      });
      if (!userEntity) {
        throw new BadRequestException('User not found');
      }
      return await this.businessService.create(createBusinessDto, userEntity);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException();
    }
  }

  @ApiOperation({
    summary: 'Retrieve all businesses owned by the current user',
  })
  @ApiResponse({ status: 200, description: 'List of businesses' })
  @Get()
  async findAll(@User() user: UserResponse) {
    return this.businessService.findAllByUser(user.id);
  }

  @ApiOperation({ summary: 'Get details of a specific business by ID' })
  @ApiResponse({ status: 200, description: 'Business details returned' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserResponse,
  ) {
    return this.businessService.findOne(id, user.id);
  }

  @ApiOperation({ summary: 'Update an existing business' })
  @ApiResponse({ status: 200, description: 'Business updated successfully' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBusinessDto: UpdateBusinessDto,
    @User() user: UserResponse,
  ) {
    return this.businessService.update(id, user.id, updateBusinessDto);
  }

  @ApiOperation({ summary: 'Delete a business by ID' })
  @ApiResponse({ status: 200, description: 'Business deleted successfully' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserResponse,
  ) {
    await this.businessService.remove(id, user.id);
    return { message: 'Business deleted successfully' };
  }
}
