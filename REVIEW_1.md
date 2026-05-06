# Plugin Submission Review — Wake Commerce

Pre-submission review against Claude Code plugin marketplace requirements (https://code.claude.com/docs/en/plugins) and general security/quality standards.

---

## Critical

- **[CRITICAL] Plugin identity mismatch.** `.claude-plugin/plugin.json` declares `name: "wake-storefront"`, but `README.md` instructs users to run `/plugin install wake-storefront-api` (the Cursor manifest's name). Marketplace install will fail on the documented command.
- **[CRITICAL] No `marketplace.json`.** Submitting to the official marketplace requires a `.claude-plugin/marketplace.json` describing the plugin entry. None present.
- **[CRITICAL] Missing direct dependency `zod`.** `src/lib/tools.ts:2` does `import { z } from 'zod'`, but `zod` is not in `package.json` `dependencies`. Currently only resolves via transitive `@modelcontextprotocol/sdk`; a peer/dep change in upstream breaks the MCP server at runtime. Add `zod` explicitly.
- **[CRITICAL] API key transported via URL query string** (`api/mcp.ts:9`). `?apiKey=…` is logged by Vercel access logs, upstream proxies, browser history, and `Referer` headers. Move credentials to headers only; reject query-string auth or accept it only with an explicit warning.
- **[CRITICAL] No LICENSE file.** Both manifests and `package.json` declare `MIT`, but no `LICENSE` file is checked in. Required by marketplace policy and by the MIT license itself.
- **[CRITICAL] `vercel.json` `outputDirectory: "."`** ships the entire repo (source, config, README, the toolkit-only `CLAUDE.md`, `Final-Review.md`, `review-prompt.md`, etc.) as the deploy output. Should target a built artifact directory, and the deployment input should exclude development files.

## High

- **[HIGH] Path/SSRF surface in `createApiClient.fetch`** (`src/lib/api.ts:30`). `path.startsWith('http')` is honored, so any caller passing a full URL hits arbitrary hosts with the user's Wake token attached. MCP tool inputs (`get_order` `id`, `get_customer` `id`) are interpolated unencoded into URLs (`/pedidos/${id}`) — no validation against `..`, `/`, or absolute URLs. Validate inputs (`/^[A-Za-z0-9_-]+$/`) and forbid absolute URLs in `path`.
- **[HIGH] Plain-text credential file on Windows.** `src/lib/config.ts:31` saves the API token to `~/.wc/config.json` and calls `chmod 0o600`. POSIX modes are largely ignored on Windows NTFS, so the token is readable by any process running as the same user. Use OS-native secret storage (Windows Credential Manager / macOS Keychain / libsecret) or, at minimum, document the limitation prominently.
- **[HIGH] Version skew across manifests.** `package.json` is `0.1.0`, `.claude-plugin/plugin.json` is `1.0.0`, MCP server reports `0.1.0` (`src/mcp-server.ts:8`, `api/mcp.ts:21`). Marketplace and clients will display inconsistent versions.
- **[HIGH] `npm run spike:*` references files that do not exist** (`scripts/auth-spike.ts`, `auth-discovery-spike.ts`, `api-key-probe.ts`). These are auth-probe scripts; shipping commands that fail or, worse, get filled later with token exfiltration is a supply-chain concern. Remove from `package.json` until the files exist and are reviewed.
- **[HIGH] `commands/publish-copy.md` and `rules/publish-copy.mdc` reference `README-publish.md`, which does not exist.** The documented publish flow is broken; running it will produce a marketplace bundle without a README.
- **[HIGH] `.cursor-plugin/plugin.json` has no `license` field** while `.claude-plugin/plugin.json` does. Either standardize or document why they differ.
- **[HIGH] Token written to two headers per request** (`Authorization: Bearer` + `TCS-Access-Token`, `src/lib/api.ts:42-43`). Doubles exposure surface in logs/proxies. Pick one; if both are required for legacy reasons, gate behind a flag.

## Medium

- **[MEDIUM] No input validation in MCP tools.** `list_products` accepts `limit` with no upper bound (`src/lib/tools.ts:13`); a tool client could request a 10M slice and OOM the process. Same for `list_orders`, `list_customers`. Cap limit (e.g., `z.number().int().min(1).max(500)`).
- **[MEDIUM] HTTP MCP handler has no CORS, no rate limiting, no body-size guard** (`api/mcp.ts`). Public endpoint will accept arbitrary bodies up to Vercel's default. Add `maxDuration` is set (30s) but no `bodyParser` size limit.
- **[MEDIUM] `WC_DEBUG=1` leaks 401 response bodies** into thrown errors (`src/lib/api.ts:52-57`). If users paste error logs into public issues, server-side details leak. Redact or scope to a clearly developer-only flag.
- **[MEDIUM] README installation step is wrong.** `claude --plugin-dir ./path/to/plugin` (`README.md:17`) is not a Claude Code flag. Local testing uses a local marketplace via `/plugin marketplace add ./`. Fix to avoid users following a non-existent invocation.
- **[MEDIUM] Hard-coded `https://api.fbits.net` base URL** (`src/lib/api.ts:3`) directly contradicts the repo-wide rule in `CLAUDE.md` ("Forbidden in plugin content: any reference to `api.fbits.net`"). The CLAUDE.md exempts the CLI/MCP code, but the marketplace bundle will still ship this. Confirm the host is a public, supported endpoint (and that exposing it does not leak vendor infrastructure).
- **[MEDIUM] `scripts/wake-graphql-validate.sh` returns exit code = number of issues**, capped only by shell exit-code range (0-255). If issue count grows, exit codes wrap or collide with conventional exit codes (1, 2). Use `0` / `1` only.
- **[MEDIUM] Final-Review.md and review-prompt.md committed/untracked at repo root** look like internal review artifacts. They should not be part of the published plugin (publish-copy already excludes them, but they should also not be in the public repo if it is the marketplace source).
- **[MEDIUM] No tests in repo**, and `package.json` has no `test` script (CLAUDE.md confirms). Marketplace plugins benefit from at least a smoke test for tool registration; without it, regressions ship silently.

## Low

- **[LOW] `package.json` `author: ""`** is empty while plugin manifests credit "Wake Commerce". Align metadata.
- **[LOW] Two logo assets** (`assets/logo.svg`, `assets/wake-logo.png`); only the SVG is referenced. Remove the unused PNG or wire it into `README.md`.
- **[LOW] Agent frontmatter says "Use PROACTIVELY"** (e.g., `agents/security-auditor.md:3`, `agents/performance-engineer.md`). Agents are invoked when description matches user intent — "proactively" is not a behavioral switch. Reword to a precise trigger description.
- **[LOW] `commands/wake-security-audit.md`, `wake-test-plan.md`, etc.** are essentially one-paragraph stubs that delegate to an agent. Marketplace reviewers may flag them as low-value commands. Consider consolidating or expanding.
- **[LOW] `eslint.config.js` ignores `*.config.js`** including itself — fine, but `api/` is also outside `tsconfig` `rootDir` and is not type-checked or linted by `npm run lint` (which only scans `src`). Add `api/` to lint scope.
- **[LOW] `package.json` `files: ["dist"]`** ships only built JS, but `prepare: "npm run build"` runs on consumer install — fine, but `tsx` is a devDependency, so `dev` script will fail post-install. Document or move to `optionalDependencies`.
- **[LOW] `list_customers` fallback to `/pedidos`** (`src/lib/tools.ts:123-137`) silently leaks customer PII (name, email) extracted from orders even when `/usuarios` is intentionally locked down for the tenant. Document this behavior or gate behind an explicit flag.
- **[LOW] `link` command** strips `https?://` and splits on `.` (`src/commands/link.ts:22`); inputs like `https://store.example.fbits-admin.net/path` silently become `store`. Validate format and surface the parsed result before saving.

---

## Recommended fixes before submission

1. Reconcile plugin name across `README.md`, `.claude-plugin/plugin.json`, `.cursor-plugin/plugin.json`.
2. Add `.claude-plugin/marketplace.json` and a root `LICENSE` file.
3. Add `zod` to `package.json` dependencies.
4. Reject query-string `apiKey` in `api/mcp.ts`; document header-only auth.
5. Validate `id`-style tool inputs and reject absolute URLs in `createApiClient.fetch`.
6. Remove or implement the `spike:*` scripts.
7. Create `README-publish.md` or remove the publish-copy workflow until ready.
8. Align versions across manifests and runtime banners.
9. Cap `limit` parameters in MCP tools.
10. Replace POSIX `chmod` token storage with OS keyring (or document the Windows caveat).
