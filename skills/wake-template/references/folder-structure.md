# Folder structure

## Link

- Wake docs — canonical page: [https://wakecommerce.readme.io/docs/pastas](https://wakecommerce.readme.io/docs/pastas)
- Lists every required folder at the template root with a short purpose for each. Treat as the authoritative source of truth; this file summarizes the contract and points to working examples.

## Contract summary

A Wake template is a flat tree of these top-level folders at the template root. Names are case-sensitive.

| Folder | Required | Purpose |
|---|---|---|
| `Assets/` | yes | Static CSS, Fonts, Img, JS served through the `asset` helper. Subfolders `CSS/`, `Fonts/`, `Img/`, `JS/`. |
| `Blocks/` | optional | Design Studio CMS blocks. Each block is paired files — `Blocks/<type>.html` (Scriban, reads `block_data.*`) + `Blocks/<type>.schema.json` (editor field schema) — authorized per page through `pages.json` `content_for_page[]` and rendered by `wake_content_for_page`. See [`blocks.md`](blocks.md) and [`design-studio.md`](design-studio.md). |
| `Components/` | yes | Reusable server-rendered fragments invoked inline (`{{ name param: value }}`). Every file must be registered in `Configs/components.json`. |
| `Configs/` | yes | Contract JSON files (`components.json`, `pages.json`, `settings.json`, `colors.json`, `emails.json`) and `Locales/` for i18n. |
| `Emails/` | yes | Transactional email bodies mapped to event types via `Configs/emails.json`. |
| `Pages/` | yes | Full-page HTML bodies. Each active Page is registered in `Configs/pages.json`. |
| `Queries/` | yes | `.graphql` files that feed Pages. `Queries/SnippetQueries/` is the subfolder that feeds Snippets. Free subfolder nesting is supported. |
| `Root/` | optional | Files served verbatim at the storefront root (e.g., `robots.txt`, `sw.js`). No Scriban processing. |
| `Snippets/` | yes | Dynamic fragments rendered on demand via the Storefront SDK (`await client.snippet.render("name.html", ...)`). |

Template-wide rules:

- `Configs/settings.json` must declare `access_token` — the token the runtime uses when the template issues GraphQL calls. Every other key in `settings.json` is developer-authored and accessed through `{{ settings.<key> }}`.
- Components referenced by name (e.g., `{{ breadcrumb breadcrumbs: product.breadcrumbs }}`) must be registered in `Configs/components.json`.
- Pages rendered by the Wake runtime must appear in `Configs/pages.json` with a `type` and, where applicable, a `query` (see [`pages.md`](pages.md)).
- Snippet files in `Snippets/` are not registered in `components.json`; they are addressed by filename through the SDK.

## Example pointer

- A canonical Wake template populates every folder in the table above — the public Wake docs page on `pastas` (linked at the top) lists each folder's role.
- Minimum tree to scaffold a new template — `Assets/{CSS,JS,Img,Fonts}/`, `Components/`, `Configs/{components.json, pages.json, settings.json, emails.json, Locales/}`, `Emails/`, `Pages/`, `Queries/SnippetQueries/`, `Snippets/`. `Blocks/` and `Root/` are optional.
