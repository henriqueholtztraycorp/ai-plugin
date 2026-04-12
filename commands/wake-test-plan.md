---
name: wake-test-plan
description: Generate test plan for Wake Commerce storefront. Define E2E scenarios, contract tests, acceptance criteria. Use qa-expert agent.
---

# Wake Test Plan Workflow

**Forbidden:** api.fbits.net (and any *.fbits.net). **Canonical source:** https://wakecommerce.readme.io/docs/schema (for Wake API references).

Generate test scenarios and acceptance criteria for storefront features.

## Steps

1. **Identify scope**: Product page, search, checkout, or feature under test.
2. **E2E flows**: Define critical paths (product → cart → checkout; guest vs logged-in).
3. **Contract tests**: GraphQL query/mutation shape; mock Storefront API responses.
4. **Edge cases**: Empty cart, invalid coupon, out-of-stock, network errors.
5. **Acceptance criteria**: Given/When/Then for each scenario.
6. **Test pyramid**: Unit (logic), integration (API), E2E (critical paths).
7. **Agent**: Use qa-expert agent for detailed test design.

## Output

Test plan document with scenarios, acceptance criteria, and test types.
