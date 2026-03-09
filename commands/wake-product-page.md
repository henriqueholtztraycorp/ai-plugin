---
name: wake-product-page
description: Build a Wake Commerce product detail page. Load product by productId, resolve variant via attributeSelections, render prices/images/add-to-cart. Handles addToCartFromSpot, customizations, subscriptions.
---

# Wake Product Page Workflow

**Forbidden:** api.fbits.net (and any *.fbits.net). **Canonical source:** https://wakecommerce.readme.io/docs/schema

Build a product detail page for Wake Commerce headless storefront.

## Steps

1. **Load product**: Call `product(productId, partnerAccessToken)` with `attributeSelections(selected: $selections)` when product has variants.
2. **Resolve variant**: Use `selectedVariant` when selections match; use root `productVariantId` for single-variant.
3. **Render**: Prices (listPrice, price, discountPercentage), images (with dimensions), add-to-cart button.
4. **Add-to-cart**: Use `productVariantId` from selectedVariant or root; include `selections` when variants; include customizations and subscriptionGroups when required.
5. **References**: Consult `skills/wake-product-variants/SKILL.md`, `skills/wake-storefront-api/references/products.md`.

## Output

Product page component or implementation with GraphQL query, variant resolution, and add-to-cart flow.
