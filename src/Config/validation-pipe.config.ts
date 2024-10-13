import { registerAs } from '@nestjs/config';

export type ValidationPipeConfig = {
  transform: boolean;
  forbidNonWhitelisted: boolean;
  whitelist: boolean;
};

export const validationPipeConfig = registerAs(
  'validationPipe',
  (): ValidationPipeConfig => ({
    transform: true,
    forbidNonWhitelisted: true,
    whitelist: true,
  }),
);
