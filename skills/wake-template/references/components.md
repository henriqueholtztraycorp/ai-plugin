# Components

## Link

- Wake docs — component authoring: [https://wakecommerce.readme.io/docs/components](https://wakecommerce.readme.io/docs/components)
- Wake docs — `components.json` contract: [https://wakecommerce.readme.io/docs/componentsjson](https://wakecommerce.readme.io/docs/componentsjson)
- Defines what a Component is (a named, parametrized HTML fragment) and how `Configs/components.json` registers every available Component for runtime resolution.

## Contract summary

Components are HTML files under `Components/` (arbitrary subfolder nesting allowed) registered in `Configs/components.json`. A component entry has the following shape:

| Field | Type | Required | Purpose |
|---|---|---|---|
| `name` | string | yes | Invocation name. Used as `{{ name param: value ... }}` in any HTML. Must be unique across `components.json`. |
| `path` | string | yes | Path relative to `Components/`. Example: `product/product_view.html`. |
| `params` | array of `{ name, required }` | optional | Declares the named parameters the component accepts. Wake validates that required params are provided at invocation time. |
| `availableInAllPages` | boolean | optional | When `true`, the component can be invoked from any Page. Typical for shared components (`header`, `footer`, `meta_tags`). |
| `availableInPages` | array of strings | optional | Limits visibility to a named subset of pages (page `type` values or custom URL matches). |
| `availableInAllComponents` | boolean | optional | When `true`, the component can be invoked from any other Component. Necessary for components composed inside other components. |
| `availableInComponents` | array of strings | optional | Limits component-inside-component visibility to a named subset. |
| `availableInAllEmails` | boolean | optional | When `true`, the component can be invoked from Email templates (`Emails/**/*.html`). |
| `inheritVariables` | boolean | optional | When `true`, the component inherits the caller's Scriban scope (`data.*`, `common.*`) instead of operating on an isolated scope bound by `params`. |

Invocation rules:

- Call a registered component by **name**: `{{ product_price prices: product.prices displayed_installment: product.displayed_installment }}`. Dot paths on the left of `:` are **not** valid — use the bare `name` from `components.json`.
- `params` at invocation are passed by name. Unknown parameter names are ignored by default; required params missing trigger a render error.
- A component not registered in `components.json` is **not invokable**, even if its HTML file exists in `Components/`.

## Example pointer

- A mature `Configs/components.json` typically holds dozens of entries spanning structural fragments (`head`, `header`, `footer`), product-page pieces (`product_view`, `product_price`, `breadcrumb`), checkout, and email-only components (`header_mail`, `footer_mail`).
- Component bodies live under `Components/` with free subfolder nesting (e.g., `Components/product/product_view.html`, `Components/breadcrumb.html`, `Components/meta_tags.html`).
- Minimal starting point — three entries (`head`, `header`, `footer`) registered with `availableInAllPages: true` plus a single `*.html` file each under `Components/`.
- Syntax inside a Component — see [`wake-scriban`](../../wake-scriban/SKILL.md).
