# Pickup Store (Retirada na Loja)

When the selected shipping is pickup ("Retirada"), `checkoutSelectShippingQuote` may require `additionalInformation`.

## InStorePickupAdditionalInformationInput

```graphql
additionalInformation: {
  document: "12345678900"   # CPF or document number
  name: "Customer Name"     # Name of person picking up
}
```

## Example

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
    selectedShipping {
      name
      type
      value
    }
  }
}
```

Variables:
```json
{
  "checkoutId": "ce8ac3c3-c8f9-4393-9a0a-ac80e2aee438",
  "shippingQuoteId": "503a4fb8-dfff-4d3f-952d-9b6f3403495d",
  "additionalInformation": {
    "document": "123456",
    "name": "Armando"
  }
}
```

Not all pickup options require `additionalInformation`; check store configuration. When required, omit it and the API will return an error—handle and prompt user.
