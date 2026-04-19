# .claude/

**DO NOT DELETE THIS DIRECTORY OR ITS CONTENTS**

This is the PM orchestrator system. Deleting or modifying files here without understanding the impact will break the entire workflow.

---

## Structure

```
skills/          PMO operating guides — invoke these, follow them
design/          Frontend and UX design skills
settings.json    Project-level permissions and hooks — travels with .claude/ to new projects
CLAUDE.md        PMO identity and safety rules — read this first
README.md        This file
```

---

## Development Lifecycle

All projects follow the same lifecycle. The three PMO skills below are the entry points — everything else is delegated.

### `/sprint-zero` — Project Initiation

Used **once per project**. Produces six planning documents and nothing else. No code is written here.

**Flow:** Interview → Plan → Approval → Remaining Docs → LEARNINGS entry → Commit → **STOP**

**Documents produced:**
- `docs/PRD.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/PROJECT_STATUS.md`
- `docs/TECH_STACK.md`
- `docs/DECISIONS.md`
- `docs/LEARNINGS.md`

Thomas must explicitly approve the plan before docs are finalised. Sprint 1 begins only after Thomas signals readiness.

---

### `/sprint-next` — Sprint Execution

Used for **every sprint after Sprint Zero**. Detects the sprint type and routes accordingly.

**Sprint type routing:**
| Sprint name contains | Routes to |
|---|---|
| "Review", "Clear", or "Verify" | `quality-gate` skill |
| "Version Gate" | `version-gate` skill |
| Neither | Regular Sprint steps |

**Quality gate cadence:** A Review sprint is mandatory every 3 feature sprints. If the count hits 3 without a Verify having closed, a Review sprint is inserted automatically and Thomas is notified before proceeding.

**Regular sprint flow:**
1. Load context from `docs/` 
2. Pre-planning check — surface manual steps and HITL requirements
3. Thomas chooses: pre-approve (AFK) or review plan first
4. Spawn plan sub-agent → `SPRINT_PLAN.md`
5. Verify all entry criteria are actually met
6. Spawn TDD worker sub-agent(s) — single or parallel tracks per `IMPLEMENTATION_PLAN.md`
7. PMO closes sprint: update `PROJECT_STATUS.md`, fill actuals, write LEARNINGS entry, update TECH_STACK/DECISIONS if needed, remove sprint from plan, commit and push

Workers execute only. They do not commit, push, or modify docs outside their sprint scope.

---

### `/version-next` — Version Loop Planning

Used **after a Version Gate closes cleanly** and Thomas signals readiness. Lighter than Sprint Zero — project context already exists.

**Flow:** Interview → Plan → Approval → Update Docs → Commit → **STOP**

- Re-anchors vision using Version Gate findings and loop learnings
- Produces a full sprint plan for the next version loop
- Updates `IMPLEMENTATION_PLAN.md` (sprint detail) and milestone horizon (vision only)
- Thomas must explicitly approve before commit

---

## Supporting Skills

These are spawned by the lifecycle skills above — not invoked directly by Thomas.

| Skill | Role |
|---|---|
| `interview` | Structured discovery — KICKOFF, PLAN-REVIEW, SPRINT-DISCOVERY, MILESTONE-PLANNING types |
| `plan` | Architecture and planning documents — Modes A, B, C |
| `tdd` | Sprint execution with red-green-refactor loop |
| `git` | Stage, commit, push |
| `quality-gate` | Review → Clear → Verify cycle |
| `version-gate` | Milestone validation at version boundaries |
| `fix-compliance` | Fixes methodology or project file discrepancies |
| `project-status` | Reports current status from `docs/PROJECT_STATUS.md` |
| `skill-creator` | Creates and improves skills |

---

## Design Skills

Stored in `design/` — frontend and UX skills used during UI sprints.

| Skill | Role |
|---|---|
| `frontend-design` | UI component and layout design |
| `ux-patterns` | UX pattern guidance |
| `scroll-motion` | Scroll and motion design |
| `visual-media` | Visual media handling |
| `site-teardown` | Analyse and deconstruct existing sites |

---

## For New Projects

Copy the entire `.claude/` directory into the new project. `CLAUDE.md` and `settings.json` travel as-is. Run `/sprint-zero` to initiate.
