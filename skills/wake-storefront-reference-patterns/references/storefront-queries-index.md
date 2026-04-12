# Storefront Queries Index

**Forbidden:** api.fbits.net (and any *.fbits.net). **Canonical source:** https://wakecommerce.readme.io/docs/schema

Mapping of Wake Storefront reference Queries/*.graphql to use cases and headless equivalents.

## Queries

| Reference File | Root Field | Use Case | Headless Equivalent |
|----------------|------------|----------|---------------------|
| product.graphql | product(productId, partnerAccessToken) | Product detail | Same; use attributeSelections(selected) for variants |
| search.graphql | search(query, partnerAccessToken) | Search, filters | Same; productsByOffset for pagination |
| hotsite.graphql | hotsite(url, partnerAccessToken) | Landing pages | Same |
| common.graphql | shop, menuGroups, scripts, shopSettings | Store config | Same |
| home.graphql | search, hotsite, brands | Home page | Compose search + hotsite + brands |

## SnippetQueries

| Reference | Root Field / Mutation | Use Case |
|-----------|------------------------|----------|
| checkout | checkout(checkoutId) | Cart contents |
| wishlist | customer(customerAccessToken).wishlist | Wishlist |
| shipping_quotes | shippingQuotes(checkoutId) | Freight quote |
| checkout mutations | createCheckout, checkoutAddProduct, etc. | Checkout flow |

## Fragment Mapping

- **SingleProductData**: productId, productVariantId, attributeSelections, prices, images, customizations, subscriptionGroups
- **checkoutFields**: checkoutId, products, customer, selectedAddress, selectedShipping, selectedPaymentMethod, totals

## Schema Notes

- IDs: Long for productId, productVariantId; Uuid for checkoutId
- attributeSelections: AttributeFilterInput array
- partnerAccessToken: Optional for partner/wholesale
