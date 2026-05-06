# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository shape

This repo is **two products in one tree**, sharing only the README:

1. **A Claude/Cursor plugin** — declarative content in `agents/`, `commands/`, `skills/`, `rules/`, `.claude-plugin/`, `.cursor-plugin/`, `assets/`. No build step. Consumed by Claude Code (`/plugin install wake-storefront-api`) and Cursor (local plugin dir). The Claude manifest names the plugin `wake-storefront`; the Cursor manifest names it `wake-storefront-api`.
2. **A TypeScript CLI + MCP server** — `src/` and `api/`, published to npm as `wake-commerce-mcp`. Two binaries (`wake-commerce`/`wc` and `wake-commerce-mcp`) plus a Vercel HTTP MCP handler.

When editing, know which product you're touching. The plugin half is markdown-only; the CLI/MCP half is built TypeScript.

## Common commands

```bash
npm run build      # tsc → dist/ (also runs on `prepare`, so npm install builds)
npm run typecheck  # tsc --noEmit
npm run lint       # eslint src
npm run dev        # tsx src/index.ts — run CLI without building
npm start          # node dist/index.js — run built CLI
```

There is **no test suite** and no test runner configured — don't claim tests pass; run typecheck + lint instead.

The MCP stdio server is invoked via the `wake-commerce-mcp` bin (after build) or `tsx src/mcp-server.ts` (dev, see `.mcp.json`). The HTTP variant is `api/mcp.ts`, deployed by Vercel (`vercel.json`, 30s max duration).

`scripts/spike:*` (in `package.json`) are exploratory auth probes against the Wake API — they reference files (`scripts/auth-spike.ts`, etc.) that may not exist in the repo. Don't assume they run.

## CLI/MCP architecture

- `src/index.ts` — Commander CLI entry, registers subcommands from `src/commands/`.
- `src/mcp-server.ts` — stdio MCP entry; instantiates `McpServer` and calls `registerTools` from `src/lib/tools.ts`.
- `api/mcp.ts` — Vercel HTTP MCP entry using `StreamableHTTPServerTransport`. Reads credentials from query params (`apiKey`, `storeId` — Smithery convention) **or** headers (`x-wake-api-key`, `x-wake-store-id`). Returns 400 if either is missing. Calls the same `registerTools` with a per-request `createApiClient`.
- `src/lib/tools.ts` — single source of truth for MCP tools (`list_products`, `list_orders`, `get_order`, `list_customers`, `get_customer`). Both the stdio and HTTP entries register from here, so adding a tool here exposes it on both transports.
- `src/lib/api.ts` — `createApiClient(baseUrl?, overrides?)`. Default base: `https://api.fbits.net`. Auth header logic is non-obvious (see below). Throws `ApiAuthError` on 401.
- `src/lib/config.ts` — persists token/store at `~/.wc/config.json` (chmod 600). `getEffectiveToken()` precedence: `WAKE_API_KEY` env → `WAKE_ACCESS_TOKEN` env → config file. `getStoreIdentifier()` precedence: `WAKE_STORE_ID` → `WAKE_STORE` → config file.

### Auth header dispatch (src/lib/api.ts)

The client picks the auth scheme by token shape and env vars in this order:
1. If `WAKE_AUTH_HEADER` is set, write the token to that custom header verbatim.
2. Else if `WAKE_AUTH_TYPE=basic` **or** the token starts with `pocma-` and contains no `.`, send `Authorization: Basic <token>`.
3. Otherwise send both `Authorization: Bearer <token>` and `TCS-Access-Token: <token>` (the Wake API expects either).

Store ID is always sent as both `Current-Store` and `X-Store-Id`. Set `WC_DEBUG=1` to include the 401 response body in `ApiAuthError`.

### TS/module conventions

- `"type": "module"` + `moduleResolution: NodeNext` → **all relative imports must end in `.js`** (even when the source is `.ts`). Adding a new file in `src/lib/` and forgetting `.js` will fail at runtime.
- `tsconfig.json` has `rootDir: src`, so anything under `api/` is **outside** the TS project root. `api/mcp.ts` is compiled by Vercel, not by `npm run build`.
- ESLint is flat config; `*.config.js` and `dist/` are ignored.

## Plugin content rules (non-obvious)

These constraints are repeated at the top of skills, agents, and commands and are easy to miss:

- **Forbidden in plugin content:** any reference to `api.fbits.net` (or `*.fbits.net`). The CLI/MCP code uses that host, but markdown under `skills/`, `agents/`, `commands/`, `rules/` must point users at the canonical docs site `https://wakecommerce.readme.io/docs/schema` instead.
- The publish flow (`commands/publish-copy.md` + `rules/publish-copy.mdc`) copies a curated subset of the repo to a separate public marketplace repo. Inclusion list: `.cursor-plugin/`, `.claude-plugin/`, `.mcp.json`, `skills/`, `agents/`, `rules/`, `commands/`, `assets/`, `scripts/`, plus `README-publish.md` → `README.md`. Excluded: `.bmad-core/`, `.codex/`, `.specify/`, `specs/`, `.publish-config.json`, plus anything not derived from a spec. If you add a new skill/agent/command and it isn't spec-derived, it won't be published.
- `README-publish.md` is the marketplace-facing README. The repo-root `README.md` is the toolkit version. Keep them in sync where appropriate, but the publish-only sections (e.g. publish-copy docs) stay out of `README-publish.md`.

## MCP tool conventions

Tools in `src/lib/tools.ts` follow Wake's REST shape:
- The Wake REST API (`api.fbits.net`) returns either a bare array or `{ items: [...] }`. Every tool normalizes with `Array.isArray(data) ? data : data?.items ?? []`. Reuse this pattern for new tools.
- Field names are Portuguese (`produtoId`, `precoPor`, `nome`, `usuarioId`, `dataCadastro`, `categorias`, `cliente`). Don't rename to English in responses.
- `list_customers` falls back to deriving customers from `/pedidos` if `/usuarios` is unavailable — some Wake tenants don't expose the users endpoint.

## Environment

- Platform is Windows 11 with PowerShell as the default shell. Use PowerShell syntax for any inline commands you suggest the user run (`$env:VAR`, not `$VAR`).
- `.mcp.json` references several MCP servers (chrome-devtools, github, sequential-thinking, playwright-mcp, context7, TestSprite, shadcn) that the plugin's skills/agents may invoke. The `web-performance-audit` skill specifically requires `chrome-devtools` MCP.
