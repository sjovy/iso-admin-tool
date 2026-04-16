# Task File Template

**Target location:** `docs/sprints/sprint-[N]/tasks/task-[NN]-[name].md`

---

```markdown
# Task: [Title]

**Sprint:** [N]
**Feature:** [Feature name from SPRINT_PLAN.md]
**Complexity:** [SIMPLE | MEDIUM | COMPLEX]
**Estimated Tokens:** [From SPRINT_PLAN.md]
**Search Scope:** [Exact patterns e.g. "src/auth/*.ts" | "N/A" if no exploration needed]

---

## Context

**Previous work:** [What came before — reference sprint history, git log]
**Current state:** [Relevant files, patterns, dependencies that exist now]
**Purpose:** [Why this task exists — reference sprint goal and REQ codes]

---

## Objective

[Clear, specific goal in 1-2 sentences. What must exist when this task is done?]

---

## Steps

1. [Specific, actionable step with exact file paths]
2. [Batch reads: "Read file1.ts AND file2.ts AND file3.ts"]
3. [Pattern reference: "Follow pattern from src/foo.ts:45-67"]
4. [Exploration: "Search {Search Scope} for {specific pattern}"]
5. [Continue with numbered steps to completion]
6. [Verification step: "Run npm test — expect X passing"]

---

## Patterns to Follow

- **Location:** `file/path:line-range`
- **What it shows:** [Explain the pattern]
- **Apply to:** [Where/how to use it]

---

## Acceptance Criteria

- [ ] [Specific, testable condition]
- [ ] [Integration: "Works with existing X"]
- [ ] [Tests: "npm test passes"]
- [ ] [Token usage within estimate]

---

## Verification

**Command:**
```bash
[Exact command to verify completion]
```

**Expected result:** [What success looks like — be specific]

---

## Notes

[Tech constraints from TECH_STACK.md relevant to this task]
[Learnings from LEARNINGS.md relevant to this task]
[Any gotchas or warnings]

**Token tracking:** Record actual tokens in SPRINT_PLAN.md after completion.
```

---

## Pre-flight Checklist

Before beginning execution, verify:

- [ ] No placeholders — all file paths are exact
- [ ] Context explains "why" and "what came before"
- [ ] Objective is specific — one clear deliverable
- [ ] Steps are numbered and actionable
- [ ] Patterns referenced where applicable
- [ ] Acceptance criteria are testable
- [ ] Verification command is specific
- [ ] Token estimate is realistic
- [ ] Search scope is narrow (or N/A)
- [ ] TECH_STACK.md constraints included in Notes
- [ ] Relevant LEARNINGS.md patterns included in Notes
- [ ] Remaining sprint token budget is sufficient

**Simulation test:** Read this task file as if you have zero prior context. Can you execute it without asking questions? If not, revise.
