import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig, saveConfig, CONFIG_FILE } from '../lib/config.js';

export const linkCommand = new Command('link')
  .description('Bind CLI to a store')
  .argument('[store]', 'Store identifier (e.g. pocmoda from https://pocmoda.fbits-admin.net)')
  .action(async (store?: string) => {
    if (!store) {
      const config = await loadConfig();
      if (config.storeIdentifier) {
        console.log(chalk.blue('\n Linked store:'), chalk.cyan(config.storeIdentifier));
        console.log(chalk.gray('  Config:'), CONFIG_FILE, '\n');
      } else {
        console.log(chalk.yellow('\n No store linked.\n'));
        console.log(chalk.gray('  Run:'), chalk.cyan('wc link <store>'));
        console.log(chalk.gray('  Example:'), chalk.cyan('wc link pocmoda'));
        console.log(chalk.gray('  Or from URL:'), chalk.cyan('wc link https://pocmoda.fbits-admin.net\n'));
      }
      return;
    }
    const storeId = store.replace(/^https?:\/\//, '').split('.')[0];
    await saveConfig({ storeIdentifier: storeId });
    console.log(chalk.green('\n Linked to store:'), chalk.cyan(storeId), chalk.green('\n'));
  });
