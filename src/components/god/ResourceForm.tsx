/* eslint-disable @next/next/no-img-element, @typescript-eslint/no-explicit-any */
import { saveResourceAction, deleteResourceAction } from "@/lib/god/actions";
import { ICON_KEYS } from "@/components/ui/Icon";
import type { Field, Resource } from "@/lib/god/resources";

const inputCls =
  "w-full rounded-lg bg-[var(--card)] border border-line px-3.5 py-2.5 text-sm outline-none focus:border-[color-mix(in_oklab,var(--brand)_55%,var(--line))] transition-colors";

const REQUIRED = new Set(["title", "name", "question", "author", "quote", "role"]);

function FieldInput({ field, value }: { field: Field; value: any }) {
  const req = REQUIRED.has(field.name);
  switch (field.type) {
    case "textarea":
      return <textarea name={field.name} rows={field.full ? 5 : 3} defaultValue={value ?? ""} className={inputCls} required={req} />;
    case "number":
      return <input type="number" name={field.name} defaultValue={value ?? ""} className={inputCls} />;
    case "boolean":
      return (
        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" name={field.name} defaultChecked={!!value} className="h-4 w-4 accent-[var(--brand)]" />
          <span className="text-sm text-muted">Enabled</span>
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
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case "list":
      return (
        <textarea
          name={field.name}
          rows={4}
          defaultValue={Array.isArray(value) ? value.join("\n") : ""}
          className={inputCls}
        />
      );
    case "json":
      return (
        <textarea
          name={field.name}
          rows={4}
          defaultValue={value ? JSON.stringify(value, null, 2) : ""}
          className={`${inputCls} font-mono text-xs`}
        />
      );
    case "image":
      return (
        <div className="space-y-2">
          <input type="url" name={field.name} defaultValue={value ?? ""} placeholder="https://…" className={inputCls} />
          {value ? <img src={value} alt="" className="h-20 rounded-lg border border-line object-cover" /> : null}
        </div>
      );
    case "icon":
      return (
        <input
          name={field.name}
          list="icon-keys"
          defaultValue={value ?? ""}
          placeholder="e.g. rocket"
          className={inputCls}
        />
      );
    default:
      return <input type="text" name={field.name} defaultValue={value ?? ""} className={inputCls} required={req} />;
  }
}

export function ResourceForm({ resource, record }: { resource: Resource; record: any }) {
  const id = record?.id ?? "new";
  const isEdit = id !== "new";
  return (
    <div className="max-w-3xl">
      <form action={saveResourceAction} className="space-y-5">
        <input type="hidden" name="__key" value={resource.key} />
        <input type="hidden" name="__id" value={id} />
        <datalist id="icon-keys">
          {ICON_KEYS.map((k) => (
            <option key={k} value={k} />
          ))}
        </datalist>

        <div className="grid sm:grid-cols-2 gap-5">
          {resource.fields.map((f) => (
            <div key={f.name} className={f.full ? "sm:col-span-2" : ""}>
              <label className="block text-sm font-medium mb-1.5">{f.label}</label>
              <FieldInput field={f} value={record?.[f.name]} />
              {f.help ? <p className="text-xs text-muted mt-1.5">{f.help}</p> : null}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="btn btn-primary">
            {isEdit ? "Save changes" : `Create ${resource.singular.toLowerCase()}`}
          </button>
          <a href={`/god/${resource.key}`} className="btn btn-ghost">
            Cancel
          </a>
        </div>
      </form>

      {isEdit ? (
        <form action={deleteResourceAction} className="mt-8 pt-6 border-t border-line">
          <input type="hidden" name="__key" value={resource.key} />
          <input type="hidden" name="__id" value={id} />
          <button type="submit" className="text-sm text-red-400 hover:text-red-300">
            Delete this {resource.singular.toLowerCase()}
          </button>
        </form>
      ) : null}
    </div>
  );
}
