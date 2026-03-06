# Checkout and Cart Patterns

## Checkout Query

```graphql
query Checkout($checkoutId: String!, $hasCheckout: Boolean!) {
  shop {
    checkoutUrl
  }
  checkout(checkoutId: $checkoutId) @include(if: $hasCheckout) {
    checkoutId
    url
    products {
      listPrice
      price
      ajustedPrice
      productId
      productVariantId
      imageUrl
      quantity
      name
      productAttributes { name type value }
      customization { id values { cost name value } }
    }
    shippingFee
    subtotal
    total
  }
}
```

## Key Fields

| Field | Notes |
|-------|-------|
| `shop.checkoutUrl` | Base checkout URL |
| `checkout.checkoutId` | Session identifier |
| `checkout.products` | Line items with price, quantity, customization |
| `shippingFee`, `subtotal`, `total` | Totals |

## Conditional Checkout

Use `@include(if: $hasCheckout)` so the checkout block is omitted when cart is empty. Pass `hasCheckout: false` when no checkout exists to avoid errors.

## Mini Cart

Mini cart typically reuses the same `checkout(checkoutId)` query with a reduced field set (e.g. product count, subtotal). The `checkoutId` is obtained from session/cookie.

## Add to Cart

Add-to-cart is typically a mutation or redirect to checkout. Use `product.addToCartFromSpot` when the product supports direct add. Pass `productId`, `productVariantId`, and `selections` (attribute values) as needed.
