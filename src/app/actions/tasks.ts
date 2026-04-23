'use server'
// Sprint 2 T05 — Task mutation server actions
// Every mutation writes an audit log entry in the same Prisma transaction.
// All mutations are atomic: if audit log fails, the mutation is rolled back.

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { isValidStatus } from '@/lib/board-utils'
import type {
  BoardTask,
  CreateTaskInput,
  MoveTaskInput,
  UpdateTaskInput,
  TaskStatus,
  Priority,
  BoardVariant,
  ActionResult,
} from '@/types/board'

// Map a raw task DB row to BoardTask view model
function mapTaskToView(task: {
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

async function resolveTenant(tenantSlug: string): Promise<string | null> {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: { id: true },
  })
  return tenant?.id ?? null
}

/**
 * Create a new task and write an audit log entry in a single transaction.
 */
export async function createTask(
  tenantSlug: string,
  input: CreateTaskInput
): Promise<ActionResult<BoardTask>> {
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

  // Resolve module to validate status against variant
  const moduleRecord = await prisma.module.findUnique({
    where: { id: input.moduleId },
    select: { boardVariant: true, tenantId: true },
  })

  if (!moduleRecord || moduleRecord.tenantId !== tenantId) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Module '${input.moduleId}' not found` } }
  }

  if (!isValidStatus(input.status, moduleRecord.boardVariant as BoardVariant)) {
    return {
      success: false,
      error: {
        code: 'INVALID_STATUS',
        message: `Status '${input.status}' is not valid for ${moduleRecord.boardVariant} board`,
      },
    }
  }

  // RBAC: Worker may only create tasks assigned to themselves
  const appUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  })

  if (!appUser) {
    return { success: false, error: { code: 'FORBIDDEN', message: 'User not in app users table' } }
  }

  if (appUser.role === 'worker' && input.ownerId && input.ownerId !== user.id) {
    return { success: false, error: { code: 'FORBIDDEN', message: 'Workers may only create tasks assigned to themselves' } }
  }

  // Parse dueDate if provided
  const dueDate = input.dueDate ? new Date(input.dueDate) : null

  try {
    // Atomic interactive transaction: create task first to capture real ID, then audit log
    const createdTask = await prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          tenantId,
          moduleId: input.moduleId,
          title: input.title,
          description: input.description ?? null,
          ownerId: input.ownerId ?? null,
          dueDate,
          isoClauseRef: input.isoClauseRef ?? null,
          priority: input.priority,
          status: input.status,
        },
        include: { owner: { select: { id: true, email: true } } },
      })
      await tx.auditLog.create({
        data: {
          tenantId,
          actorId: user.id,
          entityType: 'task',
          entityId: task.id,
          action: 'create',
          payload: {
            title: input.title,
            status: input.status,
            priority: input.priority,
          },
        },
      })
      return task
    })

    return { success: true, data: mapTaskToView(createdTask) }
  } catch (err) {
    console.error('createTask transaction failed:', err)
    return { success: false, error: { code: 'INTERNAL', message: 'Failed to create task' } }
  }
}

/**
 * Move a task to a new status column. Validates the target status is valid for the module variant.
 * Workers may only move tasks they own.
 * Atomic: status update + audit log in one transaction.
 */
export async function moveTask(
  tenantSlug: string,
  input: MoveTaskInput
): Promise<ActionResult<BoardTask>> {
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

  // Fetch the task to verify ownership + get current status
  const task = await prisma.task.findUnique({
    where: { id: input.taskId },
    include: {
      module: { select: { boardVariant: true } },
      owner: { select: { id: true, email: true } },
    },
  })

  if (!task || task.tenantId !== tenantId) {
    return { success: false, error: { code: 'NOT_FOUND', message: 'Task not found or access denied' } }
  }

  // RBAC: Worker may only move their own tasks
  const appUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  })

  if (!appUser) {
    return { success: false, error: { code: 'FORBIDDEN', message: 'User not in app users table' } }
  }

  if (appUser.role === 'worker' && task.ownerId !== user.id) {
    // Return same shape as not-found to prevent information leakage
    return {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Task not found or access denied' },
    }
  }

  // Validate target status against module variant
  const variant = task.module.boardVariant as BoardVariant
  if (!isValidStatus(input.targetStatus, variant)) {
    return {
      success: false,
      error: {
        code: 'INVALID_STATUS',
        message: `Status '${input.targetStatus}' is not valid for ${variant} board`,
      },
    }
  }

  const oldStatus = task.status

  try {
    // Atomic transaction: update status + audit log
    const [updatedTask] = await prisma.$transaction([
      prisma.task.update({
        where: { id: input.taskId },
        data: { status: input.targetStatus },
        include: { owner: { select: { id: true, email: true } } },
      }),
      prisma.auditLog.create({
        data: {
          tenantId,
          actorId: user.id,
          entityType: 'task',
          entityId: input.taskId,
          action: 'status_change',
          payload: {
            from: oldStatus,
            to: input.targetStatus,
          },
        },
      }),
    ])

    return { success: true, data: mapTaskToView(updatedTask) }
  } catch (err) {
    console.error('moveTask transaction failed:', err)
    return { success: false, error: { code: 'INTERNAL', message: 'Failed to move task' } }
  }
}

/**
 * Partially update a task. Only fields present in input are updated.
 * Writes an audit log entry recording which fields changed.
 * Atomic: field updates + audit log in one transaction.
 */
export async function updateTask(
  tenantSlug: string,
  input: UpdateTaskInput
): Promise<ActionResult<BoardTask>> {
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

  const task = await prisma.task.findUnique({
    where: { id: input.taskId },
    select: { tenantId: true },
  })

  if (!task || task.tenantId !== tenantId) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Task '${input.taskId}' not found` } }
  }

  // RBAC: Worker may not reassign ownerId to another user
  const appUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  })

  if (!appUser) {
    return { success: false, error: { code: 'FORBIDDEN', message: 'User not in app users table' } }
  }

  if (
    appUser.role === 'worker' &&
    input.ownerId !== undefined &&
    input.ownerId !== null &&
    input.ownerId !== user.id
  ) {
    return {
      success: false,
      error: { code: 'FORBIDDEN', message: 'Workers cannot reassign tasks to other users' },
    }
  }

  // Build partial update — only fields present in input
  const updateData: Record<string, unknown> = {}
  const changedFields: string[] = []

  if (input.title !== undefined) {
    updateData.title = input.title
    changedFields.push('title')
  }
  if (input.description !== undefined) {
    updateData.description = input.description
    changedFields.push('description')
  }
  if (input.ownerId !== undefined) {
    updateData.ownerId = input.ownerId
    changedFields.push('ownerId')
  }
  if (input.dueDate !== undefined) {
    updateData.dueDate = input.dueDate ? new Date(input.dueDate) : null
    changedFields.push('dueDate')
  }
  if (input.isoClauseRef !== undefined) {
    updateData.isoClauseRef = input.isoClauseRef
    changedFields.push('isoClauseRef')
  }
  if (input.priority !== undefined) {
    updateData.priority = input.priority
    changedFields.push('priority')
  }

  if (changedFields.length === 0) {
    // No fields to update — fetch and return current state
    const currentTask = await prisma.task.findUnique({
      where: { id: input.taskId },
      include: { owner: { select: { id: true, email: true } } },
    })
    if (!currentTask) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } }
    }
    return { success: true, data: mapTaskToView(currentTask) }
  }

  try {
    // Atomic transaction: update task + audit log
    const [updatedTask] = await prisma.$transaction([
      prisma.task.update({
        where: { id: input.taskId },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: updateData as any, // updateData is built from typed inputs above; safe cast
        include: { owner: { select: { id: true, email: true } } },
      }),
      prisma.auditLog.create({
        data: {
          tenantId,
          actorId: user.id,
          entityType: 'task',
          entityId: input.taskId,
          action: 'update',
          payload: { changedFields },
        },
      }),
    ])

    return { success: true, data: mapTaskToView(updatedTask) }
  } catch (err) {
    console.error('updateTask transaction failed:', err)
    return { success: false, error: { code: 'INTERNAL', message: 'Failed to update task' } }
  }
}
