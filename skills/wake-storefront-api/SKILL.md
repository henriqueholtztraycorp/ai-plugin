---
name: wake-storefront-api
description: "Wake Commerce Storefront API for headless storefronts. Use when building product pages, search, checkout, cart, or customer flows. Triggers on: Wake Storefront API, Wake Commerce GraphQL, product queries, checkout flow, cart, headless storefront."
---

# Wake Storefront API

GraphQL-based Storefront API for Wake Commerce headless storefronts. Covers products, search, checkout, cart, and customer operations.

## When to Use

- Building product listing, detail, or search pages
- Implementing checkout or cart flows
- Integrating customer account features
- Writing GraphQL queries for Wake Commerce
- Migrating or extending Wakelabs storefront patterns

## API Overview

The Storefront API is GraphQL. Base URL and auth depend on partner configuration. Key operations:

| Operation | Root Field | Use Case |
|-----------|------------|----------|
| Product | `product(productId, partnerAccessToken)` | Product detail, variants, prices |
| Search | `search(query, partnerAccessToken)` | Product search, filters, pagination |
| Checkout | `checkout(checkoutId)` | Cart contents, shipping, totals |
| Cart | See references/checkout-cart.md | Mini cart, add to cart |

## Core Principles

1. **Use `partnerAccessToken`** when querying in partner/wholesale context.
2. **Avoid N+1**: Batch related data in a single query; use fragments for reuse.
3. **Select only needed fields**: Do not over-fetch; GraphQL allows precise selection.
4. **Handle `@include(if:)`** for conditional checkout data when `hasCheckout` is false.

## Product Queries

See [references/products.md](references/products.md) for:
- Product detail with variants and attribute selections
- `SingleProductData` fragment usage
- Price fields (listPrice, price, discountPercentage, installmentPlans)
- Image URLs with dimensions

## Search Queries

- Root: `search(query, partnerAccessToken)`
- Use `productsByOffset` for paginated results (limit, offset, sortKey, sortDirection, filters)
- Aggregations: filters, priceRanges, minimumPrice, maximumPrice
- Items: productId, productName, alias, images, prices, promotions, addToCartFromSpot

## Checkout & Cart

See [references/checkout-cart.md](references/checkout-cart.md) for:
- Checkout query structure
- Products in checkout (listPrice, price, quantity, customization)
- shippingFee, subtotal, total
- Mini cart and add-to-cart patterns

## Customer

See [references/customer.md](references/customer.md) for customer-related operations.

## Error Handling

- When Storefront API returns errors: surface user-friendly message; do not expose internal paths or stack traces.
- When `productId` or `checkoutId` is invalid: return 404 or equivalent; use `.maybeSingle()` for optional queries.
- When partner token is missing but required: inform user to configure `partnerAccessToken`.

## References

- [Product query patterns](references/products.md)
- [Checkout and cart patterns](references/checkout-cart.md)
- [Customer API patterns](references/customer.md)
- Wake Commerce docs: wakecommerce.readme.io
