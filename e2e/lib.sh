#!/bin/bash
# Shared assertion helpers for e2e scenario scripts.
# Source this from each scenario: `source "$(dirname "${BASH_SOURCE[0]}")/../lib.sh"`

assert_contains() {
  local haystack="$1"
  local needle="$2"
  if ! grep -qF -- "$needle" <<< "$haystack"; then
    echo "ASSERTION FAILED: expected output to contain:"
    echo "  $needle"
    echo "--- actual output ---"
    echo "$haystack"
    echo "---------------------"
    exit 1
  fi
}

assert_not_contains() {
  local haystack="$1"
  local needle="$2"
  if grep -qF -- "$needle" <<< "$haystack"; then
    echo "ASSERTION FAILED: expected output NOT to contain:"
    echo "  $needle"
    echo "--- actual output ---"
    echo "$haystack"
    echo "---------------------"
    exit 1
  fi
}

assert_equal() {
  local actual="$1"
  local expected="$2"
  if [ "$actual" != "$expected" ]; then
    echo "ASSERTION FAILED: expected '$expected', got '$actual'"
    exit 1
  fi
}

# Assert the exit code of the last command equals the expected value.
# Usage: run_something; assert_exit_code $? 42
assert_exit_code() {
  local actual="$1"
  local expected="$2"
  if [ "$actual" -ne "$expected" ]; then
    echo "ASSERTION FAILED: expected exit code $expected, got $actual"
    exit 1
  fi
}

# Assert output matches a grep-compatible extended regex.
# Usage: assert_matches "$output" "pattern"
assert_matches() {
  local haystack="$1"
  local pattern="$2"
  if ! grep -qE -- "$pattern" <<< "$haystack"; then
    echo "ASSERTION FAILED: expected output to match pattern:"
    echo "  $pattern"
    echo "--- actual output ---"
    echo "$haystack"
    echo "---------------------"
    exit 1
  fi
}

# Assert a JSON string has a key with the expected value.
# Usage: assert_json_key "$json" ".presets | length" "104"
# Requires jq on the test host.
assert_json_key() {
  local json="$1"
  local jq_path="$2"
  local expected="$3"
  local actual
  actual=$(echo "$json" | node -e "
const d = require('fs').readFileSync('/dev/stdin','utf8');
const obj = JSON.parse(d);
const parts = '$jq_path'.replace(/^\./,'').split('.');
let v = obj;
for (const p of parts) v = v[p];
console.log(v);
  " 2>/dev/null || echo "$json" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d$(echo "$jq_path" | sed 's/\./["/g; s/\([a-zA-Z_]\+\)$/"\1"]/g'))" 2>/dev/null || echo "")
  if [ "$actual" != "$expected" ]; then
    echo "ASSERTION FAILED: JSON key '$jq_path' expected '$expected', got '$actual'"
    exit 1
  fi
}
