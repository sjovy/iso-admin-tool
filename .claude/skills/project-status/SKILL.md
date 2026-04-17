---
name: project-status
description: Report the current project status from docs/PROJECT_STATUS.md. Use this skill whenever Thomas asks what's the status, what's next, where things stand, what's happening with the project, or any similar question about project progress — even if phrased casually like "catch me up" or "what are we doing". Always trigger on status/progress/next-steps queries.
---

# Project Status

Read `docs/PROJECT_STATUS.md` and deliver a four-line brief. Nothing more.

## Output format

Reply with exactly these four items, in order:

1. **Active sprint** — name and one-line goal
2. **Last completed** — task name + one key learning or outcome
3. **Next pending** — the immediate next task to execute
4. **Open blockers** — anything preventing progress; "None" if clear

No preamble. No elaboration. No recommendations. Stop after the four items.

## If PROJECT_STATUS.md is missing

Say: "No `docs/PROJECT_STATUS.md` found. Run Sprint 0 to initialise the project."
