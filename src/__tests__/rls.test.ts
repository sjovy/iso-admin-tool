/**
 * RLS Isolation Test
 *
 * Verifies that Row-Level Security correctly isolates tenant data:
 * - User A (Tenant A) cannot read Tenant B's rows
 * - User B (Tenant B) cannot read Tenant A's rows
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY for setup (bypasses RLS) — server-only, never reaches client.
 * This key must be present in .env.local or environment when running tests.
 */

import { createClient } from "@supabase/supabase-js";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { config } from "dotenv";

// Load .env.local for local test runs
config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing required env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY"
  );
}

// Service role client — bypasses all RLS (used for test setup/teardown only)
const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Test data IDs (will be set in beforeAll)
let tenantAId: string;
let tenantBId: string;
let userAAuthId: string;
let userBAuthId: string;

const TEST_EMAIL_A = `rls-test-user-a-${Date.now()}@test.invalid`;
const TEST_EMAIL_B = `rls-test-user-b-${Date.now()}@test.invalid`;
const TEST_PASSWORD = "TestPass123!";

beforeAll(async () => {
  // 1. Create Tenant A
  const { data: tenantA, error: tenantAErr } = await adminClient
    .from("tenants")
    .insert({ id: crypto.randomUUID(), name: "Tenant A (RLS Test)", slug: `rls-tenant-a-${Date.now()}` })
    .select("id")
    .single();
  if (tenantAErr) throw new Error(`Create Tenant A failed: ${tenantAErr.message}`);
  tenantAId = tenantA.id;

  // 2. Create Tenant B
  const { data: tenantB, error: tenantBErr } = await adminClient
    .from("tenants")
    .insert({ id: crypto.randomUUID(), name: "Tenant B (RLS Test)", slug: `rls-tenant-b-${Date.now()}` })
    .select("id")
    .single();
  if (tenantBErr) throw new Error(`Create Tenant B failed: ${tenantBErr.message}`);
  tenantBId = tenantB.id;

  // 3. Create Auth User A
  const { data: authA, error: authAErr } = await adminClient.auth.admin.createUser({
    email: TEST_EMAIL_A,
    password: TEST_PASSWORD,
    email_confirm: true,
  });
  if (authAErr) throw new Error(`Create Auth User A failed: ${authAErr.message}`);
  userAAuthId = authA.user.id;

  // 4. Create Auth User B
  const { data: authB, error: authBErr } = await adminClient.auth.admin.createUser({
    email: TEST_EMAIL_B,
    password: TEST_PASSWORD,
    email_confirm: true,
  });
  if (authBErr) throw new Error(`Create Auth User B failed: ${authBErr.message}`);
  userBAuthId = authB.user.id;

  // 5. Insert app user row for User A (linked to Tenant A)
  const { error: userAErr } = await adminClient
    .from("users")
    .insert({ id: userAAuthId, email: TEST_EMAIL_A, role: "worker", tenant_id: tenantAId });
  if (userAErr) throw new Error(`Insert app User A failed: ${userAErr.message}`);

  // 6. Insert app user row for User B (linked to Tenant B)
  const { error: userBErr } = await adminClient
    .from("users")
    .insert({ id: userBAuthId, email: TEST_EMAIL_B, role: "worker", tenant_id: tenantBId });
  if (userBErr) throw new Error(`Insert app User B failed: ${userBErr.message}`);
});

afterAll(async () => {
  // Clean up in reverse dependency order
  await adminClient.from("users").delete().in("id", [userAAuthId, userBAuthId]);
  await adminClient.from("tenants").delete().in("id", [tenantAId, tenantBId]);
  await adminClient.auth.admin.deleteUser(userAAuthId);
  await adminClient.auth.admin.deleteUser(userBAuthId);
});

describe("RLS isolation — Tenant A user cannot read Tenant B data", () => {
  it("User A cannot SELECT users from Tenant B", async () => {
    const clientA = createClient(SUPABASE_URL, ANON_KEY);
    await clientA.auth.signInWithPassword({ email: TEST_EMAIL_A, password: TEST_PASSWORD });

    const { data } = await clientA
      .from("users")
      .select("id")
      .eq("tenant_id", tenantBId);

    expect(data).toEqual([]);
  });

  it("User A cannot SELECT Tenant B row from tenants", async () => {
    const clientA = createClient(SUPABASE_URL, ANON_KEY);
    await clientA.auth.signInWithPassword({ email: TEST_EMAIL_A, password: TEST_PASSWORD });

    const { data } = await clientA
      .from("tenants")
      .select("id")
      .eq("id", tenantBId);

    expect(data).toEqual([]);
  });

  it("User A can SELECT their own Tenant A row", async () => {
    const clientA = createClient(SUPABASE_URL, ANON_KEY);
    await clientA.auth.signInWithPassword({ email: TEST_EMAIL_A, password: TEST_PASSWORD });

    const { data } = await clientA
      .from("tenants")
      .select("id")
      .eq("id", tenantAId);

    expect(data).toHaveLength(1);
    expect(data![0].id).toBe(tenantAId);
  });
});

describe("RLS isolation — Tenant B user cannot read Tenant A data", () => {
  it("User B cannot SELECT users from Tenant A", async () => {
    const clientB = createClient(SUPABASE_URL, ANON_KEY);
    await clientB.auth.signInWithPassword({ email: TEST_EMAIL_B, password: TEST_PASSWORD });

    const { data } = await clientB
      .from("users")
      .select("id")
      .eq("tenant_id", tenantAId);

    expect(data).toEqual([]);
  });

  it("User B cannot SELECT Tenant A row from tenants", async () => {
    const clientB = createClient(SUPABASE_URL, ANON_KEY);
    await clientB.auth.signInWithPassword({ email: TEST_EMAIL_B, password: TEST_PASSWORD });

    const { data } = await clientB
      .from("tenants")
      .select("id")
      .eq("id", tenantAId);

    expect(data).toEqual([]);
  });

  it("User B can SELECT their own Tenant B row", async () => {
    const clientB = createClient(SUPABASE_URL, ANON_KEY);
    await clientB.auth.signInWithPassword({ email: TEST_EMAIL_B, password: TEST_PASSWORD });

    const { data } = await clientB
      .from("tenants")
      .select("id")
      .eq("id", tenantBId);

    expect(data).toHaveLength(1);
    expect(data![0].id).toBe(tenantBId);
  });
});
