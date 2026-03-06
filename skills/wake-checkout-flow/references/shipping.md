# Shipping: shippingQuotes and checkoutSelectShippingQuote

## shippingQuotes Query

```graphql
query($checkoutId: Uuid!) {
  shippingQuotes(checkoutId: $checkoutId, useSelectedAddress: true) {
    deadline
    name
    products { productVariantId value }
    shippingQuoteId
    type
    value
  }
}
```

- **useSelectedAddress: true** — Requires address set via `checkoutAddressAssociate` first.
- **Returns**: List of options with `shippingQuoteId` (Uuid), `name`, `type` (e.g. "Retirada", "Tabela"), `value`, `deadline`.

## checkoutSelectShippingQuote Mutation

```graphql
mutation(
  $checkoutId: Uuid!
  $shippingQuoteId: Uuid!
  $additionalInformation: InStorePickupAdditionalInformationInput
) {
  checkoutSelectShippingQuote(
    checkoutId: $checkoutId
    shippingQuoteId: $shippingQuoteId
    additionalInformation: $additionalInformation
  ) {
    checkoutId
    shippingFee
    total
    subtotal
    selectedShipping {
      deadline
      name
      shippingQuoteId
      type
      value
      deliverySchedule { date startTime endTime }
    }
  }
}
```

- **additionalInformation**: Required for pickup store (document, name). See [pickup-store.md](pickup-store.md).
- **deliverySchedule**: Present when delivery scheduling is selected. See [delivery-schedule.md](delivery-schedule.md).
