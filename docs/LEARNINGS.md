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

<!-- Sprint entries are appended here as sprints complete. -->
<!-- Format:

## Sprint [ID] — [Name] — [Date]

**Tokens:** [actual]K of [budget]K ([+N% over] / [-N% under])
**Over-ran:** [task — reason] or None
**Under-ran:** [task — reason] or None

**Surprises / failures:** [what was unexpected or broke]

**Carry forward to planner:** [actionable patterns — what to do differently, constraints to remember, estimation adjustments]
-->
