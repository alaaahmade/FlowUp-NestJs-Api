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
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdvertisementService } from './advertisement.service';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { UpdateAdvertisementDto } from './dto/update-advertisement.dto';

@ApiTags('Advertisements')
@ApiBearerAuth()
@Controller('advertisements')
@UseGuards(JwtAuthGuard)
export class AdvertisementController {
  constructor(private readonly advertisementService: AdvertisementService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new advertisement' })
  async create(@Body() createAdvertisementDto: CreateAdvertisementDto) {
    const advertisement = await this.advertisementService.create(
      createAdvertisementDto,
    );
    return {
      message: 'Advertisement created successfully',
      advertisement,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all advertisements' })
  @ApiQuery({ name: 'type', required: false })
  async findAll(@Query('type') type?: string) {
    const advertisements = type
      ? await this.advertisementService.findByType(type)
      : await this.advertisementService.findAll();

    return {
      message: 'Advertisements retrieved successfully',
      advertisements,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get advertisement by id' })
  async findOne(@Param('id') id: string) {
    const advertisement = await this.advertisementService.findOne(+id);
    return {
      message: 'Advertisement retrieved successfully',
      advertisement,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update advertisement' })
  async update(
    @Param('id') id: string,
    @Body() updateAdvertisementDto: UpdateAdvertisementDto,
  ) {
    const advertisement = await this.advertisementService.update(
      +id,
      updateAdvertisementDto,
    );
    return {
      message: 'Advertisement updated successfully',
      advertisement,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete advertisement' })
  async remove(@Param('id') id: string) {
    await this.advertisementService.remove(+id);
    return {
      message: 'Advertisement deleted successfully',
    };
  }
}
