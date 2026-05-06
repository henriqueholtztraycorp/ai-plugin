---
name: wake-template
description: Wake Commerce storefront template (sometimes called a "theme") anatomy — the required root folders (Assets, Blocks, Components, Configs, Emails, Pages, Queries, Root, Snippets) and the contracts behind `Configs/components.json`, `Configs/pages.json`, `Configs/settings.json`, `Configs/emails.json`, the Snippets/SnippetQueries pairing, and the Wake Design Studio CMS (Blocks + `content_for_page` on hotsite pages, paired `Blocks/<type>.html` + `Blocks/<type>.schema.json` files, and the `wake_has_content_for_page` / `wake_content_for_page` runtime helpers). Use when scaffolding a new Wake template, registering a Component, wiring a Page to a Query in `pages.json`, binding a Snippet to a SnippetQuery, adding an Email, exposing a new static asset, authoring a Design Studio Block (schema + HTML), configuring a hotsite `content_for_page`, deciding between a Block and a Component, or explaining how data flows from Queries → Pages/Snippets → Components → Blocks in a Wake storefront project. Triggers include "Wake template", "Wake theme" (synonym), "template folder structure", "components.json", "pages.json", "settings.json", "emails.json", "Configs/", "register component", "bind query to page", "scaffold a Wake template", "Wake storefront structure", "hotsite content_for_page", "Snippets + SnippetQueries pairing", "Wake Design Studio", "Wake CMS", "Design Studio block", "Wake block schema", "block_data", "wake_content_for_page", "wake_has_content_for_page", ".schema.json block", "merchant editable hotsite", "Storefront 2.0 CMS".
---

# Wake Template

Anatomy of a Wake Commerce storefront template. Use this skill whenever a prompt is about how a Wake template is **shaped** — its folders, its config files, how Pages find Queries, how Snippets are paired with SnippetQueries, how Components are registered, how Emails are wired to event types, and how Assets are referenced.

## When to use this Skill

- Scaffolding a new Wake template project (minimum viable folder tree).
- Registering a Component in `Configs/components.json` and understanding its entry shape.
- Adding a Page and wiring it to a Query via `Configs/pages.json`.
- Pairing a Snippet in `Snippets/` with a SnippetQuery in `Queries/SnippetQueries/` for dynamic rendering via the Storefront SDK.
- Reading or editing `Configs/settings.json` and knowing which keys Wake expects (`access_token`) vs arbitrary developer keys surfaced via `{{ settings.key }}`.
- Adding a transactional email under `Emails/` and mapping it to a Wake event in `Configs/emails.json`.
- Exposing a new CSS / JS / image asset under `Assets/` and invoking it with the `asset` helper.
- Adding a hotsite variant via `pages.json.customs[]` + `content_for_page`.
- Authoring a Design Studio CMS Block — paired `Blocks/<type>.html` + `Blocks/<type>.schema.json`, authorized through `pages.json` `content_for_page[]`, rendered by `wake_content_for_page`.
- Deciding whether new content should be a Block (merchant-editable through the CMS) or a Component (developer-only).
- Explaining the data flow: Queries → Pages (or Snippets) → injected `data.*` → Components → Blocks (`block_data.*`).

Do **not** use this skill for Scriban syntax inside `.html` files (use [`wake-scriban`](../wake-scriban/SKILL.md)). For GraphQL query shape, schema discovery, or headless consumers of the Storefront API, refer to the Wake docs portal — that surface is outside this skill's scope.

## Instructions

### 1. Root folders — one purpose each

A Wake template is a flat tree of nine top-level folders plus the four JSON files in `Configs/`. Keep the purpose of each folder in mind before deciding **where** a new file belongs.

| Folder | Purpose | Reference |
|---|---|---|
| `Assets/` | Static CSS, Fonts, Img, JS — invoked through the `asset` helper, never hand-linked. | [`references/assets.md`](references/assets.md) |
| `Blocks/` | Design Studio CMS blocks. Each block is paired files — `Blocks/<type>.html` (Scriban, reads `block_data.*`) + `Blocks/<type>.schema.json` (editor field schema) — authorized per page via `pages.json` `content_for_page[]`. | [`references/blocks.md`](references/blocks.md), [`references/design-studio.md`](references/design-studio.md) |
| `Components/` | Reusable server-rendered fragments invoked inline — `{{ name param: value }}`. Every component is registered in `Configs/components.json`. | [`references/components.md`](references/components.md) |
| `Configs/` | The four contract files (`components.json`, `pages.json`, `settings.json`, `colors.json`) + `emails.json` + `Locales/`. Contracts of the template. | [`references/configs.md`](references/configs.md) |
| `Emails/` | Transactional email bodies rendered from Wake event payloads, mapped to event types in `Configs/emails.json`. | [`references/emails.md`](references/emails.md) |
| `Pages/` | Full-page HTML bodies. Wired to a root Query (and optional `customs[]`) through `Configs/pages.json`. | [`references/pages.md`](references/pages.md) |
| `Queries/` | `.graphql` files that feed Pages. `Queries/SnippetQueries/` is the paired subfolder feeding Snippets. | [`references/queries.md`](references/queries.md) |
| `Root/` | Files served verbatim from the storefront root (`robots.txt`, `sw.js`). No templating. | [`references/folder-structure.md`](references/folder-structure.md) |
| `Snippets/` | Dynamic fragments rendered from the client via `await client.snippet.render("name.html", ...)` — each paired with a SnippetQuery of the same base name. | [`references/snippets.md`](references/snippets.md) |

