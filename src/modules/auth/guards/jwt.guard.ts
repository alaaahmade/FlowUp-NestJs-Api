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
export class RoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // ✅ Allow if no roles are required
    }

    const request = context.switchToHttp().getRequest<{ user?: User }>();
    const userId = request.user?.id;

    if (!userId) {
      throw new ForbiddenException(
        'Access denied: No user ID found in request.',
      );
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new ForbiddenException('Access denied: User not found.');
    }

    const userRoles = new Set(user.roles.map((role) => role.name));
    const hasRequiredRole = requiredRoles.some((role) => userRoles.has(role));

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        'Access denied: Insufficient role permissions.',
      );
    }

    return true;
  }
}
