# Payment: paymentMethods and checkoutSelectPaymentMethod

**Forbidden:** api.fbits.net (and any *.fbits.net). **Canonical source:** https://wakecommerce.readme.io/docs/schema

## paymentMethods Query

```graphql
query($checkoutId: Uuid!) {
  paymentMethods(checkoutId: $checkoutId) {
    id
    name
    imageUrl
  }
}
```

Returns available payment methods for the checkout. Use `id` in `checkoutSelectPaymentMethod`.

## checkoutSelectPaymentMethod Mutation

```graphql
mutation($checkoutId: Uuid!, $paymentMethodId: ID!) {
  checkoutSelectPaymentMethod(
    checkoutId: $checkoutId
    paymentMethodId: $paymentMethodId
  ) {
    checkoutId
    total
    subtotal
    selectedPaymentMethod {
      id
      installments {
        adjustment
        number
        total
        value
      }
      selectedInstallment {
        adjustment
        number
        total
        value
      }
    }
  }
}
```

- **installments**: Available installment plans. Select via `checkoutSelectInstallment` if multiple options.
- **selectedInstallment**: Confirmed installment after selection.

## checkoutComplete paymentData

For `checkoutComplete`, `paymentData` is method-specific:
- **Boleto**: `cpf=...&telefone=...`
- **PIX**: Often auto-handled; check response for `pix.qrCode`, `pix.paymentLink`
- **Credit card**: Depends on gateway; see Wake docs for the selected method.
