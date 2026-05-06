# Blocks

## Links

- Wake docs — Blocks contract: [https://wakecommerce.readme.io/docs/blocks](https://wakecommerce.readme.io/docs/blocks)
- Wake docs — `pages.json` Design Studio CMS section: [https://wakecommerce.readme.io/docs/pagesjson#desing-studio-cms](https://wakecommerce.readme.io/docs/pagesjson#desing-studio-cms)
- Wake docs — Design Studio overview: [https://wakecommerce.readme.io/docs/design-studio-vis%C3%A3o-geral](https://wakecommerce.readme.io/docs/design-studio-vis%C3%A3o-geral)

For the broader CMS workflow (merchant features, page-level helpers, when to choose a block over a Component), see [`design-studio.md`](design-studio.md).

## What a Block is

A Block is the unit Design Studio composes hotsite pages from. The merchant picks a Block, fills in its fields, and the runtime renders it inline at the spot where the page emits `wake_content_for_page`.

A Block is **not** a Component. Components are template-internal helpers invoked by the developer; Blocks are merchant-facing widgets configured through the CMS and discovered through `pages.json`.

## Contract — paired files

Each Block lives in `Blocks/` as two files sharing a base name:

| File | Purpose |
|---|---|
| `Blocks/<type>.html` | Scriban template that renders the Block. Reads merchant input via `block_data.<name>`. |
| `Blocks/<type>.schema.json` | Field schema that drives the Design Studio editor form. |

Both files are mandatory. The `<type>` base name is the block's stable identifier and must equal:

- the filenames (`banner_button.html` + `banner_button.schema.json`),
- the `type` value inside the schema JSON,
- and the `type` value declared in `pages.json` `content_for_page[]`.

A mismatch on any of these silently breaks discovery or rendering.

## `<type>.schema.json` shape

```json
{
  "name": "Banner with Button",
  "type": "banner_button",
  "settings": [
    { "label": "Title",            "name": "title",     "type": "text",         "required": true },
    { "label": "Subtitle",         "name": "subtitle",  "type": "text" },
    { "label": "Background image", "name": "image",     "type": "image_picker" },
    { "label": "Background color", "name": "bg_color",  "type": "color" },
    { "label": "CTA URL",          "name": "cta_url",   "type": "url" },
    { "label": "Show CTA",         "name": "show_cta",  "type": "checkbox" },
    { "label": "Variant",          "name": "variant",   "type": "select",
      "options": [
        { "label": "Light", "value": "light" },
        { "label": "Dark",  "value": "dark"  }
      ]
    }
  ]
}
```

| Property | Required | Purpose |
|---|---|---|
| `name` | recommended | Human-readable label shown in the Design Studio block picker. |
| `type` | yes | Stable identifier — must match filenames and `pages.json` `content_for_page[].type`. |
| `settings` | yes | Array of field definitions presented as the editor form. |

Each `settings[]` entry:

| Property | Required | Purpose |
|---|---|---|
| `label` | yes | Field label in the editor UI. |
| `name` | yes | Key the HTML reads as `block_data.<name>`. Stable identifier. |
| `type` | yes | Field input type — see field types below. |
| `required` | optional | Boolean. Validation runs at save time. |
| `options` | required for `select` | Array of `{ label, value }`. |

### Field types

| Type | Editor behavior | Stored as |
|---|---|---|
| `text` | Plain text input. | string |
| `number` | Numeric input. | number |
| `url` | URL-validated input. | string |
| `image_picker` | Image asset selector. | image reference (URL/object) |
| `color` | Color picker (hex/rgba). | string |
| `select` | Dropdown (requires `options`). | one of the `value`s |
| `checkbox` | Boolean toggle. | bool |

## `<type>.html` shape

The HTML is plain Scriban with one extra namespace — `block_data` — that holds the merchant's saved values. Every key in `block_data` corresponds to a `settings[].name` in the schema.

```html
{{~
  title    = block_data.title    ?? "Default title"
  bg_color = block_data.bg_color ?? "#ffffff"
  cta_url  = block_data.cta_url
  show_cta = block_data.show_cta
~}}

<section class="banner-button" style="background:{{ bg_color }}">
  <h2>{{ title }}</h2>
  {{ if block_data.subtitle }}
    <p>{{ block_data.subtitle }}</p>
  {{ end }}

  {{ if show_cta && cta_url }}
    <a href="{{ cta_url }}" class="btn">{{ block_data.variant == "dark" ? "Shop now" : "Discover" }}</a>
  {{ end }}
</section>
```

A Block can also call registered Components (`{{ product_price prices: product.prices }}`), pull from page-level `data.*`, and read `settings.*` — it is a normal Scriban fragment that happens to be parameterized by `block_data`.

## How Design Studio discovers a Block

1. Drop `<type>.html` and `<type>.schema.json` under `Blocks/`.
2. List the `type` in the relevant `pages.json` page entry's `content_for_page[]` (typically a hotsite `customs[]` with `urlMatch: ""`).
3. Design Studio reads `content_for_page[]`, looks up each `type` in `Blocks/`, validates the schema, and exposes the Block in the editor.

The folder itself is not auto-scanned; **`pages.json` is the gatekeeper** — a Block that exists on disk but is not authorized in `content_for_page[]` is invisible to the merchant.

## Authoring checklist

- [ ] Pick a `type` slug. Use it consistently across both filenames, the schema's `type`, and `pages.json`.
- [ ] Define `settings[]` with stable `name` keys. Treat them like field migrations — renaming a `name` orphans existing published data.
- [ ] Default every `block_data.<name>` read with `??` so the Block renders sanely in preview and before publish.
- [ ] List the `type` in every `pages.json` page entry that should expose it — listing is per-page, not global.
- [ ] Verify by publishing a draft in Design Studio and checking the rendered hotsite.

## See also

- [`design-studio.md`](design-studio.md) — CMS workflow, page helpers (`wake_has_content_for_page`, `wake_content_for_page`), fallback strategy.
- [`pages.md`](pages.md) — `content_for_page[]` placement and the rest of the `pages.json` contract.
- [`components.md`](components.md) — when to use a Component instead of a Block.
