# Task: Module List Page

**Sprint:** 2
**Feature:** Board UI — T06
**Complexity:** SIMPLE
**Estimated Tokens:** 35K
**Search Scope:** `src/app/[tenantSlug]/`, `src/types/board.ts`

---

## Context

**Previous work:** T02 (type contracts), T04 (getModuleList server action) completed by Track 1.
**Current state:** `getModuleList` returns `ActionResult<ModuleCard[]>`, sorted PLAN→DO→CHECK→ACT. shadcn `Card` and `Badge` installed.
**Purpose:** Tenant landing page showing all 9 ISO 9001 modules grouped by PDCA phase. REQ-002.

---

## Objective

Server Component page at `src/app/[tenantSlug]/modules/page.tsx` that renders 9 module cards grouped by PDCA phase with correct Swedish labels and color-coded phase badges.

---

## Steps

1. Install shadcn `card` and `badge` components via `pnpm dlx shadcn@latest add card badge`
2. Create `src/app/[tenantSlug]/modules/page.tsx` as Server Component
3. Call `getModuleList(tenantSlug)` — handle error state
4. Group modules by PDCA phase into four sections
5. Render section headers (PLAN=blue, DO=green, CHECK=amber, ACT=red)
6. Render `Card` per module with: name, phase badge, ISO clause ref, task count
7. Wrap card in `Link` to `/[tenantSlug]/modules/[moduleSlug]`
8. Run `pnpm tsc --noEmit` — verify clean

---

## Acceptance Criteria

- [x] Page renders all 9 modules for a seeded tenant
- [x] Modules grouped under correct PDCA phase headers
- [x] Each card shows Swedish name, PDCA badge, ISO clause, task count
- [x] Clicking a card navigates to board page
- [x] Server Component — no `"use client"` on this page
- [x] `tsc --noEmit` passes

---

## Verification

```bash
pnpm tsc --noEmit
```

**Expected result:** No errors.

---

## Notes

- Auth guard is provided by `src/app/[tenantSlug]/layout.tsx` — not duplicated here.
- `getModuleList` returns `ActionResult<ModuleCard[]>` — must handle the `!result.success` path.
- TaskOwner.name is actually email (Track 1 deviation) — not relevant here but noted.
- pnpm only — never npm/yarn.

**Token tracking:** ~25K actual
**Status:** COMPLETE
