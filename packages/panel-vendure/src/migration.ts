import { generateMigration, revertLastMigration, runMigrations } from '@vendure/core';
import { program } from 'commander';

import { config } from './vendure-config';

program
  .command('generate <name>')
  .description('Generate a new migration file with the given name')
  .action(name => {
    return generateMigration(config, { name, outputDir: './migrations-db' });
  });

program
  .command('run')
  .description('Run all pending migrations')
  .action(() => {
    return runMigrations(config);
  });

program
  .command('revert')
  .description('Revert the last applied migration')
  .action(() => {
    return revertLastMigration(config);
  });

program.parse(process.argv);
