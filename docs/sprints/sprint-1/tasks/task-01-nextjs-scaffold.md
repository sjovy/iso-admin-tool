# Task: Next.js Project Scaffold

**Sprint:** 1
**Feature:** T01 — Next.js Project Scaffold
**Complexity:** SIMPLE
**Estimated Tokens:** 8K
**Search Scope:** N/A

---

## Context

**Previous work:** Sprint 0 completed — PRD, implementation plan, tech stack, decisions, learnings documented. No code exists yet.
**Current state:** Repo root contains only `analysis/` and `docs/`. No `package.json`, no `src/`, no framework files.
**Purpose:** Foundation for all subsequent tasks. Every other sprint task depends on this scaffold existing. Addresses REQ-013 (agent-friendly operation via TypeScript strict mode and clean tooling).

---

## Objective

Initialize a Next.js App Router project with TypeScript strict mode, Tailwind CSS, ESLint, shadcn/ui, and pnpm into the current repo root. Create the `lib/ai/index.ts` V2 placeholder. All TypeScript and lint checks must pass.

---

## Steps

1. Run `pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` at repo root (`.` scaffolds into current directory, not a subdirectory).
2. Remove placeholder files: `public/next.svg`, `public/vercel.svg`. Clear `src/app/page.tsx` to a minimal placeholder.
3. Initialize shadcn/ui: `pnpm dlx shadcn@latest init` — choose New York style, slate base color, CSS variables enabled.
4. Install Button component: `pnpm dlx shadcn@latest add button`.
5. Verify `tsconfig.json` contains `"strict": true`.
6. Create `lib/ai/index.ts` with the V2 placeholder comment.
7. Run `pnpm tsc --noEmit` — expect zero errors.
8. Run `pnpm lint` — expect zero errors.

---

## Patterns to Follow

- **Location:** Sprint plan T01 steps
- **What it shows:** Exact CLI flags for `pnpm create next-app@latest` — `--app` is mandatory, no `pages/` dir
- **Apply to:** Step 1 scaffold command

---

## Acceptance Criteria

- [ ] `pnpm dev` starts without errors and renders a placeholder page at `localhost:3000`
- [ ] `tsconfig.json` contains `"strict": true`
- [ ] No `pages/` directory exists anywhere in the project
- [ ] `components/ui/button.tsx` exists (shadcn init confirmed)
- [ ] `lib/ai/index.ts` exists with the V2 placeholder comment
- [ ] `pnpm tsc --noEmit` exits 0
- [ ] `pnpm lint` exits 0
- [ ] `pnpm-lock.yaml` present, no `package-lock.json` or `yarn.lock`

---

## Verification

**Command:**
```bash
pnpm tsc --noEmit && pnpm lint && ls pnpm-lock.yaml && ls src/app && ls components/ui/button.tsx && ls lib/ai/index.ts
```

**Expected result:** All commands exit 0. Files listed exist. No `pages/` in output.

---

## Notes

- Tech constraint: `pnpm` ONLY — if scaffolder defaults to npm, delete node_modules and reinstall with pnpm.
- Tech constraint: App Router only — `--app` flag mandatory, no `pages/` directory.
- `lib/ai/index.ts` is required in Sprint 1 (carry-forward from LEARNINGS Sprint 0) — do not defer to Sprint 2.
- Record exact Next.js, Tailwind, shadcn versions after install for TECH_STACK.md update at T08.

**Token tracking:** Record actual tokens in SPRINT_PLAN.md after completion.
