# ISO Admin Tool

ISO 9001 compliance management platform. Multi-tenant, Swedish SMEs. Built on Next.js 16 App Router, Supabase, Prisma, Vercel.

## Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Access to the Supabase project (eu-north-1 / Stockholm)

## Clone and Install

```bash
git clone <repo-url>
cd iso-admin-tool
pnpm install
```

## Environment Setup

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the five values. Find them in the [Supabase dashboard](https://supabase.com/dashboard):

| Variable | Location in dashboard |
|----------|----------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Settings > API > Project API keys > anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings > API > Project API keys > service_role |
| `DATABASE_URL` | Settings > Database > Connection pooling > Transaction mode, port 6543 |
| `DIRECT_URL` | Settings > Database > Connection string, port 5432 |

## Database

Apply any pending Prisma migrations:

```bash
pnpx prisma migrate dev
```

Generate the Prisma client:

```bash
pnpx prisma generate
```

## Run Locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to `/login`.

## Type Check

```bash
pnpm tsc --noEmit
```

## Lint

```bash
pnpm lint
```

## Tests

```bash
pnpm vitest run src/__tests__/rls.test.ts
```

Requires all five env vars in `.env.local`. The RLS test creates and tears down test data in Supabase automatically.

## Tech Stack

| Layer | Choice | Version |
|-------|--------|---------|
| Framework | Next.js App Router | 16.2.4 |
| Language | TypeScript strict | 5.9.3 |
| Styling | Tailwind CSS | 4.2.2 |
| Components | shadcn/ui | 4.3.0 |
| Database | Supabase PostgreSQL | eu-north-1 |
| ORM | Prisma | 7.7.0 |
| Auth | @supabase/ssr | 0.10.2 |
| Hosting | Vercel | — |
| Package manager | pnpm | 10.33.0 |

Full details: `docs/TECH_STACK.md`
