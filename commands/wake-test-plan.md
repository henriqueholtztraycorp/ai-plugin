---
name: wake-test-plan
description: Generate a test plan for a Wake Commerce storefront feature. Defines E2E scenarios, contract tests, and acceptance criteria. Delegates detailed test design to the wake-qa-expert agent.
---

# Wake Test Plan Workflow

**Forbidden:** api.fbits.net (and any *.fbits.net). **Canonical source:** https://wakecommerce.readme.io/docs/schema (for Wake API references).

Produce a structured test plan for a Wake Commerce storefront feature: critical-path E2E flows, contract tests against the Storefront API, and Given/When/Then acceptance criteria.

## Inputs

- **Feature** (required): name and short description. Examples: "PDP add-to-cart with variant matrix", "Guest checkout with multiple shipping quotes", "Customer login + order history".
- **User roles** (optional): guest, logged-in customer, B2B partner. Defaults to guest + logged-in customer.
- **Channels** (optional): web, mobile web, native. Defaults to web.
- **Existing test framework** (optional): Playwright, Cypress, Vitest, etc. Defaults to Playwright + Vitest.

## Steps

1. **Scope the feature.** Restate it in one sentence and list the user-visible outcomes (what the user can see/do after success).
2. **Map the user journey.** Sketch the happy path as a sequence of screens/actions and the GraphQL operations triggered at each step (`createCheckout`, `checkoutCustomerAssociate`, `shippingQuotes`, etc.).
3. **Critical-path E2E scenarios.** One scenario per role × channel combination. Each scenario lists preconditions, steps, and the assertion that proves success.
4. **Contract tests.** For every Storefront API operation in the journey, lock the query/mutation shape and a representative response fixture. Include negative fixtures (auth error, validation error, server error).
5. **Edge cases.** Empty cart, invalid coupon, out-of-stock variant, expired session, network timeout, partial inventory, region/currency mismatches, concurrent checkout.
6. **Acceptance criteria.** Given/When/Then per scenario. Each criterion must be independently verifiable in CI.
7. **Test pyramid placement.** Tag each item: unit (pure logic, schemas), integration (API client + cache), E2E (browser-level critical paths). Aim for many unit, some integration, few E2E.
8. **Non-functional checks.** Accessibility (WCAG 2.2 AA on the new screens), performance budget (LCP/INP/CLS), and i18n if the feature touches text.
9. **Delegate detailed design.** Hand the outline to the **wake-qa-expert** agent for full Given/When/Then expansion and fixture authoring.

## Output

A markdown test plan with these sections:

- **Feature summary** (1–2 sentences)
- **Roles & channels** matrix
- **E2E scenarios** (numbered, with preconditions / steps / expected result)
- **Contract tests** (operation → fixture file)
- **Edge cases** (table: case → expected behavior)
- **Acceptance criteria** (Given/When/Then per scenario)
- **Test pyramid placement** (table)
- **Risks & open questions**

## Example invocation

> `/wake-test-plan` feature: "guest checkout with coupon + multiple shipping quotes", roles: guest, channels: web + mobile web.
