# Task: Vercel Deployment Pipeline

**Sprint:** 1
**Feature:** T07 — Vercel Deployment Pipeline
**Complexity:** MEDIUM
**Estimated Tokens:** 12K
**Search Scope:** .vercel/, .env.example

---

## Context

**Previous work:** T01 complete — Next.js scaffold exists. T06 complete — all routes built.
**Current state:** Vercel project confirmed by PMO MCP: project ID prj_ACZmj1iANREh1xMDFIFUILpLnrZK, team sjovys-projects.
**Purpose:** Ensures CI/CD pipeline works end-to-end. Every push to main triggers a production deployment.

---

## Objective

Link the project locally via Vercel CLI, set all five env vars in Vercel, create .env.example, push to trigger deployment, confirm READY status.

---

## Steps

1. `vercel link --project iso-admin-tool --team sjovys-projects --yes`
2. Read each var from .env.local and add to Vercel via CLI
3. Create `.env.example` with placeholder values
4. `git push origin main`
5. Confirm deployment READY via `vercel ls`

---

## Acceptance Criteria

- [ ] .vercel/project.json exists (linked)
- [ ] All 5 env vars set in Vercel (production + preview; SUPABASE_SERVICE_ROLE_KEY not in development)
- [ ] .env.example exists with all variable names
- [ ] Push triggers deployment
- [ ] Deployment status = READY

---

## Notes

- SUPABASE_SERVICE_ROLE_KEY: production + preview only (not development — .env.local covers local dev)
- Tech constraint: env vars managed via Vercel CLI/dashboard — never committed to source
- .env.local must remain git-ignored

**Token tracking:** Record actual tokens in SPRINT_PLAN.md after completion.
