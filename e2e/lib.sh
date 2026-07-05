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
