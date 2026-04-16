# Methodology Dependency Map

When a discrepancy is found in any file, use this map to trace upstream and downstream before closing the fix. Rules: fix immediately, check both directions, propagate .claude/ changes to template.

---

## .claude/ Files

| File | Upstream (depends on) | Downstream (consumed by) | Template? |
|------|-----------------------|--------------------------|-----------|
| `.claude/CLAUDE.md` | global `~/.claude/CLAUDE.md` conventions | PMO behaviour at session start; invokes skills | YES |
| `.claude/skills/interview/SKILL.md` | `.claude/CLAUDE.md` | PMO direct execution — KICKOFF, PLAN-REVIEW, SPRINT-DISCOVERY, CLARIFY, MILESTONE-PLANNING | YES |
| `.claude/skills/plan/SKILL.md` | `planning-docs-structure.md`; `plan/references/deep-modules.md` | General-purpose sub-agent spawned by sprint-zero, sprint-next, quality-gate, version-next | YES |
| `.claude/skills/git/SKILL.md` | none | General-purpose sub-agent spawned by sprint-zero, sprint-next, quality-gate, version-gate, version-next | YES |
| `.claude/skills/tdd/SKILL.md` | `tdd/references/` files | General-purpose sub-agent spawned by sprint-next Step 6 (worker execution) | YES |
| `.claude/skills/sprint-zero/SKILL.md` | `interview/SKILL.md`; `plan/SKILL.md`; `git/SKILL.md` | PMO project initiation | YES |
| `.claude/skills/sprint-next/SKILL.md` | `interview/SKILL.md`; `plan/SKILL.md`; `tdd/SKILL.md`; `git/SKILL.md`; `quality-gate/SKILL.md`; `version-gate/SKILL.md` | PMO sprint execution | YES |
| `.claude/skills/quality-gate/SKILL.md` | `plan/SKILL.md`; `git/SKILL.md`; `quality-gate/references/review-sprint-template.md`; `planning-docs-structure.md` | PMO quality gate execution — invoked by sprint-next | YES |
| `.claude/skills/version-gate/SKILL.md` | `quality-gate/SKILL.md` (automated gates prompt); `git/SKILL.md` | PMO version gate execution — invoked by sprint-next | YES |
| `.claude/skills/version-next/SKILL.md` | `interview/SKILL.md`; `plan/SKILL.md`; `git/SKILL.md` | PMO version loop re-entry | YES |
| `.claude/skills/sprint-next/references/task-template.md` | `sprint-next/SKILL.md` (referenced in worker instructions) | Sub-agent task file creation | YES |
| `.claude/skills/quality-gate/references/review-sprint-template.md` | `quality-gate/SKILL.md` (referenced in Step 3) | Plan sub-agent Mode B for review sprints | YES |
| `.claude/skills/sprint-zero/references/planning-docs-structure.md` | `sprint-zero/SKILL.md`; `plan/SKILL.md` | LEARNINGS.md entry format; sprint-next closure; plan sub-agent output format | YES |
| `.claude/skills/plan/references/deep-modules.md` | `plan/SKILL.md` | Plan sub-agent design principles | YES |
| `.claude/skills/fix-compliance/references/dependency-map.md` | all files listed here | tracing exercise (this file) | YES |

---

## docs/ Files

| File | Upstream (depends on) | Downstream (consumed by) | Template? |
|------|-----------------------|--------------------------|-----------|
| `docs/PRD.md` | KICKOFF interview findings | `IMPLEMENTATION_PLAN.md` (REQ codes); all sprint entries (REQ scope) | NO |
| `docs/PROJECT_STATUS.md` | sprint-next closure (PMO writes); `SPRINT_PLAN.md` actuals | sprint-next Step 1 (next pending); entry criteria check | NO |
| `docs/IMPLEMENTATION_PLAN.md` | `PRD.md` (REQ codes); plan sub-agent Mode A; sprint-next closure (entries removed) | sprint-next Step 1 (sprint entry); plan sub-agent Mode B input; sub-agent TRACK SCOPE | NO |
| `docs/TECH_STACK.md` | Sprint 0 plan sub-agent; sprint-next closure (new gotchas/constraints) | Sub-agent context package (every sprint); plan sub-agent Mode B | NO |
| `docs/DECISIONS.md` | Sprint 0 plan sub-agent; sprint-next closure (new ADRs) | Sub-agent context package (every sprint); plan sub-agent Mode B | NO |
| `docs/LEARNINGS.md` | sprint-next closure; quality-gate closure; `planning-docs-structure.md` (format) | Sub-agent context package (every sprint); plan sub-agent Mode B ("carry forward" field) | NO |
| `docs/sprints/N/SPRINT_PLAN.md` | plan sub-agent Mode B; `IMPLEMENTATION_PLAN.md`; `TECH_STACK.md`; `LEARNINGS.md` | Sub-agent (reads fully before executing); PMO closure (actuals + status) | NO |
| `docs/sprints/N/tasks/task-NN.md` | `task-template.md` (format); `SPRINT_PLAN.md` (content) | Sprint audit trail only — not read by subsequent agents | NO |

---

## Agent Pattern

All execution delegated to `general-purpose` sub-agents guided by skills. No custom agent types.

| Task | Agent | Skill |
|------|-------|-------|
| Interview | PMO directly | `interview` |
| Planning (all modes) | `general-purpose` | `plan` |
| Git operations | `general-purpose` | `git` |
| Feature implementation | `general-purpose` | `tdd` + task instructions |
| Automated gates | `general-purpose` | instructions in `quality-gate/SKILL.md` |
| Codebase exploration | `Explore` (factory) | none |
| Web research | `general-purpose` (factory) | none |

---

## Template Propagation

Any fix to a `.claude/` file must be copied to `project-template-copy-this/.claude/` and committed there in the same session. No fix is complete until it exists in the template.

Template repo path: `C:/Users/ThomasSjovy/ClaudeCode/coding/project-template-copy-this`

---

## Quick Trace Checklist

Found a discrepancy in a `.claude/` file?
1. Fix it here
2. Check its Upstream column — does the fix contradict anything there?
3. Check its Downstream column — does the fix break any consumer?
4. Propagate to template repo + commit both

Found a discrepancy in a `docs/` file?
1. Fix it here
2. Check its Upstream column — is the source of truth also wrong?
3. Check its Downstream column — does anything that reads this file now have stale data?
4. No template propagation needed for docs/
