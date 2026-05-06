# Pages

## Link

- Wake docs — Pages authoring: [https://wakecommerce.readme.io/docs/pages](https://wakecommerce.readme.io/docs/pages)
- Wake docs — `pages.json` contract: [https://wakecommerce.readme.io/docs/pagesjson](https://wakecommerce.readme.io/docs/pagesjson)
- Describes the eight page types Wake supports and the shape of each entry in `Configs/pages.json`.

## Contract summary

`Configs/pages.json` is an array of page entries. Two shapes coexist: **typed pages** (a single Page body keyed by `type`) and **routed pages** (`checkout`, `login`, `account`, `partner` — each a tree of named routes).

### Typed page entry

| Field | Type | Required | Purpose |
|---|---|---|---|
| `type` | string | yes | One of `search`, `hotsite`, `product`, `buy_list`, `not_found`. The runtime binds the page to the matching storefront route family. |
| `path` | string | yes | Path under `Pages/` for the default body (e.g., `product.html`). |
| `query` | string | optional | Path under `Queries/` for the GraphQL root query injected as `data.*`. Absent for pages that need no data (e.g., a static `not_found.html`). |
| `customs` | array of custom-override objects | optional | Per-URL / per-product overrides. See below. |

### `customs[]` override shape

Used on `hotsite` and `product` page types to swap the body / query for specific URLs, product IDs, categories, or subtypes — and to authorize Design Studio block types per page variant.

| Field | Type | Purpose |
|---|---|---|
| `urlMatch` | string (regex-style pipe list, supports `*` and `\|`) | Matches a hotsite URL fragment. Examples: `"listadedesejos"`, `"formulario\|quemsomos\|..."`, `"*vans*"`. Use `""` for the homepage. |
| `subtype` | string | Filter for hotsite variants — one of `category`, `brand`, `portfolio`, `buy_list`. |
| `productIds` | array of long | Matches specific product IDs (for `type: "product"` overrides). |
| `categoryIds` | array of long | Matches specific category IDs (for `type: "product"` overrides). |
| `path` | string | Alternate body path under `Pages/` (e.g., `custom/buy_box_hotsite.html`). |
| `query` | string | Alternate query path under `Queries/`. |
| `priority` | number | Tie-breaker when multiple customs match. Higher wins. |
| `content_for_page` | array of `{ type }` | Design Studio CMS — declares which `Blocks/<type>` files this page variant may use. See [`design-studio.md`](design-studio.md). |

### Routed page entry

Used only by page families with many sibling routes: `checkout`, `login`, `account`, `partner`.

| Field | Type | Required | Purpose |
|---|---|---|---|
| `type` | string | yes | One of `checkout`, `login`, `account`, `partner`. |
| `url` | string | yes | Base URL segment (e.g., `account`). |
| `routes` | array of route objects | yes | Named routes within the family. |

Each `routes[i]` object:

| Field | Type | Required | Purpose |
|---|---|---|---|
| `name` | string | yes | Internal name (stable handle). |
| `url` | string | yes | Sub-URL segment (`""` for the family's root). |
| `path` | string | yes | Page body under `Pages/<type>/`. |
| `query` | string | optional | Query under `Queries/<type>/`. |
| `authLevel` | `"Simple"` \| `"Authenticated"` \| `"New"` | optional | Minimum shopper auth required. |
| `authFallback` | string | optional | Redirect target when `authLevel` is not satisfied (e.g., `"login/authenticate"`). |
| `queryStrings` | array of `{ name, type }` | optional | Typed query-string bindings surfaced as `data.<name>` at render time. Types: `Long`, `Boolean`, `Uuid`, `String`. |

### Data flow

1. Runtime resolves the page (`type` → entry or `type` + `url` → route).
2. If the entry has `customs[]` or `routes[].queryStrings`, the runtime applies them in declared precedence.
3. The resolved `query` is executed and injected as `data.*` when the resolved `path` HTML is rendered.
4. The HTML composes Components registered in `components.json`.
5. For hotsite pages with `content_for_page[]`, the merchant's Design Studio composition is rendered wherever the HTML emits `wake_content_for_page`. See "Design Studio CMS" below.

### Design Studio CMS (hotsite only)

In the MVP, Design Studio composes content for **hotsite** pages, primarily the homepage (`urlMatch: ""`). To enable it on a hotsite variant:

1. Add `content_for_page` to that variant's `customs[]` entry, listing the allowed block `type`s.
2. Provide `Blocks/<type>.html` and `Blocks/<type>.schema.json` for each listed `type` (see [`blocks.md`](blocks.md)).
3. In the page body (`Pages/hotsite.html` or the override), render the merchant's composition with the runtime helpers:

   ```scriban
   {{ if wake_has_content_for_page }}
     {{ wake_content_for_page }}
   {{ else }}
     {{## fallback used before Design Studio is configured or between campaigns ##}}
   {{ end }}
   ```

| Helper | Returns | Purpose |
|---|---|---|
| `wake_has_content_for_page` | boolean | True when a published Design Studio layout exists for this URL. |
| `wake_content_for_page` | rendered HTML | Iterates the merchant's saved blocks and renders each `Blocks/<type>.html`, exposing field values as `block_data.*`. |

For the full CMS surface (drafts, scheduling, version history, fallback strategy), see [`design-studio.md`](design-studio.md).

## Example pointer

- A complete `Configs/pages.json` covers every typed page (`search`, `hotsite`, `product`, `buy_list`, `not_found`) plus the routed families (`checkout`, `login`, `account`, `partner`); customs commonly include product-ID overrides (`productIds: [...]`) and hotsite URL matches.
- Page bodies live under `Pages/` — typically `product.html`, `search.html`, `home.html`, `hotsite.html`, `not_found.html`, plus `Pages/checkout/*`, `Pages/account/*`, `Pages/login/*` for routed families.
- Minimal starting point — a single `hotsite` entry in `pages.json` (`{ "type": "hotsite", "path": "hotsite.html", "query": "home.graphql" }`) plus the matching `Pages/hotsite.html`.
