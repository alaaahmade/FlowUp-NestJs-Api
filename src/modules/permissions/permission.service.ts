import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Permission } from './permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async create(createDto: CreatePermissionDto): Promise<Permission> {
    const existingPermission = await this.permissionRepository.findOne({
      where: [{ name: createDto.name }, { key: createDto.key }],
    });

    if (existingPermission) {
      throw new ConflictException(
        'Permission with this name or key already exists',
      );
    }

    const permission = this.permissionRepository.create(createDto);
    return this.permissionRepository.save(permission);
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find({
      relations: ['roles'],
    });
  }

  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id: parseInt(id, 10) },
      relations: ['roles'],
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return permission;
  }

  async update(
    id: string,
    updateDto: UpdatePermissionDto,
  ): Promise<Permission> {
    const permission = await this.findOne(id);
    const numericId = parseInt(id, 10);

    if ('name' in updateDto || 'key' in updateDto) {
      const existingPermission = await this.permissionRepository.findOne({
        where: [
          { name: updateDto.name, id: Not(numericId) },
          { key: updateDto.key, id: Not(numericId) },
        ],
      });

      if (existingPermission) {
        throw new ConflictException(
          'Permission with this name or key already exists',
        );
      }
    }

    Object.assign(permission, updateDto);
    return this.permissionRepository.save(permission);
  }

  async remove(id: string): Promise<void> {
    const permission = await this.findOne(id);
    await this.permissionRepository.remove(permission);
  }

  async findByResource(resource: string): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { name: resource },
      relations: ['roles'],
    });
  }

  async findByAction(action: string): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { key: action },
      relations: ['roles'],
    });
  }
}
