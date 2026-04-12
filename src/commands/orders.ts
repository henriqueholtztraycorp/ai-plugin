import { Command } from 'commander';
import chalk from 'chalk';
import { createApiClient, ApiAuthError } from '../lib/api.js';

export const ordersCommand = new Command('orders')
  .description('Manage orders')
  .action(() => {
    console.log(chalk.blue('\n Orders\n'));
    console.log(chalk.gray('  Use subcommands:'));
    console.log(chalk.cyan('    wc orders list'));
    console.log(chalk.cyan('    wc orders get <id>'));
    console.log('');
  });

interface OrderRecord {
  pedidoId?: number;
  data?: string;
  dataCriacao?: string;
  valorTotal?: number;
  totalPedido?: number;
  situacaoPedidoId?: number;
  situacao?: string;
  status?: string;
  cliente?: { nome?: string; email?: string };
  nomeCliente?: string;
  [key: string]: unknown;
}

ordersCommand
  .command('list')
  .description('List orders')
  .option('-o, --output <format>', 'Output format: table | json', 'table')
  .option('-l, --limit <n>', 'Limit number of orders', parseInt)
  .action(async (options: { output?: string; limit?: number }) => {
    try {
      const client = await createApiClient();
      const res = await client.fetch('/pedidos');
      if (!res.ok) {
        console.error(chalk.red(`\n API error: ${res.status} ${res.statusText}\n`));
        process.exit(1);
      }
      const data = (await res.json()) as unknown;
      let items: OrderRecord[] = Array.isArray(data)
        ? data
        : (data as { items?: unknown[] })?.items ?? [];

      const useJson = options.output === 'json' || (!process.stdout.isTTY && options.output !== 'table');
      const displayLimit = options.limit && options.limit > 0 ? options.limit : (!useJson ? 10 : undefined);
      if (displayLimit) {
        items = items.slice(0, displayLimit);
      }

      if (useJson) {
        console.log(JSON.stringify(items));
      } else {
        if (items.length === 0) {
          console.log(chalk.gray('\n No orders found.\n'));
          return;
        }
        console.log(chalk.blue(`\n Pedidos (${items.length})\n`));
        for (const o of items) {
          const id = o.pedidoId ?? '—';
          const date = o.data ?? o.dataCriacao ?? '—';
          const displayDate = typeof date === 'string' ? date.slice(0, 10) : String(date);
          const total = o.valorTotal ?? o.totalPedido;
          const displayTotal = total != null ? `R$ ${Number(total).toFixed(2)}` : '—';
          const status = o.situacao ?? o.status ?? '—';
          const cliente = o.cliente?.nome ?? o.nomeCliente ?? '—';
          console.log(
            chalk.gray('  '),
            chalk.yellow(String(id)),
            chalk.gray('|'),
            displayDate,
            chalk.gray('|'),
            displayTotal,
            chalk.gray('|'),
            String(status),
            chalk.gray('|'),
            String(cliente)
          );
        }
        console.log('');
      }
    } catch (err) {
      if (err instanceof ApiAuthError) {
        console.error(chalk.red(`\n ${err.message}\n`));
        console.error(chalk.gray('  Run: wc auth login --token <key> --store <store>\n'));
        process.exit(2);
      }
      throw err;
    }
  });

ordersCommand
  .command('get <id>')
  .description('Get order details by ID')
  .option('-o, --output <format>', 'Output format: table | json', 'table')
  .action(async (id: string, options: { output?: string }) => {
    try {
      const client = await createApiClient();
      const res = await client.fetch(`/pedidos/${id}`);
      if (!res.ok) {
        console.error(chalk.red(`\n API error: ${res.status} ${res.statusText}\n`));
        process.exit(1);
      }
      const order = (await res.json()) as OrderRecord;

      if (options.output === 'json') {
        console.log(JSON.stringify(order));
      } else {
        console.log(chalk.blue(`\n Pedido #${order.pedidoId ?? id}\n`));
        const entries: [string, unknown][] = [
          ['Data', order.data ?? order.dataCriacao ?? '—'],
          ['Total', order.valorTotal ?? order.totalPedido != null ? `R$ ${Number(order.valorTotal ?? order.totalPedido).toFixed(2)}` : '—'],
          ['Status', order.situacao ?? order.status ?? '—'],
          ['Cliente', order.cliente?.nome ?? order.nomeCliente ?? '—'],
        ];
        for (const [label, value] of entries) {
          console.log(chalk.gray('  '), chalk.cyan(label + ':'), String(value));
        }
        console.log('');
      }
    } catch (err) {
      if (err instanceof ApiAuthError) {
        console.error(chalk.red(`\n ${err.message}\n`));
        console.error(chalk.gray('  Run: wc auth login --token <key> --store <store>\n'));
        process.exit(2);
      }
      throw err;
    }
  });
