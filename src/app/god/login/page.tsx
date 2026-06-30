import { loginAction } from "@/lib/god/actions";

export const dynamic = "force-dynamic";

const inputCls =
  "w-full rounded-lg bg-[var(--card)] border border-line px-3.5 py-2.5 text-sm outline-none focus:border-[color-mix(in_oklab,var(--brand)_55%,var(--line))] transition-colors";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <span className="h-8 w-8 rounded-[var(--radius)] bg-brand" />
          <span className="font-semibold text-lg">God Mode</span>
        </div>
        <form action={loginAction} className="card p-6 space-y-4">
          <input type="hidden" name="from" value={sp.from ?? "/god"} />
          <div>
            <label className="block text-sm mb-1.5">Email</label>
            <input name="email" type="email" autoComplete="email" required className={inputCls} />
          </div>
          <div>
            <label className="block text-sm mb-1.5">Password</label>
            <input name="password" type="password" autoComplete="current-password" required className={inputCls} />
          </div>
          {sp.error ? <p className="text-sm text-red-400">Invalid email or password.</p> : null}
          <button type="submit" className="btn btn-primary w-full">
            Sign in
          </button>
        </form>
        <p className="text-center text-xs text-muted mt-4">Authorized access only.</p>
      </div>
    </div>
  );
}
