---
name: sprint-next
description: PMO guide for planning and executing feature sprints. Delegates to quality-gate skill for quality gate sprints and version-gate skill for Version Gate sprints.
---

# Sprint Next

Execute any sprint from plan to committed checkpoint.

---

## Sprint Type Detection

Check the sprint name first:
- Contains "Review", "Clear", or "Verify" → invoke `quality-gate` skill
- Contains "Version Gate" → invoke `version-gate` skill
- Neither → follow Regular Sprint steps below

---

## Quality Gate Cadence Check

> Read before every feature sprint.

Count feature sprints since the last Verify closed. If count ≥ 3 → do not proceed. Insert a Review sprint in `docs/IMPLEMENTATION_PLAN.md` and flag to Thomas before continuing.

---

## Your Steps — Regular Sprint

*Also applies to Clear sprints — with scope boundary: fix only what Review found. No additions.*

### Step 1: Load Context

Read in order, stop when you have what you need:
1. `docs/PROJECT_STATUS.md` — next pending sprint; review carry-forward list (if any items have become blockers, add them to `IMPLEMENTATION_PLAN.md` before proceeding)
2. That sprint's entry in `docs/IMPLEMENTATION_PLAN.md` — goal, REQ scope, TRACKS
3. `docs/TECH_STACK.md`, `docs/DECISIONS.md`, `docs/LEARNINGS.md` — once

### Step 2: Pre-Planning Check

Present to Thomas:
- Manual steps likely needed this sprint (migrations, credentials, device testing, re-signup requirements)
- Whether Thomas needs to stay present — HITL tasks, complex domain, security-critical decisions

Ask: **"Do you want to pre-approve development? (yes/no)"**
- Yes → spawn plan sub-agent (Step 3) → verify entry criteria → spawn worker sub-agent — one sweep, Thomas walks away
- No → spawn plan sub-agent (Step 3) → stop at Step 4 for Thomas's review

### Step 3: Sprint Plan

If `docs/sprints/sprint-[ID]/SPRINT_PLAN.md` missing:
Optionally invoke `interview` skill (SPRINT-DISCOVERY type) if scope has ambiguities worth clarifying.
Then spawn `general-purpose` sub-agent with `plan` skill (Mode B).

If exists: read header only (Goal, REQ scope, Status) — confirm PENDING.

### Step 4: Thomas's Approval Gate

*(Only if Thomas said No in Step 2)*

Present: sprint name, goal, task list with complexity and token estimates, HITL/AFK summary, open questions.
Ask: **"Do you approve, or is there anything to discuss?"**
Hard gate — do not spawn worker sub-agents until explicitly approved. Iterate until approved.

### Step 5: Verify Entry Criteria

For each entry criterion — verify it is actually met, not assumed:
- State facts → confirm via `PROJECT_STATUS.md`
- External tooling (CLI, env vars, service access, credentials) → run check command or ask Thomas to confirm

If any criterion unmet: resolve blocker with Thomas before proceeding. A worker that hits an environment blocker mid-execution will deviate.

### Step 6: Execute

Check the TRACKS section in `docs/IMPLEMENTATION_PLAN.md`.

**Single track:** spawn one `general-purpose` sub-agent with `tdd` skill + task instructions. Pass: sprint ID, `SPRINT_PLAN.md` path, full `TECH_STACK.md` + `DECISIONS.md` + `LEARNINGS.md` content.

**Multiple tracks:** spawn prerequisite sub-agent first (if prerequisites listed), wait for completion, then spawn all track sub-agents simultaneously. Each gets its track scope plus the same context package.

Worker instructions must include:
- Read `SPRINT_PLAN.md` fully before doing anything else
- Create task files at `docs/sprints/[sprint]/tasks/` using template at `.claude/skills/sprint-next/references/task-template.md`
- Execute only tasks in assigned track scope, in order defined in `SPRINT_PLAN.md`
- Track token usage per task
- Run automated gates (tsc, ESLint, vitest) — fix-verify loop until all pass
- Report to PMO: tasks completed, token actuals, gate results, git status output, concerns
- Then STOP — do not commit, push, or modify docs outside sprint scope

### Step 7: Closure — yours alone

After all sub-agents report complete:
1. Update `docs/PROJECT_STATUS.md`: mark sprint closed, set next pending, replace "Last completed sprint" (2–3 lines, do not accumulate history)
2. Fill `SPRINT_PLAN.md` actuals from sub-agent summaries, set Status `CLOSED`
3. Append entry to `docs/LEARNINGS.md` — format: `sprint-zero/references/planning-docs-structure.md`. "Carry forward to planner" field is most important — make it specific and actionable.
4. Scan sub-agent summaries for new constraints → `docs/TECH_STACK.md` immediately. Do not leave constraints in LEARNINGS only.
5. New architectural decisions → `docs/DECISIONS.md` in ADR format
6. Remove sprint entry from `docs/IMPLEMENTATION_PLAN.md`
7. Spawn `general-purpose` sub-agent with `git` skill → commit and push

**If Clear sprint:** after closure, insert Verify sprint as next pending in `docs/IMPLEMENTATION_PLAN.md` and `PROJECT_STATUS.md`. Do not ask Thomas. Stop.
**Otherwise:** stop. Each sprint is a committed checkpoint.

---

## Quick Reference

```
CADENCE CHECK (before any feature sprint):
Sprints since last Verify closed ≥ 3? → Insert Review sprint. Do not proceed.

Sprint type detection:
"Review"/"Clear"/"Verify" in name? → invoke quality-gate skill
"Version Gate" in name?            → invoke version-gate skill
Neither?                           → Regular Sprint steps

Regular sprint:
Context loaded?      → Pre-planning check → "Do you want to pre-approve? (yes/no)"
Pre-approve YES?     → Plan sub-agent → entry criteria → worker sub-agent (one sweep)
Pre-approve NO?      → Plan sub-agent → present plan → Thomas approves → entry criteria → worker
Workers done?        → Closure → git sub-agent → stop
Clear sprint?        → After closure: insert Verify as next pending → stop
```
