# Learnings
**Project:** ISO Admin Tool
Append-only. One entry per completed sprint. Read by the plan sub-agent before every sprint plan.

---

## Sprint 0 — Sprint Zero (Kickoff + Plan) — 2026-04-17

**Tokens:** N/A — conversational sprint, no code execution
**Over-ran:** None
**Under-ran:** None

**Surprises / failures:**
- Product positioning shifted late in KICKOFF: tool is marketed as a lightweight agile management tool (PDCA + Årshjul) rather than an ISO admin tool. Affects all UI copy and navigation labels — Sprint 1 scaffolding agent must use PDCA framing, not ISO clause framing.
- AI key architecture (REQ-009) required a correction after the plan sub-agent wrote the docs: Thomas chose platform-level key (V1) over per-tenant key from day one. Captured in DEC-008. Plan sub-agent defaulted to the more complete architecture — always confirm V1 key management approach in KICKOFF.
- Seed data approval (Datadelen sample client) was pre-approved by Thomas. Sprint 8 tenant creation is AFK — no HITL gate required.
- Thomas is experimenting with multi-pass / vertical slice build strategy for the first time. The plan sub-agent wrote an explicit "how to read this plan" section explaining the pattern — this was the right call. Keep that explanatory section in future version plans until the pattern is established.

**Carry forward to planner:**
- Sprint 1 must confirm and pin all dependency versions (Next.js, Prisma, Tailwind, shadcn) and update TECH_STACK.md at exit.
- Supabase Stockholm instance and Vercel+GitHub connection are already provisioned — Sprint 1 scaffolding can skip provisioning steps and go straight to linking.
- RBAC has four tiers (Worker, Management, Company Admin, Consultant). Management tier separates CEO/leadership from workers at board level — Sprint 2 RBAC implementation must cover all four, not just Admin vs Worker.
- StorageProvider interface (Sprint 6) must be designed for zero consumer-code changes when swapping backends — this is the abstraction quality gate for that sprint.
- AI assistance (REQ-009) is V2 but must be architecturally accommodated in V1 schema design — a placeholder field or extension point should exist after Sprint 1.

## Sprint 1 — Tech Stack Scaffolding — 2026-04-17 (INCOMPLETE — blocked)

**Tokens:** ~full session quota burned on blocker diagnosis
**Over-ran:** T09 — blocked by Vercel 404 and middleware crash
**Under-ran:** None

**Surprises / failures:**
- Next.js 16 uses Turbopack by default for both dev and build. Turbopack bundles `@supabase/ssr` → `ws` → `__dirname` into the Edge middleware runtime, crashing every request with `MIDDLEWARE_INVOCATION_FAILED`. This is a framework-level incompatibility, not our code. Confirmed: even a passthrough `import { NextResponse } from "next/server"` fails.
- Next.js 16 upgrade docs describe a `proxy.ts` convention (Node.js runtime) replacing `middleware.ts` (Edge runtime), but this convention is not active in 16.2.4 — no Proxy entry appears in build output. The docs are ahead of the release.
- `next build --webpack` (opt out of Turbopack) produces output Vercel cannot route — resulted in 404 NOT_FOUND from Vercel infrastructure layer.
- After all middleware experiments, Vercel started returning 404 even with no middleware and standard Turbopack build. App confirmed working locally. Vercel project config likely needs a reset — check framework preset and output directory in Vercel dashboard.
- **Process failure:** Two targeted fixes failed → should have stopped, documented, moved on. Instead continued debugging for 6+ iterations burning a full session quota on an unfixable framework bug. This is the exact technical debt the build strategy is designed to prevent.

**Carry forward to planner:**
- **NEXT SESSION FIRST ACTION:** Diagnose Vercel 404 — check Vercel dashboard → Settings → Framework Preset (must be Next.js) and Output Directory (must be `.next`). Fix config, redeploy, confirm 404 is gone before any other work.
- **Middleware fix (dedicated session only):** Rewrite `middleware.ts` with dependency-free JWT cookie decode — read Supabase session cookie, decode base64 JWT payload with `atob()`, check `exp` claim. Zero external imports. Do not use `@supabase/ssr` or `@supabase/supabase-js` in middleware. Test locally first.
- **Stop rule:** If two targeted fixes on a single bug fail, stop. Log the blocker in PROJECT_STATUS.md and move to next task or end session. Never burn more than 2 fix attempts on a framework-level bug mid-sprint.
- Next.js 16 middleware Edge runtime does not support any package that transitively imports `ws` or any other Node.js-only module. Treat all middleware imports as suspect until verified Edge-compatible.
- Prisma 7 generated client at `src/generated/prisma/` sets `globalThis['__dirname']` — this is a polyfill for Node.js globals, not the source of the Edge crash (but confirms Node.js code exists in the generated output).
- `pnpm-workspace.yaml` `ignoredBuiltDependencies` / `onlyBuiltDependencies` has no effect on the Edge runtime crash — red herring, do not revisit.

## Sprint 2 — Kanban Boards (Core) — 2026-04-20

