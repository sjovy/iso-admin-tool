---
name: sprint-zero
description: PMO guide for Sprint 0 — new project initiation. Interview → Plan → Docs → Commit → STOP. Produces six documents and nothing else. All code begins in Sprint 1.
---

# Sprint Zero

Interview → Plan → Docs → Commit → STOP.

Six documents. No code.

---

## Your Steps

### Step 1: Interview

Invoke `interview` skill — **KICKOFF** type. Go deep. Do not proceed until pre-handoff checklist is complete.

### Step 2: Implementation Plan

Spawn `general-purpose` sub-agent with `plan` skill (Mode A).
Provide: interview findings, REQ codes, hard constraints.
Sub-agent writes `docs/PRD.md` and `docs/IMPLEMENTATION_PLAN.md`. Hold summary only — do not hold file contents.

### Step 3: Thomas's Approval Gate

Invoke `interview` skill — **PLAN-REVIEW** type.
**Hard gate — do not proceed until Thomas explicitly approves.**
If revisions needed: re-spawn plan sub-agent with specific revision instructions. Iterate until approved.

### Step 4: Remaining Docs

Spawn `general-purpose` sub-agent with `plan` skill (Mode C).
Sub-agent writes: `docs/PROJECT_STATUS.md`, `docs/TECH_STACK.md`, `docs/DECISIONS.md`, `docs/LEARNINGS.md` (header only).
Hold summary only.

### Step 5: Sprint 0 LEARNINGS Entry

Write Sprint 0 entry directly into `docs/LEARNINGS.md` yourself. Do not spawn sub-agent.
Cover: tokens (N/A — conversational sprint), surprises during KICKOFF or plan review, carry-forward to planner.

### Step 6: Commit

Spawn `general-purpose` sub-agent with `git` skill → stage, commit, push all Sprint 0 output.
Do not proceed past this step until push succeeds.

### Step 7: Stop

All six docs exist. LEARNINGS written. Everything committed. Await Thomas's signal before Sprint 1.

---

## Quick Reference

```
Interview complete?    → Spawn plan sub-agent (Mode A) → PRD.md + IMPLEMENTATION_PLAN.md
Thomas approves plan? → Spawn plan sub-agent (Mode C) → remaining 4 docs
All 6 docs exist?     → Write Sprint 0 LEARNINGS entry yourself
LEARNINGS written?    → Spawn git sub-agent → commit and push
Pushed?               → STOP, await Thomas
```
