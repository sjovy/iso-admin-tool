import type { ReactNode } from "react";

export default function TenantLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="p-6">{children}</main>
    </div>
  );
}
