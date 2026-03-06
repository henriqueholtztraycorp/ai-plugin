---
name: wake-storefront-reference-patterns
description: "Wake Storefront reference to headless mapping. Use when migrating from Wake Storefront templates, porting Queries/*.graphql, or aligning with production patterns. Triggers on: migrate, reference, Queries, productId vs handle, attributeSelections, addToCartFromSpot."
---

# Wake Storefront Reference Patterns

Mapping Wake Storefront reference implementations (Queries/, Snippets) to headless Storefront API patterns. Use when migrating from templates or aligning with production query patterns.

## When to Use

- Migrating from Wake Storefront reference to headless
- Porting Queries/*.graphql or SnippetQueries/*.graphql
- Understanding productId vs handle, attributeSelections vs options
- Aligning headless code with production reference

## Key Mappings

### productId vs handle

| Wake Native (Queries/) | Shopify-like (src/graphql/) | Notes |
|------------------------|----------------------------|-------|
| productId (Long) | id, handle | Wake uses Long IDs; no handle |
| productVariantId (Long) | variant id | Wake uses Long |
| attributeSelections(selected) | options, selectedOptions | Wake has matrix, selections |

**Rule**: Target native Wake schema first. If reference uses Shopify-like layer, map to native (productId, productVariantId) for Storefront API calls.

### attributeSelections

Reference uses `attributeSelections(selected: $selections)` with `AttributeFilterInput`. Pass `{ attributeId, value }` per attribute. Resolves `selectedVariant`. See wake-product-variants skill for detail.

### SingleProductData Fragment

Reference Queries often use `SingleProductData` or similar fragment. Contains: attributeSelections, matrix, selectedVariant, prices, images, customizations, subscriptionGroups. Extract fragment from reference and adapt for headless.

### addToCartFromSpot

Wake-specific boolean on product. When true, product supports direct add-to-cart. Use with productVariantId and selections. Not in Shopify schema.

### partnerAccessToken

When querying in partner/wholesale context, pass `partnerAccessToken` to product, search, hotsite. Reference may omit; add for headless when needed.

## Reference Structure

| Path | Purpose |
|------|---------|
| Queries/*.graphql | Native Wake queries (product, search, hotsite, common, home) |
| SnippetQueries/*.graphql | Checkout, wishlist, shipping, etc. |
| Snippets/ | UI snippets (HTML) |
| src/graphql/ | May use Shopify-like schema; different layer |

See [references/storefront-queries-index.md](references/storefront-queries-index.md) for Queries/*.graphql to use case mapping.

## Migration Workflow

1. Read reference Queries/*.graphql or SnippetQueries/*.graphql
2. Extract root field, args, fragment
3. Map to headless: productId not handle; attributeSelections not options
4. Generate equivalent headless query/mutation
5. Map reference fields to target framework (React, etc.)

## References

- [Storefront Queries Index](references/storefront-queries-index.md)
- Wake Commerce docs: wakecommerce.readme.io
