import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import type { ReactNode } from "react";

const roleLabelMap: Record<string, string> = {
  worker: "Medarbetare",
  management: "Ledning",
  company_admin: "Admin",
  consultant: "Konsult",
};

const roleBadgeClassMap: Record<string, string> = {
  worker: "bg-slate-100 text-slate-700",
  management: "bg-blue-100 text-blue-700",
  company_admin: "bg-purple-100 text-purple-700",
  consultant: "bg-amber-100 text-amber-700",
};

export default async function TenantLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const appUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  const role = appUser?.role ?? "";
  const roleLabel = roleLabelMap[role] ?? role;
  const roleBadgeClass = roleBadgeClassMap[role] ?? "bg-slate-100 text-slate-700";

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-800">ISO Admin</span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">{user.email}</span>
          {appUser && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadgeClass}`}>
              {roleLabel}
            </span>
          )}
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
