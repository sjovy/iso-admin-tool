# Tech Stack
**Project:** ISO Admin Tool
**Version:** 1.1 — Sprint 1
**Last updated:** 2026-04-17

This document captures what is in use and what agents must know to work safely. For the *why* behind each choice, see `docs/DECISIONS.md`.

---

## Layer Reference

### Framework
| Item | Value |
|------|-------|
| Framework | Next.js — App Router |
| Version target | **16.2.4** (pinned at Sprint 1 scaffold — 2026-04-17) |
| Rendering | Server Components by default; Client Components only where interactivity requires it (drag-and-drop, modals) |
| **Agent constraint** | Use App Router conventions throughout — no `pages/` directory. Server Actions for mutations. |

---

### Language
| Item | Value |
|------|-------|
| Language | TypeScript |
| Mode | Strict (`"strict": true` in tsconfig) |
| **Agent constraint** | `tsc --noEmit` must pass at every quality gate. No `any` casts without a comment explaining why. |

---

### Package Manager
| Item | Value |
|------|-------|
| Package manager | pnpm |
| **Agent constraint** | Never use `npm install` or `yarn`. All dependency commands use `pnpm`. Lockfile is `pnpm-lock.yaml`. |

---

### Styling and UI Components
| Item | Value |
|------|-------|
| CSS framework | Tailwind CSS **4.2.2** (pinned at Sprint 1 scaffold) |
| Component library | shadcn/ui **4.3.0** (CLI version), style: new-york, baseColor: slate |
| shadcn install command | `pnpm dlx shadcn@latest add <component>` |
| **Agent constraint** | Do not install shadcn components via npm or yarn. Do not hand-roll components that shadcn provides. |
| **Gotcha** | shadcn writes to `components/ui/` — do not edit generated files directly; re-run the CLI to update. |

---

### Database
| Item | Value |
|------|-------|
| Database | Supabase (PostgreSQL) |
| Region | eu-north-1 — Stockholm |
| Status | Provisioned and confirmed by Thomas |
| **Agent constraint** | Region is non-negotiable (GDPR). Never create or migrate to a project outside eu-north-1. |
| **Agent constraint** | Supabase MCP + CLI for all migrations. Do not write raw SQL migrations by hand outside Prisma migration output. |

---

### ORM
| Item | Value |
|------|-------|
| ORM | Prisma **7.7.0** (pinned at Sprint 1 scaffold) |
| Style | Schema-first |
| Migration workflow | Applied via Supabase MCP `apply_migration` (Prisma 7 — `migrate dev` requires direct DB access; MCP used instead) |
| **Agent constraint** | Schema changes go through Prisma. Never alter Supabase tables directly via SQL console except in emergencies — document any exception. |
| **Gotcha** | Prisma's connection string must use the Supabase pooled connection URL for serverless (Vercel). Direct URL is for migrations only. Set both `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) in `.env.local`. |
| **Gotcha** | Prisma 7 `url`/`directUrl` belong in `prisma.config.ts`, NOT in `schema.prisma` datasource block — this is a Prisma 7 breaking change from v6. |
| **CRITICAL constraint** | Use interactive transactions (`prisma.$transaction(async (tx) => { ... })`) whenever the created entity's ID is needed within the same transaction (e.g. audit log). Batch transactions (`prisma.$transaction([op1, op2])`) do not allow op1's output to flow into op2. |
| **CRITICAL constraint** | When using Prisma 7 with `@prisma/adapter-pg` (driver adapter), do NOT pass `?pgbouncer=true` in the connection string to `PrismaPg`. That flag is a Prisma 4/5 built-in-pool hint; the `pg` driver receives it as a raw startup parameter and PgBouncer rejects the session. Strip it before passing to the adapter: `url.searchParams.delete('pgbouncer')`. |

---

### Authentication
| Item | Value |
|------|-------|
| Auth provider | Supabase Auth |
| V1 method | Email / password |
| Phase 2 method | Microsoft SSO (planned V3) |
| Session management | `@supabase/ssr` **0.10.2** + `@supabase/supabase-js` **2.103.3** (pinned at Sprint 1) |
| Route protection | Server Component layouts (middleware temporarily removed — see constraint below) |
| **Agent constraint** | Use `@supabase/ssr` — not the deprecated `@supabase/auth-helpers-nextjs`. The APIs differ. |
| **CRITICAL constraint** | Next.js 16 Turbopack bundles `@supabase/ssr` → `ws` → `__dirname` into Edge middleware, crashing every request. Do NOT add `middleware.ts` that imports `@supabase/ssr` or any package with a Node.js-only transitive dependency. Middleware must use dependency-free JWT cookie decode (`atob` only) until Next.js ships the Node.js `proxy.ts` convention. |

