import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './permission.entity';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { UsersModule } from '../users/users.module';
import { RoleGuard } from '../auth/guards/roles.guard';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission, User]), // Add User entity to TypeORM
    UsersModule, // Registers Permission entity
  ],
  providers: [
    PermissionService,
    RoleGuard, // Add RoleGuard as a provider
  ],
  controllers: [PermissionController],
  exports: [PermissionService, TypeOrmModule, RoleGuard], // Ensures other modules can use PermissionService & DB repo
})
export class PermissionModule {}
