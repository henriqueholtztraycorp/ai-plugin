import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

type ApiClient = { fetch(path: string, init?: RequestInit): Promise<Response> };

const idSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/, 'ID must contain only letters, numbers, underscores, or hyphens');

// Bound result-set size so a misbehaving client cannot ask for an unbounded slice
// and OOM the server. Wake REST endpoints typically page in the low hundreds.
const limitSchema = z
  .number()
  .int()
  .min(1)
  .max(500)
  .optional()
  .describe('Max number of results (1–500)');

export function registerTools(server: McpServer, getClient: () => Promise<ApiClient>) {
  // ── Products ────────────────────────────────────────────────────────────────

  server.tool(
    'list_products',
    'List Wake Commerce products with optional sorting and category enrichment',
    {
      limit: limitSchema,
      sortBy: z.enum(['price', 'name']).optional().default('price').describe('Field to sort by'),
      order: z.enum(['asc', 'desc']).optional().default('desc').describe('Sort direction'),
      includeCategories: z.boolean().optional().default(false).describe('Fetch and include category names'),
    },
    async ({ limit, sortBy, order, includeCategories }) => {
      const client = await getClient();
      const res = await client.fetch('/produtos');
      if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);

      const data = (await res.json()) as unknown;
      let items = (Array.isArray(data) ? data : (data as { items?: unknown[] })?.items ?? []) as Record<string, unknown>[];

      if (sortBy === 'price') {
        items = [...items].sort((a, b) => {
          const pa = Number(a['precoPor'] ?? 0);
          const pb = Number(b['precoPor'] ?? 0);
          return order === 'desc' ? pb - pa : pa - pb;
        });
      } else if (sortBy === 'name') {
        items = [...items].sort((a, b) => {
          const na = String(a['nome'] ?? a['name'] ?? '');
          const nb = String(b['nome'] ?? b['name'] ?? '');
          return order === 'desc' ? nb.localeCompare(na) : na.localeCompare(nb);
        });
      }

      if (limit && limit > 0) items = items.slice(0, limit);

      if (includeCategories) {
        const seen = new Set<number>();
        for (const p of items) {
          const id = p['produtoId'] as number | undefined;
          if (id && !seen.has(id)) {
            seen.add(id);
            try {
              const catRes = await client.fetch(`/produtos/${id}/categorias`);
              if (catRes.ok) {
                const cats = (await catRes.json()) as unknown;
                p['categorias'] = Array.isArray(cats) ? cats : (cats as { items?: unknown[] })?.items ?? [];
              }
            } catch {
              p['categorias'] = [];
            }
          }
        }
      }

      return { content: [{ type: 'text' as const, text: JSON.stringify(items, null, 2) }] };
    }
  );

  // ── Orders ──────────────────────────────────────────────────────────────────

  server.tool(
    'list_orders',
    'List Wake Commerce orders',
    {
      limit: limitSchema,
    },
    async ({ limit }) => {
      const client = await getClient();
      const res = await client.fetch('/pedidos');
      if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);

      const data = (await res.json()) as unknown;
      let items = Array.isArray(data) ? data : (data as { items?: unknown[] })?.items ?? [];
      if (limit && limit > 0) items = items.slice(0, limit);

      return { content: [{ type: 'text' as const, text: JSON.stringify(items, null, 2) }] };
    }
  );

  server.tool(
    'get_order',
    'Get Wake Commerce order details by ID',
    {
      id: idSchema.describe('Order ID'),
    },
    async ({ id }) => {
      const client = await getClient();
      const res = await client.fetch(`/pedidos/${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
      const order = await res.json();
      return { content: [{ type: 'text' as const, text: JSON.stringify(order, null, 2) }] };
    }
  );

  // ── Customers ────────────────────────────────────────────────────────────────

  server.tool(
    'list_customers',
    'List Wake Commerce customers',
    {
      limit: limitSchema,
      sortBy: z.enum(['name', 'date']).optional().default('name').describe('Field to sort by'),
      order: z.enum(['asc', 'desc']).optional().default('asc').describe('Sort direction'),
    },
    async ({ limit, sortBy, order }) => {
      const client = await getClient();
      let items: Record<string, unknown>[] = [];
      let usuariosStatus: number | undefined;

      try {
        const res = await client.fetch('/usuarios');
        usuariosStatus = res.status;
        if (res.ok) {
          const data = (await res.json()) as unknown;
          items = Array.isArray(data) ? data : (data as { items?: unknown[] })?.items ?? [];
        }
      } catch { /* fall through to /pedidos fallback decision below */ }

      // Some Wake tenants intentionally lock down /usuarios. Deriving customers
      // from /pedidos extracts PII (name, email) from orders, which can defeat
      // that lockdown. Gate the fallback behind WAKE_CUSTOMERS_FALLBACK=1 so
      // tenants opt in explicitly. Default is to surface the underlying error.
      const fallbackEnabled = process.env['WAKE_CUSTOMERS_FALLBACK'] === '1';
      if (items.length === 0) {
        if (!fallbackEnabled) {
          throw new Error(
            `/usuarios returned no customers${usuariosStatus ? ` (HTTP ${usuariosStatus})` : ''}. ` +
            'Set WAKE_CUSTOMERS_FALLBACK=1 to derive customers from /pedidos (extracts PII from orders).'
          );
        }
        const ordersRes = await client.fetch('/pedidos');
        if (!ordersRes.ok) throw new Error(`API error: ${ordersRes.status} ${ordersRes.statusText}`);
        const ordersData = (await ordersRes.json()) as unknown;
        const orders = Array.isArray(ordersData) ? ordersData : (ordersData as { items?: unknown[] })?.items ?? [];
        const seen = new Set<string>();
        for (const o of orders as Record<string, unknown>[]) {
          const c = (o['cliente'] ?? o) as Record<string, unknown>;
          const key = String(c['usuarioId'] ?? c['clienteId'] ?? c['email'] ?? c['nome'] ?? '');
          if (key && !seen.has(key)) {
            seen.add(key);
            items.push({ usuarioId: c['usuarioId'] ?? c['clienteId'], nome: c['nome'] ?? o['nomeCliente'], email: c['email'] });
          }
        }
      }

      if (sortBy === 'name') {
        items = [...items].sort((a, b) => {
          const na = String(a['nome'] ?? '');
          const nb = String(b['nome'] ?? '');
          return order === 'desc' ? nb.localeCompare(na) : na.localeCompare(nb);
        });
      } else if (sortBy === 'date') {
        items = [...items].sort((a, b) => {
          const da = String(a['dataCadastro'] ?? '');
          const db = String(b['dataCadastro'] ?? '');
          return order === 'desc' ? db.localeCompare(da) : da.localeCompare(db);
        });
      }

      if (limit && limit > 0) items = items.slice(0, limit);

      return { content: [{ type: 'text' as const, text: JSON.stringify(items, null, 2) }] };
    }
  );

  server.tool(
    'get_customer',
    'Get Wake Commerce customer details by ID',
    {
      id: idSchema.describe('Customer ID'),
    },
    async ({ id }) => {
      const client = await getClient();
      const res = await client.fetch(`/usuarios/${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
      const customer = await res.json();
      return { content: [{ type: 'text' as const, text: JSON.stringify(customer, null, 2) }] };
    }
  );
}
