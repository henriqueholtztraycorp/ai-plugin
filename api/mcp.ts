import type { VercelRequest, VercelResponse } from '@vercel/node';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createApiClient } from '../src/lib/api.js';
import { registerTools } from '../src/lib/tools.js';

// Cap incoming JSON-RPC body size. The MCP control plane is tiny (tool calls
// with small arg objects); legitimate traffic is well under this. The cap
// blocks accidental or malicious oversized payloads before we touch credentials.
// NOTE: There is no built-in rate limiting on this endpoint. If the deployment
// is publicly reachable, rely on Vercel's platform-level WAF / firewall rules
// or a fronting CDN to apply per-IP throttling.
const MAX_BODY_BYTES = 64 * 1024;

const ALLOWED_METHODS = 'POST, OPTIONS';
const ALLOWED_HEADERS = 'content-type, x-wake-api-key, x-wake-store-id, mcp-session-id';

function applyCors(res: VercelResponse) {
  // Wildcard origin is acceptable here because the endpoint requires
  // per-request auth headers — there are no cookies or session credentials
  // a malicious origin could ride on. If you need to restrict callers,
  // replace '*' with an allow-list and echo a single matching origin.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', ALLOWED_METHODS);
  res.setHeader('Access-Control-Allow-Headers', ALLOWED_HEADERS);
  res.setHeader('Access-Control-Max-Age', '600');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ALLOWED_METHODS);
    res.status(405).json({ error: 'Method not allowed. Use POST for MCP requests.' });
    return;
  }

  const contentLength = Number(req.headers['content-length'] ?? '0');
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    res.status(413).json({ error: `Request body exceeds ${MAX_BODY_BYTES} byte limit.` });
    return;
  }

  // Credentials must be supplied via headers. Query-string auth is rejected because
  // Vercel access logs, upstream proxies, browser history, and Referer headers
  // routinely capture URLs and would leak the token.
  if (req.query['apiKey'] || req.query['storeId']) {
    res.status(400).json({
      error: 'Credentials in query string are not accepted. Use x-wake-api-key and x-wake-store-id headers.',
    });
    return;
  }

  const apiKey = (req.headers['x-wake-api-key'] as string) || undefined;
  const storeId = (req.headers['x-wake-store-id'] as string) || undefined;

  if (!apiKey || !storeId) {
    res.status(400).json({ error: 'Missing credentials. Pass x-wake-api-key and x-wake-store-id headers.' });
    return;
  }

  const server = new McpServer({ name: 'wake-commerce', version: '1.0.0' });
  registerTools(server, () => createApiClient(undefined, { token: apiKey, store: storeId }));

  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
}