**Tokens:** ~360K actual of ~160K EST (+125% — two parallel tracks; T08 alone was 80K; estimate was per-task, not sprint-total)
**Over-ran:** T08 Drag-and-Drop (80K vs 140K est — actually under est); overall sprint over budget because parallel track totals were summed, not budgeted as parallel execution
**Under-ran:** T02 (5K vs 35K — pure type file, trivially small)

**Surprises / failures:**
- Prisma 7 batch `$transaction([op1, op2])` does not allow the first operation's output to be referenced by the second. `createTask` audit log ends up with `entityId: 'pending'`. Fix requires interactive transaction (`$transaction(async (tx) => { ... })`). This is a Prisma 7 constraint — plan all future audit-log-paired mutations using interactive transactions.
- `users` table has no `name` field — only `email`. `TaskOwner.name` was set to `email` value. Affects display throughout the board. Future sprint should add `name` to User model or accept email-as-name.
- Worker RBAC gap on `createTask`: no server-side check that Worker's `ownerId` matches their own user ID. Worker can assign tasks to other users. Easy fix but requires discipline: every mutation server action must enforce role constraints at server level, not just UI.
- dnd-kit requires `PointerSensor` with `activationConstraint: { distance: 8 }` to avoid accidental drag-on-click. Without this, clicking a card triggers a drag.
- shadcn Combobox is not a default registry component — it is a Popover+Command pattern that must be assembled manually. Owner picker was downgraded to Select; acceptable for V1.
- Token budget arithmetic error: per-task estimates (280K T1 + 385K T2) were listed as raw estimates, but the sprint budget of 160K assumed parallel execution. Sprint summary table should show execution budget, not raw task sum.

**Carry forward to planner:**
- Sprint 2-Clear scope: (1) interactive transaction in `createTask` for real audit `entityId`, (2) Worker `ownerId` validation in `createTask`, (3) uniform error response in `moveTask` (no 403 vs 404 differentiation). File scope: `src/app/actions/tasks.ts` + tests only. ~40K EST.
- All future mutation server actions: enforce role constraints server-side. Do not rely on UI to restrict inputs (ownerId, status, etc.).
- Prisma 7 interactive transaction pattern: `prisma.$transaction(async (tx) => { const entity = await tx.model.create(...); await tx.auditLog.create({ data: { entityId: entity.id, ... } }); return entity; })`. Use this whenever audit log needs the created entity's ID.
- User model lacks `name` field — board displays email as name. Sprint 3+ should add `name` to User (or explicitly decide email-as-name is permanent).
- Sprint budget should be stated as "active context budget" not "sum of all tasks" — parallel tracks do not multiply cost.
- After Sprint 2-Clear closes, Verify sprint must be inserted before Sprint 3 proceeds.

## Sprint 2-Clear — Kanban Board Defect Fixes — 2026-04-20

**Tokens:** ~22K actual of ~40K EST (-45% — single file, targeted fixes, no exploration needed)
**Over-ran:** None
**Under-ran:** All tasks — fixes were smaller than budgeted once the file was read and the target was clear

**Surprises / failures:**
- Judge (MAJOR): New tests for `createTask` audit log and `moveTask` transaction structure use test-local simulations — they manually invoke mocked `tx.task.create` and `tx.auditLog.create` directly rather than importing the real server action. A regression in `tasks.ts` would not be caught. The production code is correct, but the tests provide no regression protection for the actual implementation.
- Judge (MAJOR): `moveTask` still uses the batch `$transaction([op1, op2])` form. For `moveTask` this is not a bug (the `taskId` is known before the transaction), but it is inconsistent with the interactive pattern now used in `createTask`. Future TECH_STACK.md note added.
- `updateTask` has no Worker RBAC guard — a Worker can update any field including `ownerId` on any task visible to them. Pre-existing gap, outside this sprint's scope, but flagged.
- Unowned task design gap: a Worker can create an unowned task (allowed by design), but no Worker can then move it (canMoveTask requires `taskOwnerId === callerId`, null ≠ any string). Pre-existing inconsistency.

**Carry forward to planner:**
- Sprint 3 and all future sprints: server action unit tests must mock `prisma` and call the real exported function (e.g. `import { createTask } from '@/app/actions/tasks'`). Test-local simulations do not catch regressions in the production code path. Reject tests that do not exercise the real function.
- `updateTask` needs a Worker RBAC guard (cannot update `ownerId` to another user). Add to Sprint 3 or a dedicated clear pass — do not let it accumulate.
- Unowned task / Worker move gap: decide if Workers should be blocked from creating unowned tasks, or if `moveTask` should allow Workers to move unowned tasks. Document the decision.
- Token estimates for Clear sprints targeting a single file should be ~15–25K, not 40K. The budget ceiling of 40K is fine as a safety net but the estimate should be tighter.

<!-- Sprint entries are appended here as sprints complete. -->
<!-- Format:

## Sprint [ID] — [Name] — [Date]

**Tokens:** [actual]K of [budget]K ([+N% over] / [-N% under])
**Over-ran:** [task — reason] or None
**Under-ran:** [task — reason] or None

**Surprises / failures:** [what was unexpected or broke]

**Carry forward to planner:** [actionable patterns — what to do differently, constraints to remember, estimation adjustments]
-->
