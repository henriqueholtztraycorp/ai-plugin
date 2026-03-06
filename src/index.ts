#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init.js';
import { configCommand } from './commands/config.js';

const program = new Command();

program
  .name('wake-commerce')
  .description('CLI for Wake Commerce')
  .version('0.1.0');

program.addCommand(initCommand);
program.addCommand(configCommand);

program
  .command('status')
  .description('Show project status and connection info')
  .action(() => {
    console.log(chalk.blue('\n Wake Commerce CLI\n'));
    console.log(chalk.gray('  Ready to use. Run'), chalk.cyan('wake-commerce --help'), chalk.gray('for commands.\n'));
  });

program.parse();
