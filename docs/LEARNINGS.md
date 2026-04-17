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

<!-- Sprint entries are appended here as sprints complete. -->
<!-- Format:

## Sprint [ID] — [Name] — [Date]

**Tokens:** [actual]K of [budget]K ([+N% over] / [-N% under])
**Over-ran:** [task — reason] or None
**Under-ran:** [task — reason] or None

**Surprises / failures:** [what was unexpected or broke]

**Carry forward to planner:** [actionable patterns — what to do differently, constraints to remember, estimation adjustments]
-->
