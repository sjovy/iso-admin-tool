# Planning Docs Structure Reference

Required content specifications for Sprint 0 documentation outputs.

---

## PRD.md

- Product vision and goals
- All feature requirements with REQ-XXX tracking codes
- Constraints and non-negotiables
- Out-of-scope items

`IMPLEMENTATION_PLAN.md` references REQ codes but does NOT duplicate feature descriptions — `PRD.md` is the single source of truth for requirements.

---

## IMPLEMENTATION_PLAN.md

Two sections:

### 1. Milestone Horizon

Current version loop (full sprint detail) + next 2–3 milestones as vision statements only (goal, no sprint detail). Acknowledge that milestones beyond that are unknown.

**Cadence reminder at top of sprint table:**
*"Hard rule: no more than 3 consecutive feature sprints before a quality gate."*

### 2. Current Version Loop Sprints

Sprints listed in sequence, each with:
- Sprint ID, goal, and REQ scope
- Feature list with complexity indicators `[SIMPLE/MEDIUM/COMPLEX]` and `HITL/AFK` label
- Domain hints (security-critical, performance-sensitive, UI-heavy, etc.)
- Entry/exit criteria
- Quality gates (tsc, ESLint, vitest, manual)
- Token budget

**Optional TRACKS section** — include only when a sprint has genuinely independent parallel tracks with disjoint file sets:
```
**Tracks:**
- Prerequisites: [shared work before parallel split — or "None"]
- Track 1 — [Name]: [scope and file boundaries]
- Track 2 — [Name]: [scope and file boundaries]
```
Omit entirely for single-track sprints.

**Forbidden in sprint entries:**
- Detailed task breakdown (reserved for SPRINT_PLAN.md)
- Agent assignments (determined at execution time)
- Model assignments (determined at execution time)

### Sprint 1 — Mandatory First Entry: Tech Stack Scaffolding

Sprint 1 must always be the first sprint entry. No feature sprint may come before it.

**Minimum scope:** framework scaffold, auth, database setup, deployment pipeline, base routing, smoke test.

**Exit criteria must include:**
- App runs locally from a fresh clone with only documented setup steps
- App deploys successfully to the target hosting environment
- Auth flow works end-to-end
- `tsc --noEmit` passes, ESLint passes

### Quality Gate Sprint Entries — Review Only

Pre-plan Review sprints only. Clear and Verify are generated dynamically from Review findings — do NOT pre-plan them at Sprint 0.

Insert a Review sprint after every 2 feature sprints. Hard maximum: no more than 3 consecutive feature sprints before a Review.

```
### Sprint [N] — [Name] Quality Gate — Review

**Type:** Review
**REQ scope:** None — validation only
**Validates:** Sprint [X], Sprint [Y], Sprint [Z]
**Domain:** [which flows, modules, roles are in scope]
**Token budget:** ~50K EST (automated gates) + manual session time
**Entry criteria:** Sprint [preceding] complete
**Exit criteria:** All test scenarios completed, findings documented, Clear sprint scope defined (or marked empty if nothing found)
```

**After Review completes:** Clear and Verify sprints are inserted dynamically by the PMO.

"Review", "Clear", and "Verify" must appear in their respective sprint names — used for automatic detection by sprint-next.

### PROJECT_STATUS.md Initialization

Initialize with Sprint 0 marked complete and Sprint 1 as the next pending sprint.

---

## PROJECT_STATUS.md

Living document updated at the start and end of every sprint. Keep it short.

**Fixed sections (always present):**
- **Active sprint** — ID, goal, current state (or "None")
- **Last completed sprint** — 2–3 lines max: goal achieved, key outcome, one learning. Replace this entry each sprint — do not accumulate history.
- **Next pending sprint** — ID, goal, entry criteria met/blocked
- **Open blockers** — anything preventing the next sprint from starting
- **Carry-forward items** — bugs, deferred decisions, QA items. Each item: description, why deferred, when to address. Remove when resolved.

---

## TECH_STACK.md

- Each layer (framework, language, styling, ORM, DB, auth, AI, hosting) with exact version
- Key constraints agents must know (e.g. "NextAuth v5 not v4 — API differs significantly")
- Gotchas discovered or anticipated
- Non-negotiables (TypeScript strict mode, no credentials in source, etc.)

---

## DECISIONS.md

**Single responsibility: the *why*.** Do NOT duplicate constraints or version notes already in TECH_STACK.md.

Each entry in ADR format:

| Field | Content |
|-------|---------|
| **ID** | DEC-XXX |
| **Status** | `decided` \| `pending` \| `superseded` |
| **Context** | Why this decision was needed |
| **Decision** | What was chosen |
| **Rationale** | Why this option was selected |
| **Alternatives Rejected** | Other options considered and why rejected |

---

## LEARNINGS.md

Append-only log. One entry per completed sprint. Read by plan sub-agent before every sprint plan.

Created at Sprint 0 with header only. Each entry:

```markdown
## Sprint [ID] — [Name] — [Date]

**Tokens:** [actual]K of [budget]K ([+N% over] / [-N% under])
**Over-ran:** [task — reason] or None
**Under-ran:** [task — reason] or None

**Surprises / failures:** [what was unexpected or broke]

**Carry forward to planner:** [actionable patterns — what to do differently, constraints to remember, estimation adjustments]
```

The last field is the most important — it is the direct input to future sprint planning.
