# Attribute Matrix

## attributeSelections(selected)

```graphql
attributeSelections(selected: $selections) {
  canBeMatrix
  matrix {
    row { name displayType values { value printUrl } }
    column { name displayType values { value printUrl } }
    data { productVariantId available stock }
  }
  selectedVariant {
    id
    productVariantId
    alias
    available
    stock
    images { fileName url }
    prices { listPrice price discountPercentage }
  }
  selections {
    attributeId
    displayType
    name
    varyByParent
    values { alias available printUrl selected value }
  }
}
```

## Variables

```json
{
  "selections": [
    { "attributeId": 1, "value": "Red" },
    { "attributeId": 2, "value": "M" }
  ]
}
```

## Matrix Usage

- **matrix.row** / **matrix.column**: Attribute dimensions (e.g. Color, Size).
- **matrix.data**: Maps row+column to productVariantId, available, stock.
- Use matrix to build variant picker: when user selects row+column, derive productVariantId from data.
- **canBeMatrix**: Indicates if product has matrix structure.

## selectedVariant

- Present when `selections` match exactly one variant.
- Null when selections are incomplete, invalid, or no match.
- Use `selectedVariant.productVariantId` for add-to-cart.
