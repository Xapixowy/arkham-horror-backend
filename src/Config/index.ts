import { ConfigFactory } from '@nestjs/config';
import { databaseConfig } from './database.config';
import { validationPipeConfig } from './validation-pipe.config';

export const configs: ConfigFactory[] = [databaseConfig, validationPipeConfig];
