#!/bin/bash
# Vitest hook — runs vitest on a test file immediately after it is written or edited.
# Silently passes if vitest is not yet configured (pre-Sprint 1).

# Extract file path from hook stdin
file_path=$(jq -r '.tool_input.file_path // .tool_input.path // empty' 2>/dev/null)

# Exit silently if no file path found
if [ -z "$file_path" ]; then
  exit 0
fi

# Only act on test files
if [[ "$file_path" != *.test.ts && "$file_path" != *.spec.ts && \
      "$file_path" != *.test.tsx && "$file_path" != *.spec.tsx ]]; then
  exit 0
fi

# Guard: skip if vitest is not configured
if ! jq -e '.scripts.test' package.json > /dev/null 2>&1; then
  exit 0
fi

# Run vitest on the specific file
result=$(pnpm vitest run "$file_path" 2>&1)
exit_code=$?

echo "$result" >&2

if [ $exit_code -ne 0 ]; then
  printf '{"continue": false, "stopReason": "Vitest failed for %s — fix failing tests before proceeding.", "hookSpecificOutput": {"hookEventName": "PostToolUse", "additionalContext": "Vitest output for %s:\n%s"}}' \
    "$file_path" "$file_path" "$result"
fi
