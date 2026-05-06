# Configs

## Link

- Wake docs — Configs overview: [https://wakecommerce.readme.io/docs/configs](https://wakecommerce.readme.io/docs/configs)
- Lists every JSON file under `Configs/` and its role. Each file has a dedicated reference page linked below.

## Contract summary

`Configs/` is the template's contract layer — flat JSON files plus a `Locales/` subfolder for i18n.

| File | Purpose | Detailed reference |
|---|---|---|
| `components.json` | Array of component registrations (name, path, params, availability). | [`components.md`](components.md) |
| `pages.json` | Array of page bindings (type → body + query, with optional `customs[]` or `routes[]`). | [`pages.md`](pages.md) |
| `settings.json` | Object of developer-authored settings surfaced as `{{ settings.<key> }}`. **Requires** `access_token`. | [`settings.md`](settings.md) |
| `colors.json` | Array of color definitions (`name`, `hex[]`, `alias`) used by filter / swatch rendering. | See Wake docs portal; no dedicated reference page in this skill (authoring shape mirrors Design Studio). |
| `emails.json` | Array of event-type → email template bindings. | [`emails.md`](emails.md) |
| `Locales/*.json` | Per-locale string tables consumed by the template's i18n layer (e.g., `en-US.json`). Naming matches the runtime locale key. | See Wake docs portal. |

Rules of thumb:

- Every JSON file under `Configs/` must parse with a standard JSON parser. Comments are not allowed.
- `settings.json` and `pages.json` are re-read on every render cycle; treat them as hot config.
- `components.json` drives name resolution — a missing entry means "component not found".
- `emails.json` decides which event triggers which `.html` under `Emails/`; toggling `production` / `active` controls whether the template ships the email at all.
- `Locales/*.json` are loaded by key matching the runtime locale; missing keys fall back to the HTML's literal text.

## Example pointer

- A populated `Configs/` directory contains every file in the table above plus a `Locales/` subfolder; `colors.json` and `Locales/*.json` are optional but commonly present in production templates.
- Minimal starting point — `components.json` (empty array `[]`), `pages.json` (empty array `[]`), `settings.json` (`{ "access_token": "<token>" }`), and `emails.json` (empty array `[]`).
