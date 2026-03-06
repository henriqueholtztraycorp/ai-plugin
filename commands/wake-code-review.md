---
name: wake-code-review
description: Code quality review for Wake Commerce storefront. Style, patterns, maintainability. Use code-reviewer agent.
---

# Wake Code Review Workflow

Review code quality and best practices.

## Steps

1. **Style**: Naming consistency; clear variables; no magic numbers.
2. **DRY/SOLID**: Extract repeated logic; single responsibility.
3. **Error handling**: Try/catch; user-friendly messages; no exposed stack traces.
4. **Hooks**: useCallback, useMemo; avoid unnecessary re-renders.
5. **TypeScript**: Strict types; avoid any; null checks.
6. **Wake patterns**: Align with wake-storefront-api, wake-checkout-flow skills.
7. **Agent**: Use code-reviewer agent for detailed review.

## Output

Code review report with findings and improvement recommendations.
