#!/bin/bash
# Runs every scenario script in e2e/scenarios and reports a pass/fail summary.
# Exits non-zero if any scenario fails, so it can be used as a CI gate.
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
total=0
failed=0
failed_names=()

for scenario in "$SCRIPT_DIR"/scenarios/*.sh; do
  name="$(basename "$scenario")"
  total=$((total + 1))

  echo "=== $name ==="
  if bash "$scenario"; then
    echo "PASS: $name"
  else
    echo "FAIL: $name"
    failed=$((failed + 1))
    failed_names+=("$name")
  fi
  echo
done

passed=$((total - failed))
echo "----------------------------------------"
echo "$passed/$total scenarios passed"

if [ "$failed" -ne 0 ]; then
  echo "Failed: ${failed_names[*]}"
  exit 1
fi

exit 0
