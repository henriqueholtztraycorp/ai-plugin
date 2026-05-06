---
name: publish-copy
description: Internal maintainer command. Copy only spec-derived plugin artifacts to the publish repository. Reads tooling/rules/publish-copy.mdc for inclusion/exclusion. Destination from .env.local (PUBLISH_REPO_PATH), .publish-config.json, or env (config overrides env). Lives under tooling/ and is NEVER published to the marketplace.
---

# Publish-Copy Command (internal)

> **Internal tooling.** This command lives under `tooling/` and is excluded from the marketplace payload. End users never see it.

**Canonical Wake API docs:** https://wakecommerce.readme.io/docs/schema (for any Wake API references in copied content).

Copy marketplace-ready plugin artifacts from the toolkit repo to the publish repository. Only spec-derived paths are copied; internal tooling (including this command) is excluded.

## Prerequisites

1. **Read the rule**: Load `tooling/rules/publish-copy.mdc` for inclusion and exclusion paths.
2. **Resolve destination**:
   - If `.publish-config.json` exists and has `destination`: use it
   - Else if `PUBLISH_REPO_PATH` env is set (in shell or read from `.env.local` via the safe parser below): use it
   - Else: prompt user for destination path

   Config overrides env if both are set.

## Workflow

1. **Read** `tooling/rules/publish-copy.mdc` — get inclusion and exclusion lists.
2. **Resolve destination** per Prerequisites above.
3. **Create destination** if it does not exist (mkdir -p).
4. **Copy** each inclusion path from repo root to destination:
   - `.cursor-plugin/`
   - `.claude-plugin/`
   - `.mcp.json`
   - `skills/`
   - `agents/`
   - `commands/`
   - `README-publish.md` (copied as `README.md` — marketplace version without toolkit-only Publish-Copy section)
   - `assets/`
   - `scripts/`
5. **Never copy** `tooling/` or `rules/` (the publish-copy command and rule must not ship).
6. **Overwrite** existing files at destination.
7. **Report**:
   - If nothing to copy (no inclusion paths exist): report and exit
   - Otherwise: list copied paths and confirm completion

## Execution

Read `PUBLISH_REPO_PATH` from `.env.local` with an explicit `KEY=VALUE` parser. Do NOT `source` the file — sourcing executes arbitrary shell from a config file and is unsafe.

PowerShell (default on Windows):

```powershell
if (Test-Path .env.local) {
  $line = Select-String -Path .env.local -Pattern '^PUBLISH_REPO_PATH=' | Select-Object -Last 1
  if ($line) { $env:PUBLISH_REPO_PATH = ($line.Line -replace '^PUBLISH_REPO_PATH=','').Trim('"',"'") }
}
$dest = $env:PUBLISH_REPO_PATH
if (-not $dest -and (Test-Path .publish-config.json)) {
  $dest = (Get-Content .publish-config.json -Raw | ConvertFrom-Json).destination
}
if (-not $dest) { Write-Error "Set PUBLISH_REPO_PATH in .env.local, or create .publish-config.json with destination"; exit 1 }
New-Item -ItemType Directory -Force -Path $dest | Out-Null
foreach ($d in '.cursor-plugin','.claude-plugin','skills','agents','commands','assets','scripts') {
  if (Test-Path $d) { Copy-Item -Recurse -Force $d $dest }
}
if (Test-Path .mcp.json)         { Copy-Item -Force .mcp.json "$dest\.mcp.json" }
if (Test-Path README-publish.md) { Copy-Item -Force README-publish.md "$dest\README.md" }
Write-Host "Publish-copy complete. Destination: $dest"
```

Bash equivalent (for non-Windows):

```bash
# Parse .env.local without executing it: only KEY=VALUE lines, ignore comments
if [ -f .env.local ]; then
  PUBLISH_REPO_PATH="$(grep -E '^PUBLISH_REPO_PATH=' .env.local | tail -n1 | cut -d= -f2- | sed 's/^"//; s/"$//; s/^'\''//; s/'\''$//')"
fi
DEST="${PUBLISH_REPO_PATH:-$(jq -r '.destination // empty' .publish-config.json 2>/dev/null)}"
[ -z "$DEST" ] && echo "Set PUBLISH_REPO_PATH in .env.local, or create .publish-config.json with destination" && exit 1
mkdir -p "$DEST"
for dir in .cursor-plugin .claude-plugin skills agents commands assets scripts; do
  [ -d "$dir" ] && cp -R "$dir" "$DEST/"
done
[ -f .mcp.json ] && cp .mcp.json "$DEST/.mcp.json"
[ -f README-publish.md ] && cp README-publish.md "$DEST/README.md"
echo "Publish-copy complete. Destination: $DEST"
```

## Validation

After copy, verify destination contains only:
- `.cursor-plugin/`, `.claude-plugin/`, `.mcp.json`, `skills/`, `agents/`, `commands/`, `README.md` (from README-publish.md), `assets/`, `scripts/`

And does NOT contain:
- `tooling/`, `rules/`, `.bmad-core/`, `.codex/`, `.specify/`, `specs/`
