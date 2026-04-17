# Sprint 1 — Tech Stack Scaffolding

| Field | Value |
|-------|-------|
| **Sprint ID** | S1 |
| **Name** | Tech Stack Scaffolding |
| **Goal** | Running skeleton — framework, auth, database, deployment pipeline, base routing. Nothing ships to users; everything builds. |
| **Status** | PENDING |
| **Token Budget** | ~120K EST |
| **Date** | 2026-04-17 |

---

## REQ Scope

| REQ | Requirement | How addressed |
|-----|-------------|---------------|
| REQ-010 | Data residency — EU only | Supabase instance pinned to eu-north-1 (Stockholm); region confirmed in T02 before any other sprint begins |
| REQ-013 | Agent-friendly operation | Supabase MCP + CLI for migrations; Prisma schema-first workflow; all secrets via env vars not hard-coded |
| REQ-001 | Multi-tenant structure | Tenant + User tables with tenant_id FK; RLS policies enforcing isolation at DB level |

---

## Task List (Ordered — Sequential)

Dependencies run top-to-bottom. No task may begin before its dependency exits acceptance.

| # | Task ID | Name | Complexity | Label | Depends On | Token EST |
|---|---------|------|------------|-------|------------|-----------|
| 1 | T01 | Next.js project scaffold | SIMPLE | AFK | — | 8K |
| 2 | T02 | Supabase link + Prisma init | MEDIUM | HITL | T01 | 12K |
| 3 | T03 | Supabase Auth + middleware | MEDIUM | AFK | T02 | 18K |
| 4 | T04 | Tenant + User schema | MEDIUM | AFK | T02 | 14K |
| 5 | T05 | RLS policies | COMPLEX | AFK | T04 | 20K |
| 6 | T06 | Base routing shells | SIMPLE | AFK | T03, T05 | 10K |
| 7 | T07 | Vercel deployment pipeline | MEDIUM | HITL | T01 | 12K |
| 8 | T08 | Env docs + CI gates | SIMPLE | AFK | T06, T07 | 8K |
| 9 | T09 | Smoke test | SIMPLE | HITL | T08 | 6K |

**Total EST:** 108K (12K headroom within 120K budget)

---

## Tasks

---

### T01 — Next.js Project Scaffold

**Complexity:** SIMPLE
**Label:** AFK
**Dependencies:** None
**Token EST:** 8K
**Token Actual:** ___

#### Description

Initialize the Next.js App Router project with TypeScript strict mode, Tailwind CSS, shadcn/ui, and pnpm as the package manager. This is the foundation every subsequent task builds on. The project must be created fresh — no `pages/` directory, no CRA, no other scaffolders.

#### Steps

1. Run `pnpm create next-app@latest iso-admin-tool --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` in the repo root. Confirm latest stable Next.js version at execution time and record it.
2. Remove the `public/` placeholder files (`next.svg`, `vercel.svg`) and clear `src/app/page.tsx` to a minimal placeholder.
3. Initialize shadcn/ui: `pnpm dlx shadcn@latest init`. Choose New York style, slate base color, CSS variables enabled.
4. Install the Button component to verify shadcn is wired: `pnpm dlx shadcn@latest add button`.
5. Verify TypeScript strict mode in `tsconfig.json`: confirm `"strict": true` is present.
6. Create `lib/ai/index.ts` as an empty placeholder module with a comment: `// AI call layer — V2 activation point (REQ-009, DEC-008). Do not import from this module in V1.`
7. Run `pnpm tsc --noEmit` — expect zero errors.
8. Run `pnpm lint` — expect zero errors.
9. Commit to branch `sprint-1-scaffolding`.

#### Acceptance Criteria

- [ ] `pnpm dev` starts without errors and renders a placeholder page at `localhost:3000`
- [ ] `tsconfig.json` contains `"strict": true`
- [ ] No `pages/` directory exists anywhere in the project
- [ ] `components/ui/button.tsx` exists (shadcn init confirmed)
- [ ] `lib/ai/index.ts` exists with the V2 placeholder comment
- [ ] `pnpm tsc --noEmit` exits 0
- [ ] `pnpm lint` exits 0
- [ ] Package manager is pnpm — `pnpm-lock.yaml` present, no `package-lock.json` or `yarn.lock`

#### Verification

```bash
pnpm tsc --noEmit && pnpm lint && ls pnpm-lock.yaml && ls src/app && ls components/ui/button.tsx && ls lib/ai/index.ts
```

