import Link from "next/link";
import { aiConfigured } from "@/lib/ai";
import { AiBlogForm } from "@/components/god/AiBlogForm";
import { Icon } from "@/components/ui/Icon";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function AiBlogPage({ searchParams }: { searchParams: Promise<{ err?: string }> }) {
  const sp = await searchParams;
  const configured = aiConfigured();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/god/posts" className="text-sm text-muted hover:text-fg inline-flex items-center gap-1.5">
          <Icon name="arrow-left" size={15} /> Blog
        </Link>
        <h1 className="text-2xl font-bold mt-2">Generate a blog post with AI</h1>
        <p className="text-muted text-sm mt-1">
          Writes an on-brand article using your market, services, and positioning. You review and publish.
        </p>
      </div>

      {sp.err ? <p className="text-sm text-red-400">{sp.err}</p> : null}

      {configured ? (
        <AiBlogForm />
      ) : (
        <div className="card p-6 space-y-3">
          <div className="flex items-center gap-3">
            <span className="icon-badge"><Icon name="bot" size={18} /></span>
            <h2 className="font-semibold">AI isn’t connected yet</h2>
          </div>
          <p className="text-sm text-muted">
            To enable AI blog generation, add an <code>ANTHROPIC_API_KEY</code> environment variable in your Vercel
            project settings, then redeploy. (Optionally set <code>ANTHROPIC_MODEL</code> to choose a different model.)
          </p>
        </div>
      )}
    </div>
  );
}
