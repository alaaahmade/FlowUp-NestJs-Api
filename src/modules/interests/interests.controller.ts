import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { InterestsService } from './interests.service';
import { Interests } from './user-interests.entity';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Interests')
@ApiBearerAuth()
@Controller('interests')
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new interest' })
  @ApiResponse({ status: 201, description: 'Interest created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createInterestDto: Partial<Interests>) {
    try {
      const interest = await this.interestsService.create(createInterestDto);
      return {
        message: 'Interest created successfully',
        interest,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all interests' })
  @ApiResponse({
    status: 200,
    description: 'All interests retrieved successfully',
  })
  async findAll() {
    const interests = await this.interestsService.findAll();
    return {
      message: 'All interests retrieved successfully',
      interests,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve an interest' })
  @ApiResponse({ status: 200, description: 'Interest retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Interest not found' })
  @ApiParam({ name: 'id', example: 1, description: 'Interest ID' })
  async findOne(@Param('id') id: number) {
    const interest = await this.interestsService.findOne(id);
    return {
      message: 'Interest retrieved successfully',
      interest,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an interest' })
  @ApiResponse({ status: 200, description: 'Interest updated successfully' })
  @ApiResponse({ status: 404, description: 'Interest not found' })
  @ApiParam({ name: 'id', example: 1, description: 'Interest ID' })
  async update(
    @Param('id') id: number,
    @Body() updateInterestDto: Partial<Interests>,
  ) {
    const interest = await this.interestsService.update(id, updateInterestDto);
    return {
      message: 'Interest updated successfully',
      interest,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an interest' })
  @ApiResponse({ status: 200, description: 'Interest deleted successfully' })
  @ApiResponse({ status: 404, description: 'Interest not found' })
  @ApiParam({ name: 'id', example: 1, description: 'Interest ID' })
  async remove(@Param('id') id: number) {
    await this.interestsService.remove(id);
    return {
      message: 'Interest deleted successfully',
      status: HttpStatus.OK,
    };
  }

  @Get('user/:id')
  @ApiOperation({ summary: 'Retrieve mobile user interests' })
  @ApiResponse({
    status: 200,
    description: 'Mobile user interests retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Mobile user not found' })
  @ApiParam({ name: 'id', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Mobile User ID' })
  async findUserInterests(@Param('id', ParseUUIDPipe) id: string) {
    const interests = await this.interestsService.getUserInterests(id);
    return {
      message: 'Mobile user interests retrieved successfully',
      interests,
    };
  }

  @Post('user/:id')
  @ApiOperation({ summary: 'Add interest to a mobile user' })
  @ApiResponse({ status: 200, description: 'Interest added successfully' })
  @ApiResponse({ status: 404, description: 'Mobile user not found' })
  @ApiParam({ name: 'id', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Mobile User ID' })
  async addUserInterest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { interestId: number }
  ) {
    const user = await this.interestsService.addUserInterest(id, body.interestId);
    return {
      message: 'Interest added successfully',
      user,
    };
  }

  @Delete('user/:id')
  @ApiOperation({ summary: 'Remove interest from a mobile user' })
  @ApiResponse({ status: 200, description: 'Interest removed successfully' })
  @ApiResponse({ status: 404, description: 'Mobile user not found' })
  @ApiParam({ name: 'id', example: '123e4567-e89b-12d3-a456-426614174000', description: 'Mobile User ID' })
  async removeUserInterest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { interestId: number }
  ) {
    const user = await this.interestsService.removeUserInterest(id, body.interestId);
    return {
      message: 'Interest removed successfully',
      user,
    };
  }
}
