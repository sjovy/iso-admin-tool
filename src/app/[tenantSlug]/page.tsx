import Link from 'next/link'

export default async function TenantPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">
        Dashboard — {tenantSlug}
      </h1>

      <nav className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href={`/${tenantSlug}/kpis`}
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-400 hover:shadow-md transition-shadow"
        >
          <div className="font-semibold text-slate-800">KPI-register</div>
          <div className="mt-1 text-sm text-slate-500">Klausul 9.1 — Mäta &amp; Utvärdera</div>
        </Link>
      </nav>
    </div>
  );
}
