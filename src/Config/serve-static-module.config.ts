import { FILE_UPLOAD_CONFIG } from './file-upload.config';
import { registerAs } from '@nestjs/config';

export const SERVE_STATIC_MODULE_CONFIG = {
  rootPath: FILE_UPLOAD_CONFIG.uploadsPath,
  serveRoot: '/public',
  serveStaticOptions: {
    cacheControl: true,
    maxAge: 60000, // 60 seconds
  },
};

export const serveStaticModuleConfig = registerAs(
  'serveStaticModule',
  () => SERVE_STATIC_MODULE_CONFIG,
);
