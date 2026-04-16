# Sprint [N] — [Name] Quality Gate — Review

**Type:** Review
**Goal:** [What is being validated]
**REQ scope:** None — validation only
**Validates:** Sprint [X], Sprint [Y], ...
**Token Budget:** ~50K EST
**Status:** PENDING

> When manual testing begins, update Status to `IN PROGRESS` and add session date below.
> When resuming, add the RESUME FROM marker directly above the Manual Test Script section.

---

## Entry Criteria

- [List each criterion]
- Test accounts: at least two Supabase Auth accounts signed up via the app; third non-member account recommended

---

## Exit Criteria

- All test scenarios executed — pass/fail recorded
- Findings documented with root cause and fix approach
- Clear sprint scope defined (or marked SKIPPED if nothing found)
- Automated gates pass

---

## Automated Gates

| Gate | Command | Pass Condition | Result |
|------|---------|---------------|--------|
| TypeScript | `npx tsc --noEmit` | Zero errors | |
| ESLint | `npx eslint src --max-warnings 0` | Zero warnings or errors | |
| Vitest | `npx vitest run` | All tests pass | |

---

## Current State

> Updated at every session start and at every planned interruption. This block is the resumption anchor — keep it accurate.

**Last updated:** [date]
**Session status:** [Fresh start / Resumed from Area X]

| Account | Device | Role in Test | Notes |
|---------|--------|--------------|-------|
| Account A | [Browser/Phone] | [role] | [email or identifier] |
| Account B | [Browser/Phone] | [role] | [email or identifier] |
| Account C | [Browser/Phone] | Non-member | [if available] |

**Test data state:** [brief note on test data created so far]

---

## Manual Test Script

> **RESUME FROM: Area [X] — scenario [Y.ZZ]**
> _(Update this marker at every planned interruption. Remove when sprint closes.)_

---

### Area 1 — [Name] ⬜ PENDING

| # | Role | Action | Expected Outcome | Result |
|---|------|--------|-----------------|--------|
| 1.01 | | | | |

---

### Area 2 — [Name] ⬜ PENDING

| # | Role | Action | Expected Outcome | Result |
|---|------|--------|-----------------|--------|
| 2.01 | | | | |

_(Add areas as needed. Mark each area: ⬜ PENDING / 🔄 IN PROGRESS / ✓ COMPLETE / ⚠ SKIPPED)_

---

## Findings Log

> Add each finding immediately when discovered. Do not batch. Severity: **fix** = Clear sprint must address, **defer** = valid but not urgent, **note** = informational. Hotfixes applied inline are marked `HOTFIX APPLIED`.

| ID | Area | Severity | Finding | Root Cause | Fix Approach |
|----|------|----------|---------|------------|-------------|
| F-01 | | | | | |

---

## Live Clear Draft

> Task stubs added here in real-time as findings are confirmed. By sprint close, this section becomes the input to the Clear sprint planner — the planner formats and orders these stubs, it does not rediscover them.
> Budget ceiling: 180K. If stubs exceed 180K after deferring everything deferrable, flag for a/b split discussion with Thomas.

### Confirmed Clear Sprint Tasks

| # | Finding ID | Description | Complexity | EST |
|---|------------|-------------|------------|-----|
| 01 | F-xx | | SIMPLE / MEDIUM / COMPLEX | 35K / 70K / 140K |

**Running total:** ~XK of 180K ceiling

### Deferred

| Finding ID | Description | Reason deferred | Suggested sprint |
|------------|-------------|-----------------|-----------------|
| | | | |

---

## Token Budget

| Section | Estimated | Actual |
|---------|-----------|--------|
| Automated gates | 15K | |
| Manual test session | 30K | |
| Documentation | 5K | |
| **TOTAL** | **50K** | |

---

## Actuals

_To be filled at sprint close._

### What was validated
### Findings summary
### Carry-forward to Clear sprint
