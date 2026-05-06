# Design Studio (Wake CMS)

## Links

- Wake docs — Design Studio overview: [https://wakecommerce.readme.io/docs/design-studio-vis%C3%A3o-geral](https://wakecommerce.readme.io/docs/design-studio-vis%C3%A3o-geral)
- Wake docs — Blocks contract: [https://wakecommerce.readme.io/docs/blocks](https://wakecommerce.readme.io/docs/blocks)
- Wake docs — `pages.json` Design Studio CMS section: [https://wakecommerce.readme.io/docs/pagesjson#desing-studio-cms](https://wakecommerce.readme.io/docs/pagesjson#desing-studio-cms)

## What it is

Design Studio is the visual CMS embedded in Wake Admin (Storefront 2.0) that lets merchants compose hotsite pages from drag-and-drop **blocks** without touching code. The agency owns the schema and the HTML; the merchant owns what goes inside it.

Current MVP scope: **hotsite pages only**, primarily the homepage (`urlMatch: ""`). Other page types (`product`, `search`, `buy_list`, etc.) do not yet support Design Studio composition.

Merchant capabilities:

- **Drafts and preview** — save WIP, render a live preview before publishing.
- **Campaign scheduling** — start/end dates per layout. When a campaign expires, the runtime falls back to the next scheduled layout (or to the template fallback if none is scheduled).
- **Version history / rollback** — every publish is auditable and revertible.

## How a template enables Design Studio

Three pieces wire together. All three must be in place for the CMS to work for a given page.

### 1. Authorize block types — `Configs/pages.json`

On a hotsite page entry (or a `customs[]` override), declare which block `type`s the CMS may use. Anything not listed is rejected at save time.

```json
{
  "type": "hotsite",
  "path": "hotsite.html",
  "query": "home.graphql",
  "customs": [
    {
      "urlMatch": "",
      "content_for_page": [
        { "type": "banner_button" },
        { "type": "product_carousel" }
      ]
    }
  ]
}
```

`content_for_page` is the only place the template grants the merchant permission to use a block — the Design Studio block picker reads this list.

### 2. Define each block — `Blocks/<type>.html` + `Blocks/<type>.schema.json`

See [`blocks.md`](blocks.md) for the full block contract. Each `type` listed in `content_for_page` requires both files; either alone is non-functional.

### 3. Render the merchant's composition — `Pages/<page>.html`

The page body decides where merchant blocks land using two runtime helpers:

| Helper | Returns | Purpose |
|---|---|---|
| `wake_has_content_for_page` | boolean | True when the merchant has published a layout for this URL. |
| `wake_content_for_page` | rendered HTML | Iterates the merchant's saved blocks and renders each `Blocks/<type>.html` in order, passing per-block field values as `block_data.*`. |

Recommended pattern — keep a static fallback so the page still works before Design Studio is configured or while a campaign rotates:

```scriban
{{ if wake_has_content_for_page }}
  {{ wake_content_for_page }}
{{ else }}
  {{## legacy hard-coded sections — hero, featured shelf, etc. ##}}
  {{ banner_button title: "Welcome" url: "/sale" }}
{{ end }}
```

The fallback path also covers the migration window where merchants are onboarding to the CMS but no layout is published yet.

## Naming and schema invariants

The CMS is unforgiving about name alignment. A mismatch silently produces empty blocks or rejected saves.

- The `type` value in `pages.json` `content_for_page[]` must equal the block filenames' base (`banner_button` ⇄ `Blocks/banner_button.html` and `Blocks/banner_button.schema.json`).
- The `type` value **inside** `Blocks/<type>.schema.json` must equal that same string.
- Each `settings[].name` in the schema is exactly the key the HTML reads as `block_data.<name>`. Rename in lockstep.

## Data sources inside a block

A block runs inside the hotsite page's render pass, so it has access to:

- `block_data.*` — the merchant-entered field values (the only CMS-specific surface).
- The page's resolved `data.*` from the hotsite Query.
- Any registered Component (`{{ product_price ... }}`), Snippet via the SDK, and `settings.*` value.

This means blocks are not isolated widgets — they are first-class fragments of the hotsite render.

## Deciding where new content belongs

| Scenario | Use |
|---|---|
| Merchant must edit copy/images/colors without a deploy. | Design Studio block. |
| Section is part of every storefront and never edited by the merchant. | Static markup or Component in `Pages/hotsite.html`. |
| Section is reused across multiple pages and merchant-edited. | Block + repeat the `type` in each page's `content_for_page[]`. |
| Section needs client-side data fetching. | Snippet (see [`snippets.md`](snippets.md)) — possibly invoked from inside a block's HTML. |

## Common pitfalls

- Forgetting to list a new block `type` in `content_for_page[]` — the schema and HTML exist, but Design Studio refuses to expose it.
- Adding a `customs[]` entry with `content_for_page` but no `urlMatch: ""` for the homepage — the homepage gets no CMS unless its custom matches.
- Removing a field from `schema.json` while old layouts still reference it — published blocks read `block_data.<gone>` as null. Keep the field with `required: false` for one publishing cycle, or migrate the data first.
- Reaching for Design Studio on non-hotsite pages — not supported in the MVP. Use Components or Snippets instead.
