import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/roles.guard';
import { User } from '../auth/decorators/user.decorator';
import { UserResponse } from '../auth/interfaces/user.interface';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateRatingDto } from './dto/create-rating.dto';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}
  @Post('/categories')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new service category' })
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    console.log(createCategoryDto);

    return this.servicesService.createCategory(createCategoryDto);
  }
  @Get('/categories')
  @ApiOperation({ summary: 'Get all service categories' })
  findAllCategories() {
    return this.servicesService.findAllCategories();
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new service' })
  @ApiResponse({ status: 201, description: 'Service created successfully' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all services' })
  @ApiQuery({ name: 'category', required: false })
  findAll(@Query('category') category?: string) {
    if (category) {
      return this.servicesService.findServicesByCategory(+category);
    }
    return this.servicesService.findAll();
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured services' })
  getFeatured() {
    return this.servicesService.findFeaturedServices();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a service by ID' })
  @ApiParam({ name: 'id', type: 'number' })
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a service' })
  @ApiParam({ name: 'id', type: 'number' })
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(+id, updateServiceDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a service' })
  @ApiParam({ name: 'id', type: 'number' })
  remove(@Param('id') id: string) {
    return this.servicesService.remove(+id);
  }

  @Post('reviews')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add a review to a service' })
  @ApiResponse({ status: 201, description: 'Review added successfully' })
  async addReview(
    @User() user: UserResponse,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.servicesService.addReview(user.id, createReviewDto);
  }

  @Get('category/:id')
  @ApiOperation({ summary: 'Get a service category by ID' })
  @ApiParam({ name: 'id', type: 'number' })
  findOneCategory(@Param('id') id: string) {
    return this.servicesService.findOneCategory(+id);
  }

  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a service category' })
  @ApiParam({ name: 'id', type: 'number' })
  updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.servicesService.updateCategory(+id, updateCategoryDto);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a service category' })
  @ApiParam({ name: 'id', type: 'number' })
  removeCategory(@Param('id') id: string) {
    console.log({ id: id });
    return this.servicesService.removeCategory(id);
  }

  @Get('by-category/:id')
  @ApiOperation({ summary: 'Get services by category ID' })
  @ApiParam({ name: 'id', type: 'number' })
  findServicesByCategory(@Param('id') id: string) {
    return this.servicesService.findServicesByCategory(+id);
  }

  @Post(':id/ratings')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a rating to a service' })
  @ApiParam({ name: 'id', type: 'number' })
  addRating(@Param('id') id: string, @Body() createRatingDto: CreateRatingDto) {
    return this.servicesService.addRating(+id, createRatingDto);
  }

  @Get(':id/ratings')
  @ApiOperation({ summary: 'Get all ratings for a service' })
  @ApiParam({ name: 'id', type: 'number' })
  getRatingsForService(@Param('id') id: string) {
    return this.servicesService.getRatingsForService(+id);
  }

  @Patch('ratings/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a rating' })
  @ApiParam({ name: 'id', type: 'number' })
  updateRating(
    @Param('id') id: string,
    @Body() updateRatingDto: Partial<CreateRatingDto>,
  ) {
    return this.servicesService.updateRating(+id, updateRatingDto);
  }

  @Delete('ratings/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a rating' })
  @ApiParam({ name: 'id', type: 'number' })
  removeRating(@Param('id') id: string) {
    return this.servicesService.removeRating(+id);
  }
}
