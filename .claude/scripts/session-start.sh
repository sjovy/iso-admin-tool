#!/bin/bash
# SessionStart hook — injects current project status into Claude's context at session start.
# Silently passes if docs/PROJECT_STATUS.md does not exist (pre-Sprint 0).

if [ ! -f "docs/PROJECT_STATUS.md" ]; then
  exit 0
fi

content=$(head -30 docs/PROJECT_STATUS.md)

jq -Rs '{"hookSpecificOutput": {"hookEventName": "SessionStart", "additionalContext": "Current project status:\n" + .}}' <<< "$content"
