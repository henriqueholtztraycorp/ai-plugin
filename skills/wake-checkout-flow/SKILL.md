---
name: wake-checkout-flow
description: "Wake Commerce checkout mutation sequence. Use when implementing or debugging checkout, shipping, payment, or order completion. Triggers on: checkout flow, createCheckout, checkoutComplete, shipping selection, payment selection, Wake checkout."
---

# Wake Checkout Flow

Full checkout mutation sequence for Wake Commerce headless storefronts. Covers createCheckout through checkoutComplete per [processo-de-fechamento-de-pedido](https://wakecommerce.readme.io/docs/processo-de-fechamento-de-pedido).

## When to Use

- Implementing checkout flow from cart to order
- Debugging shipping or payment selection
- Understanding mutation order and dependencies
- Adding pickup store or delivery schedule

## Ordered Sequence

Execute in this order. Do not skip steps; each depends on the previous.

| Step | Operation | Type | Purpose |
|------|-----------|------|---------|
| 1 | `createCheckout(products)` | Mutation | Create cart; returns checkoutId |
| 2 | `checkoutCustomerAssociate` | Mutation | (Optional) Associate logged-in customer |
| 3 | `checkoutAddressAssociate` | Mutation | Set delivery address |
| 4 | `shippingQuotes(checkoutId)` | Query | Get available shipping options |
| 5 | `checkoutSelectShippingQuote` | Mutation | Select shipping (or pickup, schedule) |
| 6 | `checkoutAddCoupon` | Mutation | (Optional) Apply discount coupon |
| 7 | `paymentMethods(checkoutId)` | Query | Get available payment methods |
| 8 | `checkoutSelectPaymentMethod` | Mutation | Select payment + installment |
| 9 | `checkoutComplete` | Mutation | Finalize order |

## Step Details

### 1. createCheckout

```graphql
mutation($products: [CheckoutProductItemInput]) {
  createCheckout(products: $products) {
    checkoutId
    products { productVariantId quantity }
  }
}
```

Input: `products: [{ productVariantId, quantity }]`. Returns `checkoutId` (Uuid). Use this for all subsequent calls.

### 2. checkoutCustomerAssociate (Optional)

Required only when customer is logged in. Pass `customerAccessToken` from login. Omit for guest checkout.

### 3. checkoutAddressAssociate

Requires `addressId` from customer addresses. Use `customerAddressCreate` if address is new. Pass `checkoutId`, `addressId`, `customerAccessToken` (if logged in).

### 4. shippingQuotes

Query with `checkoutId` and `useSelectedAddress: true`. Returns list of `shippingQuoteId`, `name`, `type`, `value`, `deadline`. See [references/shipping.md](references/shipping.md).

### 5. checkoutSelectShippingQuote

Pass `checkoutId`, `shippingQuoteId`. For pickup store, add `additionalInformation: { document, name }`. For delivery schedule, response includes `deliverySchedule`. See [references/pickup-store.md](references/pickup-store.md), [references/delivery-schedule.md](references/delivery-schedule.md).

### 6. checkoutAddCoupon (Optional)

Pass `checkoutId`, `coupon`, `customerAccessToken` (if logged in). Fails for invalid or expired coupons—handle errors and inform user.

### 7. paymentMethods

Query with `checkoutId`. Returns `id`, `name`, `imageUrl`. See [references/payment.md](references/payment.md).

### 8. checkoutSelectPaymentMethod

Pass `checkoutId`, `paymentMethodId`. Response includes `installments`; select installment if applicable.

### 9. checkoutComplete

Pass `checkoutId`, `paymentData` (method-specific, e.g. CPF/phone for boleto), `comments` (optional), `customerAccessToken` (if logged in). Returns `orders` with `orderId`, `orderStatus`, `payment` (invoice, pix, etc.).

## Error Handling

- **No checkoutId**: Create checkout first via `createCheckout`.
- **Guest checkout**: Skip `checkoutCustomerAssociate`; omit `customerAccessToken` where optional.
- **Invalid coupon**: `checkoutAddCoupon` fails; surface user-friendly message; do not retry silently.
- **Missing address**: Call `checkoutAddressAssociate` before `shippingQuotes` (useSelectedAddress requires address).

## References

- [Shipping: shippingQuotes, checkoutSelectShippingQuote](references/shipping.md)
- [Payment: paymentMethods, checkoutSelectPaymentMethod](references/payment.md)
- [Pickup store: additionalInformation](references/pickup-store.md)
- [Delivery schedule: agendamento](references/delivery-schedule.md)
- Wake Commerce: [processo-de-fechamento-de-pedido](https://wakecommerce.readme.io/docs/processo-de-fechamento-de-pedido)
