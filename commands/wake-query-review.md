---
name: wake-query-review
description: GraphQL query design review for Wake Commerce. Schema alignment, fragments, batching. Use graphql-architect agent.
---

# Wake Query Review Workflow

Review GraphQL query and mutation design.

## Steps

1. **Fragment usage**: SingleProductData, checkoutFields; composition and reuse.
2. **Field selection**: Only needed fields; @include(if:) for conditional data.
3. **Batching**: Combine related queries; avoid N+1.
4. **Schema alignment**: productId, productVariantId, attributeSelections (Wake native).
5. **Agent**: Use graphql-architect agent for detailed design review.

## Output

Query review report with recommendations for optimization and schema alignment.
