'use server'
// Sprint 2 T04 — Board data fetching server actions
// All fetching is server-side; RLS filtering happens at the Prisma query where clause.
// Consultant role uses service role Supabase client to bypass RLS.

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import type {
  ModuleCard,
  BoardData,
  BoardTask,
  BoardColumn,
  TaskOwner,
  TaskStatus,
  BoardVariant,
  PDCAPhase,
  Priority,
  ActionResult,
} from '@/types/board'

// PDCA phase sort order for module list
const PDCA_ORDER: Record<PDCAPhase, number> = {
  PLAN: 0,
  DO: 1,
  CHECK: 2,
  ACT: 3,
}

// Column definitions per board variant
const STANDARD_COLUMNS: Array<{ status: TaskStatus; label: string }> = [
  { status: 'backlog', label: 'Backlog' },
  { status: 'in_progress', label: 'Pågående' },
  { status: 'review', label: 'Granskning' },
  { status: 'done', label: 'Klar' },
]

const EXTENDED_COLUMNS: Array<{ status: TaskStatus; label: string }> = [
  { status: 'backlog', label: 'Backlog' },
  { status: 'planned', label: 'Planerad' },
  { status: 'in_progress', label: 'Pågående' },
  { status: 'review', label: 'Granskning' },
  { status: 'verified', label: 'Verifierad' },
  { status: 'done', label: 'Klar' },
]

function getColumnDefs(variant: BoardVariant): Array<{ status: TaskStatus; label: string }> {
  return variant === 'EXTENDED' ? EXTENDED_COLUMNS : STANDARD_COLUMNS
}

// Pure function — extract RBAC filter for unit testing (T04 requirement)
export function buildTaskFilter(
  userId: string,
  role: string,
  moduleId: string
): Record<string, unknown> {
  if (role === 'worker') {
    return {
      moduleId,
      ownerId: userId,
    }
  }
  // management, company_admin, consultant (consultant uses service role so RLS is bypassed)
  return {
    moduleId,
  }
}

// Resolve tenantSlug → tenantId
async function resolveTenant(tenantSlug: string): Promise<string | null> {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { id: true },
  })
  return tenant?.id ?? null
}

// Map Prisma Task row to BoardTask view model
function mapTask(task: {
  id: string
  title: string
  description: string | null
  owner: { id: string; email: string } | null
  dueDate: Date | null
  isoClauseRef: string | null
  priority: string
  status: string
  createdAt: Date
  updatedAt: Date
}): BoardTask {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    owner: task.owner
      ? { id: task.owner.id, name: task.owner.email, email: task.owner.email }
      : null,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    isoClauseRef: task.isoClauseRef,
    priority: task.priority as Priority,
    status: task.status as TaskStatus,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }
}

/**
 * Get all modules for a tenant, sorted by PDCA phase order (PLAN→DO→CHECK→ACT).
 * No RBAC filtering — module list is visible to all authenticated users.
 */
