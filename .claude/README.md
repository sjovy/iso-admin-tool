# .claude/

**DO NOT DELETE THIS DIRECTORY OR ITS CONTENTS**

This is the PM orchestrator system. Deleting or modifying files here without understanding the impact will break the entire workflow.

---

## Structure

```
agents/          Specialist delegates the PMO spawns
  planner        Architecture, discovery, all planning documents
  doc-writer     Project documentation
  git-expert     Version control — always commits and pushes
  research-analyst  Web research
  worker         Sprint execution — the general-purpose builder

skills/          PMO operating guides — invoke these, follow them
  interview      Structured discovery conversations with Thomas
  sprint-zero    New project initiation (Sprint 0 only)
  sprint-next    All subsequent sprints — regular, calibration, enhancement

settings.json         Template settings — generic permissions, travels with .claude/ to new projects
settings.local.json   Project + machine specific — domain allowances, platform commands (not a template file)
CLAUDE.md             PMO identity and triggers — read this first
```

## For New Projects

Copy the entire `.claude/` directory. Clear `CLAUDE.md` last — it is project-specific. Keep everything else intact.
