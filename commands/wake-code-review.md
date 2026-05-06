---
name: wake-code-review
description: Code quality review for Wake Commerce storefront. Style, patterns, maintainability, TypeScript hygiene, and alignment with Wake skills. Delegates detailed review to the wake-code-reviewer agent.
---

# Wake Code Review Workflow

**Forbidden:** api.fbits.net (and any *.fbits.net). **Canonical source:** https://wakecommerce.readme.io/docs/schema (for Wake API references).

Review code quality on a Wake Commerce storefront change. Focus is correctness, maintainability, and alignment with the project's Wake-specific patterns — not style nitpicks the linter already enforces.

## Inputs

- **Scope** (required): a PR diff (`git diff origin/main...HEAD`), a directory, or specific files. Examples: `apps/storefront/src/checkout/**`, `PR #482`.
- **Severity threshold** (optional): minimum severity to surface (Critical / High / Medium / Low). Defaults to Medium.
- **Focus areas** (optional): subset of {style, types, error-handling, hooks, Wake-patterns, tests}. Defaults to all.

## Steps

1. **Read the change in context.** Open the diff and the surrounding files. Confirm the change has a single coherent purpose; flag drive-by edits that should be split.
2. **Style & naming.** Check identifier clarity, no magic numbers, no commented-out code, no dead branches. Defer to ESLint/Prettier for mechanical issues — only flag what the linter cannot catch.
3. **DRY / SOLID.** Identify duplicated logic that should be extracted, modules that took on a second responsibility, and abstractions that leak storage/transport details into UI.
4. **Error handling.** Every async call has a defined failure path. User-visible messages are generic; internal logs include correlation IDs, never PII. No `catch {}` silently swallowing errors. Confirm `ApiAuthError` (and any Wake-specific error types) is handled at the right layer.
5. **React hooks discipline.** `useCallback` / `useMemo` only where dependencies justify it (not as a default). No effects that re-run on every render. Confirm cleanup functions for subscriptions, listeners, and timers.
6. **TypeScript hygiene.** Strict mode is on; no `any` (use `unknown` + narrowing); no `as` cast that bypasses a fixable type; null checks at boundaries. Confirm public functions are exported with explicit return types.
7. **Wake patterns.** Cross-check against the project's skills:
   - `wake-storefront-api` — productId vs handle, partnerAccessToken usage
   - `wake-checkout-flow` — mutation order
   - `wake-product-variants` — `attributeSelections` resolution
   - Field names stay Portuguese (`produtoId`, `precoPor`, `nome`) when surfacing Wake REST data.
8. **Tests.** New behavior has a test; modified behavior has a regression test; tests assert outcomes, not implementation. Flag mocked-database tests where an integration test would catch more.
9. **Delegate.** Hand the assembled notes to the **wake-code-reviewer** agent for the final write-up with rewritten code snippets.

## Output

A markdown review with:

- **Summary** (1–2 sentences on overall quality and merge-readiness)
- **Findings** by severity: title, file:line, why it matters, suggested fix (with code where helpful)
- **Nits** (non-blocking, grouped at the end)
- **Test gaps**
- **Approval signal**: `approve` / `request changes` / `comment`

## Example invocation

> `/wake-code-review` scope: `git diff origin/main...HEAD`, threshold: Medium, focus: types + Wake-patterns.
