import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig, saveConfig, CONFIG_FILE } from '../lib/config.js';
import { createApiClient, getEffectiveToken, ApiAuthError } from '../lib/api.js';

export const authCommand = new Command('auth')
  .description('Authenticate with Wake Commerce')
  .action(() => {
    console.log(chalk.blue('\n Auth\n'));
    console.log(chalk.gray('  Use subcommands:'));
    console.log(chalk.cyan('    wc auth login --token <token>'));
    console.log(chalk.cyan('    wc auth login --token <token> --store <store>'));
    console.log(chalk.cyan('    wc auth login --api-key <key>'));
    console.log(chalk.cyan('    wc link <store> (bind to store)'));
    console.log(chalk.cyan('    wc auth login --method device (when configured)'));
    console.log(chalk.cyan('    wc auth login (uses WAKE_API_KEY or WAKE_ACCESS_TOKEN env)'));
    console.log(chalk.cyan('    wc auth logout'));
    console.log(chalk.cyan('    wc auth status'));
    console.log(chalk.cyan('    wc auth verify (test token)\n'));
  });

authCommand
  .command('login')
  .description('Login with token or API key')
  .option('-t, --token <token>', 'Access token (from browser or API key)')
  .option('--api-key <key>', 'API key (synonym for --token)')
  .option('-s, --store <store>', 'Store identifier (e.g. pocmoda from https://pocmoda.fbits-admin.net)')
  .option('-m, --method <method>', 'Auth method: api-key | device')
  .action(async (options: { token?: string; apiKey?: string; store?: string; method?: string }) => {
    if (options.method === 'device') {
      console.log(chalk.yellow('\n Device flow not configured. Use --api-key or WAKE_API_KEY / WAKE_ACCESS_TOKEN.\n'));
      process.exit(1);
    }
    const token = options.token ?? options.apiKey ?? process.env.WAKE_API_KEY ?? process.env.WAKE_ACCESS_TOKEN;
    if (!token) {
      console.log(chalk.yellow('\n No token provided.\n'));
      console.log(chalk.gray('  Use --token <token>, --api-key <key>, or set WAKE_API_KEY / WAKE_ACCESS_TOKEN env.\n'));
      process.exit(1);
    }
    const updates: Record<string, string> = { accessToken: token };
    if (options.store) {
      updates.storeIdentifier = options.store.replace(/^https?:\/\//, '').split('.')[0];
    }
    await saveConfig(updates);
    console.log(chalk.green('\n Logged in. Token saved to'), chalk.cyan(CONFIG_FILE), chalk.green('\n'));
    if (options.store) {
      console.log(chalk.gray('  Store:'), chalk.cyan(updates.storeIdentifier), chalk.green('\n'));
    }
  });

authCommand
  .command('logout')
  .description('Clear stored credentials')
  .action(async () => {
    await saveConfig({});
    console.log(chalk.green('\n Logged out. Credentials cleared.\n'));
  });

authCommand
  .command('verify')
  .description('Test token against API')
  .action(async () => {
    const token = await getEffectiveToken();
    if (!token) {
      console.log(chalk.yellow('\n No token configured. Run'), chalk.cyan('wc auth login --token <token>'), chalk.yellow('\n'));
      process.exit(1);
    }
    try {
      const client = await createApiClient();
      const res = await client.fetch('/produtos');
      if (res.ok) {
        console.log(chalk.green('\n Token verified. API connection OK.\n'));
      } else {
        console.log(chalk.yellow(`\n API returned ${res.status}. Response:`));
        console.log(await res.text());
        console.log('');
        process.exit(1);
      }
    } catch (err) {
      if (err instanceof ApiAuthError) {
        console.error(chalk.red('\n Token invalid or expired.\n'));
        if (err.responseBody) {
          console.error(chalk.gray('  API:'), err.responseBody.slice(0, 300));
          console.error('');
        }
        console.error(chalk.gray('  Ensure API key and store: wc auth login --token <key> --store <store>\n'));
        process.exit(2);
      }
      throw err;
    }
  });

authCommand
  .command('status')
  .description('Show auth status')
  .action(async () => {
    const config = await loadConfig();
    const hasToken = !!(config.accessToken ?? process.env.WAKE_API_KEY ?? process.env.WAKE_ACCESS_TOKEN);
    const store = config.storeIdentifier ?? process.env.WAKE_STORE_ID ?? process.env.WAKE_STORE;
    const isTty = process.stdout.isTTY;
    if (isTty) {
      console.log(chalk.blue('\n Auth Status\n'));
      console.log(chalk.gray('  Token:'), hasToken ? chalk.green('configured') : chalk.yellow('not set'));
      console.log(chalk.gray('  Store:'), store ? chalk.cyan(store) : chalk.yellow('not linked (run wc link <store>)'));
      console.log(chalk.gray('  Config:'), CONFIG_FILE);
      console.log('');
    } else {
      console.log(JSON.stringify({ tokenConfigured: hasToken, store, configPath: CONFIG_FILE }));
    }
  });
