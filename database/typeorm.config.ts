import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.APP_DOCKERIZED === 'true' ? 'database' : process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: process.env.APP_ENV === 'development',
  logging: process.env.APP_ENV === 'development',
  entities: [__dirname + '/../src/entities/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/**/*.ts'],
  seeds: [__dirname + '/../../database/seeds/**/*.ts'],
  factories: [__dirname + '/../../database/factories/**/*.ts'],
} as DataSourceOptions & { seeds: string[]; factories: string[] });
