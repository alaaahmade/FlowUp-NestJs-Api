import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../modules/roles/role.entity';
import { Permission } from '../../modules/permissions/permission.entity';

@Injectable()
export class RoleSeedService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async seed() {
    try {
      // Check if permissions already exist
      const existingPermissions = await this.permissionRepository.find();
      if (existingPermissions.length === 0) {
        // Create default permissions
        const permissions = await Promise.all([
          this.permissionRepository.save({
            name: 'Create User',
            key: 'create_user',
            resource: 'users',
            action: 'create',
            description: 'Can create new users',
          }),
          this.permissionRepository.save({
            name: 'Read User',
            key: 'read_user',
            resource: 'users',
            action: 'read',
            description: 'Can read user information',
          }),
        ]);

        // Check if roles already exist
        const existingRoles = await this.roleRepository.find();
        if (existingRoles.length === 0) {
          // Create admin role with all permissions
          await this.roleRepository.save({
            name: 'admin',
            description: 'Administrator role with full access',
            permissions: permissions,
          });

          // Create user role with limited permissions
          await this.roleRepository.save({
            name: 'user',
            description: 'Regular user role',
            permissions: [permissions[1]], // Only read permission
          });
        }
      }
    } catch (error: unknown) {
      console.log(error, 'Seed data already exists, skipping...');
    }
  }
}
