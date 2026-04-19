---
name: quality-gate
description: PMO guide for running a quality gate cycle — Review → Clear → Verify. Invoked by sprint-next when a quality gate sprint is detected. Handles automated gates, manual testing, findings documentation, and the Clear/Verify loop.
---

# Quality Gate

Review → Clear → Verify. One complete cycle. May loop (Clear → Verify again) until Verify is clean.

---

## Rules

**Cadence** (enforced by sprint-next before invoking this skill):
- Soft rule: after every 2 feature sprints
- Hard rule: never more than 3 consecutive feature sprints

**Scope boundary — Clear sprints only:**
Fix only what Review found. No new features. No backlog items. Anything outside the findings list is deferred.

**Exit gate:** Verify must return zero findings. No partial exit.

**Loop limit:** Maximum 3 loops. If 3rd Verify fails — stop. Escalate to Thomas before proceeding.

**Subdivision:** Only Clear sprints may be subdivided (Clear-a, Clear-b) when findings exceed the 180K token ceiling. Always flag to Thomas before splitting — never subdivide silently.

---

## Your Steps — Review Sprint

> Review sprints span multiple sessions. SPRINT_PLAN.md is persistent memory — write findings continuously, not at the end.

### Step 1: Load Context and Detect Resume

Read `docs/PROJECT_STATUS.md` and the sprint's `SPRINT_PLAN.md` header.

- Status `IN PROGRESS` → go to **Review Resume Path** below immediately
- Status `PENDING` → fresh start, continue Step 2

Read `docs/TECH_STACK.md`, `docs/DECISIONS.md`, `docs/LEARNINGS.md` — once.

### Step 2: Pre-Planning Check

Present to Thomas:
- Manual steps likely needed (migrations, credentials, device testing)
- Whether Thomas needs to stay present (complex domain, security-critical, schema changes)

Ask: **"Do you want to pre-approve? (yes/no)"**
- Yes → spawn plan sub-agent (Step 3) → verify entry criteria → spawn automated gates sub-agent — one sweep
- No → spawn plan sub-agent → present plan → Thomas approves → verify entry criteria → spawn automated gates sub-agent

### Step 3: Sprint Plan

If `SPRINT_PLAN.md` missing: spawn `general-purpose` sub-agent with `plan` skill (Mode B). Review sprint plan = test script with Findings Log, Current State block, Live Clear Draft section, Resume From marker. Use structure from `quality-gate/references/review-sprint-template.md`.

If exists: read header only — confirm PENDING.

### Step 4: Thomas's Approval Gate

*(Only if Thomas said No in Step 2)*

Present plan. Ask: **"Do you approve or anything to discuss?"**
Hard gate — do not proceed until explicitly approved.

### Step 5: Verify Entry Criteria

For each entry criterion: verify it is actually met, not assumed.
- State facts → confirm via `PROJECT_STATUS.md`
- External tooling → run check or ask Thomas to confirm
If unmet: resolve blocker before proceeding.

### Step 6: Automated Gates

Spawn `general-purpose` sub-agent with automated gates prompt below.
Wait for gate results. After gates pass: set `SPRINT_PLAN.md` Status to `IN PROGRESS`, write session start date. Do this before presenting the first scenario to Thomas.

### Step 7: Manual Test Session

Thomas tests scenarios on real devices.

**Hotfix threshold:** Fix inline only if it blocks continuation of the test session itself. Document as `HOTFIX APPLIED` in Findings Log. Everything else deferred to Clear.

For each area:
1. Present scenario: role, action, expected outcome
2. Thomas tests: pass / fail / finding
3. Record result immediately — do not defer
4. Finding → add to Findings Log immediately (severity: fix/defer/note, root cause, fix approach)
5. Finding going to Clear → add task stub to Live Clear Draft immediately
6. After each area completes → write `SPRINT_PLAN.md` to disk

**Interruption protocol — when Thomas signals a break:**
1. Write any partial results from current area
2. Update Current State block: accounts, roles, test data, areas done/pending/in progress
3. Write `**RESUME FROM: Area X — scenario Y.ZZ**` prominently
4. Confirm state with Thomas
5. Spawn `general-purpose` sub-agent with `git` skill → commit in-progress plan
6. Stop

### Step 8: Triage and Clear Sprint Draft

Live Clear Draft already has task stubs from Step 7. Finalise — do not rebuild from scratch.

**Budget rule:** Clear sprint ceiling = 180K.
1. If over: confirm nothing can be deferred (in a quality gate, nothing found in Review may skip to a feature sprint)
2. If still over → split Clear-a / Clear-b — flag to Thomas first, never split silently

Spawn `general-purpose` sub-agent with `plan` skill (Mode D) to convert Live Clear Draft into proper `SPRINT_PLAN.md`.

After the plan sub-agent returns: spawn a judge sub-agent (`general-purpose`, no skill). Provide the full Findings Log and instruct: "You did not build this codebase. Review each finding independently. Score severity (critical/major/minor), identify root cause category, and recommend fix approach. Do not defer to the builder's framing." Incorporate judge scores into the Clear sprint plan priorities.

### Step 9: Closure

