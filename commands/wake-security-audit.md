---
name: wake-security-audit
description: Security audit for Wake Commerce storefront. Review token handling, auth, data exposure, OWASP alignment. Use security-auditor agent.
---

# Wake Security Audit Workflow

**Forbidden:** api.fbits.net (and any *.fbits.net). **Canonical source:** https://wakecommerce.readme.io/docs/schema (for Wake API references).

Audit storefront code for security issues.

## Steps

1. **Token handling**: Verify customerAccessToken, partnerAccessToken never logged or exposed; check storage (httpOnly cookie, secure storage).
2. **Auth**: Validate login flow; token expiry; logout cleanup.
3. **Input validation**: productId, checkoutId, CEP, user input; sanitize before GraphQL.
4. **Data exposure**: No internal paths, stack traces, or PII in errors.
5. **Secrets**: API keys in env; .env not committed; no hardcoded credentials.
6. **OWASP**: Check injection, XSS, CSRF; document findings.
7. **Agent**: Use security-auditor agent for detailed review.

## Output

Security audit report with findings and remediation recommendations.
