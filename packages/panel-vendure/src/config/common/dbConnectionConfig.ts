import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const env = process.env;

const migrationPath = path.join(__dirname, '../../migrations-db/*.ts');

/* eslint-disable  */
const dbConnectionConfig: any = {
  type: 'postgres',
  host: env.DB_HOST,
  port: parseInt(env.DB_PORT || ''),
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: env.SYNC, // turn this off for production
  logging: true,
  migrations: [migrationPath],
};

export default dbConnectionConfig;
