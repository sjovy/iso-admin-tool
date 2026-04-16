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

Sprints listed in sequence, each with:
- Sprint ID, goal, and scope
- Feature list with complexity indicators [SIMPLE/MEDIUM/COMPLEX]
- Domain hints (security-critical, performance-sensitive, UI-heavy, etc.)
- Entry/exit criteria
- Quality gates (linting, unit tests, integration tests, UI tests)
- Token budget (see workflow in SKILL.md for calculation rules)

**Optional TRACKS section** — include only when a sprint has genuinely independent parallel tracks with disjoint file sets:
```
**Tracks:**
- Prerequisites: [shared work before parallel split — or "None"]
- Track 1 — [Name]: [scope and file boundaries]
- Track 2 — [Name]: [scope and file boundaries]
```
Omit entirely for single-track sprints. The PMO reads this to determine how many Workers to spawn.

**Forbidden in sprint entries:**
- Detailed task breakdown (reserved for tactical sprint plan)
- Agent assignments (determined at execution time)
- Model assignments (determined at execution time)

### Sprint 1 — Mandatory First Entry: Tech Stack Scaffolding

Sprint 1 must always be the first sprint entry in the plan. No feature sprint may come before it. It covers the working installable skeleton that all subsequent sprints depend on.

**Minimum scope for Sprint 1** (include all that apply to the project):
- Project scaffold: framework, language, build tool, styling library
- Authentication: sign-up, sign-in, sign-out, session persistence
- Database / backend: schema, connection, base RLS or access control
- Deployment pipeline: hosting provider, environment variables, CI/CD
- Base routing: auth guard, public vs. protected routes
- PWA / offline shell: manifest, service worker registration (if applicable)
- Smoke test: app loads, auth works end-to-end, deploys cleanly from fresh clone

**Exit criteria must include:**
- App runs locally from a fresh clone with only documented setup steps
- App deploys successfully to the target hosting environment
- Auth flow works end-to-end
- `tsc --noEmit` passes, ESLint passes

### Quality Cycle — Review Sprint Entry

Plan only the Review sprint upfront. Clear and Verify sprints are generated dynamically from Review findings — do NOT pre-plan them at Sprint 0.

Insert a Review sprint after every 2 feature sprints. Hard maximum: no more than 3 consecutive feature sprints before a Review.

```
### Sprint [N] — [Name] Quality Cycle — Review

**Type:** Review
**REQ scope:** None — validation only
**Validates:** Sprint [X], Sprint [Y], Sprint [Z]
**Domain:** [which flows, modules, roles are in scope]
**Token budget:** ~50K EST (automated gates) + manual session time
**Entry criteria:** Sprint [preceding] complete
**Exit criteria:** All test scenarios completed, findings documented, Clear sprint scope defined (or marked empty if nothing found)
```

**After Review completes:** Clear and Verify sprints are inserted dynamically by the PMO from findings.

"Review", "Clear", and "Verify" must appear in their respective sprint names — used for automatic detection by sprint-next.

### PROJECT_STATUS.md Initialization

Initialize with Sprint 0 marked complete and Sprint 1 as the next pending sprint.

---

## PROJECT_STATUS.md

Living document updated at the start and end of every sprint. Keep it short — the PMO reads this on every sprint start and context is finite.

**Fixed sections (always present):**
- **Active sprint** — ID, goal, current state (or "None")
- **Last completed sprint** — 2-3 lines max: goal achieved, key outcome, one learning. Replace this entry each sprint — do not accumulate history. Full records live in SPRINT_PLAN.md actuals.
- **Next pending sprint** — ID, goal, entry criteria met/blocked
- **Open blockers** — anything preventing the next sprint from starting
- **Carry-forward items** — bugs, deferred decisions, QA items that need future attention. Each item: description, why deferred, when to address. Remove items when resolved.

Initialized at Sprint 0 with Sprint 0 marked complete and Sprint 1 as next pending.

---

## TECH_STACK.md

- Each layer (framework, language, styling, ORM, DB, auth, AI, hosting) with exact version
- Key constraints agents must know (e.g. "NextAuth v5 not v4 — API differs significantly")
- Gotchas discovered or anticipated (e.g. "Prisma requires both DATABASE_URL and DIRECT_URL for Supabase")
- Non-negotiables (TypeScript strict mode, no credentials in source, etc.)

---

## DECISIONS.md

**Single responsibility: the *why*.** Do NOT duplicate constraints, gotchas, or version notes already captured in TECH_STACK.md. If a decision's consequence is a constraint (e.g. "use proxy.ts not middleware.ts"), that constraint belongs in TECH_STACK.md only — not repeated here.

Each entry in ADR format:

| Field | Content |
|-------|---------|
| **ID** | DEC-XXX |
| **Status** | `decided` \| `pending` \| `superseded` |
| **Context** | Why this decision was needed |
| **Decision** | What was chosen |
| **Rationale** | Why this option was selected |
| **Alternatives Rejected** | Other options considered and why rejected |

Pending decisions must note what they block and who owns the decision.
Updated at the start of each sprint when new decisions arise.

---

## LEARNINGS.md

Append-only log. One entry per completed sprint. Read by planner before every sprint plan — structure matters.

Created at Sprint 0 with header only. Each entry uses this format:

```markdown
## Sprint [ID] — [Name] — [Date]

**Tokens:** [actual]K of [budget]K ([+N% over] / [-N% under])
**Over-ran:** [task — reason] or None
**Under-ran:** [task — reason] or None

**Surprises / failures:** [what was unexpected or broke]

**Carry forward to planner:** [actionable patterns — what to do differently, constraints to remember, estimation adjustments]
```

The last field is the most important — it is the direct input to future sprint planning.
