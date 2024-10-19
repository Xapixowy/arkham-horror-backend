import { registerAs } from '@nestjs/config';
import { Language } from '@Enums/language';

export type AppConfig = {
  backend_url: string;
  backend_port: number;
  frontend_url: string;
  language: Language;
  available_languages: Language[];
};

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    backend_url: process.env.APP_URL,
    backend_port: parseInt(process.env.APP_PORT),
    frontend_url: process.env.FRONTEND_URL,
    language: Language.POLISH,
    available_languages: [Language.ENGLISH, Language.POLISH],
  }),
);