**Expected result:** All commands exit 0. Files listed exist. No `pages/` in output.

#### Notes

- Tech constraint: `pnpm` ONLY. If the scaffolder defaults to npm, copy `node_modules` is irrelevant — delete it and reinstall with pnpm.
- Tech constraint: App Router only. `--app` flag is mandatory.
- Record the exact Next.js, Tailwind, and shadcn versions installed and update `docs/TECH_STACK.md` under "Layer Reference / Framework / Version target" at sprint exit (T08).
- Carry-forward (LEARNINGS Sprint 0): `lib/ai/` placeholder is required in Sprint 1, not Sprint 2. Do it here.

---

### T02 — Supabase Link + Prisma Init

**Complexity:** MEDIUM
**Label:** HITL
**Dependencies:** T01
**Token EST:** 12K
**Token Actual:** ___

#### Description

Thomas provides the Supabase credentials for the pre-provisioned Stockholm instance. The worker links the project to Prisma, creates the initial schema, and applies the first (empty baseline) migration. This task cannot proceed until Thomas confirms the credentials and region.

**HITL action required from Thomas:**
1. Open the Supabase dashboard for this project.
2. Confirm the region shows `eu-north-1` (Stockholm). Screenshot or verbal confirmation is sufficient.
3. Provide the following values for `.env.local`:
   - `DATABASE_URL` — the pooled connection string (Settings > Database > Connection pooling > Transaction mode, port 6543)
   - `DIRECT_URL` — the direct connection string (Settings > Database > Connection string, port 5432)
   - `NEXT_PUBLIC_SUPABASE_URL` — the project URL (Settings > API > Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — the anon public key (Settings > API > Project API keys > anon public)
   - `SUPABASE_SERVICE_ROLE_KEY` — the service role key (Settings > API > Project API keys > service_role) — treat as a secret, never commit

#### Steps

1. Wait for Thomas to provide credentials and confirm eu-north-1. Do not proceed without confirmation.
2. Create `.env.local` at project root with the five variables Thomas provides. Add `.env.local` to `.gitignore` (Next.js scaffolder does this by default — verify it is present).
3. Install Prisma: `pnpm add -D prisma` and `pnpm add @prisma/client`.
4. Initialize Prisma: `pnpx prisma init`. This creates `prisma/schema.prisma` and adds `DATABASE_URL` reference.
5. Update `prisma/schema.prisma`:
   - Set `provider = "postgresql"`
   - Add `directUrl = env("DIRECT_URL")` under the datasource block
   - Leave the model section empty for now (T04 adds models)
6. Run `pnpx prisma migrate dev --name baseline` — this creates the first migration with an empty SQL file. Confirm the migration applies to Supabase without errors.
7. Run `pnpx prisma generate` to generate the client.
8. Confirm Supabase region by checking dashboard or running: `pnpx supabase projects list` (if Supabase CLI is installed) — region must show `eu-north-1`.

#### Acceptance Criteria

- [ ] Thomas has confirmed eu-north-1 region in Supabase dashboard before any migration runs
- [ ] `.env.local` exists with all five required variables
- [ ] `.env.local` is listed in `.gitignore` — confirmed not tracked by git
- [ ] `prisma/schema.prisma` exists with `directUrl` set
- [ ] `prisma/migrations/` directory exists with at least one migration folder
- [ ] `pnpx prisma migrate status` shows no pending migrations
- [ ] `pnpx prisma generate` exits 0

#### Verification

```bash
pnpx prisma migrate status && pnpx prisma generate && git check-ignore .env.local
```

**Expected result:** `migrate status` shows "Database schema is up to date". `generate` exits 0. `git check-ignore` returns `.env.local` (confirming it is ignored).

#### Notes

- Tech constraint: `DATABASE_URL` must be the pooled connection (port 6543, transaction mode) — NOT the direct connection. Using direct URL at runtime causes connection pool exhaustion on Vercel.
- Tech constraint: `DIRECT_URL` is for migrations only — Prisma uses it internally when running `prisma migrate`.
- Tech constraint: `SUPABASE_SERVICE_ROLE_KEY` must never be committed — double-check `.gitignore` before commit.
- Gotcha: If Prisma generates a `schema.prisma` with `provider = "postgresql"` but the Supabase connection string uses `?pgbouncer=true`, add `connection_limit = 1` to the datasource block for local dev stability.

---

### T03 — Supabase Auth + Middleware

**Complexity:** MEDIUM
**Label:** AFK
**Dependencies:** T02
**Token EST:** 18K
**Token Actual:** ___

#### Description

Configure Supabase Auth for email/password login, install the `@supabase/ssr` package, create the Supabase client utilities (server and browser), and implement Next.js middleware that refreshes the session on every request and protects authenticated routes.

#### Steps

1. Install dependencies: `pnpm add @supabase/supabase-js @supabase/ssr`.
2. Create `lib/supabase/server.ts` — exports a `createClient()` function using `createServerClient` from `@supabase/ssr`, reading cookies from Next.js `cookies()`.
3. Create `lib/supabase/browser.ts` — exports a `createBrowserClient()` function using `createBrowserClient` from `@supabase/ssr`, reading `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Create `middleware.ts` at project root (not inside `src/`). The middleware must:
   - Call `createServerClient` with cookie read/write access
   - Call `supabase.auth.getUser()` to refresh the session (updates the cookie if the JWT has been refreshed)
   - Redirect unauthenticated users hitting any `/dashboard` or `/[tenantSlug]` or `/admin` path to `/login`
   - Allow unauthenticated access to `/login` and all Next.js internals (`/_next/`, `/favicon.ico`)
   - Export a `config.matcher` that excludes static files
5. Create `src/app/login/page.tsx` — minimal login form (email + password inputs, submit button using shadcn Button). Use a Server Action to call `supabase.auth.signInWithPassword()`. On success, redirect to `/dashboard`.
6. Create `src/app/auth/callback/route.ts` — handles the Supabase auth callback for email confirmation links (required for email/password flow even if not immediately used).
7. Test locally: navigate to `/dashboard` without being logged in — confirm redirect to `/login`. Log in — confirm redirect to `/dashboard` (which can 404 for now; the redirect is the success criterion).

#### Acceptance Criteria

- [ ] `lib/supabase/server.ts` and `lib/supabase/browser.ts` exist and use `@supabase/ssr` (NOT `@supabase/auth-helpers-nextjs`)
- [ ] `middleware.ts` exists at project root with `matcher` config
- [ ] Unauthenticated request to `/dashboard` redirects to `/login` (verifiable with `curl -I` or browser)
- [ ] Login form renders at `/login` with email and password fields
- [ ] Successful login redirects away from `/login`
- [ ] `pnpm tsc --noEmit` exits 0
- [ ] `pnpm lint` exits 0

#### Verification

```bash
pnpm tsc --noEmit && pnpm lint
```

Then manually: navigate to `http://localhost:3000/dashboard` — must redirect to `/login`.

**Expected result:** TypeScript and lint pass. Browser redirects to `/login` when unauthenticated.

#### Notes

- Tech constraint: Use `@supabase/ssr` — NOT the deprecated `@supabase/auth-helpers-nextjs`. The cookie handling API is different.
- Tech constraint: Middleware MUST call `supabase.auth.getUser()` on every request to refresh the session. Skipping this causes stale JWT tokens after expiry.
- Gotcha: `middleware.ts` must be at project root (same level as `package.json`), not inside `src/`. Next.js will not pick it up from inside `src/`.
- Pattern: Follow Supabase's official Next.js App Router SSR guide exactly for the cookie handling pattern. The cookie setter in middleware is security-critical.
- DEC-010 note: The `/login` page uses generic labels — no ISO clause references anywhere in auth UI.

---

### T04 — Tenant + User Schema

**Complexity:** MEDIUM
**Label:** AFK
**Dependencies:** T02
**Token EST:** 14K
**Token Actual:** ___

#### Description

Define the `Tenant` and `User` Prisma models, run and apply the migration to Supabase, and confirm the tables exist. The role enum must include all four RBAC tiers. This task runs in parallel with T03 (both depend on T02; T03 does not depend on T04, and T04 does not depend on T03) but both must complete before T05.

#### Steps

1. Open `prisma/schema.prisma`.
2. Add the `Role` enum:
   ```prisma
   enum Role {
     worker
     management
     company_admin
     consultant
   }
   ```
3. Add the `Tenant` model:
   ```prisma
   model Tenant {
     id        String   @id @default(cuid())
     name      String
     slug      String   @unique
     createdAt DateTime @default(now()) @map("created_at")
     updatedAt DateTime @updatedAt @map("updated_at")
     users     User[]

     @@map("tenants")
   }
   ```
4. Add the `User` model (linking to Supabase Auth's `auth.users` table via the `id` field — Supabase Auth creates the auth record; this table stores app-level profile data):
   ```prisma
   model User {
     id        String   @id  // Must match auth.users.id (UUID from Supabase)
     email     String   @unique
     role      Role     @default(worker)
     tenantId  String   @map("tenant_id")
     tenant    Tenant   @relation(fields: [tenantId], references: [id])
     createdAt DateTime @default(now()) @map("created_at")
     updatedAt DateTime @updatedAt @map("updated_at")

     @@map("users")
   }
   ```
5. Run `pnpx prisma migrate dev --name add-tenant-user` — review the generated SQL before confirming.
6. Run `pnpx prisma generate`.
7. Verify in Supabase dashboard (Table Editor) that `tenants` and `users` tables exist with correct columns.
8. Confirm `users.id` is UUID type (not auto-increment) — it must match Supabase Auth's `auth.users.id`.

#### Acceptance Criteria

- [ ] `prisma/schema.prisma` contains `Role` enum with all four values: `worker`, `management`, `company_admin`, `consultant`
- [ ] `tenants` table exists in Supabase with columns: `id`, `name`, `slug` (unique), `created_at`, `updated_at`
- [ ] `users` table exists in Supabase with columns: `id` (UUID, PK), `email` (unique), `role` (enum), `tenant_id` (FK to tenants), `created_at`, `updated_at`
- [ ] `pnpx prisma migrate status` shows no pending migrations
- [ ] `pnpx prisma generate` exits 0
- [ ] `pnpm tsc --noEmit` exits 0

#### Verification

```bash
pnpx prisma migrate status && pnpx prisma generate && pnpm tsc --noEmit
```

Then in Supabase dashboard: Table Editor → confirm `tenants` and `users` tables are present with correct columns.

**Expected result:** All commands exit 0. Both tables visible in Supabase with correct schema.

#### Notes

- Tech constraint: The `User.id` field must be a plain `String @id` with no `@default()` — the ID comes from Supabase Auth (`auth.users.id`). An application that sets its own ID will break the Auth ↔ User link.
- DEC-004: All future tenant-scoped tables will follow the same `tenant_id` FK pattern established here.
- RBAC carry-forward (LEARNINGS Sprint 0): All four roles must be in the enum — `worker`, `management`, `company_admin`, `consultant`. The `management` tier is distinct from `company_admin` — do not merge them.
- Gotcha: Prisma will generate the enum as a PostgreSQL `CREATE TYPE` — if the migration fails due to enum already existing (e.g., from a manual attempt), drop the type in Supabase SQL editor before re-running.

---

### T05 — RLS Policies

**Complexity:** COMPLEX
**Label:** AFK
**Dependencies:** T04
**Token EST:** 20K
**Token Actual:** ___

#### Description

Enable Row-Level Security on `tenants` and `users` tables. Write RLS policies that enforce tenant isolation: a user may only read/write rows where `tenant_id` matches their own `tenant_id`, resolved via `auth.uid()`. Write a Supabase SQL function `get_user_tenant_id()` to encapsulate the lookup. Verify isolation with two test tenants and two test users.

#### Steps

1. In Supabase SQL editor (or via migration file), write the following SQL. Apply via `pnpx supabase migration new add-rls-policies` and place the SQL there, then apply with `pnpx supabase db push` OR apply directly via Supabase MCP `apply_migration` tool.

2. Enable RLS on both tables:
   ```sql
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
   ```

3. Create the helper function (runs as SECURITY DEFINER to read `auth.users`):
   ```sql
   CREATE OR REPLACE FUNCTION get_user_tenant_id()
   RETURNS text
   LANGUAGE sql
   SECURITY DEFINER
   STABLE
   AS $$
     SELECT tenant_id FROM users WHERE id = auth.uid()::text
   $$;
   ```

4. Create RLS policies for `users` table:
   ```sql
   -- Users can read their own tenant's users
   CREATE POLICY "users_select_same_tenant"
     ON users FOR SELECT
     USING (tenant_id = get_user_tenant_id());

   -- Users can update their own row only
   CREATE POLICY "users_update_own"
     ON users FOR UPDATE
     USING (id = auth.uid()::text);

   -- Insert allowed for authenticated users (for registration flow — service role will set tenant_id)
   CREATE POLICY "users_insert_authenticated"
     ON users FOR INSERT
     WITH CHECK (auth.role() = 'authenticated');
   ```

5. Create RLS policies for `tenants` table:
   ```sql
   -- Users can read their own tenant only
   CREATE POLICY "tenants_select_own"
     ON tenants FOR SELECT
     USING (id = get_user_tenant_id());
   ```

6. Document the service role bypass: the `SUPABASE_SERVICE_ROLE_KEY` bypasses all RLS. This key is used only in Server Actions for consultant operations (Sprint 8). No policy for it is required — bypass is inherent to the key type.

7. Write a Vitest test file at `src/__tests__/rls.test.ts`. The test must:
   - Create two tenants (Tenant A, Tenant B) via service role client
   - Create one user in each tenant via service role client
   - Log in as User A (anon client)
   - Attempt to SELECT from `users` where `tenant_id = Tenant B's ID` — expect empty result
   - Attempt to SELECT from `tenants` where `id = Tenant B's ID` — expect empty result
   - Log in as User B and confirm they see only Tenant B rows

8. Run the Vitest test: `pnpm vitest run src/__tests__/rls.test.ts`.

#### Acceptance Criteria

- [ ] RLS is enabled on both `users` and `tenants` tables (verifiable in Supabase dashboard under Authentication > Policies)
- [ ] `get_user_tenant_id()` function exists in Supabase
- [ ] Three policies exist on `users`: select (same tenant), update (own row), insert (authenticated)
- [ ] One policy exists on `tenants`: select (own tenant)
- [ ] Vitest RLS isolation test passes: User A cannot read Tenant B data
- [ ] `pnpm tsc --noEmit` exits 0
- [ ] `pnpm lint` exits 0

#### Verification

```bash
pnpm vitest run src/__tests__/rls.test.ts && pnpm tsc --noEmit && pnpm lint
```

**Expected result:** Vitest test passes. All checks exit 0.

#### Notes

- Tech constraint: Every tenant-scoped table must have RLS enabled before the sprint exits — no exceptions (TECH_STACK.md Non-Negotiables).
- Tech constraint: `SUPABASE_SERVICE_ROLE_KEY` is only used in the test file via `process.env.SUPABASE_SERVICE_ROLE_KEY` — the test runs server-side only and the key never reaches client code.
- DEC-004: The `get_user_tenant_id()` helper pattern must be used on all future tables — document this pattern in a comment in the migration file so future workers follow it.
- DEC-005: Consultant bypass uses service role key on the server — this is correct and does not require a special RLS policy.
- Gotcha: `auth.uid()` returns a UUID but `users.id` is stored as `text` in Prisma (mapped from UUID) — the cast `auth.uid()::text` in the function is required. If the column type is UUID natively, remove the cast.
- Gotcha: The `SECURITY DEFINER` on `get_user_tenant_id()` is required because the function reads the `users` table which has RLS enabled — without it, the function would be subject to RLS itself and could return null.

---

### T06 — Base Routing Shells

**Complexity:** SIMPLE
**Label:** AFK
**Dependencies:** T03, T05
**Token EST:** 10K
**Token Actual:** ___

#### Description

Create the base route structure for the application: login page (already created in T03), dashboard shell, tenant-scoped shell, and consultant admin shell. Each route renders a minimal layout with a placeholder heading — no real content. Routes must respect middleware protection from T03.

#### Steps

1. Create `src/app/dashboard/page.tsx` — renders `<h1>Dashboard</h1>` placeholder. This is the post-login landing page for all non-consultant users.
2. Create `src/app/dashboard/layout.tsx` — wraps dashboard routes. Include a minimal nav placeholder (no real links yet). Server Component.
3. Create `src/app/[tenantSlug]/page.tsx` — renders `<h1>Tenant: {params.tenantSlug}</h1>`. This will become the per-tenant home page.
4. Create `src/app/[tenantSlug]/layout.tsx` — wraps tenant-scoped routes. Server Component. Reads `params.tenantSlug`.
5. Create `src/app/admin/page.tsx` — renders `<h1>Consultant Admin</h1>`. Protected: only the `consultant` role may access this route.
6. Create `src/app/admin/layout.tsx` — wraps admin routes. Server Component.
7. Update `middleware.ts` to add the `/admin` route check: if the authenticated user's role is not `consultant`, redirect to `/dashboard`.
8. Create `src/app/page.tsx` (root) — redirect to `/dashboard` if authenticated, redirect to `/login` if not. Use a Server Component with `redirect()` from `next/navigation`.
9. Install a minimal shadcn component for layout if needed — do not add anything not required.
10. Run `pnpm tsc --noEmit` and `pnpm lint` — both must pass.

#### Acceptance Criteria

- [ ] `src/app/login/page.tsx` exists (from T03)
- [ ] `src/app/dashboard/page.tsx` and `src/app/dashboard/layout.tsx` exist
- [ ] `src/app/[tenantSlug]/page.tsx` and `src/app/[tenantSlug]/layout.tsx` exist
- [ ] `src/app/admin/page.tsx` and `src/app/admin/layout.tsx` exist
- [ ] Root `src/app/page.tsx` redirects based on auth state
- [ ] Unauthenticated user hitting `/dashboard` redirects to `/login` (middleware from T03)
- [ ] Non-consultant user hitting `/admin` redirects to `/dashboard`
- [ ] `pnpm tsc --noEmit` exits 0
- [ ] `pnpm lint` exits 0

#### Verification

```bash
pnpm tsc --noEmit && pnpm lint
```

Then manually verify: unauthenticated → `/dashboard` → redirect to `/login`. Consultant user → `/admin` → renders. Non-consultant → `/admin` → redirect to `/dashboard`.

**Expected result:** All checks pass. Route protection works for all three protected paths.

#### Notes

- DEC-010: Route labels use PDCA framing — not ISO clause labels. `/dashboard` is the entry point, not `/iso-modules`. The `/[tenantSlug]/` structure accommodates future per-tenant routing without exposing internal IDs.
- Tech constraint: All route layouts must be Server Components unless interactivity is explicitly required.
- Gotcha: `[tenantSlug]` is a dynamic segment — ensure the middleware matcher does not accidentally block dynamic tenant routes. Test with a literal slug like `/acme-corp`.

---

### T07 — Vercel Deployment Pipeline

**Complexity:** MEDIUM
**Label:** HITL
**Dependencies:** T01
**Token EST:** 12K
**Token Actual:** ___

#### Description

Confirm that the Vercel project is linked to the GitHub repository and that deployments trigger automatically. Set the required environment variables in Vercel. Confirm both preview (feature branch) and production (main branch) deployments succeed.

**HITL action required from Thomas:**
1. Confirm in Vercel dashboard that the project is linked to the correct GitHub repo (this was provisioned in Sprint 0 — just confirm).
2. Add the following environment variables to Vercel (Settings > Environment Variables) for all environments (Production, Preview, Development):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` — Production and Preview only (not Development)
3. Push the `sprint-1-scaffolding` branch to GitHub and confirm a preview deployment triggers.
4. Confirm the preview deployment URL opens and renders the login redirect (not a 500 error).
5. Confirm production deployment triggers on merge to `main` (or Thomas can trigger manually from Vercel dashboard to validate).

#### Steps (Worker — after Thomas confirms)

1. Verify `vercel.json` does not exist (Vercel auto-detects Next.js — no config file needed unless override is required).
2. Confirm `.gitignore` includes `.env.local` and `.env*.local`.
3. Create `.env.example` at project root documenting all required variables with placeholder values (no real secrets):
   ```
   DATABASE_URL=postgresql://...
   DIRECT_URL=postgresql://...
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
4. Push branch to GitHub: `git push origin sprint-1-scaffolding`.
5. Wait for Thomas to confirm preview deployment URL is live and renders correctly.

#### Acceptance Criteria

- [ ] Vercel project is linked to GitHub repo (Thomas confirmed)
- [ ] All five environment variables are set in Vercel dashboard (Thomas confirmed)
- [ ] Push to `sprint-1-scaffolding` triggers a Vercel preview deployment
- [ ] Preview deployment URL renders without 500 error (login redirect or login page visible)
- [ ] `.env.example` exists at project root with all variable names documented (no real values)
- [ ] `.env.local` is not committed to git

#### Verification

```bash
git check-ignore .env.local && ls .env.example
```

Then Thomas confirms in Vercel dashboard: preview deployment status = Ready.

**Expected result:** `.env.local` is git-ignored. `.env.example` exists. Vercel shows preview deployment as Ready.

#### Notes

- Tech constraint: Environment variables are managed via Vercel dashboard or `vercel env` CLI — never committed to source.
- Carry-forward (LEARNINGS Sprint 0): Supabase instance and Vercel+GitHub connection are already provisioned — this task is confirming and wiring, not provisioning from scratch.
- Gotcha: `SUPABASE_SERVICE_ROLE_KEY` must be added to Vercel as server-only (not prefixed with `NEXT_PUBLIC_`). Never set it in the browser environment.

---

### T08 — Env Docs + CI Gates

**Complexity:** SIMPLE
**Label:** AFK
**Dependencies:** T06, T07
**Token EST:** 8K
**Token Actual:** ___

#### Description

Document all environment variables in `docs/TECH_STACK.md`, pin all dependency versions used in Sprint 1, and confirm that `tsc --noEmit` and ESLint pass as the CI gate. Update `README.md` with the exact steps to run the app from a fresh clone.

#### Steps

1. Read `docs/TECH_STACK.md` and update the "Environment Variables Reference" table with any variables added during Sprint 1 (all five should already be listed — verify and correct if needed).
2. Update "Layer Reference / Framework / Version target" in `docs/TECH_STACK.md` with the exact pinned versions:
   - Next.js version (from `package.json`)
   - Tailwind CSS version
   - shadcn/ui version
   - Prisma version
   - `@supabase/ssr` version
3. Create or update `README.md` at project root with:
   - **Prerequisites:** Node.js version, pnpm install command
   - **Clone and install:** `git clone` + `pnpm install`
   - **Environment setup:** Copy `.env.example` to `.env.local` and fill values (link to Supabase dashboard for values)
   - **Database:** `pnpx prisma migrate dev`
   - **Run locally:** `pnpm dev`
   - **Type check:** `pnpm tsc --noEmit`
   - **Lint:** `pnpm lint`
4. Run the full CI gate sequence:
   ```bash
   pnpm tsc --noEmit
   pnpm lint
   ```
5. Both must exit 0. If either fails, fix the issue before proceeding to T09.
6. Commit all Sprint 1 changes on `sprint-1-scaffolding` branch with commit message: `feat(sprint-1): tech stack scaffold — Next.js, Supabase Auth, Prisma, RLS, base routing`.

#### Acceptance Criteria

- [ ] `docs/TECH_STACK.md` "Environment Variables Reference" table contains all five Sprint 1 variables
- [ ] `docs/TECH_STACK.md` contains pinned versions for Next.js, Tailwind, shadcn/ui, Prisma, `@supabase/ssr`
- [ ] `README.md` exists with complete setup steps that allow a fresh clone to run locally
- [ ] `pnpm tsc --noEmit` exits 0
- [ ] `pnpm lint` exits 0
- [ ] All Sprint 1 changes committed on `sprint-1-scaffolding` branch

#### Verification

```bash
pnpm tsc --noEmit && pnpm lint && git log --oneline -5
```

**Expected result:** Both checks exit 0. Git log shows the Sprint 1 commit.

#### Notes

- Carry-forward (LEARNINGS Sprint 0): Pinning versions in `docs/TECH_STACK.md` at sprint exit is mandatory — do not leave "latest stable" as the recorded version after scaffold is done.
- The README steps must be tested mentally as "zero prior knowledge" — if a new developer can follow the steps without asking questions, it is sufficient.

---

### T09 — Smoke Test

**Complexity:** SIMPLE
**Label:** HITL
**Dependencies:** T08
**Token EST:** 6K
**Token Actual:** ___

#### Description

Thomas manually runs the end-to-end smoke test to confirm the entire sprint works as an integrated whole. This is the final HITL gate before the sprint is marked complete.

**HITL action required from Thomas:**

Run the following scenario manually (local dev environment or Vercel preview URL):

1. Fresh clone from GitHub: `git clone <repo> && cd iso-admin-tool && pnpm install`.
2. Copy `.env.example` to `.env.local` and fill in real values from Supabase dashboard.
3. Run `pnpx prisma migrate dev` — confirm exits 0.
4. Run `pnpm dev` — confirm app starts at `localhost:3000`.
5. Navigate to `http://localhost:3000` — confirm redirect to `/login`.
6. In Supabase dashboard (Authentication > Users), manually create a test user with email `test-worker@acme.test` and a password.
7. In Supabase dashboard (Table Editor), manually insert a row in `tenants`: `{ name: 'Acme Corp', slug: 'acme-corp' }`.
8. In Supabase dashboard (Table Editor), manually insert a row in `users`: `{ id: <UUID from auth user>, email: 'test-worker@acme.test', role: 'worker', tenant_id: <ID from tenants row> }`.
9. Log in at `/login` with the test user credentials — confirm redirect to `/dashboard`.
10. Navigate to `/acme-corp` — confirm the tenant shell renders without error.
11. Navigate to `/admin` — confirm redirect to `/dashboard` (worker role blocked).
12. Log out (navigate to `/login` directly or use a sign-out link if present) — confirm session is cleared (navigating to `/dashboard` redirects to `/login`).

#### Acceptance Criteria

- [ ] Fresh clone + pnpm install succeeds
- [ ] `pnpx prisma migrate dev` exits 0 on a fresh clone
- [ ] App starts locally with `pnpm dev`
- [ ] Unauthenticated root visit redirects to `/login`
- [ ] Login with valid credentials redirects to `/dashboard`
- [ ] `/acme-corp` tenant shell renders for the logged-in user
- [ ] `/admin` route is blocked for worker role — redirects to `/dashboard`
- [ ] Logout clears session — subsequent `/dashboard` visit redirects to `/login`

#### Verification

Thomas confirms each checkbox above by running the scenario and reporting pass/fail. Any failure blocks the sprint from closing.

**Expected result:** All eight acceptance criteria pass. Thomas signs off on the smoke test.

#### Notes

- This is a manual gate — the worker agent cannot run this test autonomously.
- If any step fails, Thomas reports which step. The worker agent then diagnoses and fixes before Thomas re-runs from that step.
- The smoke test covers REQ-001 (tenant structure), REQ-010 (data stays in Stockholm — confirmed by Supabase region in T02), and the foundational auth flow required by all subsequent sprints.

---

## HITL Summary

| Task | What Thomas Must Do | Blocks |
|------|---------------------|--------|
| T02 | 1. Open Supabase dashboard and confirm region = eu-north-1 (Stockholm). 2. Provide all five `.env.local` credentials. | T03, T04, T05, T06 — nothing after T02 can run without credentials |
| T07 | 1. Confirm Vercel ↔ GitHub link is active. 2. Add all five env vars in Vercel dashboard. 3. Confirm preview deployment triggers and renders without error on `sprint-1-scaffolding` branch. | T08 — env docs cannot be finalized until deployment is confirmed |
| T09 | Run the full smoke test scenario (8 steps). Report pass/fail. Sign off to close the sprint. | Sprint close — sprint cannot be marked COMPLETE without T09 pass |

**Estimated HITL time:** T02 ≈ 10 min. T07 ≈ 15 min. T09 ≈ 20 min. Total: ~45 min Thomas time.

---

## Gates

### Automated CI Gate (runs at T08 and must pass before T09)

```bash
pnpm tsc --noEmit   # TypeScript strict mode — zero errors
pnpm lint           # ESLint — zero errors
pnpm vitest run src/__tests__/rls.test.ts   # RLS isolation test — all pass
```

All three must exit 0. Failures are blocking — do not proceed to T09 until all pass.

### Manual Gate (T09)

Thomas runs the smoke test scenario. All eight acceptance criteria must pass. Any failure is blocking.

### Deployment Gate (T07)

Preview deployment on Vercel must show status = Ready. A 500 error or build failure in Vercel is blocking — diagnose from Vercel build logs before proceeding to T08.

---

## Exit Criteria

- [ ] App runs locally from a fresh clone with only the steps documented in README
- [ ] App deploys successfully to Vercel (preview and production)
- [ ] Auth flow works end-to-end: register, login, protected route, logout
- [ ] Tenant isolation confirmed: user in Tenant A cannot query Tenant B's rows (RLS Vitest test passes)
- [ ] `tsc --noEmit` passes, ESLint passes
- [ ] Supabase region confirmed as eu-north-1 (Stockholm) — confirmed by Thomas in T02 before any migration runs
- [ ] All dependency versions pinned in `docs/TECH_STACK.md`
- [ ] `lib/ai/` placeholder module exists for V2 architecture accommodation (DEC-008)

---

## Token Tracking

| Task | EST | Actual | Delta |
|------|-----|--------|-------|
| T01 | 8K | ___ | ___ |
| T02 | 12K | ___ | ___ |
| T03 | 18K | ___ | ___ |
| T04 | 14K | ___ | ___ |
| T05 | 20K | ___ | ___ |
| T06 | 10K | ___ | ___ |
| T07 | 12K | ___ | ___ |
| T08 | 8K | ___ | ___ |
| T09 | 6K | ___ | ___ |
| **Total** | **108K** | ___ | ___ |

Budget remaining after total EST: 12K headroom.
