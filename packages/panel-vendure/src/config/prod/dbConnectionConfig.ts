import path from 'path';
import dotenv from 'dotenv';
import commonDbConnectionConfig from '../common/dbConnectionConfig';

dotenv.config();

const env = process.env;
const migrationPath = path.join(__dirname, '../../migrations-db/*{.ts,*.js}');

/* eslint-disable  */
const dbConnectionConfig: any = {
  ...commonDbConnectionConfig,
  migrations: [migrationPath],
  synchronize: env.SYNC,
  logging: true,
};

export default dbConnectionConfig;
