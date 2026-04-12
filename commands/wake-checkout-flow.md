---
name: wake-checkout-flow
description: Implement full Wake Commerce checkout sequence. createCheckout → checkoutCustomerAssociate → checkoutAddressAssociate → shippingQuotes → checkoutSelectShippingQuote → checkoutAddCoupon → paymentMethods → checkoutSelectPaymentMethod → checkoutComplete.
---

# Wake Checkout Flow Workflow

**Forbidden:** api.fbits.net (and any *.fbits.net). **Canonical source:** https://wakecommerce.readme.io/docs/schema

Implement the full checkout mutation sequence for Wake Commerce.

## Steps

1. **createCheckout**: Create cart with products; obtain checkoutId.
2. **checkoutCustomerAssociate** (optional): Associate logged-in customer; omit for guest.
3. **checkoutAddressAssociate**: Set delivery address.
4. **shippingQuotes**: Query available shipping options with checkoutId, useSelectedAddress: true.
5. **checkoutSelectShippingQuote**: Select shipping; add additionalInformation for pickup store; handle deliverySchedule for agendamento.
6. **checkoutAddCoupon** (optional): Apply discount coupon.
7. **paymentMethods**: Query available payment methods.
8. **checkoutSelectPaymentMethod**: Select payment and installment.
9. **checkoutComplete**: Finalize order with paymentData, comments.
10. **References**: Consult `skills/wake-checkout-flow/SKILL.md` for detailed patterns.

## Output

Checkout flow implementation with correct mutation order and error handling.