For the full enumeration and the cross-folder relationships, see [`references/folder-structure.md`](references/folder-structure.md).

### 2. Data flow — Queries → Pages / Snippets → Components

1. A `.graphql` file under `Queries/` (for Pages) or `Queries/SnippetQueries/` (for Snippets) declares the data envelope.
2. `Configs/pages.json` binds the Page HTML to its root Query (and optional per-URL `customs[]` overrides).
3. The Storefront runtime executes the Query and injects the result as `data.*` when rendering the Page HTML. For Snippets, the SDK call passes variables to the SnippetQuery and injects `data.*` into the Snippet HTML.
4. The Page / Snippet composes reusable Components by inline invocation (`{{ product_price prices: product.prices }}`). Components are resolved through `Configs/components.json`.
5. `Configs/settings.json` exposes developer-authored values as `{{ settings.key }}`; the `access_token` key authenticates the template's runtime GraphQL calls.

### 3. Design Studio CMS (Wake's visual editor)

Design Studio is the merchant-facing CMS in Wake Admin (Storefront 2.0). It composes **hotsite** pages from drag-and-drop **Blocks** that the agency authors. The MVP scope is hotsite pages — primarily the homepage (`urlMatch: ""`).

The template enables it through three paired pieces:

1. **Authorize the block types in `pages.json`** — on a hotsite `customs[]` entry, list the allowed `type`s under `content_for_page[]`. This is the gatekeeper; a Block on disk that is not listed here is invisible to the merchant.

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

2. **Define each Block under `Blocks/`** — paired files:
   - `Blocks/<type>.schema.json` — drives the editor form (fields with `text`, `number`, `url`, `image_picker`, `color`, `select`, `checkbox`).
   - `Blocks/<type>.html` — Scriban template that reads merchant input as `block_data.<name>` (one key per `settings[].name` in the schema).

   The base filename, the schema's `type`, and the `pages.json` `type` must all match. See [`references/blocks.md`](references/blocks.md).

3. **Render the merchant's composition in the page body** — use the runtime helpers, with a static fallback for the pre-CMS / between-campaigns state:

   ```scriban
   {{ if wake_has_content_for_page }}
     {{ wake_content_for_page }}
   {{ else }}
     {{## fallback markup — used until a layout is published ##}}
   {{ end }}
   ```

   `wake_has_content_for_page` reports whether a published layout exists; `wake_content_for_page` iterates the merchant's saved blocks and renders each `Blocks/<type>.html`.

Block vs. Component — quick rule: if the merchant edits it through the CMS, it's a Block; if only the developer ever touches it, it's a Component. Both can be invoked from the same hotsite page, and a Block can itself call Components.

For the merchant-side capabilities (drafts, preview, campaign scheduling, version history), the full block contract, and migration patterns, see [`references/design-studio.md`](references/design-studio.md) and [`references/blocks.md`](references/blocks.md).

### 4. Scaffold a new template

1. Create the root tree with the nine top-level folders above (`Assets/`, `Blocks/`, `Components/`, `Configs/`, `Emails/`, `Pages/`, `Queries/`, `Root/`, `Snippets/`) plus `Queries/SnippetQueries/`.
2. Add the four contract files under `Configs/`: `components.json` (empty array), `pages.json` (empty array), `settings.json` (object with `access_token`), and `emails.json` (empty array). For i18n, create `Configs/Locales/`.
3. Put a real token in `Configs/settings.json`'s `access_token` field (required — see [`references/settings.md`](references/settings.md)).
4. Add Pages and register their Queries in `Configs/pages.json` — contract in [`references/pages.md`](references/pages.md).
5. Register any new Components in `Configs/components.json` — contract in [`references/components.md`](references/components.md).
6. For dynamic fragments, drop the Snippet into `Snippets/` and its SnippetQuery into `Queries/SnippetQueries/` sharing the base name — contract in [`references/snippets.md`](references/snippets.md).