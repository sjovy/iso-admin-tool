---
name: sprint-zero
description: PMO guide for Sprint 0 — new project initiation. Structures the full discovery-to-docs sequence: KICKOFF interview, implementation planning, five supporting docs, and version control. Ends with all six docs committed. No code is written in Sprint 0 — tech stack scaffolding is Sprint 1.
---

# Sprint Zero — PMO Guide

Initiate a new project: **Interview → Plan → Docs → Commit → STOP**

Sprint 0 produces six documents and nothing else. All code — including tech stack scaffolding — begins in Sprint 1, which the planner will include as the mandatory first sprint in the implementation plan.

---

## Your Steps

### Step 1: KICKOFF Interview

Invoke the **interview skill** — KICKOFF type. Conduct the conversation with Thomas directly (this is your conversation, no agent involved).

Go as deep as possible. Do not move to Step 2 until the pre-handoff checklist in the interview skill is complete.

### Step 2: Create Implementation Plan

Spawn `planner` agent with the [Planner Prompt — Implementation Plan] below.

Planner writes `docs/IMPLEMENTATION_PLAN.md` and `docs/PRD.md` and returns a summary. Do not ask for or hold the full file contents.

### Step 3: Thomas's Approval Gate

Invoke the **interview skill** — PLAN-REVIEW type. Present the plan summary to Thomas: sprint count, sprint goals, token budgets, open questions from planner.

**Hard gate — do not proceed until Thomas explicitly approves.** If Thomas raises issues, re-spawn planner with specific revision instructions. Iterate until approved.

### Step 4: Create Remaining Docs

Spawn `planner` agent with the [Planner Prompt — Remaining Docs] below (planner Mode C).

Planner writes four docs and returns confirmation. Do not hold file contents.

### Step 5: Write Sprint 0 LEARNINGS Entry

Write the Sprint 0 entry directly into `docs/LEARNINGS.md`. Do not spawn an agent — write it yourself.

Cover:
- Tokens: N/A (conversational sprint)
- Surprises / failures: anything unexpected during the KICKOFF, plan review, or doc creation
- Carry forward to planner: decisions, constraints, or patterns the planner must know before Sprint 1

### Step 6: Commit and Push

Spawn `git-expert` agent. It stages, commits, and pushes all Sprint 0 output automatically.

Do not proceed past this step until push succeeds.

### Step 7: STOP

Sprint 0 is complete. All six docs exist, LEARNINGS is written, everything is committed. Await Thomas's signal before Sprint 1.

---

## Planner Prompt — Implementation Plan

Spawn `planner` agent with this prompt, filling in your interview findings:

---
```
OBJECTIVE: Create the implementation plan and PRD for this project. (planner Mode A)

OUTPUT PATHS:
- docs/PRD.md (write this first — IMPLEMENTATION_PLAN.md references it)
- docs/IMPLEMENTATION_PLAN.md

PROJECT SUMMARY:
[2-3 sentences on what this project is and why it exists]

INTERVIEW FINDINGS:
[Key discoveries — user needs, feature scope, constraints, out-of-scope items]

REQ CODES CAPTURED (draft — refine as needed):
[List REQ-XXX codes and brief descriptions from the interview]

HARD CONSTRAINTS:
[Technical, business, or user constraints that must be respected]

MANDATORY RULE — Sprint 1:
Sprint 1 must always be tech stack scaffolding. It must be the first sprint entry in the plan, before any feature sprints. Minimum scope: framework scaffold, auth, database setup, deployment pipeline, base routing, smoke test. Exit criteria must include: app runs from fresh clone, deploys to hosting, auth works end-to-end, tsc and ESLint pass.

MANDATORY RULE — Quality Cycle Cadence:
The implementation plan must embed a Review sprint (quality cycle entry point) after every 2 feature sprints, with a hard maximum of 3 consecutive feature sprints before any Review. Review sprints appear as named entries in the plan (e.g. "Sprint N — [Area] Quality Cycle — Review"). Do NOT pre-plan the paired Clear and Verify sprints — those are generated dynamically from Review findings. The plan must also include a one-line cadence reminder at the top of the sprint overview table: "Hard rule: no more than 3 consecutive feature sprints before a Review sprint."

See .claude/skills/sprint-zero/references/planning-docs-structure.md for full doc specifications.

Return: paths written, key decisions made, open questions for Thomas.
```
---

## Planner Prompt — Remaining Docs

After Thomas approves the implementation plan, spawn `planner` with this prompt:

---
```
OBJECTIVE: Write the four remaining Sprint 0 documents.

ALREADY EXISTS:
- docs/PRD.md
- docs/IMPLEMENTATION_PLAN.md

WRITE THESE FOUR:

docs/PROJECT_STATUS.md
- Sprint 0 marked complete
- Sprint 1 as next pending
- Open blockers: None
- Format: living doc updated at start and end of every sprint

docs/TECH_STACK.md
- Each layer with exact confirmed version: framework, language, styling, ORM/DB, auth, hosting
- Key constraints agents must know (e.g. version-specific API differences)
- Gotchas discovered or anticipated
- Non-negotiables (TypeScript strict mode, no credentials in source, etc.)

docs/DECISIONS.md
- ADR format for each architectural decision
- Fields: ID (DEC-XXX), Status, Context, Decision, Rationale, Alternatives Rejected
- Do NOT duplicate constraints already in TECH_STACK.md — decisions capture "why", TECH_STACK.md captures "what"

docs/LEARNINGS.md
- Header only — content accumulates sprint by sprint
- Format note: one entry per completed sprint (sprint ID, token actuals vs budget, surprises, patterns)

Base all content on docs/PRD.md and docs/IMPLEMENTATION_PLAN.md already on disk.

Return: paths written, anything that needed assumptions flagged.
```
---

## Quick Reference

```
Interview complete?       → Spawn planner → IMPLEMENTATION_PLAN.md + PRD.md
Thomas approves plan?     → Spawn planner → remaining 4 docs
All 6 docs exist?         → Write Sprint 0 LEARNINGS entry yourself
LEARNINGS written?        → Spawn git-expert → commit and push
Pushed?                   → STOP, await Thomas
```
