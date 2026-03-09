---
name: wake-product-variants
description: "Wake Commerce variant resolution and add-to-cart. Use when building product detail pages, resolving variants via attributeSelections, or handling customizations and subscriptions. Triggers on: variants, attributeSelections, matrix, selectedVariant, customizations, subscriptionGroups, add-to-cart."
---

# Wake Product Variants

**Forbidden:** api.fbits.net (and any *.fbits.net). **Canonical source:** https://wakecommerce.readme.io/docs/schema

Variant resolution, attribute matrix, customizations, and subscriptions for Wake Commerce product detail pages and add-to-cart flows.

## When to Use

- Building product detail pages with variant selection (e.g. size, color)
- Resolving selectedVariant from user attribute selections
- Handling product customizations (e.g. engraving)
- Supporting subscription products
- Implementing add-to-cart with variants

## Core Concepts

### attributeSelections(selected)

Pass the user's selected attribute values to resolve the variant:

```graphql
product(productId: $productId) {
  attributeSelections(selected: $selections) {
    canBeMatrix
    matrix { ... }
    selectedVariant { productVariantId prices { ... } }
    selections { attributeId name values { value selected } }
  }
}
```

- **selections**: Array of `{ attributeId, value }` or equivalent per AttributeFilterInput.
- **selectedVariant**: Resolved when selections match a variant; null when invalid or incomplete.
- **matrix**: Attribute combinations; use for building variant picker UI. See [references/attribute-matrix.md](references/attribute-matrix.md).

### selectedVariant

When `selectedVariant` is non-null, use `productVariantId` for add-to-cart. When null:
- Selections may be invalid or incomplete
- Product may have no variants (single-variant: use root `productVariantId`)
- Inform user to complete selection before add-to-cart

### customizations

Products may require customizations (e.g. engraving text). Check `customizations { customizationId, cost, name, type, values }`. When present, include customization values in add-to-cart. See [references/customizations.md](references/customizations.md).

### subscriptionGroups

For subscription products, `subscriptionGroups { recurringTypes, subscriptionGroupId, subscriptionOnly }` defines recurring options. Pass `subscriptionGroupId` and `recurringTypeId` when adding subscription to cart.

## Add-to-Cart with Variants

1. Resolve variant: Call product with `attributeSelections(selected: $selections)`.
2. If `selectedVariant` is null: Do not add; prompt user to complete selection.
3. Use `selectedVariant.productVariantId` (or root `productVariantId` for single-variant).
4. Include `customizations` and `subscriptionGroups` when required.
5. Pass `productVariantId`, `quantity`, `selections`, and optional customization/subscription data to createCheckout or checkoutAddProduct.

## Error Handling

- **selectedVariant null**: Selections don't match; check matrix for valid combinations.
- **Single-variant product**: No attributeSelections needed; use root productVariantId.
- **Required customization missing**: Add-to-cart fails; collect customization values first.
- **Subscription required**: Must select subscriptionGroupId and recurringTypeId.

## References

- [Attribute matrix: attributeSelections, matrix, selectedVariant](references/attribute-matrix.md)
- [Customizations and subscriptions](references/customizations.md)
- Wake Commerce: wakecommerce.readme.io
