---
name: wake-scriban
description: Scriban templating language as used inside Wake Storefront SSR `.html` files. Use whenever the user writes, edits, debugs, or explains Scriban code — `{{ ... }}` blocks, `{{~ ~}}` whitespace control, `{{## ## }}` doc-comments, `for`/`if`/`capture`/`func`, pipes (`|`), built-ins (`math.format`, `string.*`, `array.*`, `html.url_encode`, `group.by`), Wake component invocations (`{{ product_price prices: ... }}`), `wake_*` helpers, `data_layer_*`, `page_scripts`, `asset` — anywhere Scriban appears in a Wake `.html` template, even when "Scriban" is not named explicitly. For folder anatomy / Configs / Pages↔Queries wiring use the sibling `wake-template` skill instead.
---

# Wake Scriban

Scriban dialect and conventions used inside Wake Storefront SSR `.html` templates. This skill is **language-focused**: syntax, expressions, built-ins, whitespace control, Wake-flavored idioms.

For project anatomy (folders, `Configs/*.json` contracts, Pages↔Queries wiring, Snippets/SnippetQueries pairing), use the sibling **[`wake-template`](../wake-template/SKILL.md)** skill.

When you need depth this file doesn't cover, read the bundled docs in `references/`:

- `references/language.md` — full Scriban language reference (syntax, statements, expressions). Read for: advanced control flow, `wrap`, `with`, `import`, parametric functions, escape blocks beyond `{%{ }%}`.
- `references/builtins.md` — every built-in function (`array.*`, `string.*`, `math.*`, `date.*`, `html.*`, `object.*`, `regex.*`, `timespan.*`). Read when picking the right helper or checking signatures.
- `references/liquid-support.md` — Scriban's Liquid compatibility layer. Read only if migrating from Liquid or seeing `{% ... %}` style tags.
- `references/runtime.md` — .NET host API. Mostly irrelevant for template authors; read only when integrating Scriban into a custom .NET app.

