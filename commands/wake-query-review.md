---
name: wake-query-review
description: GraphQL query design review for Wake Commerce storefronts. Schema alignment, fragments, batching, and field-selection hygiene. Delegates detailed redesign to the graphql-architect agent.
---

# Wake Query Review Workflow

**Forbidden:** api.fbits.net (and any *.fbits.net). **Canonical source:** https://wakecommerce.readme.io/docs/schema

Review GraphQL queries and mutations against the Wake Storefront schema and recommend changes that improve correctness, reusability, and performance.

## Inputs

- **Target** (required): one or more `.graphql` files, an inline query, or a directory (e.g. `apps/storefront/src/queries/**/*.graphql`).
- **Operation type** (optional): query / mutation / subscription. Defaults to all.
- **Context** (optional): the page or feature the operation backs (PDP, search, checkout) — sharpens recommendations on field selection and caching.

## Steps

1. **Schema alignment.** Cross-check every field, argument, and enum value against the canonical schema (https://wakecommerce.readme.io/docs/schema). Flag deprecated fields, wrong scalar types, and missing required arguments. Confirm Wake-native identifiers are used: `productId` (not `handle`), `productVariantId`, `attributeSelections`, `checkoutId`, `partnerAccessToken`.
2. **Field selection.** Remove fields the consumer does not read. Use `@include(if:)` / `@skip(if:)` for conditional sub-trees instead of multiple operation variants. Flag operations selecting >50 leaf fields.
3. **Fragment composition.** Extract reusable fragments (`SingleProductData`, `checkoutFields`, `customerFields`). Co-locate fragments with the components that consume them. Avoid fragment cycles and duplicate fragment names across the project.
4. **Batching & N+1.** Replace per-item fetches with a single list query plus the relevant fragment. For lists, prefer `productsByOffset` / connection patterns over fan-out client-side.
5. **Variables & types.** Use typed input objects, not stringly-typed scalars. Confirm pagination variables (`first`, `offset`, `cursor`) match the backing connection.
6. **Mutations.** Verify the mutation order matches the documented checkout sequence (`createCheckout` → `checkoutCustomerAssociate` → `checkoutAddressAssociate` → `shippingQuotes` → `checkoutSelectShippingQuote` → `checkoutSelectPaymentMethod` → `checkoutComplete`). Flag any missing intermediate step.
7. **Caching impact.** For each query, list the cache key it produces in Apollo / React Query and the events that should invalidate it (e.g., `checkoutAddCoupon` invalidates the cart query).
8. **Delegate redesign.** Hand the annotated operations to the **graphql-architect** agent for rewritten versions and fragment extraction.

## Output

A markdown report with one section per operation:

- **Operation name + file:line**
- **Issues found** (severity: critical / high / medium / low)
- **Suggested rewrite** (diff or full replacement)
- **Cache key + invalidation notes**
- **Schema references** (deep links to https://wakecommerce.readme.io/docs/schema)

End with a roll-up: count by severity, list of new/extracted fragments, and cache-impact summary.

## Example invocation

> `/wake-query-review` target: `apps/storefront/src/queries/pdp/*.graphql`, context: PDP.
