import { AuthOptions } from '@vendure/core';
import dotenv from 'dotenv';
import { ChasquiPasswordValidationStrategy } from '../../strategies/ChasquiPasswordValidationStrategy';
dotenv.config();

const env = process.env;

const authOptionsConfig: AuthOptions = {
  tokenMethod: 'bearer',
  sessionDuration: '90m',
  superadminCredentials: {
    identifier: env.SUPERADMIN_ID || 'superadmin',
    password: env.SUPERADMIN_PASSWORD || 'superadmin',
  },
  passwordValidationStrategy: new ChasquiPasswordValidationStrategy(),
};

export default authOptionsConfig;
