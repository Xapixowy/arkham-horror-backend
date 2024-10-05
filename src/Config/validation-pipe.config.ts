import { registerAs } from '@nestjs/config';

export const validationPipeConfig = registerAs('validationPipe', () => ({
  transform: true,
  forbidNonWhitelisted: true,
  whitelist: true,
}));
