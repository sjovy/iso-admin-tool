#!/bin/bash
# Budget ceiling guard — validates SPRINT_PLAN.md total token estimate does not exceed 200K.
# Runs as a PostToolUse hook on Write|Edit. Blocks if ceiling is exceeded.

file_path=$(python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    ti = d.get('tool_input', {})
    print(ti.get('file_path') or ti.get('path') or '')
except:
    pass
" 2>/dev/null)

if [[ "$file_path" != *"SPRINT_PLAN.md" ]]; then
  exit 0
fi

# Extract the Total line — matches patterns like "| **Total** | **40K** |" or "| **Total** | 40K |"
total_k=$(python3 -c "
import re, sys
try:
    content = open('$file_path').read()
    m = re.search(r'[Tt]otal.*?(\d+)K', content)
    if m:
        print(m.group(1))
except:
    pass
" 2>/dev/null)

if [ -z "$total_k" ]; then
  exit 0
fi

if [ "$total_k" -gt 200 ]; then
  printf '{"continue": false, "stopReason": "Sprint budget %dK exceeds the 200K ceiling. Re-scope before proceeding — split tasks, defer items, or divide into two sprints."}' "$total_k"
fi
