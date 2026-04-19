---
name: version-gate
description: PMO guide for running a Version Gate — the milestone validation sprint at the end of a version loop. Always preceded by a quality gate. Purely milestone judgment — technical quality is already guaranteed. Three outcome paths: clean, gaps, fundamental failure.
---

# Version Gate

A Version Gate closes a version loop and validates the milestone vision. It is always preceded by a quality gate — technical debt is already cleared. This sprint is purely milestone judgment.

---

## Hard Rule

A Version Gate sprint must always be preceded by a completed quality gate. Never proceed to a Version Gate with unresolved technical findings.

---

## Your Steps

### Step 1: Load Context

Read `docs/PROJECT_STATUS.md`, the milestone vision defined in `docs/IMPLEMENTATION_PLAN.md` at the start of this version loop, and `docs/LEARNINGS.md` for the full loop.

Identify: what was the milestone vision? What was built across this version loop? Where are the gaps, if any?

### Step 2: Automated Gates

Spawn `general-purpose` sub-agent with the Automated Gates Sub-Agent Prompt from `quality-gate/skill.md`. Wait for pass before proceeding.

Additionally, run the full Playwright CLI regression suite: `npx playwright test`. This covers all `.spec.ts` files accumulated across the version loop — system-wide regression confidence before milestone judgment. Any failure is a hard gate.

### Step 3: System-Wide Manual Assessment

Broader than an in-loop quality gate — covers the full version loop, not just recent sprints.

Scope:
- End-to-end flows across all features built in this loop
- Cross-feature integration
- Full milestone experience — does the product feel complete for this milestone?
- Performance under realistic conditions
- Gaps relative to the milestone vision defined at loop start

Thomas is present. Present scenarios covering the full loop. Record all findings.

### Step 4: Milestone Judgment

Ask Thomas explicitly: **"Does this version meet the milestone vision as defined at the start of this loop?"**

---

## Outcome Paths

### Path 1 — Clean

All findings are cosmetic or negligible. Thomas confirms milestone is met.

1. Document any minor items as carry-forward in `docs/PROJECT_STATUS.md` (not blockers)
2. Update `docs/PROJECT_STATUS.md` — Version Gate closed, version loop complete
3. Append `LEARNINGS.md` entry — capture full loop learnings
4. Spawn `general-purpose` sub-agent with `git` skill → commit and push
5. Signal readiness for `version-next` — await Thomas

### Path 2 — Gaps

Significant features incomplete or underdelivered relative to the milestone vision. Thomas decides:

- **Extend loop:** add feature sprints to the current loop, then return to quality gate → Version Gate sequence
- **Re-scope milestone:** formally declare what was built as the milestone; update `docs/IMPLEMENTATION_PLAN.md` milestone definition

Capture the decision in `docs/DECISIONS.md` (DEC-XXX format) — why the scope changed, what was accepted.

### Path 3 — Fundamental Failure

Wrong direction, architectural issues, or the milestone vision itself was incorrect.

**Stop. Do not proceed.**

Work with Thomas to diagnose root cause. This may require revising the milestone vision, significant rework, or a redesign before `version-next` begins. No path forward is defined here — the outcome depends on the diagnosis.

---

## Quick Reference

```
Preceded by quality gate?         → Yes, always — hard rule
Automated gates pass?             → Also run: npx playwright test (full .spec.ts suite) — hard gate
Playwright CLI fails?             → Hard gate — fix before proceeding to manual assessment
Thomas confirms milestone?        → Path 1: clean → close → spawn git → await version-next signal
Significant gaps?                 → Path 2: extend loop or re-scope (Thomas decides) → capture in DECISIONS.md
Fundamental failure?              → Path 3: stop, diagnose with Thomas
```
