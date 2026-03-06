import { Command } from 'commander';
import chalk from 'chalk';

export const initCommand = new Command('init')
  .description('Initialize Wake Commerce in the current project')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .action(async (options: { yes?: boolean }) => {
    console.log(chalk.blue('\n Initializing Wake Commerce...\n'));
    if (options.yes) {
      console.log(chalk.gray('  Using default configuration'));
    }
    console.log(chalk.green('  Done!\n'));
  });
