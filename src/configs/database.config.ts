import { registerAs } from '@nestjs/config';

export type DatabaseConfig = {
  type: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
  logging: boolean;
  entities: string[];
  migrations: string[];
};

export const databaseConfig = registerAs(
  'database',
  (): DatabaseConfig => ({
    type: 'postgres',
    host: process.env.APP_DOCKERIZED === 'true' ? 'database' : process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT) || 5432,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    synchronize: process.env.APP_ENV === 'development',
    logging: process.env.APP_ENV === 'development',
    entities: [__dirname + '/../entities/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../../database/migrations/**/*.ts'],
  }),
);
