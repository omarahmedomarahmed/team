import { Icon } from "@/components/ui/Icon";

/**
 * Elegant light placeholder for an image/screenshot slot that hasn't been
 * uploaded yet (no stock photos). Shows initials for portraits, or a small
 * labelled icon for screenshots/showcase frames.
 */
export function Placeholder({ label, initials }: { label?: string; initials?: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-bg-2 p-6 text-center">
      {initials ? (
        <span className="text-3xl font-bold tracking-wide text-fg opacity-25">{initials}</span>
      ) : (
        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted">
          <Icon name="layers" size={15} /> {label || "Visual"}
        </span>
      )}
    </div>
  );
}
