---
name: publish-copy
description: Copy only spec-derived plugin artifacts to the publish repository. Reads rules/publish-copy.mdc for inclusion/exclusion. Destination from .env.local (PUBLISH_REPO_PATH), .publish-config.json, or env (config overrides env).
---

# Publish-Copy Command

Copy marketplace-ready plugin artifacts from the toolkit repo to the publish repository. Only spec-derived paths are copied; internal tooling is excluded.

## Prerequisites

1. **Read the rule**: Load `rules/publish-copy.mdc` for inclusion and exclusion paths.
2. **Load .env.local** (if present): Source `.env.local` so `PUBLISH_REPO_PATH` is available.
3. **Resolve destination** (after loading .env.local):
   - If `.publish-config.json` exists and has `destination`: use it
   - Else if `PUBLISH_REPO_PATH` env is set (from .env.local or shell): use it
   - Else: prompt user for destination path

   Config overrides env if both are set.

## Workflow

1. **Read** `rules/publish-copy.mdc` — get inclusion and exclusion lists.
2. **Resolve destination** per Prerequisites above.
3. **Create destination** if it does not exist (mkdir -p).
4. **Copy** each inclusion path from repo root to destination:
   - `.cursor-plugin/`
   - `.claude-plugin/`
   - `.mcp.json`
   - `skills/`
   - `agents/`
   - `rules/`
   - `commands/`
   - `README.md`
   - `assets/`
   - `scripts/`
5. **Overwrite** existing files at destination.
6. **Report**:
   - If nothing to copy (no inclusion paths exist): report and exit
   - Otherwise: list copied paths and confirm completion

## Execution

Use bash/file operations to perform the copy. Example pattern:

```bash
[ -f .env.local ] && set -a && source .env.local && set +a
DEST="${PUBLISH_REPO_PATH:-$(jq -r '.destination // empty' .publish-config.json 2>/dev/null)}"
[ -z "$DEST" ] && echo "Set PUBLISH_REPO_PATH in .env.local, or create .publish-config.json with destination" && exit 1
mkdir -p "$DEST"
for dir in .cursor-plugin .claude-plugin skills agents rules commands assets scripts; do
  [ -d "$dir" ] && cp -R "$dir" "$DEST/"
done
[ -f README.md ] && cp README.md "$DEST/"
echo "Publish-copy complete. Destination: $DEST"
```

## Validation

After copy, verify destination contains only:
- `.cursor-plugin/`, `.claude-plugin/`, `.mcp.json`, `skills/`, `agents/`, `rules/`, `commands/`, `README.md`, `assets/`, `scripts/`

And does NOT contain:
- `.bmad-core/`, `.codex/`, `.specify/`, `specs/`
