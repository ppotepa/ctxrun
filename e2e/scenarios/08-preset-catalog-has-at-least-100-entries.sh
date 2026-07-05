#!/bin/bash
# Scenario: the registry must expose at least 100 presets, matching the
# "everyday dev tool coverage" requirement.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

COUNT=$(su devuser -c "ctxrun plugins list --json" | node -e '
let data = "";
process.stdin.on("data", (chunk) => (data += chunk));
process.stdin.on("end", () => {
  const parsed = JSON.parse(data);
  console.log(parsed.presets.length);
});
')

echo "Preset count: $COUNT"
if [ "$COUNT" -lt 100 ]; then
  echo "ASSERTION FAILED: expected at least 100 presets, got $COUNT"
  exit 1
fi
