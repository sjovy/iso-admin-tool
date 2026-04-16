---
name: sprint-next
description: PMO guide for planning and executing sprints. Covers loading context, creating sprint plans via planner, presenting to Thomas, spawning Workers, and closing sprints. Contains the Worker prompts to pass verbatim.
---

# Sprint Next — PMO Guide

Execute any sprint from plan to committed checkpoint.

---

## Quality Cycle Rule

> **Read this before executing any sprint.**

### Structure
The build rhythm alternates between a **build phase** (feature sprints) and a **quality cycle**. The quality cycle has three phases in sequence: **Review → Clear → Verify**. Together they form one complete cycle. The cycle may loop (Clear → Verify again) until Verify is clean.

### Cadence
- **Soft rule:** quality cycle after every 2 feature sprints
- **Hard rule:** never more than 3 consecutive feature sprints without a quality cycle
- **Enforcement:** at Step 1 of any feature sprint, count feature sprints since the last Verify closed. If count ≥ 3 → do not proceed with the feature sprint, insert a Review sprint first and flag to Thomas

### Scope Boundary — Clear sprints only
Clear sprints fix **only what Review found**. No new features. No backlog items. No additions beyond the findings list. Anything not in the findings list is deferred to the next build phase.

### Exit Gate
Verify must return **zero findings** before the quality cycle closes and the build phase resumes. There is no partial exit.

### Loop Limit
Maximum **3 loops** per quality cycle. If a 3rd Verify still fails: stop, do not run a 4th Clear. Diagnose root cause with Thomas before continuing.

### Subdivision
Only Clear sprints may be subdivided (e.g. Clear-a, Clear-b) when findings exceed the 180K token ceiling. Review and Verify are always single, indivisible sprints. Flag to Thomas before subdividing — never subdivide silently.

---

## Your Steps — Regular Sprint

**First:** check the sprint name:
- Contains "Review" → skip to **Your Steps — Review Sprint** below
- Contains "Clear" → follow Regular Sprint steps; apply the **scope boundary** (only Review findings — no additions)
- Contains "Verify" → skip to **Your Steps — Verify Sprint** below
- Neither → continue with regular sprint steps below

### Step 1: Load Context

Read in this order, stop once you have what you need:
1. `docs/PROJECT_STATUS.md` — identify next pending sprint. Also review the carry-forward list: if any items have become blockers or are now worth scheduling, add them to `docs/IMPLEMENTATION_PLAN.md` before proceeding.
2. That sprint's entry in `docs/IMPLEMENTATION_PLAN.md` — goal, REQ scope, TRACKS
3. `docs/TECH_STACK.md`, `docs/DECISIONS.md`, `docs/LEARNINGS.md` — once, hold in context

Do not read more than you need. Context window is finite.

### Step 2: Pre-Planning Check

Before engaging the planner, do a quick read of the sprint entry in `docs/IMPLEMENTATION_PLAN.md` (already loaded in Step 1) and present to Thomas:

- **Things you will likely need to do during or after this sprint** — scan features and domain hints for: Supabase migrations (`db push`), Edge Function deploys (`functions deploy`), credential setup, device testing, re-signup requirements. List each one specifically. If none: say so explicitly. This is an estimate — it's OK to be wrong.
- **Whether you need to stay available** — brief note on whether surprises are likely (complex domain, security-critical decisions, schema changes) or whether the sprint is routine enough to walk away.

Then ask: **"Do you want to pre-approve development? (yes/no, ja/nej)"**

**Response rules:**
- yes / ja (any case) → run planner (Step 3) and, once plan is written, proceed directly through entry criteria check and spawn Worker — all in one sweep. Thomas does not need to review the plan before execution.
- no / nej (any case) → run planner only (Step 3), then stop at Step 4 and present the plan for Thomas's review.
- Anything unclear or ambiguous → re-ask. Do not assume. Do not proceed.

### Step 3: Sprint Plan

Check if `docs/sprints/sprint-[ID]/SPRINT_PLAN.md` exists.

