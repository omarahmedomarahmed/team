/* eslint-disable @typescript-eslint/no-explicit-any */
import { saveResourceAction, deleteResourceAction } from "@/lib/admin/actions";
import { ICON_KEYS } from "@/components/ui/Icon";
import type { Resource } from "@/lib/admin/resources";
import { FieldInput } from "@/components/admin/FieldInput";

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
          <a href={`/admin/${resource.key}`} className="btn btn-ghost">
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
