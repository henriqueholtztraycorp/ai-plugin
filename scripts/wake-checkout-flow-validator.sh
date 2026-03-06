#!/usr/bin/env bash
# wake-checkout-flow-validator: Verify checkout mutations called in correct order.
# Usage: ./scripts/wake-checkout-flow-validator.sh <file-with-mutations>
# Expected order: createCheckout, checkoutCustomerAssociate, checkoutAddressAssociate,
#   checkoutSelectShippingQuote, checkoutAddCoupon, checkoutSelectPaymentMethod, checkoutComplete

set -e
FILE="${1:-}"
if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
  echo "Usage: $0 <file-with-checkout-mutations>"
  exit 1
fi

ORDER=(
  createCheckout
  checkoutCustomerAssociate
  checkoutAddressAssociate
  checkoutSelectShippingQuote
  checkoutAddCoupon
  checkoutSelectPaymentMethod
  checkoutComplete
)

echo "Validating checkout mutation order in $FILE..."
FOUND=()
for mut in "${ORDER[@]}"; do
  if grep -q "$mut" "$FILE"; then
    FOUND+=("$mut")
  fi
done

PREV_IDX=-1
ISSUES=0
for m in "${FOUND[@]}"; do
  for i in "${!ORDER[@]}"; do
    [[ "${ORDER[$i]}" == "$m" ]] && { IDX=$i; break; }
  done
  if [ -n "${IDX:-}" ] && [ "$IDX" -lt "$PREV_IDX" ]; then
    echo "  [ERROR] $m out of order (expected after ${ORDER[$PREV_IDX]})"
    ISSUES=$((ISSUES + 1))
  fi
  PREV_IDX=$IDX
done

if [ $ISSUES -eq 0 ]; then
  echo "  Order OK. Found: ${FOUND[*]}"
else
  echo "  Issues: $ISSUES"
  echo "  Expected order: ${ORDER[*]}"
  exit 1
fi
