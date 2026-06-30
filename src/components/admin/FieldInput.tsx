/* eslint-disable @typescript-eslint/no-explicit-any */
import { ImageUpload, MultiImageUpload } from "@/components/admin/ImageUpload";
import type { Field } from "@/lib/admin/resources";

export const inputCls =
  "w-full rounded-lg bg-[var(--card)] border border-line px-3.5 py-2.5 text-sm outline-none focus:border-[color-mix(in_oklab,var(--brand)_55%,var(--line))] transition-colors";

export function FieldInput({ field, value }: { field: Field; value: any }) {
  switch (field.type) {
    case "textarea":
      return <textarea name={field.name} rows={field.full ? 5 : 3} defaultValue={value ?? ""} className={inputCls} />;
    case "number":
      return <input type="number" name={field.name} defaultValue={value ?? ""} className={inputCls} />;
    case "boolean":
      return (
        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" name={field.name} defaultChecked={value !== false} className="h-4 w-4 accent-[var(--brand)]" />
          <span className="text-sm text-muted">On</span>
        </label>
      );
    case "status":
      return (
        <select name={field.name} defaultValue={value ?? "PUBLISHED"} className={inputCls}>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      );
    case "select":
      return (
        <select name={field.name} defaultValue={value ?? field.options?.[0]?.value} className={inputCls}>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      );
    case "list":
      return <textarea name={field.name} rows={4} defaultValue={Array.isArray(value) ? value.join("\n") : ""} className={inputCls} />;
    case "pairs": {
      const [k0, k1] = field.pairKeys ?? ["a", "b"];
      const text = Array.isArray(value) ? value.map((o: any) => `${o?.[k0] ?? ""} | ${o?.[k1] ?? ""}`).join("\n") : "";
      return <textarea name={field.name} rows={4} defaultValue={text} placeholder="First | Second" className={inputCls} />;
    }
    case "link": {
      const v = value || {};
      return (
        <div className="grid grid-cols-2 gap-2">
          <input name={`${field.name}__label`} defaultValue={v.label ?? ""} placeholder="Button text" className={inputCls} />
          <input name={`${field.name}__href`} defaultValue={v.href ?? ""} placeholder="/contact" className={inputCls} />
        </div>
      );
    }
    case "image":
      return <ImageUpload name={field.name} value={value} />;
    case "images":
      return <MultiImageUpload name={field.name} value={Array.isArray(value) ? value : []} />;
    case "icon":
      return <input name={field.name} list="icon-keys" defaultValue={value ?? ""} placeholder="e.g. rocket" className={inputCls} />;
    default:
      return <input type="text" name={field.name} defaultValue={value ?? ""} className={inputCls} />;
  }
}
