import type { VercelRequest, VercelResponse } from '@vercel/node';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createApiClient } from '../src/lib/api.js';
import { registerTools } from '../src/lib/tools.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  const server = new McpServer({ name: 'wake-commerce', version: '0.1.0' });
  registerTools(server, () => createApiClient(undefined, { token: apiKey, store: storeId }));

  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
}