---

### Server Action Isolation Pattern

| Item | Value |
|------|-------|
| Mandatory tenant check | After `getUser()` and `resolveTenant()`, every server action must assert `appUser.tenantId === tenantId`. RLS enforces DB-level isolation but the application layer must also verify the authenticated user belongs to the resolved tenant. |
| **CRITICAL constraint** | Missing this check allows any authenticated user who knows a resource UUID to read or write data in a different tenant by supplying an arbitrary `tenantSlug`. Found in Sprint 3 judge review — apply retroactively to all server actions. |

---

### Row-Level Security (RLS)
| Item | Value |
|------|-------|
| Enforcement | Supabase RLS policies on every table that holds tenant data |
| Isolation model | `tenant_id` column on all tenant-scoped tables; RLS reads `auth.uid()` → `user.tenant_id` |
| Consultant bypass | Service role key used server-side for consultant super-admin operations; never exposed to client |
| **Agent constraint** | Every new table with tenant data must have RLS enabled and a corresponding `tenant_id` policy before the sprint exits. Never disable RLS on a tenant-scoped table. |
| **Agent constraint** | The service role key (`SUPABASE_SERVICE_ROLE_KEY`) must never appear in client-side code or be committed to source. |

---

### Hosting and Deployment
| Item | Value |
|------|-------|
| Hosting | Vercel |
| Status | Project created, GitHub repo connected — confirmed by Thomas |
| Deployment trigger | Push to `main` → production; push to feature branch → preview |
| CLI tool | Vercel CLI (`pnpm dlx vercel`) |
| **Agent constraint** | All deployments go through Vercel. Do not configure alternative hosting. |
| **Agent constraint** | Environment variables are managed via Vercel dashboard or `vercel env` CLI — never committed to source. |

---

### Version Control
| Item | Value |
|------|-------|
| VCS | GitHub |
| Status | Repo exists and linked to Vercel |
| Branch model | `main` is production. Feature work on `sprint-N-description` branches. |

---

### Drag-and-Drop
| Item | Value |
|------|-------|
| Library | `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` (installed Sprint 2) |
| Sensor config | `PointerSensor` with `activationConstraint: { distance: 8 }` — prevents accidental drag on click |
| **Agent constraint** | Always include `activationConstraint` on `PointerSensor`. Omitting it causes drag to fire on every click. |

---

### Toast Notifications
| Item | Value |
|------|-------|
| Library | `sonner` (via `pnpm dlx shadcn@latest add sonner`) |
| Integration | `<Toaster />` added to `src/app/layout.tsx` once — do not add again in child layouts |

---

### AI Integration
| Item | Value |
|------|-------|
| API | Anthropic Claude API |
| V1 key management | Platform-level key — stored as `ANTHROPIC_API_KEY` environment variable |
| V2 key management | Per-tenant keys (clients supply own key) — not V1 scope |
| Activation | AI features are deferred to V2; architecture must accommodate the integration point from Sprint 1 |
| **Agent constraint** | Do not activate AI features in V1 sprints. Do design the AI call layer as a named module so V2 can enable it without structural changes. |

---

### CI / Quality Gates
| Item | Value |
|------|-------|
| Type check | `tsc --noEmit` — must pass at every quality gate |
| Lint | ESLint — must pass at every quality gate |
| Unit tests | Vitest |
| Manual gates | HITL sessions as specified per sprint |
| **Agent constraint** | `tsc --noEmit` and ESLint must pass before a sprint is marked complete. Failing builds are not mergeable. |

---

## Environment Variables Reference

All variables go in `.env.local` (never committed). Document every variable here as it is added.

| Variable | Purpose | Required in |
|----------|---------|-------------|
| `DATABASE_URL` | Supabase pooled connection (Prisma runtime) | All environments |
| `DIRECT_URL` | Supabase direct connection (Prisma migrations) | Local dev, CI |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (client-safe) | All environments |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (client-safe) | All environments |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — server-only, never client | Server only |
| `ANTHROPIC_API_KEY` | Claude API key — platform-level for V1 | Server only (V2+) |

---

## Non-Negotiables

1. TypeScript strict mode — always on
2. pnpm — no other package manager
3. `tsc --noEmit` must pass before merging
4. Supabase region = eu-north-1 (Stockholm) — GDPR, cannot change
5. RLS enabled on every tenant-scoped table — no exceptions
6. Service role key and API keys never in client code, never committed
7. App Router only — no `pages/` directory
8. Migrations through Prisma + Supabase CLI — no ad-hoc SQL console changes
