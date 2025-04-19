import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionService } from './permission.service';
import { Permission } from './permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { RoleGuard } from '../auth/guards/roles.guard';

@ApiTags('Permissions') // ✅ Groups all endpoints under "Permissions" in Swagger
@ApiBearerAuth() // ✅ Adds Authorization header in Swagger
@Controller('permissions')
@UseGuards(JwtAuthGuard, RoleGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @ApiOperation({ summary: 'Create a new permission' }) // ✅ Describes what this endpoint does
  @ApiResponse({
    status: 201,
    description: 'Permission created successfully',
    type: Permission,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed' })
  @Post()
  async create(@Body() createDto: CreatePermissionDto): Promise<Permission> {
    return this.permissionService.create(createDto);
  }

  @ApiOperation({
    summary: 'Retrieve all permissions or filter by resource/action',
  })
  @ApiResponse({
    status: 200,
    description: 'List of permissions',
    type: [Permission],
  })
  @ApiQuery({
    name: 'resource',
    required: false,
    description: 'Filter by resource name',
  })
  @ApiQuery({
    name: 'action',
    required: false,
    description: 'Filter by action type',
  })
  @Get()
  async findAll(
    @Query('resource') resource?: string,
    @Query('action') action?: string,
  ): Promise<Permission[]> {
    if (resource) {
      return this.permissionService.findByResource(resource);
    }
    if (action) {
      return this.permissionService.findByAction(action);
    }
    return this.permissionService.findAll();
  }

  @ApiOperation({ summary: 'Retrieve a specific permission by ID' })
  @ApiResponse({
    status: 200,
    description: 'Permission details',
    type: Permission,
  })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: string): Promise<Permission> {
    return this.permissionService.findOne(id);
  }

  @ApiOperation({ summary: 'Update an existing permission by ID' })
  @ApiResponse({
    status: 200,
    description: 'Permission updated successfully',
    type: Permission,
  })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateDto: UpdatePermissionDto,
  ): Promise<Permission> {
    return this.permissionService.update(id, updateDto);
  }

  @ApiOperation({ summary: 'Delete a permission by ID' })
  @ApiResponse({ status: 200, description: 'Permission deleted successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: string): Promise<void> {
    return this.permissionService.remove(id);
  }
}
