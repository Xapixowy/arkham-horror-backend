import { registerAs } from '@nestjs/config';
import { HttpException, ValidationError } from '@nestjs/common';
import { ValidationFailedException } from '@exceptions/validation-failed.exception';

export type ValidationPipeConfig = {
  transform: boolean;
  forbidNonWhitelisted: boolean;
  whitelist: boolean;
  exceptionFactory: (errors: ValidationError[]) => HttpException;
};

export const validationPipeConfig = registerAs(
  'validationPipe',
  (): ValidationPipeConfig => ({
    transform: true,
    forbidNonWhitelisted: true,
    whitelist: true,
    exceptionFactory: (errors: ValidationError[]) =>
      new ValidationFailedException(errors),
  }),
);
