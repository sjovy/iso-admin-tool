# Task: RAG Override UI

**Sprint:** 3
**Feature:** KPI Register — T07
**Complexity:** SIMPLE
**Estimated Tokens:** 35K
**Search Scope:** `src/components/kpi/`, `src/app/[tenantSlug]/kpis/[kpiId]/`

---

## Objective

Add `RagOverrideControl` component to detail page. Visible only to management/company_admin.

---

## Acceptance Criteria

- [ ] `RagOverrideControl` rendered on detail page for management/company_admin only
- [ ] Selecting a RAG value calls `setRagOverride`
- [ ] "Auto" selection clears override (passes `null`)
- [ ] Shows toast on success/error
- [ ] Refreshes page after change
- [ ] `tsc --noEmit` passes
