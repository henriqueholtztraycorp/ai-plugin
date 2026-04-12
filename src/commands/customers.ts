import { Command } from 'commander';
import chalk from 'chalk';
import { createApiClient, ApiAuthError } from '../lib/api.js';

export const customersCommand = new Command('customers')
  .description('Manage customers')
  .action(() => {
    console.log(chalk.blue('\n Customers\n'));
    console.log(chalk.gray('  Use subcommands:'));
    console.log(chalk.cyan('    wc customers list'));
    console.log(chalk.cyan('    wc customers get <id>'));
    console.log('');
  });

interface CustomerRecord {
  usuarioId?: number;
  clienteId?: number;
  nome?: string;
  email?: string;
  cpf?: string;
  cnpj?: string;
  telefone?: string;
  celular?: string;
  dataCadastro?: string;
  dataNascimento?: string;
  sexo?: string;
  ativo?: boolean;
  [key: string]: unknown;
}

customersCommand
  .command('list')
  .description('List customers')
  .option('-o, --output <format>', 'Output format: table | json', 'table')
  .option('-l, --limit <n>', 'Limit number of customers', parseInt)
  .option('-s, --sort-by <field>', 'Sort by: name | date', 'name')
  .option('--order <dir>', 'Sort order: asc | desc', 'asc')
  .action(async (options: { output?: string; limit?: number; sortBy?: string; order?: string }) => {
    try {
      const client = await createApiClient();
      // Try /usuarios first; fall back to extracting customers from /pedidos
      let items: CustomerRecord[] = [];
      let usuariosOk = false;
      try {
        const res = await client.fetch('/usuarios');
        if (res.ok) {
          const data = (await res.json()) as unknown;
          items = Array.isArray(data)
            ? data
            : (data as { items?: unknown[] })?.items ?? [];
          usuariosOk = true;
        }
      } catch {
        // /usuarios not accessible, fall back
      }
      if (!usuariosOk) {
        // Extract unique customers from orders
        const ordersRes = await client.fetch('/pedidos');
        if (!ordersRes.ok) {
          console.error(chalk.red(`\n API error: ${ordersRes.status} ${ordersRes.statusText}\n`));
          process.exit(1);
        }
        const ordersData = (await ordersRes.json()) as unknown;
        const orders = Array.isArray(ordersData)
          ? ordersData
          : (ordersData as { items?: unknown[] })?.items ?? [];
        const seen = new Set<string>();
        for (const o of orders as Array<Record<string, any>>) {
          const c = o.cliente ?? o;
          const key = String(c.usuarioId ?? c.clienteId ?? c.email ?? c.nome ?? '');
          if (key && !seen.has(key)) {
            seen.add(key);
            items.push({
              usuarioId: c.usuarioId ?? c.clienteId,
              nome: c.nome ?? o.nomeCliente,
              email: c.email,
              cpf: c.cpf,
              telefone: c.telefone,
              celular: c.celular,
            });
          }
        }
      }

      const sortBy = options.sortBy;
      const order = options.order ?? 'asc';

      if (sortBy === 'name') {
        items = [...items].sort((a, b) => {
          const na = String(a.nome ?? '');
          const nb = String(b.nome ?? '');
          return order === 'desc' ? nb.localeCompare(na) : na.localeCompare(nb);
        });
      } else if (sortBy === 'date') {
        items = [...items].sort((a, b) => {
          const da = String(a.dataCadastro ?? '');
          const db = String(b.dataCadastro ?? '');
          return order === 'desc' ? db.localeCompare(da) : da.localeCompare(db);
        });
      }

      const useJson = options.output === 'json' || (!process.stdout.isTTY && options.output !== 'table');
      const displayLimit = options.limit && options.limit > 0 ? options.limit : (!useJson ? 10 : undefined);
      if (displayLimit) {
        items = items.slice(0, displayLimit);
      }

      if (useJson) {
        console.log(JSON.stringify(items));
      } else {
        if (items.length === 0) {
          console.log(chalk.gray('\n No customers found.\n'));
          return;
        }
        console.log(chalk.blue(`\n Clientes (${items.length})\n`));
        for (const c of items) {
          const id = c.usuarioId ?? c.clienteId ?? '—';
          const nome = c.nome ?? '—';
          const email = c.email ?? '—';
          const telefone = c.celular ?? c.telefone ?? '—';
          const cadastro = c.dataCadastro ? String(c.dataCadastro).slice(0, 10) : '—';
          console.log(
            chalk.gray('  '),
            chalk.yellow(String(id)),
            chalk.gray('|'),
            String(nome),
            chalk.gray('|'),
            String(email),
            chalk.gray('|'),
            String(telefone),
            chalk.gray('|'),
            cadastro
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

customersCommand
  .command('get <id>')
  .description('Get customer details by ID')
  .option('-o, --output <format>', 'Output format: table | json', 'table')
  .action(async (id: string, options: { output?: string }) => {
    try {
      const client = await createApiClient();
      const res = await client.fetch(`/usuarios/${id}`);
      if (!res.ok) {
        console.error(chalk.red(`\n API error: ${res.status} ${res.statusText}\n`));
        process.exit(1);
      }
      const customer = (await res.json()) as CustomerRecord;

      if (options.output === 'json') {
        console.log(JSON.stringify(customer));
      } else {
        console.log(chalk.blue(`\n Cliente #${customer.usuarioId ?? customer.clienteId ?? id}\n`));
        const entries: [string, unknown][] = [
          ['Nome', customer.nome ?? '—'],
          ['Email', customer.email ?? '—'],
          ['CPF', customer.cpf ?? '—'],
          ['Telefone', customer.celular ?? customer.telefone ?? '—'],
          ['Cadastro', customer.dataCadastro ? String(customer.dataCadastro).slice(0, 10) : '—'],
          ['Ativo', customer.ativo != null ? (customer.ativo ? 'Sim' : 'Não') : '—'],
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
