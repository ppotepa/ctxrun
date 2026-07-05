#!/bin/bash
# Scenario: External plugins and presets from ~/.config/ctxrun/ are loaded
# and merged correctly with built-in ones.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

# Ensure config dir exists for devuser
sudo mkdir -p /home/devuser/.config/ctxrun
sudo chown -R devuser:devuser /home/devuser/.config/ctxrun
trap "sudo rm -f /home/devuser/.config/ctxrun/plugins.json /home/devuser/.config/ctxrun/presets.json" EXIT

# Write external plugins.json
cat > /tmp/external-plugins.json << 'EOF'
{
  "plugins": [
    {
      "name": "external-test",
      "description": "External test plugin",
      "configures": ["EXTERNAL_VAR"],
      "env": {
        "EXTERNAL_VAR": ".config/external-test-config"
      }
    }
  ]
}
EOF

# Write external presets.json
cat > /tmp/external-presets.json << 'EOF'
{
  "presets": [
    {
      "name": "external-preset",
      "command": "echo",
      "plugins": ["base", "external-test"]
    }
  ]
}
EOF

# Copy to devuser's config and set permissions
sudo cp /tmp/external-plugins.json /home/devuser/.config/ctxrun/plugins.json
sudo cp /tmp/external-presets.json /home/devuser/.config/ctxrun/presets.json
sudo chown devuser:devuser /home/devuser/.config/ctxrun/plugins.json /home/devuser/.config/ctxrun/presets.json

# Test 1: plugins list as devuser should show merged plugins (built-in + external)
OUT=$(su devuser -c "ctxrun plugins list")
assert_contains "$OUT" "external-test - External test plugin"
assert_contains "$OUT" "base - Preserves the target user's HOME"

# Test 2: plugins list should show external preset merged with built-in ones
assert_contains "$OUT" "external-preset -> echo [base, external-test]"

# Test 3: --dry-run resolves external preset correctly (path is relative to targetHome)
OUT=$(su devuser -c "ctxrun run external-preset --dry-run")
assert_contains "$OUT" "EXTERNAL_VAR=/home/devuser/.config/external-test-config"

# Test 4: --json flag works with --profile integration
OUT=$(su devuser -c "ctxrun plugins list --json" | head -5)
# Should output valid JSON start
assert_contains "$OUT" "{"
