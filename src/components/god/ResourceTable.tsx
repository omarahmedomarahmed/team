/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import type { Resource } from "@/lib/god/resources";

function Cell({ value, name }: { value: any; name: string }) {
  if (value == null || value === "") return <span className="text-muted">—</span>;
  if (typeof value === "boolean")
    return <span className={value ? "text-emerald-400" : "text-muted"}>{value ? "Yes" : "No"}</span>;
  if (value instanceof Date) return <>{value.toLocaleDateString()}</>;
  if (name === "status") {
    const color =
      value === "PUBLISHED"
        ? "text-emerald-400 border-emerald-400/30"
        : value === "DRAFT"
          ? "text-amber-400 border-amber-400/30"
          : "text-muted border-line";
    return <span className={`text-xs px-2 py-0.5 rounded-full border ${color}`}>{value}</span>;
  }
  const s = String(value);
  return <>{s.length > 60 ? s.slice(0, 60) + "…" : s}</>;
}

export function ResourceTable({ resource, rows }: { resource: Resource; rows: any[] }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-muted">
            {resource.listColumns.map((c) => (
              <th key={c.name} className="px-4 py-3 font-medium whitespace-nowrap">
                {c.label}
              </th>
            ))}
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-line last:border-0 hover:bg-[var(--card)] transition-colors">
              {resource.listColumns.map((c) => (
                <td key={c.name} className="px-4 py-3 align-top">
                  <Cell value={r[c.name]} name={c.name} />
                </td>
              ))}
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <Link href={`/god/${resource.key}/${r.id}`} className="text-brand hover:underline">
                  Edit
                </Link>
              </td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={resource.listColumns.length + 1} className="px-4 py-10 text-center text-muted">
                No items yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