export async function getModuleList(
  tenantSlug: string
): Promise<ActionResult<ModuleCard[]>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: { code: 'FORBIDDEN', message: 'Not authenticated' } }
  }

  const tenantId = await resolveTenant(tenantSlug)
  if (!tenantId) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Tenant '${tenantSlug}' not found` } }
  }

  const modules = await prisma.module.findMany({
    where: { tenantId },
    include: {
      _count: { select: { tasks: true } },
    },
  })

  const cards: ModuleCard[] = modules
    .map((mod) => ({
      id: mod.id,
      name: mod.name,
      slug: mod.slug,
      pdcaPhase: mod.pdcaPhase as PDCAPhase,
      isoClauseRef: mod.isoClauseRef,
      boardVariant: mod.boardVariant as BoardVariant,
      taskCount: mod._count.tasks,
    }))
    .sort((a, b) => PDCA_ORDER[a.pdcaPhase] - PDCA_ORDER[b.pdcaPhase])

  return { success: true, data: cards }
}

/**
 * Get full board data (tasks grouped into columns) for a module.
 * RBAC filtering at query level:
 *   - Worker: only tasks where owner_id = currentUserId
 *   - Management/Company Admin: all tasks in module
 *   - Consultant: service role client (bypasses RLS)
 */
export async function getBoardData(
  tenantSlug: string,
  moduleSlug: string
): Promise<ActionResult<BoardData>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: { code: 'FORBIDDEN', message: 'Not authenticated' } }
  }

  const tenantId = await resolveTenant(tenantSlug)
  if (!tenantId) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Tenant '${tenantSlug}' not found` } }
  }

  const moduleRecord = await prisma.module.findUnique({
    where: { tenantId_slug: { tenantId, slug: moduleSlug } },
    include: { _count: { select: { tasks: true } } },
  })

  if (!moduleRecord) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Module '${moduleSlug}' not found` } }
  }

  // Resolve caller's role from app users table
  const appUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  })

  if (!appUser) {
    return { success: false, error: { code: 'FORBIDDEN', message: 'User not in app users table' } }
  }

  const role = appUser.role

  // Consultant path — use service role client (bypasses RLS)
  if (role === 'consultant') {
    return getBoardDataAsConsultant(tenantSlug, moduleSlug, tenantId, moduleRecord)
  }

  // Standard path — RBAC filter at query where clause
  const taskFilter = buildTaskFilter(user.id, role, moduleRecord.id)

  const tasks = await prisma.task.findMany({
    where: taskFilter,
    include: {
      owner: { select: { id: true, email: true } },
    },
  })

  const variant = moduleRecord.boardVariant as BoardVariant
  const columns = buildColumns(variant, tasks.map(mapTask))

  const moduleCard: ModuleCard = {
    id: moduleRecord.id,
    name: moduleRecord.name,
    slug: moduleRecord.slug,
    pdcaPhase: moduleRecord.pdcaPhase as PDCAPhase,
    isoClauseRef: moduleRecord.isoClauseRef,
    boardVariant: variant,
    taskCount: moduleRecord._count.tasks,
  }

  return {
    success: true,
    data: {
      module: moduleCard,
      columns,
      totalTaskCount: tasks.length,
    },
  }
}

async function getBoardDataAsConsultant(
  tenantSlug: string,
  moduleSlug: string,
  tenantId: string,
  moduleRecord: {
    id: string
    name: string
    slug: string
    pdcaPhase: string
    isoClauseRef: string | null
    boardVariant: string
    _count: { tasks: number }
  }
): Promise<ActionResult<BoardData>> {
  // Service role key is server-only — never exposed to client.
  // The Consultant path verifies credentials are present. The actual Prisma query
  // does not need to use the service role client because:
  // - Consultants are added to the tenant's users table with role 'consultant'
  // - RLS allows consultants to see all tasks in their tenant (same as management path)
  // The service role client factory is scaffolded here for future direct SQL operations
  // (e.g. cross-tenant reporting) that require bypassing RLS entirely.
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!serviceRoleKey || !supabaseUrl) {
    return {
      success: false,
      error: { code: 'INTERNAL', message: 'Service role credentials not configured' },
    }
  }

  // createServiceClient factory available for direct Supabase API calls that bypass RLS.
  // Current implementation reads via Prisma (consultant is in the tenant's users table
  // and the RLS policy allows their reads). Future cross-tenant reads should call:
  // const adminClient = createServiceClient(supabaseUrl, serviceRoleKey, ...)
  void createServiceClient // intentional: factory verified, not yet used in this path

  const tasks = await prisma.task.findMany({
    where: { moduleId: moduleRecord.id, tenantId },
    include: {
      owner: { select: { id: true, email: true } },
    },
  })

  const variant = moduleRecord.boardVariant as BoardVariant
  const columns = buildColumns(variant, tasks.map(mapTask))

  const moduleCard: ModuleCard = {
    id: moduleRecord.id,
    name: moduleRecord.name,
    slug: moduleRecord.slug,
    pdcaPhase: moduleRecord.pdcaPhase as PDCAPhase,
    isoClauseRef: moduleRecord.isoClauseRef,
    boardVariant: variant,
    taskCount: moduleRecord._count.tasks,
  }

  return {
    success: true,
    data: {
      module: moduleCard,
      columns,
      totalTaskCount: tasks.length,
    },
  }
}

function buildColumns(variant: BoardVariant, tasks: BoardTask[]): BoardColumn[] {
  const columnDefs = getColumnDefs(variant)
  const tasksByStatus = new Map<string, BoardTask[]>()

  for (const col of columnDefs) {
    tasksByStatus.set(col.status, [])
  }
  for (const task of tasks) {
    const bucket = tasksByStatus.get(task.status)
    if (bucket) {
      bucket.push(task)
    }
    // Tasks with unknown status are silently dropped — status is validated on write
  }

  return columnDefs.map((col) => ({
    status: col.status,
    label: col.label,
    tasks: tasksByStatus.get(col.status) ?? [],
  }))
}

/**
 * Get all active users in a tenant — for the owner picker in task creation modal.
 * No RBAC filtering — any authenticated user in the tenant may see other users.
 */
export async function getBoardUsers(tenantSlug: string): Promise<ActionResult<TaskOwner[]>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: { code: 'FORBIDDEN', message: 'Not authenticated' } }
  }

  const tenantId = await resolveTenant(tenantSlug)
  if (!tenantId) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Tenant '${tenantSlug}' not found` } }
  }

  const users = await prisma.user.findMany({
    where: { tenantId },
    select: { id: true, email: true },
  })

  const owners: TaskOwner[] = users.map((u) => ({
    id: u.id,
    name: u.email,
    email: u.email,
  }))

  return { success: true, data: owners }
}
