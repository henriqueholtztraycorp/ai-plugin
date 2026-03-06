# Customizations and Subscriptions

## customizations

Products may have customizations (e.g. engraving, gift message):

```graphql
customizations {
  customizationId
  cost
  name
  type
  values
}
```

- **customizationId**: Required when adding customized product to cart.
- **cost**: Additional cost for the customization.
- **values**: Allowed values (e.g. text input, dropdown options).

When adding to cart, include customization data in the mutation input. Format depends on checkoutAddProduct or createCheckout API. Check Wake docs for exact structure.

## subscriptionGroups

For subscription products:

```graphql
subscriptionGroups {
  recurringTypes {
    name
    days
    recurringTypeId
  }
  subscriptionGroupId
  subscriptionOnly
}
```

- **subscriptionGroupId**: Pass when adding subscription to cart.
- **recurringTypeId**: Selected recurring option (e.g. monthly, weekly).
- **subscriptionOnly**: Whether product is subscription-only.

When adding subscription to cart, pass `subscriptionGroupId` and `recurringTypeId` in the mutation input.

## Add-to-Cart with Customizations/Subscriptions

- **Customization**: Collect customization values from user; include in add-to-cart payload.
- **Subscription**: User selects recurring type; include subscriptionGroupId and recurringTypeId.
- Both can apply to the same product (e.g. customized subscription).
