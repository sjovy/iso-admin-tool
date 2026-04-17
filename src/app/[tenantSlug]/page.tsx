export default async function TenantPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">
        Tenant: {tenantSlug}
      </h1>
    </div>
  );
}
