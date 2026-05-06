import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig, saveConfig, CONFIG_FILE } from '../lib/config.js';

const STORE_ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

type ParseResult =
  | { ok: true; storeId: string; source: 'bare' | 'url'; hostname?: string }
  | { ok: false; reason: string };

export function parseStoreInput(raw: string): ParseResult {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, reason: 'empty input' };

  if (/^https?:\/\//i.test(trimmed)) {
    let url: URL;
    try {
      url = new URL(trimmed);
    } catch {
      return { ok: false, reason: `not a valid URL: ${trimmed}` };
    }
    const host = url.hostname.toLowerCase();
    const labels = host.split('.');
    if (labels.length < 2 || !labels[0]) {
      return { ok: false, reason: `cannot extract store identifier from host "${host}"` };
    }
    const candidate = labels[0];
    if (!STORE_ID_PATTERN.test(candidate)) {
      return {
        ok: false,
        reason: `parsed "${candidate}" from "${host}" is not a valid store identifier (lowercase letters, digits, hyphens; must start alphanumeric)`,
      };
    }
    return { ok: true, storeId: candidate, source: 'url', hostname: host };
  }

  const lowered = trimmed.toLowerCase();
  if (!STORE_ID_PATTERN.test(lowered)) {
    return {
      ok: false,
      reason: `"${trimmed}" is not a valid store identifier (lowercase letters, digits, hyphens; must start alphanumeric). Pass either an identifier (e.g. pocmoda) or a full URL (e.g. https://pocmoda.fbits-admin.net).`,
    };
  }
  return { ok: true, storeId: lowered, source: 'bare' };
}

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

    const parsed = parseStoreInput(store);
    if (!parsed.ok) {
      console.error(chalk.red('\n Invalid store input:'), parsed.reason, '\n');
      process.exit(1);
    }

    if (parsed.source === 'url') {
      console.log(
        chalk.gray('\n  Parsed'),
        chalk.cyan(parsed.storeId),
        chalk.gray('from URL host'),
        chalk.cyan(parsed.hostname ?? ''),
      );
    } else {
      console.log(chalk.gray('\n  Parsed identifier:'), chalk.cyan(parsed.storeId));
    }

    await saveConfig({ storeIdentifier: parsed.storeId });
    console.log(chalk.green(' Linked to store:'), chalk.cyan(parsed.storeId), chalk.green('\n'));
  });
