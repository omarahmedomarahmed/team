import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-change-me");

// Protect the God Mode admin. Runs on the edge; only verifies the JWT cookie.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/god/login") return NextResponse.next();

  const token = req.cookies.get("god_session")?.value;
  if (token) {
    try {
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      /* invalid/expired — fall through to redirect */
    }
  }

  const url = req.nextUrl.clone();
  url.pathname = "/god/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/god/:path*"] };
