---
name: smoke-test
description: Playwright MCP smoke test runner. Reads docs/smoke-tests.md, executes each scenario via browser control, hard gates on any failure. Invoked by quality-gate automated gates phase from sprint 2 onward.
---

# Smoke Test

Read scenarios → Execute via Playwright MCP → Hard gate on failure.

---

## Guards

**Sprint 1**: Skip entirely. Return: "Smoke test skipped — sprint 1 is infrastructure only."

**Missing config**: If `docs/smoke-tests.md` does not exist or contains no scenarios below the divider line — stop. Report to PMO: "`docs/smoke-tests.md` missing or empty — use `.claude/skills/smoke-test/references/smoke-tests-template.md` as the format reference and populate before running quality gate."

---

## Your Steps

### Step 1: Read Scenarios

Read `docs/smoke-tests.md`. Parse each scenario: name, URL, steps, expected outcome. If none defined, apply missing config guard above.

### Step 2: Execute

For each scenario, use Playwright MCP to:
1. Navigate to the URL
2. Execute each step in sequence
3. Verify expected outcome

Record result per scenario: PASS / FAIL + failure detail (which step, what was observed vs expected).

### Step 3: Report

**All pass**: Return clean report to PMO — scenario names and PASS status. Automated gates continue.

**Any fail**: Hard gate. Return to PMO:
- Which scenarios failed
- At which step
- Observed vs expected
- Screenshot or DOM state if Playwright MCP captured it

PMO stops. Manual test session does not begin until all failures are resolved and smoke-test re-run clean.

---

## Quick Reference

```
Sprint 1?                          → Skip
docs/smoke-tests.md missing/empty? → Stop, report to PMO
Scenarios defined?                 → Execute via Playwright MCP
All pass?                          → Report clean, gates continue
Any fail?                          → Hard gate, report detail, stop
```
