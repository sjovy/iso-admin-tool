#!/bin/bash
# Vitest hook — runs vitest on a test file immediately after it is written or edited.
# Silently passes if vitest is not yet configured (pre-Sprint 1).

# Extract file path from hook stdin
file_path=$(python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    ti = d.get('tool_input', {})
    print(ti.get('file_path') or ti.get('path') or '')
except:
    pass
" 2>/dev/null)

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
if ! python3 -c "import json,sys; d=json.load(open('package.json')); sys.exit(0 if 'test' in d.get('scripts',{}) else 1)" 2>/dev/null; then
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
