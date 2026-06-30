/* eslint-disable @next/next/no-img-element */
import type { Settings } from "@/lib/site";

export function Logo({ settings }: { settings: Settings }) {
  if (settings.logoUrl) {
    return <img src={settings.logoUrl} alt={settings.siteName} className="h-7 w-auto" />;
  }
  const text = settings.logoText || settings.siteName;
  return (
    <span className="flex items-center gap-2.5">
      <span className="inline-block h-7 w-7 rounded-[var(--radius)] bg-brand" />
      <span className="font-semibold tracking-tight text-[1.05rem]">{text}</span>
    </span>
  );
}
