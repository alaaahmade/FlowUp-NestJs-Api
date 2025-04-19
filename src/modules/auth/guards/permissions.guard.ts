import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/user.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user?: User }>();
    const userId = request.user?.id;

    if (!userId) {
      throw new ForbiddenException(
        'Access denied: No user ID found in request.',
      );
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new ForbiddenException('Access denied: User not found.');
    }

    const userPermissions = new Set(
      user.roles.flatMap((role) => role.permissions.map((p) => p.name)),
    );

    const requiredPermissions =
      this.reflector.get<string[]>('permissions', context.getHandler()) || [];

    if (requiredPermissions.length === 0) {
      return true; // No permissions required, allow access
    }

    const hasAllPermissions = requiredPermissions.every((perm) =>
      userPermissions.has(perm),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('Access denied: Insufficient permissions.');
    }

    return true;
  }
}
