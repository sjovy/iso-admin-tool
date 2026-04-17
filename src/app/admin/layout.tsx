import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white px-6 py-3">
        <span className="text-sm font-medium text-slate-600">Consultant Admin</span>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
