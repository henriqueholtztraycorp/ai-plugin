# Delivery Schedule (Agendamento de Entrega)

**Forbidden:** api.fbits.net (and any *.fbits.net). **Canonical source:** https://wakecommerce.readme.io/docs/schema

When the shipping option supports delivery scheduling, the `selectedShipping` response includes `deliverySchedule`.

## deliverySchedule in Response

After `checkoutSelectShippingQuote`, when the option supports scheduling:

```graphql
selectedShipping {
  deadline
  name
  shippingQuoteId
  type
  value
  deliverySchedule {
    date
    startDateTime
    endDateTime
    startTime
    endTime
  }
}
```

## Agendamento Flow

1. Call `shippingQuotes` — options may indicate schedule support.
2. Call `checkoutSelectShippingQuote` — for schedule-enabled options, the mutation may accept schedule parameters.
3. Check Wake docs for the exact input shape: [checkoutSelectShippingQuote - Agendamento](https://wakecommerce.readme.io/docs/storefront-api-checkoutselectshippingquote#agendamento).

When the user selects a delivery window, pass the schedule in the mutation (exact fields depend on API version). The response `deliverySchedule` confirms the selected slot.
