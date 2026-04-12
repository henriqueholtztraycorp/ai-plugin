import type { VercelRequest, VercelResponse } from '@vercel/node';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createApiClient } from '../src/lib/api.js';
import { registerTools } from '../src/lib/tools.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Accept credentials from query params (Smithery) or headers (direct clients)
  const apiKey = (req.query['apiKey'] as string)
    || (req.headers['x-wake-api-key'] as string)
    || undefined;
  const storeId = (req.query['storeId'] as string)
    || (req.headers['x-wake-store-id'] as string)
    || undefined;

  if (!apiKey || !storeId) {
    res.status(400).json({ error: 'Missing apiKey and storeId. Pass as query params or x-wake-api-key / x-wake-store-id headers.' });
    return;
  }

  const server = new McpServer({ name: 'wake-commerce', version: '0.1.0' });
  registerTools(server, () => createApiClient(undefined, { token: apiKey, store: storeId }));

  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
}
