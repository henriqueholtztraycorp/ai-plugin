import { writeFile, readFile, mkdir, chmod } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export const CONFIG_DIR = join(homedir(), '.wc');
export const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

export interface WcConfig {
  accessToken?: string;
  storeId?: string;
  storeIdentifier?: string;
  refreshToken?: string;
}

export async function loadConfig(): Promise<WcConfig> {
  if (!existsSync(CONFIG_FILE)) return {};
  try {
    const data = await readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(data) as WcConfig;
  } catch {
    return {};
  }
}

export async function saveConfig(partial: Partial<WcConfig>): Promise<void> {
  const existing = await loadConfig();
  const merged: WcConfig = { ...existing, ...partial };
  await mkdir(CONFIG_DIR, { recursive: true });
  await writeFile(CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  // chmod 0o600 is honored on POSIX. On Windows NTFS, POSIX modes are largely
  // ignored — the file is readable by any process running as the same user.
  // For higher-security setups on Windows, prefer the env-var path
  // (WAKE_API_KEY / WAKE_STORE_ID) sourced from a secret manager rather than
  // persisting the token to ~/.wc/config.json. This caveat is documented in
  // the README under "Credential storage".
  if (process.platform !== 'win32') {
    try {
      await chmod(CONFIG_FILE, 0o600);
    } catch {
      /* best-effort; some filesystems reject chmod */
    }
  }
}

/**
 * Returns effective token: WAKE_API_KEY or WAKE_ACCESS_TOKEN env first, then config.accessToken.
 * Precedence: env (explicit) over stored session.
 */
export async function getEffectiveToken(): Promise<string | undefined> {
  const envToken = process.env.WAKE_API_KEY ?? process.env.WAKE_ACCESS_TOKEN;
  if (envToken) return envToken;
  const config = await loadConfig();
  return config.accessToken;
}

export async function getStoreIdentifier(): Promise<string | undefined> {
  const envStore = process.env.WAKE_STORE_ID ?? process.env.WAKE_STORE;
  if (envStore) return envStore;
  const config = await loadConfig();
  return config.storeIdentifier;
}