**If missing:** optionally invoke the **interview skill** — SPRINT-DISCOVERY type first if the sprint scope has ambiguities worth clarifying before planning. Then spawn `planner` agent with this prompt (fill in bracketed values):
```
OBJECTIVE: Create sprint plan for [sprint name]. (planner Mode B)
TARGET PATH: docs/sprints/sprint-[ID]/SPRINT_PLAN.md

CONTEXT:
[Sprint entry from IMPLEMENTATION_PLAN.md — paste exact text]

ALSO READ:
- docs/TECH_STACK.md
- docs/LEARNINGS.md
- Relevant existing source files before designing tasks
```
Planner writes the file and returns a summary. Do not ask for or hold the full plan content.

**If exists:** read only the header (Goal, REQ scope, Status) to confirm it is PENDING.

### Step 4: Thomas's Approval Gate

**Only reached if Thomas said NO to pre-approve in Step 2.**

Present the full plan to Thomas:
- Sprint name, goal, task list with complexity and token estimates, open questions from planner
- Manual steps confirmed or refined from Step 2

Then ask: **"Do you approve, or is there anything you want to discuss or look closer at?"**

**Response rules:**
- Approves → proceed to Step 5
- Wants to discuss or change something → address it, re-spawn planner with revision guidance if needed, re-present at Step 4
- Anything unclear → ask a clarifying question. Do not spawn Workers until approval is explicit.

**Hard gate — do not spawn Workers until Thomas explicitly approves.** Iterate until approved.

### Step 5: Verify Entry Criteria

Before spawning any Worker, verify every entry criterion in the sprint plan is actually met — not assumed. This is a hard gate equivalent to Step 4.

For each entry criterion:
- If it is a state fact ("Sprint N complete") — confirm via PROJECT_STATUS.md.
- If it involves external tooling (CLI, environment variable, service access, credentials) — run a check command or ask Thomas to confirm it works. Do not assume it works because it worked before.

Common checks for sprints touching Supabase:
- `npx supabase --version` returns a version (CLI accessible)
- `SUPABASE_ACCESS_TOKEN` is set if migrations or type-gen will be needed (ask Thomas to confirm)
- Relevant tables/functions exist in Supabase if the sprint builds on prior migrations

If any entry criterion is not met: resolve the blocker with Thomas before proceeding to Worker spawn. A Worker that hits an environment blocker mid-execution will deviate from the plan — prevention is cheaper than fixing deviations.

### Step 6: Execute

Check the TRACKS section of the sprint entry in `docs/IMPLEMENTATION_PLAN.md`.

**Single track:** spawn one `worker` agent with the Regular Sprint Worker Prompt below. Pass: sprint ID, SPRINT_PLAN.md path, full content of TECH_STACK.md + DECISIONS.md + LEARNINGS.md.

**Multiple tracks:** spawn prerequisite Worker first (if prerequisites listed), wait for completion, then spawn all track Workers simultaneously. Each gets its track scope plus the same context package.

Workers run in background for parallel tracks. All required permissions are pre-approved in settings.

### Step 7: Closure — yours alone

After all Workers report complete:
1. Update `docs/PROJECT_STATUS.md`:
   - Mark sprint closed, set next pending
   - Replace "Last completed sprint" with a 2-3 line summary of this sprint — do not append, replace. History does not accumulate here; full records live in SPRINT_PLAN.md actuals.
   - Add any carry-forward items reported by Workers to the carry-forward section. Remove any items that were resolved this sprint.
2. Fill SPRINT_PLAN.md actuals from Worker summaries, set Status to CLOSED
3. Append entry to `docs/LEARNINGS.md` using the format defined in `.claude/skills/sprint-zero/references/planning-docs-structure.md`. The "Carry forward to planner" field is the most important — make it specific and actionable.
4. **MANDATORY — scan Worker summaries for new constraints and decisions:**
   - New package gotchas, version conflicts, API quirks, non-obvious patterns → add to `docs/TECH_STACK.md` immediately. Do not leave these in LEARNINGS.md only — Workers receive TECH_STACK.md directly and must see constraints there.
   - New architectural decisions made during the sprint → add to `docs/DECISIONS.md` in ADR format. Do not skip this even if the decision feels minor.
