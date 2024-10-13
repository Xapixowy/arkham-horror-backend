import { registerAs } from '@nestjs/config';

export type ServeStaticModuleConfig = {
  serveRoot: string;
  serveStaticOptions: {
    cacheControl: boolean;
    maxAge: number;
  };
};

export const serveStaticModuleConfig = registerAs(
  'serveStaticModule',
  (): ServeStaticModuleConfig => ({
    serveRoot: '/public',
    serveStaticOptions: {
      cacheControl: true,
      maxAge: 60000, // 60 seconds
    },
  }),
);
