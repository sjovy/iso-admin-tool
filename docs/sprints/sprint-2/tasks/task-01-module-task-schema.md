# Task: Module + Task Prisma Schema

**Sprint:** 2
**Feature:** Track 1 — Schema & API
**Complexity:** MEDIUM
**Estimated Tokens:** 70K
**Actual Tokens:** ~25K
**Search Scope:** `prisma/schema.prisma`, `prisma.config.ts`, `src/generated/prisma/`

---

## Context

**Previous work:** Sprint 1 established Tenant and User models. Prisma 7 with generated client at `src/generated/prisma/`. Connection URLs live in `prisma.config.ts` (not schema.prisma — Prisma 7 change).
**Current state:** `prisma/schema.prisma` contained only Tenant and User models. No Module, Task, or AuditLog.
**Purpose:** REQ-002/003/005 — kanban boards require Module and Task tables with tenant isolation (RLS).

---

## Objective

Extend the Prisma schema with Module, Task, and AuditLog models. Apply migration via Supabase MCP. Enable RLS on modules and tasks tables with tenant-isolation and RBAC-aware policies.

---

## Steps

1. Read `prisma/schema.prisma` and `prisma.config.ts` to understand existing structure and Prisma 7 constraints
2. Add `PdcaPhase`, `BoardVariant`, `Priority` enums
3. Add `Module`, `Task`, `AuditLog` models with all required fields
4. Add `tasks Task[]` back-relation to Tenant (required by Prisma — both sides of every relation must be declared)
5. Apply migration via Supabase MCP `apply_migration` with full DDL + RLS policy SQL
6. Fix type cast issue: `users.id` is TEXT, `auth.uid()` returns UUID — cast with `auth.uid()::text`
7. Verify RLS enabled: `SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('modules', 'tasks')`
8. Run `pnpm prisma generate` — succeeded
9. Run `pnpm tsc --noEmit` — passed

---

## Key Decisions

- `users.id` is TEXT (Supabase Auth UUID stored as text per Sprint 1 Prisma cuid convention). RLS policies cast `auth.uid()::text` for all comparisons.
- `prisma.config.ts` holds connection URLs for Prisma 7 — `url`/`directUrl` must NOT appear in `schema.prisma` (Prisma 7 breaking change from v6).
- Task→Tenant direct relation added (alongside Task→Module) for simpler RLS and query filtering by tenant at DB level.
- `AuditLog.entityId` stored as TEXT (not UUID) in Prisma schema for flexibility — DB column is UUID.
- Updated_at triggers created in migration SQL (Prisma `@updatedAt` generates client-side logic; triggers ensure DB-level consistency).
- Index on `(module_id, status)` added per sprint plan performance requirement.

---

## Acceptance Criteria

- ✅ `prisma/schema.prisma` contains Module, Task, and AuditLog models
- ✅ Migration applied successfully via Supabase MCP (`add_module_task_auditlog`)
- ✅ RLS enabled on `modules` and `tasks` tables (verified: `relrowsecurity = true` for both)
- ✅ `prisma generate` runs without errors
- ✅ `tsc --noEmit` passes after schema change

---

## Verification

**Command:**
```bash
pnpm prisma generate && pnpm tsc --noEmit
```

**Expected result:** No errors.

---

## Notes

- Prisma 7: `url` and `directUrl` in `datasource db {}` block are no longer supported — connection config belongs in `prisma.config.ts`.
- RLS Worker policy: Worker sees tasks where `owner_id = auth.uid()::text` OR role is management/company_admin. Consultant bypasses via service role key (server-side only — no policy needed).
- `SUPABASE_SERVICE_ROLE_KEY` must never appear in client code.
