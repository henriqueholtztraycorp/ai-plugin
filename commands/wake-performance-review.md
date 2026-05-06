---
name: wake-performance-review
description: Performance review for Wake Commerce storefront. Covers GraphQL query shape, caching, images, and Core Web Vitals. Delegates Lighthouse capture to the web-performance-audit skill and detailed analysis to the performance-engineer agent.
---

# Wake Performance Review Workflow

**Forbidden:** api.fbits.net (and any *.fbits.net). **Canonical source:** https://wakecommerce.readme.io/docs/schema (for Wake API references).

Diagnose and prioritize performance issues on a Wake Commerce storefront: GraphQL waste, cache misses, image regressions, and Core Web Vitals (LCP / INP / CLS).

## Inputs

- **Target** (required): URL of the deployed storefront page, or local route + dev-server port. Examples: `https://shop.example.com/p/sneaker-x`, `http://localhost:3000/search?q=shoes`.
- **Page type** (optional): home, category, search, PDP, cart, checkout. Defaults inferred from the URL.
- **Device profile** (optional): mobile (default) or desktop. Throttling: 4× CPU, Slow 4G for mobile.
- **Baseline** (optional): a prior Lighthouse run / CrUX snapshot to diff against.

## Steps

1. **Establish baselines.** Capture LCP, INP, CLS, TBT, TTFB, and total bytes via the **web-performance-audit** skill (Chrome DevTools MCP `lighthouse_audit` + `performance_start_trace`). Record three runs and use the median.
2. **GraphQL shape audit.** Open Network → GraphQL. For each operation: confirm only required fields are selected, fragments are reused (`SingleProductData`, `checkoutFields`), and there are no N+1 patterns (e.g., a product list followed by per-product detail fetches). Flag operations >150 KB response or >500 ms server time.
3. **Caching strategy.** Inspect Apollo / React Query cache config: keys (`productById`, `search`), TTL per partner, and invalidation triggers on checkout state changes. Check CDN headers (`cache-control`, `vary`) on static and API routes.
4. **Images.** Confirm `imageUrl` is requested with explicit `w`/`h` (no oversized originals), `loading="lazy"` is set below the fold, and modern formats (WebP/AVIF) are served via `<picture>` or `Accept`-based negotiation.
5. **Core Web Vitals deep-dive.**
   - **LCP:** identify the LCP element; verify it is server-rendered, preloaded, and not blocked by JS hydration.
   - **INP:** profile interactions on the slowest button/link; flag long tasks > 50 ms during user input.
   - **CLS:** verify reserved space for images, ads, and async-loaded modules.
6. **JS payload.** Bundle analyzer pass: flag duplicate libraries, polyfills shipped to modern browsers, and route-level chunks > 200 KB gzipped.
7. **Server / edge.** TTFB > 600 ms? Check origin distance, SSR work, and uncached GraphQL fan-out.
8. **Delegate analysis.** Hand the captured traces and findings to the **performance-engineer** agent for prioritized remediation, performance budget recommendations, and an optimization roadmap.

## Output

A markdown report with:

- **Baseline metrics** table (LCP / INP / CLS / TBT / TTFB / bytes; mobile + desktop)
- **Findings**, ranked by impact: title, evidence (trace / screenshot / file:line), expected lift, effort
- **Top 3 quick wins** (under 1 day each)
- **Performance budget proposal** for this page type
- **Follow-up monitoring** plan (CrUX, RUM, synthetic)

## Example invocation

> `/wake-performance-review` target: `https://shop.example.com/p/sneaker-x`, device: mobile, baseline: previous Lighthouse run from last release.