5. Remove sprint entry from `docs/IMPLEMENTATION_PLAN.md`
6. Spawn `git-expert` agent to commit and push

**If this is a Clear sprint — trigger Verify automatically:**
Do not ask. Insert a Verify sprint as next pending in `docs/IMPLEMENTATION_PLAN.md` (e.g. "Sprint [N] — [Area] Quality Cycle — Verify"). Set it as next pending in `docs/PROJECT_STATUS.md`. Then stop — the Verify sprint begins when Thomas signals ready.

**If this is NOT a Clear sprint:** stop. Each sprint is a committed checkpoint.

---

## Regular Sprint Worker Prompt

Pass this block verbatim to the `worker` agent, filling in the bracketed values:

---
```
You are executing Sprint [ID] — [Name].

SPRINT PLAN PATH: [path to SPRINT_PLAN.md]
Read it fully before doing anything else.

CONTEXT PACKAGE:
[TECH_STACK.md — paste full content]
[DECISIONS.md — paste full content]
[LEARNINGS.md — paste full content]

TRACK SCOPE: [track name and task numbers, or "Full sprint — all tasks"]

---

EXECUTION GUIDE

Phase 1 — Confirm context
Identify: sprint goal, key tech constraints, relevant architectural decisions, applicable learnings from the context package above.

Phase 2 — Task files (MANDATORY — do this before any implementation)
Create task files for every task in your TRACK SCOPE at: docs/sprints/[sprint]/tasks/task-[NN]-[name].md
Use the template at: .claude/skills/sprint-next/references/task-template.md
Exact paths, specific steps, no placeholders. Do not skip this even if SPRINT_PLAN already has detailed descriptions. These files are the sprint's audit trail.

Phase 3 — Implement
Execute ONLY the tasks listed in your TRACK SCOPE, in the order defined in SPRINT_PLAN.md.
Read existing files before writing. Follow established patterns — never invent conventions the codebase does not use.
Track token usage per task. Include actuals in your final report to PMO — do not write them to SPRINT_PLAN.md.
If stuck: max 2 attempts with the same approach, then escalate to PMO with a clear explanation.

Phase 4 — Quality gates
Run automated gates only: tsc, eslint, vitest.
Fix-verify loop until all pass. Do not report complete with failing gates.
Manual UI verification is not part of your scope.

Phase 5 — Report and stop
Run `git status --short` and include the full output in your report. This captures CLI-generated side-effect files (e.g. Supabase config files) that you did not explicitly create but that were produced as a result of commands run during the sprint.

Report to PMO:
- Tasks completed and outcomes
- Token actuals per task vs estimates
- Quality gate results
- Full `git status --short` output
- Any concerns, blockers, or carry-forward items

Then STOP. Do not commit, push, or modify any docs outside your sprint scope.
```
---

## Your Steps — Review Sprint

> **Design note:** Review sprints span multiple sessions by design. Manual testing with real devices and real data takes hours — longer than a single focused work session. The SPRINT_PLAN.md is a living document throughout: findings, test results, and the Clear sprint draft are written to it continuously, not filled in at the end. Treat SPRINT_PLAN.md as the sprint's persistent memory. Context window memory is not persistent memory.

---

### Step 1: Load Context and Detect Resume

Read `docs/PROJECT_STATUS.md` and the sprint's `SPRINT_PLAN.md` header.

**If SPRINT_PLAN.md Status is `IN PROGRESS` → this is a RESUME. Go to the Calibration Resume Path below immediately. Do not follow Steps 2–6.**

If Status is `PENDING` → this is a fresh start. Continue with Step 2.

Also read `docs/TECH_STACK.md`, `docs/DECISIONS.md`, `docs/LEARNINGS.md` — once, hold in context.

### Step 2: Pre-Planning Check
Same as regular sprint Step 2 — present manual steps + recommendation from IMPLEMENTATION_PLAN.md entry, ask Y/n before engaging planner.

### Step 3: Sprint Plan
Same as regular sprint Step 3. If SPRINT_PLAN.md is missing, spawn `planner` Mode B — for calibration sprints the planner writes a test script instead of a task breakdown. The plan must use the structure defined in `.claude/skills/sprint-next/references/calibration-plan-template.md` — Findings Log, Current State block, live Enhancement draft section, and Resume From marker must all be present.

