---
name: wake-search-page
description: Build a Wake Commerce search page. Call search(query, partnerAccessToken), use productsByOffset for pagination, apply filters and aggregations.
---

# Wake Search Page Workflow

Build a search page for Wake Commerce headless storefront.

## Steps

1. **Call search**: `search(query, partnerAccessToken)` with query from user input or URL.
2. **Pagination**: Use `productsByOffset` with limit, offset, sortKey, sortDirection.
3. **Filters**: Apply filters from aggregations; use filters arg in productsByOffset.
4. **Display**: Product list (productId, productName, alias, images, prices, promotions, addToCartFromSpot).
5. **Aggregations**: Show filters, priceRanges, minimumPrice, maximumPrice for faceted search.
6. **References**: Consult `skills/wake-storefront-api/SKILL.md` for search patterns.

## Output

Search page component or implementation with GraphQL query, pagination, and filter UI.
