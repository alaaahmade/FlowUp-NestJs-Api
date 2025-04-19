// src/middlewares/raw-body.middleware.ts
import * as bodyParser from 'body-parser';

export function rawBodyMiddleware() {
  return bodyParser.raw({ type: 'application/json' });
}