### Step 4: Thomas's Approval Gate
Same as regular sprint Step 4 — Y/n response required; re-ask if unclear.

### Step 5: Verify Entry Criteria
Same as regular sprint Step 5 — verify all entry criteria in the sprint plan are actually met before spawning the Worker.

### Step 6: Automated Gates
Spawn `worker` with the Calibration Worker Prompt below. Pass: sprint ID, SPRINT_PLAN.md path, full content of TECH_STACK.md + DECISIONS.md + LEARNINGS.md.

Wait for Worker to report gate results before proceeding to Step 7.

**After gates pass:** immediately update SPRINT_PLAN.md — set `Status: IN PROGRESS` and write today's date as session start. This is the signal that distinguishes a resume from a fresh start. Do this before presenting the first scenario to Thomas.

### Step 7: Manual Test Session

**Nature of this step:** Thomas is present and tests scenarios on real devices. This is the primary value of the calibration sprint. Do not rush. Do not skip scenarios.

**Hotfix threshold — the only code changes permitted during calibration:**
A finding may be fixed inline (during calibration, before continuing) if and only if it **blocks continuation of the test session itself** — i.e. the app cannot be used to test further scenarios without the fix. Everything else is collected and deferred to the Enhancement sprint. When a hotfix is applied: write the migration/code change, push it, document it in the Findings Log as `HOTFIX APPLIED` with the migration filename or file changed. Do not fix cosmetic bugs, UX issues, or non-blocking failures inline.

**For each area:**
1. Present each scenario: role, action, expected outcome
2. Thomas tests and reports: pass / fail / finding
3. Record the result in the scenario's Result column immediately — do not defer
4. If a finding emerges: add it to the Findings Log in SPRINT_PLAN.md immediately, with severity (fix / defer / note), root cause, and fix approach
5. If the finding belongs in the Enhancement sprint: add a task stub to the Live Enhancement Draft section in SPRINT_PLAN.md immediately
6. **After each area completes (all scenarios recorded): write the updated SPRINT_PLAN.md to disk.** Do not wait until the end of the session. If the session is cut off after an area, that area's results are saved.

**Planned interruption protocol** — when Thomas signals a break before the sprint is complete:
1. Write any partial results from the current area (even incomplete)
2. Update the Current State block in SPRINT_PLAN.md: which accounts hold which roles, what test data exists, which areas are done / pending / in progress
3. Write `**RESUME FROM: Area X — scenario Y.ZZ**` prominently at the top of the Manual Test Script section
4. Confirm with Thomas that the state looks accurate before he leaves
5. Spawn `git-expert` to commit the in-progress plan immediately
6. Then stop

### Step 8: Triage and Clear Sprint Draft

By the time all areas are complete, the Live Clear Draft in SPRINT_PLAN.md will already contain task stubs for every finding. This step finalises that draft rather than building it from scratch.

**Budget rule:** The Clear sprint may use up to **180K tokens** (same ceiling as normal feature sprints, including the 40K buffer). If the collected findings exceed 180K:
1. First: confirm nothing in the list can be deferred — in a quality cycle, nothing found in Review may be deferred to a feature sprint. Only de-scope if truly out of bounds.
2. Only if still over 180K: split into Clear-a and Clear-b — see **Quality Cycle Rule — Subdivision** above
3. Flag to Thomas before splitting — do not split silently

**Size each finding** into the Clear sprint:
- **Fits within 180K** → add to Clear sprint in `docs/IMPLEMENTATION_PLAN.md`
- **Too large, no dependencies on planned work** → split as Clear-a/Clear-b per subdivision rule
- **Too large, has dependencies on planned work** → flag to Thomas and decide together

