import { Command } from 'commander';
import chalk from 'chalk';

export const configCommand = new Command('config')
  .description('Manage Wake Commerce configuration')
  .action(() => {
    console.log(chalk.blue('\n Configuration\n'));
    console.log(chalk.gray('  Use subcommands to view or set config:'));
    console.log(chalk.cyan('    wake-commerce config get <key>'));
    console.log(chalk.cyan('    wake-commerce config set <key> <value>\n'));
  });

configCommand
  .command('get <key>')
  .description('Get a configuration value')
  .action((key: string) => {
    console.log(chalk.gray(`  ${key}: (not set)\n`));
  });

configCommand
  .command('set <key> <value>')
  .description('Set a configuration value')
  .action((key: string, value: string) => {
    console.log(chalk.green(`  Set ${key} = ${value}\n`));
  });
