---
name: wake-security-audit
description: Security audit for Wake Commerce storefront. Review token handling, auth, data exposure, OWASP alignment. Delegates detailed analysis to the security-auditor agent.
---

# Wake Security Audit Workflow

**Forbidden:** api.fbits.net (and any *.fbits.net). **Canonical source:** https://wakecommerce.readme.io/docs/schema (for Wake API references).

Run a security audit over a Wake Commerce storefront integration. Use this command before merging changes that touch auth, secrets, customer/partner tokens, or input validation, and as a periodic pre-release check.

## Inputs

- **Scope** (required): files, directory, PR diff, or feature area. Examples: `apps/storefront/src/checkout/**`, `git diff origin/main...HEAD`, "the customer login flow".
- **Compliance target** (optional): OWASP Top 10 (default), PCI-DSS scope, LGPD/GDPR PII rules, or a custom checklist.
- **Severity threshold** (optional): minimum severity to report (Critical / High / Medium / Low). Defaults to Medium.

## Steps

1. **Inventory the surface.** Identify entry points (routes, GraphQL operations, webhooks, MCP tools), trust boundaries, and where secrets enter/leave the system.
2. **Token & session handling.** Verify `customerAccessToken` and `partnerAccessToken` are never logged, printed, sent in URLs, or stored in `localStorage`. Check expiry, refresh, and logout cleanup. Flag any tokens persisted to disk without OS-keyring protection.
3. **Auth flows.** Walk login, registration, password reset, and SSO. Check for IDOR, missing rate limiting, weak password policy, and broken object-level authorization on `customerId`/`orderId`/`checkoutId`.
4. **Input validation.** For every external input (`productId`, `checkoutId`, `cep`, search query, coupon code, free-text fields): confirm a typed schema (Zod / Yup / GraphQL scalar) bounds shape, length, and character set. Flag string-concatenated GraphQL or shell calls.
5. **Data exposure.** Grep for stack traces, internal hostnames, debug payloads, and PII (email, CPF, phone) in error responses, logs, and client bundles. Confirm errors returned to the browser are generic.
6. **Secrets & config.** Verify API keys live in env vars or a secret manager, never in source. Confirm `.env*` is gitignored and no secrets exist in git history (`git log -p -- .env`).
7. **Transport & headers.** Check that requests use HTTPS, that `Authorization` is sent in headers (not query strings), and that responses set `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, and `Referrer-Policy` where appropriate.
8. **Dependencies.** Run `npm audit --omit=dev` (or `pnpm audit`); cross-check Critical/High advisories against actual usage before recommending upgrades.
9. **Delegate detailed analysis.** Hand the assembled findings to the **security-auditor** agent for OWASP-aligned write-up, CWE references, and remediation snippets.

## Output

A markdown report with one entry per finding:

- **Title** + severity (Critical / High / Medium / Low)
- **Location** (file:line, route, or operation)
- **Description** and **business impact**
- **Steps to reproduce**
- **Remediation** (specific, with code where possible)
- **References** (OWASP / CWE / Wake docs)

End with an executive summary (counts per severity) and a top-3 prioritized action list.

## Example invocation

> `/wake-security-audit` scope: `git diff origin/main...HEAD` — review the current branch against OWASP Top 10, threshold Medium.
