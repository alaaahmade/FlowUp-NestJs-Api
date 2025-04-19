import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/modules/users/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: { id: number };
      route?: { permissions?: string[] };
    }>();

    if (!request.user?.id) return false; // User not authenticated

    // Fetch user with roles and permissions
    const user = await this.userRepository.findOne({
      where: { id: request.user.id },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) return false;

    // Extract user permissions
    const userPermissions: string[] = user.roles.flatMap((role) =>
      role.permissions.map((p) => p.name),
    );

    // Ensure route and permissions are well-defined
    const requiredPermissions: string[] = request.route?.permissions ?? [];

    return requiredPermissions.every((perm) => userPermissions.includes(perm));
  }
}
