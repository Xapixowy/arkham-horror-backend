import { ConfigFactory } from '@nestjs/config';
import { databaseConfig } from './database.config';
import { validationPipeConfig } from './validation-pipe.config';
import { fileUploadConfig } from './file-upload.config';
import { serveStaticModuleConfig } from './serve-static-module.config';

export const configs: ConfigFactory[] = [
  databaseConfig,
  validationPipeConfig,
  fileUploadConfig,
  serveStaticModuleConfig,
];
