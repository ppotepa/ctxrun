#!/bin/bash
# Scenario: `.ctxrunrc.json` in the current working directory is loaded as
# project-level configuration — on top of user-level and built-in config.
# Project-level presets and plugins must override / extend user-level ones.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

# Create a temporary project directory with a .ctxrunrc.json.
PROJ=$(mktemp -d)
trap "rm -rf '$PROJ'" EXIT

cat > "$PROJ/.ctxrunrc.json" << 'EOF'
{
  "plugins": [
    {
      "name": "project-db",
      "description": "Project database config",
      "env": {
        "PROJECT_DB_URL": ".config/project/db.sock"
      }
    }
  ],
  "presets": [
    {
      "name": "project-build",
      "command": "make",
      "plugins": ["base", "project-db"]
    }
  ]
}
EOF
chown -R devuser:devuser "$PROJ"

# 1. `ctxrun plugins list` run from the project dir must show the project plugin.
OUT=$(su devuser -c "cd '$PROJ' && ctxrun plugins list")
assert_contains "$OUT" "project-db - Project database config"
assert_contains "$OUT" "project-build -> make [base, project-db]"

# 2. Built-in presets must still be present alongside project-level ones.
assert_contains "$OUT" "codex"

# 3. Dry-run resolves the project preset's env vars relative to targetHome.
DRY=$(su devuser -c "cd '$PROJ' && sudo ctxrun project-build --dry-run")
assert_contains "$DRY" "PROJECT_DB_URL=/home/devuser/.config/project/db.sock"
assert_contains "$DRY" "HOME=/home/devuser"

# 4. Outside the project dir, the project plugin must NOT be visible.
OUT_OUTSIDE=$(su devuser -c "cd /tmp && ctxrun plugins list")
assert_not_contains "$OUT_OUTSIDE" "project-db"
assert_not_contains "$OUT_OUTSIDE" "project-build"

echo "Project-level .ctxrunrc.json: OK"
