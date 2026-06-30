/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getResource } from "@/lib/admin/resources";
import { ResourceTable } from "@/components/admin/ResourceTable";

export const dynamic = "force-dynamic";

export default async function ResourceList({ params }: { params: Promise<{ resource: string }> }) {
  const { resource: key } = await params;
  const resource = getResource(key);
  if (!resource) notFound();

  const rows = await (prisma as any)[resource.model].findMany({
    orderBy: resource.orderBy ?? [{ createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{resource.label}</h1>
          <p className="text-muted text-sm mt-1">
            {rows.length} item{rows.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {key === "posts" ? (
            <Link href="/admin/ai-blog" className="btn btn-ghost">
              Generate with AI
            </Link>
          ) : null}
          {!resource.noCreate ? (
            <Link href={`/admin/${key}/new`} className="btn btn-primary">
              New {resource.singular.toLowerCase()}
            </Link>
          ) : null}
        </div>
      </div>
      <ResourceTable resource={resource} rows={rows} />
    </div>
  );
}
