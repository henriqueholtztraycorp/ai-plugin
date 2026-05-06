# Snippets

## Link

- Wake docs — Snippets: [https://wakecommerce.readme.io/docs/snippets](https://wakecommerce.readme.io/docs/snippets)
- Explains that a Snippet is a fragment rendered **on demand** (not during page build) via the Storefront SDK or the Wake `/snippet` endpoint, and explains its pairing with a SnippetQuery under `Queries/SnippetQueries/`.

## Contract summary

Snippets are HTML files under `Snippets/`. They are **not** registered in `components.json`; they are addressed by filename at render time.

Pairing convention:

- Each Snippet that needs data is paired with a file of the same base name under `Queries/SnippetQueries/`.
- Example: `Snippets/product_shipping_quotes_snippet.html` ↔ `Queries/SnippetQueries/shipping_quotes.graphql` (the Snippet's render call resolves which SnippetQuery runs; base-name alignment is the standard pairing convention).
- The SnippetQuery's result lands in the Snippet as `data.*` when the render call runs.

Invocation — Storefront SDK (Scriban-side or JS-side):

```scriban-html
{{ snippet source: "product_shipping_quotes_snippet.html" variables: { cep: "01311-000", productVariantId: 12345 } }}
```

```javascript
// JS, via @wake-commerce/storefront-sdk
const html = await client.snippet.render("product_shipping_quotes_snippet.html", {
  cep: "01311-000",
  productVariantId: 12345
});
```

Author convention:

- Snippet filenames end in `_snippet.html` (e.g., `mini_cart_snippet.html`, `buy_list_product_snippet.html`).
- Every Snippet opens with a `{{ ## Description / Params / Usage ## }}` doc block.
- The SnippetQuery body contains one top-level GraphQL operation and references the fragments defined inline or in its sibling queries.
- Snippets can invoke Components (as long as the components are registered with `availableInAllPages: true` or `availableInAllComponents: true` so they resolve inside the render scope).

## Example pointer

- A populated `Snippets/` directory typically holds many `*_snippet.html` files for dynamic fragments — common ones include `mini_cart_snippet.html`, `wishlist_snippet.html`, `product_shipping_quotes_snippet.html`, `buy_list_product_snippet.html`.
- Pairings sit under `Queries/SnippetQueries/` — one `.graphql` per Snippet, sharing the base name (e.g., `mini_cart.graphql`, `shipping_quotes.graphql`, `wishlist.graphql`).
- SnippetQuery shape (types, fields, fragments) follows the Wake Storefront API contract; refer to the Wake docs portal for schema discovery.
- Scriban inside a Snippet — see [`wake-scriban`](../../wake-scriban/SKILL.md).
