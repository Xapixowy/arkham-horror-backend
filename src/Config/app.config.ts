import { registerAs } from '@nestjs/config';

export type AppConfig = {
  backend_url: string;
  backend_port: number;
  frontend_url: string;
};

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    backend_url: process.env.APP_URL,
    backend_port: parseInt(process.env.APP_PORT),
    frontend_url: process.env.FRONTEND_URL,
  }),
);
