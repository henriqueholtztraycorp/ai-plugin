#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createApiClient } from './lib/api.js';
import { registerTools } from './lib/tools.js';

const server = new McpServer({ name: 'wake-commerce', version: '1.0.0' });

registerTools(server, () => createApiClient());

const transport = new StdioServerTransport();
server.connect(transport).catch((err: unknown) => {
  process.stderr.write(`wake-commerce MCP error: ${String(err)}\n`);
  process.exit(1);
});
