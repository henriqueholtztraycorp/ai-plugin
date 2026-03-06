---
name: wake-migrate-storefront-query
description: Port Wake Storefront reference Queries/*.graphql to headless. Extract root field, args, fragment; generate equivalent headless query; map to target framework.
---

# Wake Migrate Storefront Query Workflow

Port reference GraphQL to headless Storefront API.

## Steps

1. **Read reference**: Load Queries/*.graphql or SnippetQueries/*.graphql from Wake Storefront reference.
2. **Extract**: Identify root field (product, search, hotsite, checkout, etc.), args, and fragment.
3. **Map to native**: Use productId not handle; attributeSelections not options; addToCartFromSpot when applicable.
4. **Generate**: Create equivalent headless query or mutation.
5. **Map to framework**: Adapt field structure for React, Vue, or target framework.
6. **References**: Consult `skills/wake-storefront-reference-patterns/SKILL.md`, `references/storefront-queries-index.md`.

## Output

Headless query/mutation and framework integration code.
