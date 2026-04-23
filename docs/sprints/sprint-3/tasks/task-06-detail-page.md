# Task: KPI Detail Page + Add Measurement Modal

**Sprint:** 3
**Feature:** KPI Register — T06
**Complexity:** SIMPLE
**Estimated Tokens:** 35K
**Search Scope:** `src/app/[tenantSlug]/kpis/`

---

## Objective

Create KPI detail page at `/[tenantSlug]/kpis/[kpiId]` with measurement history and add measurement modal.

---

## Acceptance Criteria

- [ ] Detail page renders KPI fields + measurement history
- [ ] "Add measurement" button opens modal
- [ ] Modal fields: actual (number), measuredAt (date picker), notes (textarea)
- [ ] Successful submit calls `addMeasurement`, shows toast, refreshes page
- [ ] History table is read-only (no delete/edit)
- [ ] `tsc --noEmit` passes
