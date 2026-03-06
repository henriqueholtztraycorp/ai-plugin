# Customer API Patterns

## Authentication

Customer operations require `customerAccessToken`. Obtain via login flow; store securely and pass in subsequent requests.

## Wishlist

```graphql
query Wishlist($customerAccessToken: String!, $productsIds: [Long]) {
  customer(customerAccessToken: $customerAccessToken) {
    wishlist(productsIds: $productsIds) {
      products {
        id productId productName productVariantId alias
        images { url print fileName }
        available
        prices { listPrice price installmentPlans { ... } bestInstallment { ... } }
        promotions { content id stamp fullStampUrl title disclosureType }
        addToCartFromSpot
      }
    }
  }
}
```

## Key Fields

| Field | Notes |
|-------|-------|
| `customerAccessToken` | Required; from login |
| `wishlist(productsIds)` | Get wishlist; optionally filter by product IDs |
| `products` | Same shape as search/product items |

## Other Customer Operations

The Storefront API may expose additional customer fields (profile, addresses, orders). Consult Wake Commerce docs for the full schema. Always pass `customerAccessToken` for authenticated customer queries.
