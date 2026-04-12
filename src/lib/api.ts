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
      const url = path.startsWith('http') ? path : `${baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;
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
          headers.set('TCS-Access-Token', token);
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
