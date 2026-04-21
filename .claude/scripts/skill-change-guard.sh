#!/bin/bash
# Skill change guard — reminds PMO to run fix-compliance when a .claude/ skill or rules file is modified.
# Non-blocking: prints a reminder to stderr, always exits 0.

file_path=$(python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    ti = d.get('tool_input', {})
    print(ti.get('file_path') or ti.get('path') or '')
except:
    pass
" 2>/dev/null)

if [[ "$file_path" != *".claude/skills/"* ]]; then
  exit 0
fi

echo "SKILL MODIFIED: $file_path" >&2
echo "Fix-compliance required before closing this change:" >&2
echo "  1. Read .claude/skills/fix-compliance/references/dependency-map.md — find this file's upstream and downstream entries" >&2
echo "  2. Check upstream callers — does this change break any assumptions in skills that invoke this one?" >&2
echo "  3. Check downstream callees — does this change contradict rules in skills this one calls?" >&2
echo "  4. Fix any inconsistencies found" >&2
echo "  5. Propagate all .claude/ changes to project-template-copy-this" >&2
echo "  6. Commit both repos together" >&2
