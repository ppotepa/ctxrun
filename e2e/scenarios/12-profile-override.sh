#!/bin/bash
# Scenario: `--profile` overrides the detected target user and home directory.
# devuser creates a profile pointing at ciuser's home; running with that
# profile must resolve ciuser's paths, not devuser's.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"

# Write a profiles.json for devuser that declares a "ciuser" profile.
sudo -u devuser mkdir -p /home/devuser/.config/ctxrun
cat > /tmp/profiles.json << 'EOF'
{
  "ciuser": {
    "targetUser": "ciuser",
    "targetHome": "/home/ciuser"
  }
}
EOF
sudo cp /tmp/profiles.json /home/devuser/.config/ctxrun/profiles.json
sudo chown devuser:devuser /home/devuser/.config/ctxrun/profiles.json
trap "sudo rm -f /home/devuser/.config/ctxrun/profiles.json" EXIT

# 1. Without --profile: dry-run resolves devuser's HOME.
OUT_DEFAULT=$(su devuser -c "sudo ctxrun gh --dry-run")
assert_contains "$OUT_DEFAULT" "HOME=/home/devuser"
assert_not_contains "$OUT_DEFAULT" "HOME=/home/ciuser"

# 2. With --profile ciuser: dry-run resolves ciuser's HOME.
OUT_PROFILE=$(su devuser -c "sudo ctxrun --profile ciuser gh --dry-run")
assert_contains "$OUT_PROFILE" "HOME=/home/ciuser"
assert_contains "$OUT_PROFILE" "GH_CONFIG_DIR=/home/ciuser/.config/gh"
assert_not_contains "$OUT_PROFILE" "HOME=/home/devuser"

# 3. doctor with --profile shows overridden targetUser.
DOCTOR=$(su devuser -c "sudo ctxrun --profile ciuser doctor")
assert_contains "$DOCTOR" "targetUser=ciuser"
assert_contains "$DOCTOR" "targetHome=/home/ciuser"

echo "Profile override: OK"
