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
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { Role } from './role.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Roles') // Swagger: Group endpoints under "Roles"
@ApiBearerAuth() // Swagger: Requires JWT Authentication
@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @ApiOperation({ summary: 'Get all roles with their permissions' })
  @ApiResponse({ status: 200, description: 'Return all roles', type: [Role] })
  async findAll(): Promise<Role[]> {
    return this.roleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a role by id' })
  @ApiResponse({ status: 200, description: 'Return a role', type: Role })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiParam({ name: 'id', example: 1, description: 'The ID of the role' })
  async findOne(@Param('id', ParseIntPipe) id: string): Promise<Role> {
    return this.roleService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiBody({ type: CreateRoleDto }) // Swagger: Defines the expected request body
  async create(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    return this.roleService.create(createRoleDto);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Update an existing role' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiParam({ name: 'id', example: 1, description: 'The ID of the role' })
  @ApiBody({ type: UpdateRoleDto }) // Swagger: Defines the expected request body
  async update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<Role> {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a role' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiParam({ name: 'id', example: 1, description: 'The ID of the role' })
  async remove(@Param('id', ParseIntPipe) id: string): Promise<void> {
    return this.roleService.remove(id);
  }
}
