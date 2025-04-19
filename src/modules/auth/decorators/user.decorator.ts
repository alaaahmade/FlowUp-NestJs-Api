import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserResponse } from '../dto/user-response.dto';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: UserResponse;
}

export const User = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): UserResponse => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    if (!request.user) {
      throw new Error('User not found in request');
    }
    return request.user;
  },
);

export const CurrentUser = User; // Export CurrentUser as an alias for User
