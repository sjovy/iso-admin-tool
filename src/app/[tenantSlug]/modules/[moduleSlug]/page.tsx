// T07 — Kanban Board Page (Server Component)
// Fetches board data server-side and passes to KanbanBoard client component.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { getBoardData, getBoardUsers } from '@/app/actions/board'
import { KanbanBoard } from '@/components/board/KanbanBoard'
import Link from 'next/link'

export default async function BoardPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; moduleSlug: string }>
}) {
  const { tenantSlug, moduleSlug } = await params

  // Auth guard — get current user and role
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get current user's role from app users table
  const appUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  })
  const currentUserRole = appUser?.role ?? 'worker'

  // Fetch board data and users in parallel
  const [boardResult, usersResult] = await Promise.all([
    getBoardData(tenantSlug, moduleSlug),
    getBoardUsers(tenantSlug),
  ])

  if (!boardResult.success) {
    return (
      <div className="text-red-600 p-4">
        Kunde inte ladda tavlan: {boardResult.error.message}
      </div>
    )
  }

  const boardData = boardResult.data
  const boardUsers = usersResult.success ? usersResult.data : []

  return (
    <div className="space-y-4">
      {/* Breadcrumb + module header */}
      <div>
        <nav className="text-sm text-slate-500 mb-1">
          <Link href={`/${tenantSlug}/modules`} className="hover:text-slate-800 transition-colors">
            Moduler
          </Link>
          <span className="mx-1">/</span>
          <span className="text-slate-800 font-medium">{boardData.module.name}</span>
        </nav>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{boardData.module.name}</h1>
          {boardData.module.isoClauseRef && (
            <span className="text-xs font-mono text-slate-500 bg-slate-100 border border-slate-200 rounded px-2 py-0.5">
              ISO {boardData.module.isoClauseRef}
            </span>
          )}
          <span className="text-xs text-slate-500">{boardData.totalTaskCount} uppgifter</span>
        </div>
      </div>

      {/* KanbanBoard — client component receives pre-fetched data */}
      <KanbanBoard
        initialData={boardData}
        tenantSlug={tenantSlug}
        currentUserId={user.id}
        currentUserRole={currentUserRole}
        boardUsers={boardUsers}
      />
    </div>
  )
}
