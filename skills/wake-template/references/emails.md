# Emails

## Link

- Wake docs — Emails and `emails.json`: the canonical email-authoring page lives under the Wake docs portal (`https://wakecommerce.readme.io/docs/*`). Prefer the Wake Docs MCP — search "Wake transactional emails" or the event type (e.g., "ConfirmacaoPedido template") — because the event catalog evolves with platform features.
- Event enumeration also appears in the Wake Admin panel alongside the template upload UI.

## Contract summary

`Emails/` holds transactional email bodies. `Configs/emails.json` is the event-to-template map.

`emails.json` entry shape:

| Field | Type | Required | Purpose |
|---|---|---|---|
| `type` | string | yes | Wake event key (Portuguese names, e.g., `ConfirmacaoPedido`, `AbandonedCartNovoCheckout`, `BoasVindas`). Canonical list lives in the Wake Docs MCP / Admin. |
| `path` | string | yes | Path relative to `Emails/` for the email body. Nested paths are fine (e.g., `Orders/order_confirmed.html`, `Subscriptions/subscription_canceled.html`). Empty string for the generic `EmailGenerico` placeholder. |
| `production` | boolean | yes | Whether Wake ships this template in production. `false` leaves it as a staging-only template. |
| `active` | boolean | yes | Whether the event currently triggers the email at all. Toggling this off disables the event without removing the template. |

Runtime behavior:

- When the Wake platform emits an event matching a `type` in `emails.json`, it renders the `path` body with the event payload injected as `data.*`.
- Emails can invoke Components flagged `availableInAllEmails: true` in `components.json` (typical examples: `header_mail`, `footer_mail`, `product_mail`).
- Scriban syntax inside email HTML follows the same rules as other `.html` files — see [`wake-scriban`](../../wake-scriban/SKILL.md).

## Example pointer

- A mature `Configs/emails.json` typically holds dozens of event bindings spanning orders, subscriptions, cart abandonment, auth flows, and partner notifications.
- Email bodies live under `Emails/` with optional subfolders by domain (e.g., `Emails/Orders/`, `Emails/Subscriptions/`, `Emails/Products/`, `Emails/Login/`).
- Email-capable components — entries in `components.json` flagged `availableInAllEmails: true` (e.g., `header_mail`, `footer_mail`, `product_mail`).
