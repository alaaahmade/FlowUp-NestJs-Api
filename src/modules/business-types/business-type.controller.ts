import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { BusinessTypeService } from './business-type.service';
import { BusinessType } from './business-type.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateBusinessTypeDto } from './dto/create-business-type.dto';
import { UpdateBusinessTypeDto } from './dto/update-business-type.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Business Types') // Swagger: Groups all endpoints under "Business Types"
@ApiBearerAuth() // Swagger: Requires JWT authentication
@Controller('business-types')
@UseGuards(JwtAuthGuard)
export class BusinessTypeController {
  constructor(private readonly businessTypeService: BusinessTypeService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all business types' })
  @ApiResponse({
    status: 200,
    description: 'List of business types retrieved successfully',
  })
  async findAll(): Promise<BusinessType[]> {
    return this.businessTypeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single business type by ID' })
  @ApiResponse({
    status: 200,
    description: 'Business type retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Business type not found' })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'The ID of the business type',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<BusinessType> {
    const businessType = await this.businessTypeService.findOne(id);
    if (!businessType) {
      throw new NotFoundException('Business type not found');
    }
    return businessType;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new business type' })
  @ApiResponse({
    status: 201,
    description: 'Business type created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiBody({ type: CreateBusinessTypeDto }) // Swagger: Defines the expected request body
  async create(
    @Body() createDto: CreateBusinessTypeDto,
  ): Promise<BusinessType> {
    return this.businessTypeService.create(createDto);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Update an existing business type' })
  @ApiResponse({
    status: 200,
    description: 'Business type updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 404, description: 'Business type not found' })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'The ID of the business type',
  })
  @ApiBody({ type: UpdateBusinessTypeDto }) // Swagger: Defines the expected request body
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateBusinessTypeDto,
  ): Promise<BusinessType> {
    return this.businessTypeService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a business type' })
  @ApiResponse({
    status: 200,
    description: 'Business type deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Business type not found' })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'The ID of the business type',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.businessTypeService.remove(id);
  }
}
