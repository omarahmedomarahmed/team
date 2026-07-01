/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getResource } from "@/lib/admin/resources";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { Icon } from "@/components/ui/Icon";

export const dynamic = "force-dynamic";

export default async function ResourceEdit({
  params,
}: {
  params: Promise<{ resource: string; id: string }>;
}) {
  const { resource: key, id } = await params;
  const resource = getResource(key);
  if (!resource) notFound();

  let record: any = null;
  if (id !== "new") {
    record = await (prisma as any)[resource.model].findUnique({ where: { id } });
    if (!record) notFound();
  } else if (resource.noCreate) {
    notFound();
  }

  // Load options for any "relation" fields so they render as pick-from-a-list
  // dropdowns (storing the target's stable id — links survive renames).
  const relationOptions: Record<string, { value: string; label: string }[]> = {};
  for (const f of resource.fields) {
    if (f.type !== "relation" || !f.relationTo) continue;
    const rel = getResource(f.relationTo);
    if (!rel) continue;
    const rows: any[] = await (prisma as any)[rel.model].findMany({
      orderBy: rel.orderBy ?? [{ createdAt: "desc" }],
    });
    const labelKey = rel.listColumns[0]?.name ?? "title";
    relationOptions[f.name] = rows.map((r) => ({
      value: r.id,
      label: String(r[labelKey] ?? r.title ?? r.company ?? r.name ?? r.slug ?? r.id),
    }));
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/admin/${key}`} className="text-sm text-muted hover:text-fg inline-flex items-center gap-1.5">
          <Icon name="arrow-left" size={15} /> {resource.label}
        </Link>
        <h1 className="text-2xl font-bold mt-2">
          {id === "new" ? `New ${resource.singular.toLowerCase()}` : `Edit ${resource.singular.toLowerCase()}`}
        </h1>
      </div>
      <ResourceForm resource={resource} record={record} />
    </div>
  );
}
