import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './role.entity';
import { Permission } from '../permissions/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

interface PermissionWithId {
  id: number;
}

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: {
        permissions: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        permissions: {
          id: true,
          name: true,
          key: true,
          resource: true,
          action: true,
        },
      },
    });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id: parseInt(id, 10) },
      relations: {
        permissions: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        permissions: {
          id: true,
          name: true,
          key: true,
          resource: true,
          action: true,
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const { permissions, ...roleData } = createRoleDto;

    // Find permissions by IDs
    const permissionEntities = await this.permissionRepository.findBy({
      id: In(permissions),
    });

    const role = this.roleRepository.create({
      ...roleData,
      permissions: permissionEntities,
    });

    return this.roleRepository.save(role);
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const { permissions, ...roleData } = updateRoleDto;
    const role = await this.findOne(id);

    if (permissions && permissions.length > 0) {
      const permissionIds = permissions.map(
        (p: number | PermissionWithId): number => {
          if (typeof p === 'number') return p;
          return p.id;
        },
      );

      const permissionEntities = await this.permissionRepository.findBy({
        id: In(permissionIds),
      });

      if (!permissionEntities.length) {
        throw new NotFoundException('No valid permissions found');
      }

      role.permissions = permissionEntities;
    }

    Object.assign(role, roleData);
    return this.roleRepository.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);
    await this.roleRepository.remove(role);
  }
}
