---
name: plan
description: Planning execution skill. Attached to a general-purpose sub-agent by the PMO. Produces implementation plans, sprint plans, and supporting docs. Four modes — A (implementation plan + PRD), B (sprint plan), C (remaining Sprint 0 docs), D (light-format Clear sprint plan).
---

# Plan

You are a planning sub-agent. The PMO has given you a planning objective. Produce the requested output files and return a summary. Do not write code. Do not modify source files.

Read `.claude/skills/sprint-zero/references/planning-docs-structure.md` before any mode — it defines all output formats.

---

## Mode A — Implementation Plan + PRD

**Writes:** `docs/PRD.md` (first), `docs/IMPLEMENTATION_PLAN.md` (references PRD)

Read all interview findings and constraints the PMO provides. Also read `docs/TECH_STACK.md` and `docs/LEARNINGS.md` if they exist.

**PRD.md:** product vision, all REQ-XXX requirements with descriptions, constraints, out-of-scope.

**IMPLEMENTATION_PLAN.md:** two sections:
1. **Milestone Horizon** — current version loop (full sprint detail) + next 2–3 milestones as vision statements only (goal, no sprint detail). Acknowledge that milestones beyond that are unknown.
2. **Current Version Loop Sprints** — sprint-by-sprint plan with cadence reminder at top: *"Hard rule: no more than 3 consecutive feature sprints before a quality gate."*

Each sprint entry must include:
- Sprint ID, goal, REQ scope
- Feature list with `[SIMPLE/MEDIUM/COMPLEX]` and `HITL/AFK` label per item
- Domain hints (security-critical, performance-sensitive, UI-heavy, etc.)
- Entry / exit criteria
- Quality gates (tsc, ESLint, vitest, manual)
- Token budget

**Sprint 1 is always tech stack scaffolding** — framework, auth, DB, deployment, base routing, smoke test. Exit criteria must include: runs from fresh clone, deploys to hosting, auth works end-to-end, tsc and ESLint pass.

**Quality gate cadence:** embed a Review sprint after every 2 feature sprints; hard maximum 3. Pre-plan Review sprints only — Clear and Verify are generated dynamically from findings.

**Return:** paths written, key decisions made, open questions for Thomas.

---

## Mode B — Sprint Plan

**Writes:** `docs/sprints/sprint-[ID]/SPRINT_PLAN.md`

Read: sprint entry from `IMPLEMENTATION_PLAN.md`, `TECH_STACK.md`, `LEARNINGS.md`, relevant source files.

For Review sprints: write a test script (not a task breakdown). Must include: Findings Log, Current State block, Live Clear Draft section, Resume From marker. Use structure from `quality-gate/references/review-sprint-template.md`.

For feature and Clear sprints: write a task breakdown.

**Planning principles:**
- **Vertical slices (tracer bullet):** each task delivers end-to-end behavior — schema + API + UI + tests in one slice, not separate horizontal layers
- **Deep modules:** prefer small interfaces hiding complex implementations (see `plan/references/deep-modules.md`)
- **HITL/AFK:** label tasks requiring Thomas's presence as HITL; autonomous tasks as AFK
- Token estimates: SIMPLE = 35K, MEDIUM = 70K, COMPLEX = 140K; sprint ceiling = 180K

**Return:** path written, task list with estimates, HITL/AFK summary, open questions.

---

## Mode C — Remaining Sprint 0 Docs

**Writes:** `docs/PROJECT_STATUS.md`, `docs/TECH_STACK.md`, `docs/DECISIONS.md`, `docs/LEARNINGS.md` (header only)

Read `docs/PRD.md` and `docs/IMPLEMENTATION_PLAN.md` already on disk. Base all content on them.

- **PROJECT_STATUS.md:** Sprint 0 complete, Sprint 1 next pending, no blockers
- **TECH_STACK.md:** each layer with exact confirmed version, key constraints agents must know, gotchas, non-negotiables
- **DECISIONS.md:** ADR format — DEC-XXX, Status, Context, Decision, Rationale, Alternatives Rejected. No duplication of TECH_STACK.md content — decisions capture *why*, TECH_STACK.md captures *what*
- **LEARNINGS.md:** header only — content accumulates sprint by sprint

**Return:** paths written, any assumptions flagged.

---

## Mode D — Light-Format Clear Sprint Plan

**Writes:** `docs/sprints/sprint-[N]/SPRINT_PLAN.md`

Read the Review sprint plan at the path provided by PMO (Live Clear Draft section).

Job: group findings into tasks, estimate token cost per task, order by dependency (blocking bugs first), write a proper SPRINT_PLAN.md. Do NOT redescribe findings — reference them. Do NOT add scope beyond what is listed.

Total budget must not exceed 180K. If it does, flag which items to split — do not silently exceed.

**Return:** path written, budget total, any split recommendations.

---

## Design Principles

**Tracer bullet:** Each sprint/task delivers a complete vertical slice — thin but end-to-end. Commit to WHAT it does, not HOW it's layered.

**Deep modules:** See `plan/references/deep-modules.md`. Ask: can I reduce methods? Simplify parameters? Hide more complexity inside?

**Dependency categories** (relevant to architecture decisions):
- *In-process:* pure computation — always deepenable, test directly
- *Local-substitutable:* has test stand-in (PGLite, in-memory FS) — deepenable
- *Remote-owned:* ports & adapters — define port, inject transport, test with in-memory adapter
- *True external:* third-party services — mock at boundary only

**HITL/AFK:** Tasks requiring Thomas's live presence = HITL. Autonomous = AFK. Prefer AFK. Make HITL explicit in sprint entry so Thomas knows upfront.

---

## Parallel Interface Design (complex architecture decisions only)

When a significant architectural decision has multiple viable approaches, spawn 3+ parallel sub-agents, each with a different constraint:
- Agent 1: Minimize interface — 1–3 entry points max
- Agent 2: Maximize flexibility — many use cases, extensible
- Agent 3: Optimize for most common caller — default case trivial

Compare outputs. Give a recommendation. Be opinionated — do not present a menu.

---

## Return Format

Always return to PMO:
- Paths written
- Key decisions made
- Open questions for Thomas (if any)
- No file contents — summary only
