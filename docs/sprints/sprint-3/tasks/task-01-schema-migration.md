# Task: KPI & KPIMeasurement Prisma Schema + RLS + Migration

**Sprint:** 3
**Feature:** KPI Register — T01
**Complexity:** MEDIUM
**Estimated Tokens:** 70K
**Search Scope:** `prisma/schema.prisma`, `src/generated/prisma/`

---

## Context

**Previous work:** Sprint 2 established Task/Module/AuditLog schema. Pattern: UUID PK via `@default(uuid())`, snake_case column names via `@map(...)`, Tenant FK denormalized for RLS.
**Current state:** `prisma/schema.prisma` has Tenant, User, Module, Task, AuditLog. No KPI models yet.
**Purpose:** REQ-002 (Mäta & Utvärdera) requires KPI tracking. Two models: `Kpi` (definition) and `KpiMeasurement` (append-only time series).

---

## Objective

Add `Kpi` and `KpiMeasurement` models to the Prisma schema, apply migration via Supabase MCP, and enable RLS policies on both tables.

---

## Steps

1. Add `IsoCategory` and `RagStatus` enums to `prisma/schema.prisma`
2. Add `Kpi` model with all specified fields
3. Add `KpiMeasurement` model with all specified fields
4. Add `kpis Kpi[]` relation to Tenant model
5. Run `pnpm prisma generate`
6. Apply migration via Supabase MCP `apply_migration`
7. Apply RLS policies via Supabase MCP `execute_sql`
8. Run `pnpm tsc --noEmit`

---

## Acceptance Criteria

- [ ] `IsoCategory` and `RagStatus` enums present in schema
- [ ] `Kpi` model has all 12 fields
- [ ] `KpiMeasurement` model has all 7 fields (no `updatedAt`)
- [ ] Migration applied successfully
- [ ] RLS enabled; SELECT/INSERT/UPDATE/DELETE on kpis; SELECT/INSERT only on kpi_measurements
- [ ] `pnpm prisma generate` and `pnpm tsc --noEmit` pass

---

## Notes

- Interactive transactions required for audit log (Sprint 2 LEARNINGS)
- No `updatedAt` on `KpiMeasurement` — append-only enforced by RLS
- `ragOverride` is nullable — null means computed from latest measurement
