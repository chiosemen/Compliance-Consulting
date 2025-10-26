export default async function OrgPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-foreground mb-4">
        Organization Details
      </h1>
      <p className="text-foreground/70">
        Viewing organization: <span className="font-mono text-brand">{id}</span>
      </p>
    </div>
  );
}