### Step 9: Closure
1. **Determine Clear sprint fate:** if Review found nothing worth fixing, skip the Clear sprint entirely — remove it from `docs/IMPLEMENTATION_PLAN.md` and insert a Verify sprint directly (which will immediately confirm clean). If it has content, leave it and set it as next pending. Spawn `planner` with a light-format prompt (see below) to convert the Live Clear Draft into a proper SPRINT_PLAN.md — the planner does NOT rediscover findings, only formats and orders them.
2. Update `docs/PROJECT_STATUS.md` — mark Review closed, set Clear (or Verify if nothing found) as next pending, update carry-forward
3. Fill SPRINT_PLAN.md actuals, set Status to CLOSED
4. Append entry to `docs/LEARNINGS.md` using format in `.claude/skills/sprint-zero/references/planning-docs-structure.md`
5. **MANDATORY** — scan for new constraints/decisions → `docs/TECH_STACK.md` / `docs/DECISIONS.md`
6. Remove Review sprint entry from `docs/IMPLEMENTATION_PLAN.md`
7. Spawn `git-expert` to commit and push

**Clear sprint planner prompt (Step 9, light-format only):**
```
OBJECTIVE: Format Sprint [N] — [Clear Name] plan. (planner Mode B — light format)
TARGET PATH: docs/sprints/sprint-[N]/SPRINT_PLAN.md

The findings and fix descriptions are already captured in the Review sprint plan at:
docs/sprints/sprint-[review-ID]/SPRINT_PLAN.md — Live Clear Draft section

Your job is to:
1. Read that section
2. Group findings into logical tasks
3. Estimate token cost per task (use: SIMPLE=35K, MEDIUM=70K, COMPLEX=140K)
4. Order tasks by dependency (blocking bugs first)
5. Write a proper SPRINT_PLAN.md with goal, entry/exit criteria, task list, and token budget
6. Do NOT redescribe findings — reference them. Do NOT add scope beyond what is listed.
Total budget must not exceed 180K. If it does, flag which items to split — do not silently exceed.
```

---

## Your Steps — Verify Sprint

> **Purpose:** Confirm that Clear fixed everything Review found. Re-runs the test script against only the areas that had findings. If clean → quality cycle closes. If not → loop back to Clear.

### Step 1: Load Context and Determine Loop Count
Read `docs/PROJECT_STATUS.md` and the preceding Clear sprint's SPRINT_PLAN.md. Count how many Clear→Verify loops have completed so far in this quality cycle. Record the count.

**If loop count is already 3 and this Verify is expected to fail** → stop before running anything. Escalate to Thomas — diagnose root cause before proceeding.

### Step 2: Run Automated Gates
Spawn `worker` with the Calibration Worker Prompt (reuse for Verify — automated gates only). Wait for pass.

### Step 3: Focused Manual Re-test
Re-run the test script from the preceding Review sprint, but **only the areas that had findings**. Areas that passed Review cleanly are not re-tested. Present each scenario from those areas only; Thomas confirms pass/fail.

### Step 4: Evaluate Result
**All findings resolved (zero new failures):**
1. Quality cycle is complete
2. Update `docs/PROJECT_STATUS.md` — mark Verify closed, set next feature sprint as next pending
3. Fill SPRINT_PLAN.md actuals, set Status to CLOSED
4. Append entry to `docs/LEARNINGS.md`
5. Remove Verify sprint entry from `docs/IMPLEMENTATION_PLAN.md`
6. Spawn `git-expert` to commit and push
7. **Stop. Build phase resumes.**

**New or unresolved findings:**
1. Check loop count. If this was loop 3 → stop. Escalate to Thomas per loop limit rule. Do not insert another Clear.
2. If loop count < 3 → insert a new Clear sprint in `docs/IMPLEMENTATION_PLAN.md` (e.g. "Sprint [N] — [Area] Quality Cycle — Clear Pass [loop+1]"). Document only the new/unresolved findings. Set as next pending.
3. Fill SPRINT_PLAN.md actuals, set Status to CLOSED (Verify sprint itself is done — the loop continues)
4. Append entry to `docs/LEARNINGS.md`
5. Spawn `git-expert` to commit and push
6. **Stop. Clear sprint is next.**

---

## Review Resume Path

**Triggered when:** SPRINT_PLAN.md Status is `IN PROGRESS` at Step 1.

