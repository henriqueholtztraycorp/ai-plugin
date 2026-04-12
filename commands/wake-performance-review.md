---
name: wake-performance-review
description: Performance review for Wake Commerce storefront. Query optimization, caching, Core Web Vitals. Use performance-engineer agent and web-performance-audit skill.
---

# Wake Performance Review Workflow

**Forbidden:** api.fbits.net (and any *.fbits.net). **Canonical source:** https://wakecommerce.readme.io/docs/schema (for Wake API references).

Review and optimize storefront performance.

## Steps

1. **GraphQL**: Check for over-fetching, N+1; recommend batching, fragment reuse.
2. **Caching**: Apollo/React Query cache config; TTL; invalidation on checkout.
3. **Images**: Dimensions (w, h); lazy load; WebP.
4. **Core Web Vitals**: LCP, INP, CLS; use web-performance-audit skill for Lighthouse.
5. **Chrome DevTools MCP**: Run performance_start_trace, lighthouse_audit when available.
6. **Agent**: Use performance-engineer agent for detailed recommendations.

## Output

Performance review report with findings and optimization recommendations.
