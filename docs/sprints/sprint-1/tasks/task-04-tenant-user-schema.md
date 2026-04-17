# Task: Tenant + User Schema

**Sprint:** 1
**Feature:** T04 — Tenant + User Schema
**Complexity:** MEDIUM
**Estimated Tokens:** 14K
**Search Scope:** prisma/schema.prisma, prisma/migrations/

---

## Context

**Previous work:** T02 complete — Prisma installed, baseline migration applied. T03 complete — auth middleware in place.
**Current state:** `prisma/schema.prisma` has generator + datasource blocks only. No models defined.
**Purpose:** Implements REQ-001 (multi-tenant structure). Tenant + User tables are the foundation for all tenant-scoped data and RLS policies (T05).

---

## Objective

Add `Role` enum, `Tenant` model, and `User` model to `prisma/schema.prisma`. Apply migration via Supabase MCP. Confirm tables exist in Supabase with correct columns.

---

## Steps

1. Add Role enum, Tenant model, User model to `prisma/schema.prisma`
2. Apply migration via `mcp__supabase__apply_migration` with name `add_tenant_user`
3. Run `pnpx prisma generate`
4. Verify tables in Supabase via `mcp__supabase__list_tables`
5. Run `pnpm tsc --noEmit`

---

## Acceptance Criteria

- [ ] `Role` enum with: worker, management, company_admin, consultant
- [ ] `tenants` table: id, name, slug (unique), created_at, updated_at
- [ ] `users` table: id (UUID PK — no default), email (unique), role (enum), tenant_id (FK), created_at, updated_at
- [ ] `pnpx prisma generate` exits 0
- [ ] `pnpm tsc --noEmit` exits 0

---

## Notes

- Tech constraint: `User.id` has NO `@default()` — the ID comes from Supabase Auth's `auth.users.id`
- DEC-004: All future tenant-scoped tables follow the same `tenant_id` FK pattern
- RBAC: All four roles required — `management` is distinct from `company_admin`, do not merge

**Token tracking:** Record actual tokens in SPRINT_PLAN.md after completion.
