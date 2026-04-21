# Skill Dependency Map

Maps every `.claude/` skill and script. Use this during fix-compliance Steps 3 and 4.

**Upstream** = what calls / invokes / depends on this file
**Downstream** = what this file calls / invokes / depends on
**Template?** = must be propagated to project-template-copy-this when changed

---

| File | Upstream (callers) | Downstream (callees) | Template? |
|------|--------------------|----------------------|-----------|
| `.claude/CLAUDE.md` | — (entry point) | sprint-next, quality-gate, version-gate, fix-compliance, project-status, git skill | Yes |
| `.claude/settings.json` | — (system config) | All hook scripts | Yes |
| `.claude/skills/sprint-next/SKILL.md` | CLAUDE.md, quality-gate | quality-gate, version-gate, plan, tdd, git, interview (optional), budget-check.sh | Yes |
| `.claude/skills/quality-gate/SKILL.md` | sprint-next | sprint-next (Regular Steps), plan, tdd, git, smoke-test | Yes |
| `.claude/skills/version-gate/SKILL.md` | sprint-next | plan, git | Yes |
| `.claude/skills/plan/SKILL.md` | sprint-next, quality-gate, version-gate, version-next | — | Yes |
| `.claude/skills/tdd/SKILL.md` | sprint-next, quality-gate | — | Yes |
| `.claude/skills/git/SKILL.md` | sprint-next, quality-gate, version-gate, fix-compliance, version-next | — | Yes |
| `.claude/skills/interview/SKILL.md` | sprint-next (optional), version-next | — | Yes |
| `.claude/skills/smoke-test/SKILL.md` | quality-gate | Playwright MCP tools | Yes |
| `.claude/skills/fix-compliance/SKILL.md` | CLAUDE.md (on discrepancy) | git, dependency-map.md | Yes |
| `.claude/skills/version-next/SKILL.md` | CLAUDE.md (on version close) | interview, plan, git | Yes |
| `.claude/skills/project-status/SKILL.md` | CLAUDE.md | docs/PROJECT_STATUS.md | Yes |
| `.claude/skills/skill-creator/SKILL.md` | PMO ad-hoc | — | Yes |
| `.claude/skills/sprint-zero/SKILL.md` | CLAUDE.md (project initiation) | interview, plan, git | Yes |
| `.claude/skills/sprint-next/references/task-template.md` | sprint-next (worker instructions), quality-gate | — | Yes |
| `.claude/skills/quality-gate/references/review-sprint-template.md` | quality-gate Step 3 | Plan sub-agent Mode B for review sprints | Yes |
| `.claude/skills/sprint-zero/references/planning-docs-structure.md` | sprint-zero, plan | LEARNINGS.md entry format; sprint-next closure; plan output format | Yes |
| `.claude/skills/plan/references/deep-modules.md` | plan | Plan sub-agent design principles | Yes |
| `.claude/skills/fix-compliance/references/dependency-map.md` | fix-compliance Steps 3+4 | All .claude/ files | Yes |
| `.claude/scripts/budget-check.sh` | settings.json (PostToolUse hook) | SPRINT_PLAN.md (reads) | Yes |
| `.claude/scripts/skill-change-guard.sh` | settings.json (PostToolUse hook) | dependency-map.md (references) | Yes |
| `.claude/scripts/pre-commit-gate.sh` | settings.json (PreToolUse hook) | pnpm lint, tsc | Yes |
| `.claude/scripts/vitest-on-test-file.sh` | settings.json (PostToolUse hook) | pnpm vitest | Yes |
| `.claude/scripts/session-start.sh` | settings.json (SessionStart hook) | docs/PROJECT_STATUS.md | Yes |
| `docs/PROJECT_STATUS.md` | session-start.sh, sprint-next closure, quality-gate closure | — | No |
| `docs/IMPLEMENTATION_PLAN.md` | sprint-next Step 1, quality-gate Step 1 | — | No |
| `docs/TECH_STACK.md` | sprint-next Step 1 (context package) | — | No |
| `docs/DECISIONS.md` | sprint-next Step 1 (context package) | — | No |
| `docs/LEARNINGS.md` | sprint-next Step 1 (context package) | — | No |
| `docs/PRD.md` | KICKOFF interview findings | IMPLEMENTATION_PLAN.md (REQ codes); all sprint entries (REQ scope) | No |
| `docs/sprints/N/SPRINT_PLAN.md` | plan sub-agent Mode B; IMPLEMENTATION_PLAN.md; context package | Worker (reads fully before executing); PMO closure (actuals + status) | No |
| `docs/sprints/N/tasks/task-NN.md` | task-template.md (format); SPRINT_PLAN.md (content) | Sprint audit trail only — not read by subsequent agents | No |

---

## Agent Pattern

All execution delegated to sub-agents. PMO holds summaries only, never working content.

| Task | Agent type | Skill |
|------|------------|-------|
| Interview | PMO directly | `interview` |
| Planning (all modes) | `general-purpose` | `plan` |
| Git operations | `general-purpose` | `git` |
| Feature implementation | `general-purpose` | `tdd` + task instructions |
| Automated gates | `general-purpose` | instructions in `quality-gate/SKILL.md` |
| Codebase exploration | `Explore` | none |
| Web research | `general-purpose` | none |
