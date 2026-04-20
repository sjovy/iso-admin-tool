---
name: fix-compliance
description: PMO procedure for handling any discrepancy found in methodology or project files. Covers fix, upstream/downstream dependency traversal, and template propagation. Invoke immediately when any inconsistency is found in .claude/ or docs/ files.
---

# Fix Compliance

Invoke immediately when any discrepancy is found in `.claude/` or `docs/` files. Do not defer, log, or continue other work first.

**Discrepancy includes:** missing steps, contradictory rules between skills, a skill calling another skill in a way the callee no longer supports, gaps between methodology and reality, self-review checklist failures, inconsistencies introduced by a skill edit.

---

## Steps

### Step 1: Identify

State the discrepancy precisely:
- Which file contains the problem
- What the rule currently says
- What it should say
- What downstream effect the current state causes

### Step 2: Fix

Make the correction in the affected file. Do not fix adjacent issues in the same edit — one discrepancy per fix-compliance run.

### Step 3: Trace Upstream

Read `.claude/rules/dependency-map.md`. Find the fixed file's **Upstream** column — these are the skills/files that call or depend on this file.

For each upstream caller: does this change break any assumption the caller makes? If yes, fix the caller too. Repeat Step 3 for each caller fixed.

### Step 4: Trace Downstream

Find the fixed file's **Downstream** column — these are the skills/files this file calls or references.

For each downstream callee: does this change contradict any rule in the callee? If yes, fix the callee too. Repeat Step 4 for each callee fixed.

### Step 5: Propagate to Template

All `.claude/` changes must be mirrored to `C:/Users/ThomasSjovy/ClaudeCode/coding/project-template-copy-this`.

Copy every modified `.claude/` file to the same relative path in the template repo. `docs/` changes stay project-local — do not propagate them.

### Step 6: Commit Both Repos

Spawn `general-purpose` sub-agent with `git` skill for each repo:
1. Commit iso-admin-tool changes: message `fix(methodology): [brief description]`
2. Commit project-template-copy-this changes: same message

Both commits must reference the same discrepancy. Do not commit one without the other.

---

## Quick Reference

```
Discrepancy found?
  → Identify precisely → Fix → Trace Upstream → Trace Downstream → Fix inconsistencies → Propagate to template → Commit both repos
```
