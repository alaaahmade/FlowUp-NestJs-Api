import { Request } from 'express';
import { JwtPayload } from '../types/jwt-payload.type';

export type RequestWithUser = Request & {
  user: JwtPayload;
};
