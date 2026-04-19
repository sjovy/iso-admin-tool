#!/bin/bash
# Pre-commit gate — runs lint and type check before every git commit.
# Silently passes if toolchain is not yet configured (pre-Sprint 1).
# Activated as a Sprint 1 exit criterion once pnpm lint and tsc are wired up.

# Guard: skip if package.json has no lint script (toolchain not yet set up)
if ! python3 -c "import json,sys; d=json.load(open('package.json')); sys.exit(0 if 'lint' in d.get('scripts',{}) else 1)" 2>/dev/null; then
  exit 0
fi

lint_output=$(pnpm run lint 2>&1)
lint_exit=$?

tsc_output=$(pnpm tsc --noEmit 2>&1)
tsc_exit=$?

if [ $lint_exit -ne 0 ] || [ $tsc_exit -ne 0 ]; then
  echo "$lint_output" >&2
  echo "$tsc_output" >&2
  printf '{"continue": false, "stopReason": "Pre-commit gate failed: fix lint and type errors before committing."}'
fi
