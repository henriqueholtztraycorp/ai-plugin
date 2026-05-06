# Wake Commerce Plugin

AI-powered development assistance for Wake Commerce Storefront. Agents, skills, workflows, and tools for building headless storefronts, checkout flows, migrations, security audits, performance reviews, and code quality.

## Installation

### Cursor

1. Open Cursor Settings → Plugins
2. Add this directory as a local plugin
3. The plugin loads manifests, skills, agents, and commands

### Claude (Agent Plugins)

1. Add the marketplace if needed: `/plugin marketplace add <marketplace-url>`
2. Install: `/plugin install wake-storefront-api`
3. Or test locally with a local marketplace: `/plugin marketplace add ./` from the plugin root

## Documentation

For detailed API reference, schemas, and guides:

- **[Wake Commerce Documentation](https://wakecommerce.readme.io/)** — Storefront API, GraphQL schema, checkout, products, search, and more.

---

## Agents

| Agent | Description |
|-------|-------------|
| **wake-storefront-developer** | Wake Commerce Storefront API specialist. Use when building headless storefronts, product pages, search, checkout, cart, or customer flows. |
| **wake-checkout-architect** | Checkout flow design specialist. Use when designing checkout, shipping, payment, or order completion. |
| **wake-migration-specialist** | Reference-to-headless migration specialist. Use when migrating from Wake Storefront templates, porting Queries/*.graphql, or aligning with production patterns. |
| **security-auditor** | Senior security auditor. Use when reviewing changes that touch auth/tokens/secrets/input validation, performing OWASP-aligned audits, or threat-modeling storefront flows. |
| **qa-expert** | Test design and validation specialist. Use when designing E2E tests, contract tests, or acceptance criteria. |
| **performance-engineer** | Senior performance engineer. Use when investigating Core Web Vitals, GraphQL query optimization, caching strategy, image/asset perf, load/stress testing, or scaling/capacity questions. |
| **graphql-architect** | GraphQL design specialist. Use when designing schema usage, queries, fragments, or batching. |
| **code-reviewer** | Code quality specialist. Use when reviewing style, patterns, maintainability, or best practices. |

---

## Workflows (Commands)

| Command | Description |
|---------|-------------|
| **wake-product-page** | Build a product detail page. Load product by productId, resolve variant via attributeSelections, render prices/images/add-to-cart. |
| **wake-search-page** | Build a search page. Call search(query, partnerAccessToken), use productsByOffset for pagination, apply filters and aggregations. |
| **wake-checkout-flow** | Implement full checkout sequence: createCheckout → checkoutCustomerAssociate → checkoutAddressAssociate → shippingQuotes → checkoutSelectShippingQuote → checkoutAddCoupon → paymentMethods → checkoutSelectPaymentMethod → checkoutComplete. |
| **wake-migrate-storefront-query** | Port Wake Storefront reference Queries/*.graphql to headless. Extract root field, args, fragment; generate equivalent headless query. |
| **wake-security-audit** | Security audit. Review token handling, auth, data exposure, OWASP alignment. Uses security-auditor agent. |
| **wake-test-plan** | Generate test plan. Define E2E scenarios, contract tests, acceptance criteria. Uses qa-expert agent. |
| **wake-performance-review** | Performance review. Query optimization, caching, Core Web Vitals. Uses performance-engineer agent and web-performance-audit skill. |
| **wake-query-review** | GraphQL query design review. Schema alignment, fragments, batching. Uses graphql-architect agent. |
| **wake-code-review** | Code quality review. Style, patterns, maintainability. Uses code-reviewer agent. |

---

## Skills

| Skill | Description |
|-------|-------------|
| **wake-storefront-api** | Wake Commerce Storefront API for headless storefronts. Product pages, search, checkout, cart, customer flows. |
| **wake-checkout-flow** | Checkout mutation sequence. createCheckout → checkoutComplete, shipping selection, payment selection. |
| **wake-product-variants** | Variant resolution and add-to-cart. attributeSelections, matrix, selectedVariant, customizations, subscriptionGroups. |
| **wake-storefront-reference-patterns** | Reference to headless mapping. Migrating from Wake Storefront templates, porting Queries/*.graphql, productId vs handle. |
| **wake-hotsite-banners** | Hotsite and landing pages. Landing pages, promotional pages, campaign URLs. |
| **web-performance-audit** | Lighthouse and performance audits. Core Web Vitals (LCP, INP, CLS), accessibility, SEO, best practices. Requires Chrome DevTools MCP. |

---

## Tools (Scripts)

| Script | Usage | Purpose |
|--------|-------|---------|
| **wake-graphql-validate.sh** | `./scripts/wake-graphql-validate.sh <query-file>` | Validate GraphQL query: productId (not handle), attributeSelections, partnerAccessToken. |
| **wake-query-from-reference.sh** | `./scripts/wake-query-from-reference.sh <reference-file>` | Extract headless query pattern from Wake Storefront reference. Outputs mapping notes. |
| **wake-checkout-flow-validator.sh** | `./scripts/wake-checkout-flow-validator.sh <file>` | Verify checkout mutations are called in correct order. |

---

## What's Included

| Component | Path | Purpose |
|-----------|------|---------|
| Cursor manifest | `.cursor-plugin/` | Cursor plugin metadata |
| Claude manifest | `.claude-plugin/` | Claude/Agent Plugins metadata |
| MCP config | `.mcp.json` | External MCP servers used by skills/agents |
| Skills | `skills/` | Domain instructions and references |
| Agents | `agents/` | Persona definitions |
| Commands | `commands/` | Slash-command workflows |
| Rules | `rules/` | Plugin rules |
| Scripts | `scripts/` | Validation and extraction tools |
| Assets | `assets/` | Logo and marketplace assets |

---

## References

- [Wake Commerce Documentation](https://wakecommerce.readme.io/) — API reference, schemas, guides
- [Agent Skills Specification](https://agentskills.io/specification)
- [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [Core Web Vitals](https://web.dev/articles/vitals)

## License

MIT
