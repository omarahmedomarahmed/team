/* eslint-disable @next/next/no-img-element */
import type { Settings } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";

// The logo is always the text wordmark plus a box. The box shows an uploaded
// image if there is one, else a chosen icon, else the first initial — so the
// name is never hidden.
export function Logo({ settings }: { settings: Settings }) {
  const text = settings.logoText || settings.siteName;
  return (
    <span className="flex items-center gap-2.5">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius)] border border-line bg-brand text-white">
        {settings.logoUrl ? (
          <img src={settings.logoUrl} alt={text} className="h-full w-full object-cover" />
        ) : settings.logoIcon ? (
          <Icon name={settings.logoIcon} size={18} className="text-white" />
        ) : (
          <span className="text-sm font-bold">{(text || "O").trim().charAt(0).toUpperCase()}</span>
        )}
      </span>
      <span className="text-[1.05rem] font-semibold tracking-tight">{text}</span>
    </span>
  );
}
