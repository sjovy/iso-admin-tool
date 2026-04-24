# Smoke Test Scenarios

Populated from sprint 2 onward — the first building sprint.
These scenarios run during the exit criteria phase via Playwright MCP.
Any failure is a hard gate — manual test session does not begin until all pass.

## Test Accounts

- Worker: `test-worker@acme.test` / `qwerty`
- Admin: `test-admin@acme-corp.test` / `TestAdmin123!`
- Tenant slug: `acme-corp`
- Dev server: `http://localhost:3000`

## Format

### Scenario: [Name]
- **URL**: /path/to/start
- **Steps**:
  1. Action description
- **Expected**: What should be true at the end

---

<!-- Add scenarios below this line -->

---

### Scenario: Login as Worker

- **URL**: `http://localhost:3000/login`
- **Steps**:
  1. Confirm the page shows a login form (email and password fields)
  2. Fill email field with `test-worker@acme.test`
  3. Fill password field with the test-worker password (ask Thomas if needed)
  4. Click the login / submit button
- **Expected**: User is redirected away from `/login` to a dashboard or tenant page; no error message visible

---

### Scenario: Authenticated user reaches tenant dashboard

- **URL**: `http://localhost:3000/acme` (navigate after login from previous scenario, or log in first)
- **Steps**:
  1. If not already logged in: log in as `test-worker@acme.test`
  2. Navigate to `http://localhost:3000/acme`
- **Expected**: Page loads without error; tenant content (modules list or dashboard) is visible; no redirect to login

---

### Scenario: Kanban board loads with columns

- **URL**: `http://localhost:3000/acme-corp/modules/planera`
- **Steps**:
  1. If not already logged in: log in as `test-worker@acme.test`
  2. Navigate to `http://localhost:3000/acme-corp/modules/planera`
- **Expected**: Page loads; at minimum one board column is visible (Backlog, Pågående, Granskning, or Klar); no JavaScript error in console

---

### Scenario: KPI register loads

- **URL**: `http://localhost:3000/acme-corp/kpis`
- **Steps**:
  1. If not already logged in: log in as `test-worker@acme.test`
  2. Navigate to `http://localhost:3000/acme-corp/kpis`
- **Expected**: KPI register page loads; either a list of KPIs is shown or an empty-state message; no JavaScript error in console; coverage indicator visible

---

### Scenario: Unauthenticated access to protected route redirects to login

- **URL**: `http://localhost:3000/acme-corp/modules/planera`
- **Steps**:
  1. Clear cookies / open a private/incognito browser session
  2. Navigate directly to `http://localhost:3000/acme-corp/modules/planera`
- **Expected**: User is redirected to `/login` or receives a 403/401 response; no board data is shown to an unauthenticated visitor