1. Read the full SPRINT_PLAN.md — Findings Log, Current State block, Resume From marker, completed areas
2. Say explicitly: "Resuming Sprint [N] calibration — not starting fresh. [X] areas complete, resuming from Area [Y]."
3. Confirm the Current State with Thomas before testing: "Last session: Account A is [role], Account B is [role], test Ambition is [name]. Does this still match?" — things may have changed (accounts deleted, test data changed) since the last session
4. Once Thomas confirms state: continue from the first pending area
5. Do NOT re-run planner, do NOT re-check entry criteria, do NOT repeat completed areas
6. Apply the same real-time writing rules as Step 7 — write after each area, update findings log immediately

---

## Calibration Worker Prompt

Pass this block verbatim to the `worker` agent for the automated phase only:

---
```
You are executing the automated phase of [Sprint ID] — a calibration sprint.

SPRINT PLAN PATH: [path to SPRINT_PLAN.md]
Read only the automated gates section.

CONTEXT PACKAGE:
[TECH_STACK.md — paste full content]
[DECISIONS.md — paste full content]
[LEARNINGS.md — paste full content]

---

CALIBRATION AUTOMATED GUIDE

Phase 1 — Task files
Create task files for automated gate tasks only at: docs/sprints/[sprint]/tasks/
Use the template at: .claude/skills/sprint-next/references/task-template.md

Phase 2 — Automated gates
Run: tsc --noEmit, eslint, vitest.
Fix-verify loop until all pass. Do not proceed with failing gates.

Phase 3 — Report and stop
Report to PMO: gate results, token actuals.
Then STOP. No code fixes during calibration — PMO handles all findings, documentation, and session management.
```
---

## Quick Reference

```
CADENCE CHECK (before any feature sprint):
Count feature sprints since last Verify closed.
≥ 3? → Insert Review sprint first. Do not proceed with feature sprint.

--- Sprint Type Detection ---
"Review" in name?        → Follow Review Sprint steps
"Clear" in name?         → Follow Regular Sprint steps + scope boundary (Review findings only)
"Verify" in name?        → Follow Verify Sprint steps
Neither?                 → Follow Regular Sprint steps (feature sprint)

--- Feature Sprint ---
Context loaded?          → Pre-Planning Check: likely manual steps + "Do you want to pre-approve development?"
Pre-approve YES?         → Spawn planner → verify entry criteria → spawn Worker (one sweep, Thomas walks away)
Pre-approve NO?          → Spawn planner → present full plan → "Do you approve or anything to discuss?"
Thomas approves?         → Verify entry criteria → spawn Worker(s)
Workers complete?        → Close sprint → spawn git-expert → stop
Is it a Clear sprint?    → After closure: insert Verify sprint as next pending → stop

--- Review Sprint ---
SPRINT_PLAN.md IN PROGRESS? → Resume Path: confirm state with Thomas → continue from first pending area
SPRINT_PLAN.md PENDING?  → Fresh start below

Fresh start:
Context loaded?          → Pre-Planning Check + "Do you want to pre-approve development?"
Pre-approve YES?         → Spawn planner → verify entry criteria → spawn Worker (automated gates only)
Pre-approve NO?          → Spawn planner → present full plan → Thomas approves → verify entry criteria → spawn Worker
Gates pass?              → Set Status IN PROGRESS → Manual test session
Each area done?          → Write results + findings + Clear draft stubs to SPRINT_PLAN.md immediately
Thomas signals break?    → Write partial state → Current State block → RESUME FROM marker → git-expert commit → stop
All areas done?          → Triage (max 180K; Clear-a/b split only if unavoidable) → spawn planner light-format for Clear plan
Clear plan done?         → Closure → spawn git-expert → stop

--- Verify Sprint ---
Loop count = 3 and likely failing? → Stop. Escalate to Thomas before running.
Otherwise:               → Automated gates → focused re-test (affected areas only)
Zero findings?           → Quality cycle complete → close → set next feature sprint → spawn git-expert → stop
Findings remain?         → Loop count < 3: insert Clear Pass [N+1] → close Verify → spawn git-expert → stop
                         → Loop count = 3: stop, escalate to Thomas
```
