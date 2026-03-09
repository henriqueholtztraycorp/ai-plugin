# Product Query Patterns

**Forbidden:** api.fbits.net (and any *.fbits.net). **Canonical source:** https://wakecommerce.readme.io/docs/schema

## Product Detail

```graphql
query ProductPage($productId: Long!, $selections: [AttributeFilterInput], $partnerAccessToken: String) {
  product(productId: $productId, partnerAccessToken: $partnerAccessToken) {
    ...SingleProductData
    id
    sku
    ean
    averageRating
    productBrand { name logoUrl fullUrlLogo }
    informations { id title type value }
    reviews { customer email rating review reviewDate }
    promotions { content id stamp fullStampUrl title disclosureType }
    breadcrumbs { link text }
    seo { content name type httpEquiv scheme }
    addToCartFromSpot
    subscriptionGroups { recurringTypes { name days recurringTypeId } subscriptionGroupId subscriptionOnly }
  }
  productRecommendations(productId: $productId, partnerAccessToken: $partnerAccessToken) {
    alias productName productId available
    similarProducts { alias image name imageUrl(w: 50, h: 50) }
    images { url }
    prices { listPrice price discountPercentage installmentPlans { ... } bestInstallment { ... } }
    promotions { content id stamp title disclosureType }
    addToCartFromSpot
  }
}

fragment SingleProductData on SingleProduct {
  attributeSelections(selected: $selections) {
    canBeMatrix
    matrix { row { name displayType values { value printUrl } } column { ... } data { productVariantId available stock } }
    selectedVariant {
      id alias available images { fileName url }
      prices { listPrice price discountPercentage installmentPlans { ... } bestInstallment { ... } wholesalePrices { price quantity } }
      productId productVariantId stock
    }
    selections { attributeId displayType name varyByParent values { alias available printUrl selected value } }
  }
  alias productId productName productVariantId stock available parallelOptions
  images { url fileName print }
  prices { listPrice price discountPercentage installmentPlans { ... } bestInstallment { ... } wholesalePrices { price quantity } }
  productCategories { name }
  customizations { customizationId cost name type values }
}
```

## Key Fields

| Field | Type | Notes |
|-------|------|-------|
| `productId`, `productVariantId` | Long | Required for add-to-cart |
| `attributeSelections(selected: $selections)` | - | Pass user selections for variant resolution |
| `selectedVariant` | - | Resolved variant when selections match |
| `prices.listPrice`, `prices.price` | Decimal | List and sale price |
| `prices.discountPercentage` | Decimal | Discount % |
| `prices.bestInstallment` | - | Installment plan display |
| `prices.wholesalePrices` | - | Partner/wholesale pricing |
| `addToCartFromSpot` | Boolean | Whether direct add-to-cart is supported |
| `available`, `stock` | - | Availability |

## Add-to-Cart from Spot

Use `addToCartFromSpot` to check if product supports direct add-to-cart. When true, use `product` + `attributeSelections(selected: $selections)` to resolve variant before adding.
