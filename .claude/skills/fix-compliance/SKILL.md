---
name: fix-compliance
description: PMO procedure for handling any discrepancy found in methodology or project files. Covers fix, upstream/downstream tracing via dependency-map, template propagation, and commit. Invoke immediately when any discrepancy is detected.
---

# Fix Compliance — PMO Guide

Invoke this skill the moment any discrepancy is found — in any `.claude/` file, any `docs/` file, or any agent behaviour. Do not defer, log, or continue other work until this procedure is complete.

---

## What Counts as a Discrepancy

- A step missing from a skill that should be there
- An agent instruction that produces the wrong behaviour
- A rule that is incomplete, ambiguous, or contradicted by another rule
- A document that is inconsistent with another document
- A gap between what the methodology prescribes and what actually happens
- A self-review checklist that does not catch a known failure mode

## What Does NOT Count

- Improvements, enhancements, or nice-to-haves → normal planning
- Differences in style or formatting that do not affect behaviour

---

## Procedure

### Step 1 — Identify

State clearly:
- Which file contains the discrepancy
- What is wrong (missing step, contradiction, wrong behaviour)
- What the correct state should be

### Step 2 — Fix

Apply the fix now. Do not proceed until the file is corrected.

### Step 3 — Trace Upstream

Open `.claude/rules/dependency-map.md`. Find the fixed file's row. Check its **Upstream** column.

For each upstream dependency:
- Is the fix consistent with what that file says?
- Does the upstream file itself need updating to align with the fix?

Fix any misalignments before continuing.

### Step 4 — Trace Downstream

Same row, check the **Downstream** column.

For each downstream consumer:
- Does the fix change what that file or agent receives?
- Does any downstream file need updating to stay consistent?

Fix any misalignments before continuing.

### Step 5 — Template Propagation

Check the **Template?** column for the fixed file.

**If YES:** Copy the fixed file to `project-template-copy-this/.claude/` at the same relative path. Verify the copy is identical. Commit to the template repo with a clear message describing what was wrong and what was corrected. This step is mandatory — the fix is not complete until it exists in the template.

**If NO:** Skip.

### Step 6 — Commit

Every methodology fix gets its own commit. Message format:
```
fix: [what was wrong and what was corrected]
```

Spawn `git-expert` to commit and push. For `.claude/` fixes: commit the template repo. For `docs/` fixes: commit the project repo.

---

## Reference

Dependency map: `.claude/skills/fix-compliance/references/dependency-map.md`
Template repo: `C:/Users/ThomasSjovy/ClaudeCode/coding/project-template-copy-this`
