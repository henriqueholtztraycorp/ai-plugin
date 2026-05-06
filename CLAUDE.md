# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Official docs to create plugins: https://code.claude.com/docs/en/plugins

## Repository shape

This repo is a **Claude/Cursor plugin** — declarative, markdown-only content in `agents/`, `commands/`, `skills/`, `.claude-plugin/`, `.cursor-plugin/`, `assets/`. No build step, no compiled artifacts. Internal-only tooling (publish-copy command/rule) lives in `tooling/` and is never copied to the marketplace.

- Consumed by Claude Code (`/plugin install wake-storefront`) and by Cursor (added as a local plugin directory).
- Both Claude and Cursor manifests use the plugin name `wake-storefront`.
- The Claude marketplace manifest is at `.claude-plugin/marketplace.json` (marketplace `name: wake-commerce`).

## Plugin content rules (non-obvious)

These constraints are repeated at the top of skills, agents, and commands and are easy to miss:

- **Forbidden in plugin content:** any reference to `api.fbits.net` (or `*.fbits.net`). Markdown under `skills/`, `agents/`, `commands/` must point users at the canonical docs site `https://wakecommerce.readme.io/docs/schema` instead.
- The publish flow (`tooling/commands/publish-copy.md` + `tooling/rules/publish-copy.mdc`) copies a curated subset of the repo to a separate public marketplace repo. Inclusion list: `.cursor-plugin/`, `.claude-plugin/`, `.mcp.json`, `skills/`, `agents/`, `commands/`, `assets/`, `scripts/`, plus `README-publish.md` → `README.md`. Excluded: `tooling/`, `.bmad-core/`, `.codex/`, `.specify/`, `specs/`, `.publish-config.json`, plus anything not derived from a spec. If you add a new skill/agent/command and it isn't spec-derived, it won't be published.
- `README-publish.md` is the marketplace-facing README. The repo-root `README.md` is the toolkit version. Keep them in sync where appropriate, but the publish-only sections (e.g. publish-copy docs) stay out of `README-publish.md`.

## Environment

- Platform is Windows 11 with PowerShell as the default shell. Use PowerShell syntax for any inline commands you suggest the user run (`$env:VAR`, not `$VAR`).
- `.mcp.json` ships only the `chrome-devtools` MCP server (required by the `web-performance-audit` skill). Other MCP servers (context7, sequential-thinking, etc.) are referenced as optional external tools in some agents but are NOT auto-installed by this plugin — users must add them to their own MCP config if they want them.
