import { getEffectiveToken, getStoreIdentifier } from './config.js';

// `api.fbits.net` is Wake's public REST endpoint. It's pinned here as the
// default for out-of-the-box use; tenants on a different host (staging,
// regional, or vendor-rebranded) can override via `WAKE_API_BASE_URL`.
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
  baseUrl?: string,
  overrides?: { token?: string; store?: string }
) {
  const resolvedBase = baseUrl ?? process.env.WAKE_API_BASE_URL ?? DEFAULT_BASE_URL;
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
      const url = `${resolvedBase.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;
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
        // Only surface the response body when an explicit, dev-only flag is set.
        // The body is redacted and truncated so accidental log paste-ins don't
        // leak tokens or upstream session details. WC_DEBUG is kept as a legacy
        // alias for compatibility but should be replaced by WAKE_DEBUG_API_RESPONSE.
        const debugFlag = process.env.WAKE_DEBUG_API_RESPONSE === '1' || process.env.WC_DEBUG === '1';
        const body = debugFlag ? redactSensitive(await res.text()).slice(0, 512) : undefined;
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

// Redact obvious secret-looking values from a debug payload before it lands in
// an error message. Best-effort — the goal is to keep accidental log shares
// from exposing bearer tokens or JWT-shaped values, not to be exhaustive.
function redactSensitive(text: string): string {
  return text
    .replace(/(eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]+)/g, '[REDACTED_JWT]')
    .replace(/(Bearer\s+)[A-Za-z0-9._\-=]+/gi, '$1[REDACTED]')
    .replace(/(("?)(?:token|api[_-]?key|access[_-]?token|secret|password)\2\s*[:=]\s*"?)([^"\s,}]+)/gi, '$1[REDACTED]');
}
