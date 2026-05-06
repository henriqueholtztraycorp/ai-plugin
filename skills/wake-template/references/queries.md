# Queries

## Link

- Wake docs — Queries: [https://wakecommerce.readme.io/docs/queries](https://wakecommerce.readme.io/docs/queries)
- Explains the role of `Queries/` — GraphQL documents consumed by the Storefront runtime at page render or snippet render time — and the `Queries/SnippetQueries/` subfolder for SDK-driven fragments.

## Contract summary

Folder layout:

- `Queries/*.graphql` — root queries for Pages. Bound through `Configs/pages.json` (`query: "<name>.graphql"`). Subfolder nesting is allowed and must match the `query` path used in `pages.json` (e.g., `Queries/checkout/checkout.graphql`, bound as `"query": "checkout/checkout.graphql"`).
- `Queries/SnippetQueries/*.graphql` — queries paired with Snippets (see [`snippets.md`](snippets.md)). Resolved at SDK render time, not in `pages.json`.

Runtime contract:

- Each `.graphql` file contains **one** top-level operation (a `query` or `mutation`). Fragments may be defined inline.
- The operation's variables are resolved by Wake's runtime from the page context. Known binding sources:
  - Page-type defaults (e.g., `productId` on a `product` page, `searchTerm` on a `search` page, `hotsiteUrl` on a `hotsite` page).
  - `queryStrings` declared on the page's route entry (routed pages only — see [`pages.md`](pages.md)).
  - Partner or customer access tokens when the page's auth level requires them.
- The resolved query is executed against the Storefront GraphQL endpoint using the `access_token` from `Configs/settings.json`. The response's root object is injected as `data.*` into the corresponding Page or Snippet HTML.
- Query **shape** (types, fields, fragments, pagination primitives) is owned by the Wake Storefront API — this skill covers only the **binding** between a query file and its consumer. For schema discovery, refer to the Wake docs portal and the GraphQL introspection on the Storefront endpoint.

Fragment reuse:

- Shared fragments (e.g., `SingleProductData`, `Prices`, `Image`) live adjacent to the queries that use them, or inside a common file at the queries root such as `Queries/common.graphql`.
- Snippets usually inline small fragments; Pages usually reuse fragments from `common.graphql`.

## Example pointer

- Typical page queries — `Queries/product.graphql`, `Queries/search.graphql`, `Queries/home.graphql`, `Queries/checkout/checkout.graphql` (one per `pages.json` entry that needs data).
- Typical SnippetQueries — `Queries/SnippetQueries/` holds one `.graphql` per Snippet (e.g., `shipping_quotes.graphql`, `mini_cart.graphql`, `wishlist.graphql`).
- Common fragments — convention is a single `Queries/common.graphql` that page-level queries import from.
