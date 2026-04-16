---
name: version-next
description: PMO guide for planning the next version loop after a Version Gate closes cleanly. Lighter than sprint-zero — project context exists. Interview → Plan → Approval → Docs → Commit → STOP.
---

# Version Next

Plan the next version loop. Triggered after a Version Gate closes cleanly and Thomas signals readiness.

---

## Your Steps

### Step 1: Interview

Invoke `interview` skill — **MILESTONE-PLANNING** type.

Re-anchor vision using Version Gate findings and loop learnings: what did we learn? What does the next milestone need to achieve? What changed in our understanding of the product?

### Step 2: Plan

Spawn `general-purpose` sub-agent with `plan` skill (Mode A — version loop scope).

Provide to sub-agent:
- Interview findings from Step 1
- Current `docs/IMPLEMENTATION_PLAN.md` (existing milestone horizon)
- `docs/TECH_STACK.md`, `docs/DECISIONS.md`, `docs/LEARNINGS.md`

Sub-agent produces:
- Full sprint plan for next version loop (sprint-by-sprint, quality gates at cadence)
- Updated Milestone Horizon section in `docs/IMPLEMENTATION_PLAN.md` (next 2–3 milestones as vision statements only — no sprint detail)

### Step 3: Thomas's Approval Gate

Present plan summary: sprint count, sprint goals, token budgets, open questions from plan sub-agent.

**Hard gate — do not proceed until Thomas explicitly approves.**

If revisions needed: re-spawn plan sub-agent with specific revision instructions. Iterate until approved.

### Step 4: Update Docs

`docs/IMPLEMENTATION_PLAN.md` already updated by plan sub-agent.
Update `docs/PROJECT_STATUS.md` — new version loop active, first sprint as next pending, no blockers.

### Step 5: Commit

Spawn `general-purpose` sub-agent with `git` skill → commit and push.

### Step 6: Stop

Await Thomas's signal to begin Sprint Next for the new loop.

---

## Quick Reference

```
Version Gate clean + Thomas signals? → Invoke interview (MILESTONE-PLANNING)
Interview complete?                  → Spawn plan sub-agent (Mode A, version loop scope)
Plan returned?                       → Present summary → Thomas approves?
Approved?                            → Update PROJECT_STATUS.md → spawn git sub-agent → stop
```