External: [Wake Scriban docs](https://wakecommerce.readme.io/docs/scriban), [Wake general docs](https://wakecommerce.readme.io/docs), [Scriban upstream](https://github.com/scriban/scriban/tree/master/doc).

## Scriban Quick Reference (Wake-flavored)

Wake uses Scriban (not Liquid). The two share a lot of surface but Scriban is more expressive — prefer Scriban syntax in new code.

### Code blocks

```scriban-html
{{ expression }}                  output the expression
{{ x = 5 }}                       assignment, no output
{{ if cond }}...{{ end }}         control flow
{{~ ... ~}}                       greedy whitespace trim (left/right)
{{- ... -}}                       same as ~ for both sides
{{## doc-comment ##}}             multi-line comment (Wake header pattern, see below)
# inline comment                  to end of line, inside a code block
```

### Wake header-comment convention

Every component and snippet starts with a doc-comment describing what it does. **Match this style for any new component you add** — the team relies on it:

```scriban-html
{{ ##
    Description: Short one-liner.
    Params:
        - param_name: what it is
        - other: [optional] what it is, defaults...
    Usage:
        component_name param_name: value other: value
## }}
```

### Component invocation

Components are called like functions with named args — **no commas, no parens, no quotes around arg names**. (The component must be registered in `Configs/components.json` to be invokable; see the [`wake-template`](../wake-template/SKILL.md) skill for that side.)

```scriban-html
{{ product_price prices: product.prices displayed_installment: "Boleto Yapay" }}
{{ asset type: "css" paths: ["navbar", "footer", "product"] }}
{{ banners_carousel id: "banners_top" banners: data.hotsite.banners position: "Topo" }}
```

### Variables and property access

```scriban-html
{{ product.product_name }}            dot access
{{ products[0].title }}               index access
{{ aggregations?.filters }}           safe navigation — short-circuits if aggregations is null
{{ user.name ?? "anonymous" }}        null-coalescing
{{ this["my-handle"] }}               bracket access for non-identifier keys
```

### Control flow

```scriban-html
{{ if user.active && user.balance > 0 }}
    {{ user.name }}
{{ else if user.active }}
    Active, no balance.
{{ else }}
    Inactive.
{{ end }}

{{ for item in collection }}
    {{ item.title }} ({{ for.index }}/{{ for.length }})
{{ end }}

{{ for p in products | array.limit 4 }}    pipe straight into for
    ...
{{ end }}

{{ case status }}
    {{ when "open" }}Open
    {{ when "closed", "archived" }}Closed
    {{ else }}Unknown
{{ end }}
```

Truthy/falsy in Scriban: `null`, `false`, and the empty string `""` are falsy. **Empty arrays and `0` are truthy** — check explicitly with `array.size` or `> 0` when that matters.

### Pipes and built-ins

Pipes feed the left value as the first arg of the right call. Wake code uses them heavily:

```scriban-html
{{ prices.price | math.format "c" "pt-BR" }}              R$ 1.234,56
{{ filter.field | html.url_encode }}                      url-safe key
{{ "Hello" | string.upcase | string.append "!" }}         chained
{{ products | array.filter @is_available | array.size }}  filter then count
```

Common Wake usages:
- `math.format "c" "pt-BR"` — currency formatting (Brazilian Real)
- `html.url_encode`, `html.escape`, `html.strip`
- `string.downcase`, `string.upcase`, `string.append`, `string.contains`
- `array.filter`, `array.map`, `array.limit`, `array.size`, `array.first`, `array.add_range`, `array.sort`
- `group.by`, `group.get` (custom helpers seen in components)
- `date.to_string`, `date.parse`, `date.now`

For full list and signatures: `references/builtins.md`.

### Capture, function, anon function

```scriban-html
{{~ capture favicon_source ~}}
    {{- store.urls.static_img}}{{settings.favicon_path}}?v={{store.last_modified}}
{{~ end ~}}
<link rel="icon" href="{{ favicon_source }}">

{{~ func is_meta(x)
        ret (x.type | string.downcase) == "meta"
    end
~}}
{{ for item in seo | array.filter @is_meta }}...{{ end }}

{{~ promotions_grouped = product.promotions | group.by @(do; ret $0.disclosure_type; end) ~}}
```

`@function_name` passes a function as a value. `@(do; ...; end)` is an inline anonymous function whose args are `$0`, `$1`, ...

### Whitespace control

Templates emit literal whitespace between blocks. Use `~` aggressively to keep HTML output clean:

```scriban-html
{{~ if x ~}}<span>X</span>{{~ end ~}}
```

vs. without `~`:

```scriban-html
{{ if x }}
    <span>X</span>
{{ end }}
```

The second form leaves blank lines in the rendered HTML. Use `~` whenever the surrounding code block isn't supposed to produce its own whitespace.

## Wake Ambient Context

These variables are pre-populated by the Wake runtime in any Page or Component template:

| Var | What it contains |
|-----|------------------|
| `store` | Store metadata: `store.urls.current`, `store.urls.static_img`, `store.theme`, `store.last_modified`, store name, locale, etc. |
| `data` | Result of the GraphQL query bound to the current route in `pages.json`. Shape depends on the query — e.g. `data.hotsite.banners`, `data.product.images`, `data.calculate_prices`. |
| `settings` | Whatever you put in `Configs/settings.json` (e.g. `settings.favicon_path`, `settings.page_size.default`, `settings.filter.price_type`). |
| `common` | Common cross-page data (menus, scripts, etc.) — `common.menu_groups`, `common.scripts`. |
| `is_preview` | Boolean — true in preview mode. Use for conditional preview-only UI. |

In **Snippets**, the renderer-supplied query result lands in `data` (e.g. `data.calculate_prices` for `price_snippet.html`). Snippets are invoked from JS:

```javascript
await client.snippet.render("price_snippet.html", { /* query vars */ });
```

## Wake Built-in Tags / Components

These are provided by the Wake runtime — you don't need to register them in `components.json`. Common ones:

- `{{ wake_recaptcha_script }}`, `{{ wake_meta_pixel_script }}`, `{{ wake_meta_pixel_content product: ... variant_id: ... }}`
- `{{ wake_overlay }}`, `{{ wake_modal }}`, `{{ wake_scripts scripts: ["wake_utils"] }}`
- `{{ asset type: "css|js" paths: [...] options: "async|defer" }}` — bundles Assets
- `{{ page_scripts position: "HEADER_START|HEADER_END|BODY_START|FOOTER_START|FOOTER_END|BODY_END" scripts: common.scripts }}`
- `{{ data_layer_config }}`, `{{ data_layer_hotsite_view product_lists: [...] }}` — analytics

Don't reinvent these. Search the codebase before writing equivalents.

## Common Patterns You'll See

**Currency**:
```scriban-html
{{ prices.price | math.format "c" "pt-BR" }}
```

**Image with cache-bust + theme**:
```scriban-html
<img src="{{- store.urls.static_img}}icons/close.svg?theme={{store.theme}}&v={{store.last_modified}}" />
```

**Safe variant fallback**:
```scriban-html
{{~ selected_variant = product.attribute_selections?.selected_variant ~}}
{{~ if selected_variant && selected_variant.images && selected_variant.images.size > 0 ~}}
    {{ product_image images: selected_variant.images }}
{{~ else ~}}
    {{ product_image images: product.images }}
{{~ end ~}}
```

**Group + filter pattern (used for promotion stamps)**:
```scriban-html
{{~ promotion_types = product.promotions | group.by @(do; ret $0.disclosure_type; end)
    spot_promos = promotion_types | group.get "Spot"
    null_promos = promotion_types | group.get null
    grouped = spot_promos | array.add_range null_promos
    stamps promotions: grouped
~}}
```

**Snippet render from JS** (for AJAX/lazy fragments):
```javascript
const html = await client.snippet.render("price_snippet.html", { productVariantId, quantity });
```
The snippet's `.graphql` lives under `Queries/SnippetQueries/`.

## Style and Conventions (Scriban side)

- **Filenames** are `snake_case.html`.
- **Indent with 4 spaces** (matches existing code).
- **Header doc-comment is mandatory** on new components and snippets — match the `Description / Params / Usage` shape shown above.
- **Tailwind classes** for styling — don't write custom CSS unless there's already a sibling `.css` file in `Assets/`.
- **Keep templates lean** — favor splitting into sub-components and pushing data-shape logic into the GraphQL query. Pages should mostly orchestrate, components should mostly render.
- **Use `~` aggressively** on structural blocks (`{{~ if ~}}`, `{{~ for ~}}`, `{{~ end ~}}`) to keep generated HTML clean.

## Common Pitfalls

- **Liquid muscle memory**: Wake is Scriban. `{% if %}` / `{% endif %}` is Liquid syntax — Scriban uses `{{ if }}` / `{{ end }}`. (Liquid is *parsed* by Scriban for back-compat but write Scriban going forward — see `references/liquid-support.md`.)
- **Whitespace bloat**: forgetting `~` on `if`/`for`/`end` produces blank lines in HTML. Use `{{~ ... ~}}` on structural code blocks.
- **Loop vars on `for.*`, not the iter var**: `for.index` (0-based), `for.length`, `for.first`, `for.last`, `for.even`, `for.odd`, `for.changed`.
- **Empty array is truthy** — `if products` is true even when `products.size == 0`. Check `if products.size > 0` or `if products?.size`.
- **Named-arg syntax has no commas**: `{{ comp a: 1 b: 2 }}` not `{{ comp a: 1, b: 2 }}`.
- **Property names with hyphens or reserved words** need bracket access: `this["my-handle"]`, `(for)` (parens for the `for` keyword).
- **Component not rendering**: if the name lookup fails silently it's almost always a missing entry in `Configs/components.json`. See the [`wake-template`](../wake-template/SKILL.md) skill for the contract.

## When You're Stuck

1. Grep the existing template tree — Wake stores reuse the same patterns; there's almost always a sibling component doing what you need.
2. Check `Configs/components.json` for the param shape of any component you're calling.
3. Check the matching `Queries/*.graphql` to see the exact shape of `data` for the current page.
4. For language questions, jump to `references/language.md`. For "is there a built-in for X?", `references/builtins.md`.
