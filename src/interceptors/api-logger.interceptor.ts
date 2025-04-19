import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class ApiLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('API');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, ip } = request;
    const startTime = Date.now();

    // Log the incoming request
    console.log('\n=== Incoming Request ===');
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`IP: ${ip}`);
    console.log(`Method: ${method}`);
    console.log(`URL: ${url}`);
    console.log(`Body: ${JSON.stringify(body)}`);
    console.log('=====================\n');

    return next.handle().pipe(
      tap({
        next: (data) => {
          const endTime = Date.now();
          const duration = endTime - startTime;

          // Log the response
          console.log('\n=== Response ===');
          console.log(`Status: Success`);
          console.log(`Duration: ${duration}ms`);
          console.log(`Data: ${JSON.stringify(data)}`);
          console.log('================\n');
        },
        error: (error) => {
          const endTime = Date.now();
          const duration = endTime - startTime;

          // Log the error
          console.log('\n=== Error Response ===');
          console.log(`Status: Error`);
          console.log(`Duration: ${duration}ms`);
          console.log(`Error: ${error.message}`);
          console.log(`Stack: ${error.stack}`);
          console.log('===================\n');
        },
      }),
      catchError((error) => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        // Log the error
        console.log('\n=== Error Response ===');
        console.log(`Status: Error`);
        console.log(`Duration: ${duration}ms`);
        console.log(`Error: ${error.message}`);
        console.log(`Stack: ${error.stack}`);
        console.log('===================\n');

        throw error;
      }),
    );
  }
}

