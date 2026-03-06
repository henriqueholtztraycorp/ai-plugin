#!/usr/bin/env bash
# wake-graphql-validate: Validate Wake Commerce GraphQL query against common patterns.
# Usage: ./scripts/wake-graphql-validate.sh <query-file>
# Checks: productId (not handle), attributeSelections, partnerAccessToken when needed.

set -e
FILE="${1:-}"
if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
  echo "Usage: $0 <query-file>"
  exit 1
fi

echo "Validating $FILE for Wake Commerce patterns..."
ISSUES=0

# Check for handle (Shopify) - Wake uses productId
if grep -qE '\bhandle\b' "$FILE"; then
  echo "  [WARN] 'handle' found - Wake uses productId (Long), not handle"
  ISSUES=$((ISSUES + 1))
fi

# Check for attributeSelections when product has variants
if grep -q 'product(' "$FILE" && ! grep -q 'attributeSelections' "$FILE"; then
  echo "  [INFO] product query without attributeSelections - ensure product has no variants or add attributeSelections(selected)"
  # Not necessarily wrong for single-variant
fi

# Check partnerAccessToken for product/search/hotsite in partner context
if grep -qE 'product\(|search\(|hotsite\(' "$FILE" && ! grep -q 'partnerAccessToken' "$FILE"; then
  echo "  [INFO] product/search/hotsite without partnerAccessToken - add if in partner/wholesale context"
fi

echo "Validation complete. Issues: $ISSUES"
exit $ISSUES
