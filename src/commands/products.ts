import { Command } from 'commander';
import chalk from 'chalk';
import { createApiClient, ApiAuthError } from '../lib/api.js';

export const productsCommand = new Command('products')
  .description('Manage products')
  .action(() => {
    console.log(chalk.blue('\n Products\n'));
    console.log(chalk.gray('  Use subcommands:'));
    console.log(chalk.cyan('    wc products list'));
    console.log('');
  });

interface ProductRecord {
  produtoId?: number;
  produtoVarianteId?: number;
  nome?: string;
  name?: string;
  sku?: string;
  precoPor?: number;
  genero?: string | null;
  colecao?: string | null;
  fabricante?: string | null;
  categorias?: Array<{ nome?: string }>;
  [key: string]: unknown;
}

productsCommand
  .command('list')
  .description('List all products')
  .option('-o, --output <format>', 'Output format: table | json', 'table')
  .option('-l, --limit <n>', 'Limit number of products', parseInt)
  .option('-s, --sort-by <field>', 'Sort by: price | name', 'price')
  .option('--order <dir>', 'Sort order: asc | desc', 'desc')
  .option('--include-categories', 'Fetch and include product categories')
  .action(async (options: { output?: string; limit?: number; sortBy?: string; order?: string; includeCategories?: boolean }) => {
    try {
      const client = await createApiClient();
      const res = await client.fetch('/produtos');
      if (!res.ok) {
        console.error(chalk.red(`\n API error: ${res.status} ${res.statusText}\n`));
        process.exit(1);
      }
      const data = (await res.json()) as unknown;
      let items = Array.isArray(data) ? data : (data as { items?: unknown[] })?.items ?? [];
      items = items as ProductRecord[];

      const limit = options.limit;
      const sortBy = options.sortBy;
      const order = options.order ?? 'desc';

      if (sortBy === 'price') {
        items = [...items].sort((a, b) => {
          const pa = Number(a.precoPor ?? 0);
          const pb = Number(b.precoPor ?? 0);
          return order === 'desc' ? pb - pa : pa - pb;
        });
      } else if (sortBy === 'name') {
        items = [...items].sort((a, b) => {
          const na = String(a.nome ?? a.name ?? '');
          const nb = String(b.nome ?? b.name ?? '');
          return order === 'desc' ? nb.localeCompare(na) : na.localeCompare(nb);
        });
      }

      const useJson = options.output === 'json' || (!process.stdout.isTTY && options.output !== 'table');
      const displayLimit = limit && limit > 0 ? limit : (!useJson ? 10 : undefined);
      if (displayLimit) {
        items = items.slice(0, displayLimit);
      }

      if (options.includeCategories) {
        const seen = new Set<number>();
        for (const p of items) {
          const id = p.produtoId;
          if (id && !seen.has(id)) {
            seen.add(id);
            try {
              const catRes = await client.fetch(`/produtos/${id}/categorias`);
              if (catRes.ok) {
                const cats = (await catRes.json()) as unknown;
                const arr = Array.isArray(cats) ? cats : (cats as { items?: unknown[] })?.items ?? [];
                p.categorias = arr as Array<{ nome?: string }>;
              }
            } catch {
              p.categorias = [];
            }
          }
        }
      }

      if (useJson) {
        console.log(JSON.stringify(items));
      } else {
        if (items.length === 0) {
          console.log(chalk.gray('\n No products found.\n'));
          return;
        }
        const showCategories = options.includeCategories;
        const header = sortBy
          ? `\n Top ${items.length} produtos (ordenado por ${sortBy} ${order === 'desc' ? '↓' : '↑'})\n`
          : `\n Products (${items.length})\n`;
        console.log(chalk.blue(header));
        for (const p of items) {
          const id = p.produtoId ?? p.sku ?? '—';
          const nome = p.nome ?? p.name ?? '—';
          const preco = p.precoPor != null ? `R$ ${Number(p.precoPor).toFixed(2)}` : '—';
          const cat = showCategories && p.categorias?.length
            ? p.categorias.map((c: { nome?: string }) => c.nome).filter(Boolean).join(', ') || '—'
            : (p.genero || p.colecao || p.fabricante) || '—';
          console.log(chalk.gray('  '), String(id), chalk.cyan('|'), String(nome), chalk.gray('|'), preco, chalk.gray('|'), String(cat));
        }
        console.log('');
      }
    } catch (err) {
      if (err instanceof ApiAuthError) {
        console.error(chalk.red(`\n ${err.message}\n`));
        if (err.responseBody) {
          console.error(chalk.gray('  API response:'), err.responseBody.slice(0, 200));
          console.error('');
        }
        console.error(chalk.gray('  Ensure API key and store are set: wc auth login --token <key> --store <store>\n'));
        process.exit(2);
      }
      throw err;
    }
  });
