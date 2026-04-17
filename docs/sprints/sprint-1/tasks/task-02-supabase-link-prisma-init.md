# Task: Supabase Link + Prisma Init

**Sprint:** 1
**Feature:** T02 — Supabase Link + Prisma Init
**Complexity:** MEDIUM
**Estimated Tokens:** 12K
**Search Scope:** prisma/schema.prisma, .env.local, .gitignore

---

## Context

**Previous work:** T01 complete — Next.js App Router scaffold with TypeScript strict mode, Tailwind 4.2.2, shadcn 4.3.0, pnpm-lock.yaml present.
**Current state:** No database connection configured. No Prisma installed. No `.env.local` exists.
**Purpose:** Links the project to the pre-provisioned Supabase Stockholm instance. REQ-010 (EU data residency) requires the region to be confirmed before any migration runs. REQ-013 (agent-friendly) requires Prisma schema-first workflow.

---

## Objective

Install Prisma, link the project to the Supabase PostgreSQL instance (eu-north-1), create the baseline migration, and confirm the region. All five environment variables must be in `.env.local` and git-ignored before any migration runs.

---

## Steps

**HITL GATE — do not proceed past step 1 without Thomas confirmation.**

1. Wait for Thomas to:
   a. Confirm Supabase region = eu-north-1 (Stockholm) in dashboard
   b. Provide all five `.env.local` credentials

2. Create `.env.local` at project root with:
   ```
   DATABASE_URL=<pooled connection, port 6543, transaction mode>
   DIRECT_URL=<direct connection, port 5432>
   NEXT_PUBLIC_SUPABASE_URL=<project URL>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
   SUPABASE_SERVICE_ROLE_KEY=<service role key — treat as secret>
   ```

3. Verify `.env.local` is in `.gitignore` (Next.js scaffolder includes this — verify).

4. Install Prisma: `pnpm add -D prisma` and `pnpm add @prisma/client`

5. Initialize Prisma: `pnpx prisma init`

6. Update `prisma/schema.prisma`:
   - Set `provider = "postgresql"`
   - Add `directUrl = env("DIRECT_URL")` under datasource block

7. Run `pnpx prisma migrate dev --name baseline`

8. Run `pnpx prisma generate`

---

## Patterns to Follow

- **Location:** Sprint plan T02 steps
- **What it shows:** DATABASE_URL = pooled (port 6543), DIRECT_URL = direct (port 5432) — do not swap them
- **Apply to:** .env.local creation

---

## Acceptance Criteria

- [ ] Thomas has confirmed eu-north-1 region before any migration runs
- [ ] `.env.local` exists with all five required variables
- [ ] `.env.local` is listed in `.gitignore` — confirmed not tracked by git
- [ ] `prisma/schema.prisma` exists with `directUrl` set
- [ ] `prisma/migrations/` directory exists with at least one migration folder
- [ ] `pnpx prisma migrate status` shows no pending migrations
- [ ] `pnpx prisma generate` exits 0

---

## Verification

**Command:**
```bash
pnpx prisma migrate status && pnpx prisma generate && git check-ignore .env.local
```

**Expected result:** `migrate status` shows "Database schema is up to date". `generate` exits 0. `git check-ignore` returns `.env.local`.

---

## Notes

- HITL GATE: Do not proceed without Thomas providing credentials and confirming region.
- Tech constraint: DATABASE_URL = pooled connection (port 6543, transaction mode) — runtime connection.
- Tech constraint: DIRECT_URL = direct connection (port 5432) — migrations only.
- Tech constraint: SUPABASE_SERVICE_ROLE_KEY must never be committed.
- Gotcha: If using pgbouncer, add `connection_limit = 1` to datasource block.
- REQ-010: eu-north-1 (Stockholm) must be confirmed before first migration.

**Token tracking:** Record actual tokens in SPRINT_PLAN.md after completion.
