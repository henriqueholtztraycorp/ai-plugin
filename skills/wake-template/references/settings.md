# settings.json

## Link

- Wake docs — `settings.json` contract: [https://wakecommerce.readme.io/docs/settingsjson](https://wakecommerce.readme.io/docs/settingsjson)
- Defines the required `access_token` key and the convention that all other keys are developer-authored and surfaced inside Scriban as `{{ settings.<path> }}`.

## Contract summary

`Configs/settings.json` is a single JSON object — no top-level array, no comments. Rules:

| Key | Required | Purpose |
|---|---|---|
| `access_token` | **yes** | Wake Storefront API token the template runtime uses when executing `Queries/*.graphql`. Format: the opaque token string issued by Wake for the store (e.g., `tcs_<store>_<hash>`). Without it, the runtime cannot resolve page queries. |
| any other key | optional | Free-form. Values may be primitives, nested objects, or arrays. Accessed from any Scriban template via `{{ settings.key }}`, `{{ settings.group.nested_key }}`. |

Access pattern in HTML:

```scriban-html
<meta name="wake:default-page-size" content="{{ settings.page_size.default }}">
{{~ if settings.checkout.birthdate_required ~}}
  <!-- birthdate field markup -->
{{~ end ~}}
```

Conventions for production templates:

- Group related knobs under an object (e.g., `"page_size": { "default": 24, "options": [12,24,36,48] }`).
- Prefer literal values over booleans-as-strings; the Scriban runtime preserves JSON types.
- Never commit a real production `access_token` in a public repository — rotate and inject through the deploy pipeline when shipping.

## Example pointer

- A populated `settings.json` typically includes `access_token`, `page_size` (default + selectable options), `breadcrumb.home_text`, `sort.<page_type>.options[]`, and feature flags like `checkout.birthdate_required`.
- Minimal starting point — `{ "access_token": "<placeholder>", "page_size": { "default": 24, "options": [12, 24, 36, 48] } }`.
- Reading settings from Scriban — see [`wake-scriban`](../../wake-scriban/SKILL.md) for access syntax and null-guarding.
