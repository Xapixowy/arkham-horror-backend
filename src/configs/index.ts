import { ConfigFactory } from '@nestjs/config';
import { databaseConfig } from './database.config';
import { validationPipeConfig } from './validation-pipe.config';
import { fileUploadConfig } from './file-upload.config';
import { serveStaticModuleConfig } from './serve-static-module.config';
import { jwtConfig } from './jwt.config';
import { bcryptConfig } from './bcrypt.config';
import { mailerConfig } from './mailer.config';
import { appConfig } from './app.config';
import { i18nConfig } from './i18n.config';
import { gameSessionsConfig } from '@Configs/game_sessions.config';

export const configs: ConfigFactory[] = [
  appConfig,
  databaseConfig,
  validationPipeConfig,
  fileUploadConfig,
  serveStaticModuleConfig,
  bcryptConfig,
  jwtConfig,
  mailerConfig,
  i18nConfig,
  gameSessionsConfig,
];