1. If Review found nothing → skip Clear entirely, insert Verify sprint directly
2. Update `docs/PROJECT_STATUS.md` — mark Review closed, set Clear (or Verify if nothing found) as next pending
3. Fill `SPRINT_PLAN.md` actuals, set Status `CLOSED`
4. Append entry to `docs/LEARNINGS.md` (format: `sprint-zero/references/planning-docs-structure.md`)
5. Scan for new constraints → `docs/TECH_STACK.md` immediately; new decisions → `docs/DECISIONS.md` in ADR format
6. Remove Review sprint entry from `docs/IMPLEMENTATION_PLAN.md`
7. Spawn `general-purpose` sub-agent with `git` skill → commit and push

---

## Your Steps — Verify Sprint

> Re-tests only areas that had findings from Review. Zero findings = cycle closes. Findings = loop back to Clear.

### Step 1: Load Context and Count Loops

Read `docs/PROJECT_STATUS.md` and the preceding Clear sprint's `SPRINT_PLAN.md`. Count Clear→Verify loops completed so far in this quality gate.

If loop count = 3 and this Verify is expected to fail → stop before running anything. Escalate to Thomas.

### Step 2: Automated Gates

Spawn `general-purpose` sub-agent with automated gates prompt below. Wait for pass.

### Step 3: Focused Manual Re-test

Re-run the test script from the preceding Review sprint — **only the areas that had findings**. Areas that passed Review cleanly are not re-tested. Present each scenario; Thomas confirms pass/fail.

### Step 4: Evaluate Result

**Zero findings:**
1. Quality gate complete
2. Update `docs/PROJECT_STATUS.md` — Verify closed, next feature sprint as next pending
3. Fill `SPRINT_PLAN.md` actuals, Status `CLOSED`
4. Append `LEARNINGS.md` entry
5. Remove Verify entry from `docs/IMPLEMENTATION_PLAN.md`
6. Spawn `general-purpose` sub-agent with `git` skill → commit and push
7. **Stop. Build phase resumes.**

**Findings remain:**
1. Loop count = 3 → stop. Escalate to Thomas. Do not insert another Clear.
2. Loop count < 3 → insert new Clear sprint in `docs/IMPLEMENTATION_PLAN.md` (e.g. "Sprint N — [Area] Quality Gate — Clear Pass [loop+1]"). Document only new/unresolved findings. Set as next pending.
3. Fill `SPRINT_PLAN.md` actuals, Status `CLOSED`
4. Append `LEARNINGS.md` entry
5. Spawn `general-purpose` sub-agent with `git` skill → commit and push
6. **Stop. Clear sprint is next.**

---

## Review Resume Path

Triggered when `SPRINT_PLAN.md` Status is `IN PROGRESS` at Step 1.

1. Read full `SPRINT_PLAN.md` — Findings Log, Current State block, Resume From marker, completed areas
2. Say explicitly: "Resuming [Sprint N] review — not starting fresh. [X] areas complete, resuming from Area [Y]."
3. Confirm Current State with Thomas before testing: accounts, roles, test data — things may have changed
4. Continue from first pending area
5. Do NOT re-run plan sub-agent, re-check entry criteria, or repeat completed areas
6. Apply the same real-time writing rules as Step 7

---

## Automated Gates Sub-Agent Prompt

Pass to `general-purpose` sub-agent:

```
You are running the automated phase of [Sprint ID] — a quality gate sprint.

SPRINT PLAN PATH: [path to SPRINT_PLAN.md]
Read only the automated gates section.

CONTEXT PACKAGE:
[TECH_STACK.md — paste full content]
[DECISIONS.md — paste full content]
[LEARNINGS.md — paste full content]

AUTOMATED PHASE:
1. Create task files for automated gate tasks at: docs/sprints/[sprint]/tasks/
   Use template: .claude/skills/sprint-next/references/task-template.md
2. Run: tsc --noEmit, ESLint, vitest
   Fix-verify loop until all pass. Do not proceed with failing gates.
3. If sprint number ≥ 2: invoke smoke-test skill. Hard gate — if any scenario fails, report to PMO and stop. Do not proceed to step 4.
4. Report to PMO: gate results, smoke-test results, token actuals. Then STOP.
   No code fixes beyond automated gates — PMO handles all findings and session management.
```

---

## Quick Reference

```
Sprint name contains "Review"?         → Your Steps — Review Sprint
Sprint name contains "Clear"?          → sprint-next Regular Steps + scope boundary (Review findings only)
Sprint name contains "Verify"?         → Your Steps — Verify Sprint

Automated gates (sprint ≥ 2):         → invoke smoke-test skill after tsc/ESLint/vitest
Smoke test fails?                      → Hard gate — stop, report to PMO, no manual session
Step 8 after plan sub-agent returns:   → spawn judge sub-agent (no skill) on Findings Log → incorporate scores into Clear plan

Review resume check:
SPRINT_PLAN.md IN PROGRESS?            → Resume Path: confirm state → continue from first pending area

Verify loop check:
Loop count = 3 and likely failing?     → Stop. Escalate to Thomas.
Zero findings?                         → Quality gate complete. Build phase resumes.
Findings remain + loop < 3?            → Insert Clear Pass [N+1] → close Verify → git → stop
Findings remain + loop = 3?            → Stop. Escalate to Thomas.
```
