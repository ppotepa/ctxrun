#!/bin/bash
# Scenario: every single registered preset must, when dry-run under sudo,
# resolve devuser's HOME (not root's), exit 0, and never crash. This scales
# automatically as new presets are added to the catalog - no per-preset
# scenario needed.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

PRESET_NAMES=$(su devuser -c "ctxrun plugins list --json" | node -e '
let data = "";
process.stdin.on("data", (chunk) => (data += chunk));
process.stdin.on("end", () => {
  const parsed = JSON.parse(data);
  for (const preset of parsed.presets) {
    console.log(preset.name);
  }
});
')

count=0
for preset in $PRESET_NAMES; do
  count=$((count + 1))
  OUT=$(su devuser -c "sudo ctxrun ${preset} --dry-run" 2>&1)
  STATUS=$?

  if [ "$STATUS" -ne 0 ]; then
    echo "FAILED preset '$preset': dry-run exited with status $STATUS"
    echo "$OUT"
    exit 1
  fi

  assert_contains "$OUT" "HOME=/home/devuser"
  assert_not_contains "$OUT" "HOME=/root"
done

echo "All $count presets dry-ran successfully with devuser's context."
