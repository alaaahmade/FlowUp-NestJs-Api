import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import {
  RegistrationDto,
  VerificationDto,
  LoginDto,
} from '../../modules/mobile-auth/dto';
import { MobileAuthOptionsResponse } from '../responses/mobile-auth-options.response';

export const ApiMobileAuthOptions = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get mobile authentication options',
      description: 'Retrieves available options for gender and interests',
    }),
    ApiResponse({
      status: 200,
      description: 'Returns available options for gender and interests',
      type: MobileAuthOptionsResponse,
    }),
  );

export const ApiMobileRegister = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Initiate mobile registration',
      description:
        'Start the registration process by sending a verification code to email or phone',
    }),
    ApiBody({ type: RegistrationDto }),
    ApiResponse({
      status: 200,
      description: 'Verification code sent successfully',
      schema: {
        example: {
          identifier: 'user@example.com',
          expiresIn: '3h',
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid identifier format or user already exists',
    }),
  );

export const ApiVerifyRegistration = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Verify mobile registration',
      description: 'Verify the registration code sent to the user',
    }),
    ApiBody({ type: VerificationDto }),
    ApiResponse({
      status: 200,
      description: 'Registration code verified successfully',
      schema: {
        example: {
          success: true,
          identifier: 'user@example.com',
        },
      },
    }),
  );

export const ApiCompleteRegistration = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Complete registration with user details',
      description:
        'Complete the registration process by providing user details. Requires prior verification of the identifier.',
    }),
    ApiResponse({
      status: 201,
      description: 'User registered successfully',
      schema: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string', nullable: true },
              fullName: { type: 'string' },
            },
          },
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
          expiresIn: { type: 'string' },
          refreshExpiresIn: { type: 'string' },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description:
        'Identifier not verified. Please verify your identifier first.',
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid input data or user already exists',
    }),
  );
};

export const ApiMobileLogin = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Initiate mobile login',
      description: 'Start the login process by sending a verification code',
    }),
    ApiBody({ type: LoginDto }),
    ApiResponse({
      status: 200,
      description: 'Verification code sent successfully',
      schema: {
        example: {
          identifier: 'user@example.com',
          expiresIn: '3h',
        },
      },
    }),
  );

export const ApiVerifyLogin = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Verify mobile login',
      description:
        'Complete login by verifying the code and returning access tokens',
    }),
    ApiBody({ type: VerificationDto }),
    ApiResponse({
      status: 200,
      description: 'Login successful',
      schema: {
        example: {
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'user@example.com',
            fullName: 'John Doe',
          },
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'abc123...',
          expiresIn: '15m',
          refreshExpiresIn: '30d',
        },
      },
    }),
  );
