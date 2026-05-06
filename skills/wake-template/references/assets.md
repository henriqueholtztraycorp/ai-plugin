# Assets

## Link

- Wake docs — `Assets/` folder and the `asset` helper: [https://wakecommerce.readme.io/docs/pastas](https://wakecommerce.readme.io/docs/pastas) covers the folder layout. Specific helper syntax is documented alongside the Scriban reference — prefer the Wake Docs MCP search "asset helper Wake" for the current signature.

## Contract summary

`Assets/` serves every static file the storefront ships — CSS, JS, images, fonts. It is split into four mandatory subfolders:

| Subfolder | Contents |
|---|---|
| `Assets/CSS/` | Stylesheets. Invoked by basename (no extension) through the `asset` helper. |
| `Assets/JS/` | Client-side scripts. Invoked by basename through the `asset` helper. |
| `Assets/Img/` | Images and icons. Invoked by filename (with extension) through the `asset` helper. |
| `Assets/Fonts/` | Web fonts (woff, woff2, ttf). Typically referenced from CSS via `url(...)` rather than the helper. |

Invocation — the `asset` helper (registered component on every Wake template):

```scriban-html
{{ asset type: "css" paths: ["navbar", "footer", "mini_cart", "product"] }}
{{ asset type: "js"  paths: ["product", "navbar"] options: "async" }}
{{ asset type: "img" paths: ["logo.svg"] }}
```

Rules:

- `type` ∈ `{ "css", "js", "img" }`. Required.
- `paths` is an array of basenames (CSS / JS) or filenames (Img). Required.
- `options` is free-form string passed through to the emitted tag (e.g., `"async"`, `"defer"`).
- `fetch_priority` — optional priority hint emitted as `fetchpriority="..."`.
- Always use the helper — never hand-build URLs into `Assets/`. The helper resolves hashing, CDN prefixing, and environment-specific paths.

## Example pointer

- Canonical layout — `Assets/CSS/`, `Assets/JS/`, `Assets/Img/`, `Assets/Fonts/` at the template root.
- `asset` component definition — registered as an entry in `Configs/components.json` (path `asset.html`, params `type` / `paths` / `options` / `fetch_priority`).
- Typical Page usage — `Pages/product.html` invokes `{{ asset type: "css" paths: [...] }}` for stylesheets and `{{ asset type: "js" paths: [...] options: "async" }}` for scripts.
- Scriban syntax for the helper — see [`wake-scriban`](../../wake-scriban/SKILL.md) (searches for `{{ asset }}`).
