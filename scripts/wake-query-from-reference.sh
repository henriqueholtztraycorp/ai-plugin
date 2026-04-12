#!/usr/bin/env bash
# wake-query-from-reference: Extract headless query pattern from Wake Storefront reference.
# Usage: ./scripts/wake-query-from-reference.sh <reference-file>
# Reads Queries/*.graphql or SnippetQueries/*.graphql, outputs headless mapping notes.

set -e
FILE="${1:-}"
if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
  echo "Usage: $0 <reference-graphql-file>"
  echo "Example: $0 path/to/Queries/product.graphql"
  exit 1
fi

echo "Analyzing $FILE for headless mapping..."
echo ""
echo "Root fields:"
grep -oE '(query|mutation)[[:space:]]+[A-Za-z0-9_]+' "$FILE" 2>/dev/null || true
grep -oE '\b(product|search|hotsite|checkout|createCheckout|checkoutAddProduct)\s*\(' "$FILE" 2>/dev/null || true
echo ""
echo "Mapping notes:"
echo "  - Replace handle with productId (Long) for Wake native"
echo "  - Use attributeSelections(selected) for variant resolution"
echo "  - Add partnerAccessToken when in partner context"
echo "  - See skills/wake-storefront-reference-patterns/SKILL.md for full mapping"
echo ""
echo "Done."
