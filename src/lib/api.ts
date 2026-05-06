import { getEffectiveToken, getStoreIdentifier } from './config.js';

const DEFAULT_BASE_URL = 'https://api.fbits.net';

export class ApiAuthError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 401,
    public readonly responseBody?: string
  ) {
    super(message);
    this.name = 'ApiAuthError';
  }
}

/**
 * Creates a fetch wrapper that adds Bearer token and store context to requests.
 * Domain commands should use this client. On 401, throws ApiAuthError;
 * callers should catch and exit 2 with message suggesting `wc auth` or checking key.
 */
export async function createApiClient(
  baseUrl = DEFAULT_BASE_URL,
  overrides?: { token?: string; store?: string }
) {
  const token = overrides?.token ?? await getEffectiveToken();
  const store = overrides?.store ?? await getStoreIdentifier();
  const authHeader = process.env.WAKE_AUTH_HEADER;
  return {
    async fetch(path: string, init?: RequestInit): Promise<Response> {
      // Reject absolute URLs and any path that could escape the configured base
      // (protocol-relative `//host`, backslash variants, or upward traversal).
      // The token is high-value, so callers must not be able to redirect requests.
      if (/^[a-z][a-z0-9+.-]*:/i.test(path) || path.startsWith('//') || path.startsWith('\\')) {
        throw new Error('Absolute URLs are not allowed in api client path');
      }
      if (path.split(/[/\\]/).some((seg) => seg === '..')) {
        throw new Error('Path traversal segments are not allowed in api client path');
      }
      const url = `${baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;
      const headers = new Headers(init?.headers);
      headers.set('accept', 'application/json');
      if (token) {
        if (authHeader) {
          headers.set(authHeader, token);
        } else if (
          process.env.WAKE_AUTH_TYPE === 'basic' ||
          (token.startsWith('pocma-') && !token.includes('.'))
        ) {
          headers.set('Authorization', `Basic ${token}`);
        } else {
          headers.set('Authorization', `Bearer ${token}`);
          // Legacy dual-header mode: some Wake tenants only accept the proprietary
          // TCS-Access-Token header. Off by default to avoid leaking the token to
          // an extra header in logs/proxies. Opt in with WAKE_LEGACY_AUTH=1.
          if (process.env.WAKE_LEGACY_AUTH === '1') {
            headers.set('TCS-Access-Token', token);
          }
        }
      }
      if (store) {
        headers.set('Current-Store', store);
        headers.set('X-Store-Id', store);
      }
      const res = await fetch(url, { ...init, headers });
      if (res.status === 401) {
        const body = process.env.WC_DEBUG ? await res.text() : undefined;
        throw new ApiAuthError(
          'Authentication failed. Run `wc auth login` or check your API key.',
          401,
          body
        );
      }
      return res;
    },
  };
}

export { getEffectiveToken } from './config.js';
