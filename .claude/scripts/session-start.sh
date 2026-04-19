#!/bin/bash
# SessionStart hook — injects current project status into Claude's context at session start.
# Silently passes if docs/PROJECT_STATUS.md does not exist (pre-Sprint 0).

if [ ! -f "docs/PROJECT_STATUS.md" ]; then
  exit 0
fi

content=$(head -30 docs/PROJECT_STATUS.md)

python3 -c "
import sys, json
text = sys.stdin.read()
print(json.dumps({'hookSpecificOutput': {'hookEventName': 'SessionStart', 'additionalContext': 'Current project status:\n' + text}}))
" <<< "$content"
