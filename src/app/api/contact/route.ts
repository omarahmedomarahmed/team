import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, string>;

    // Honeypot: bots fill hidden fields; humans never see this one.
    if (body.website) return NextResponse.json({ ok: true });

    const { name, email, phone, company, message } = body;
    if (!email) {
      return NextResponse.json({ ok: false, error: "Email is required" }, { status: 400 });
    }

    await prisma.lead.create({
      data: {
        name: name || null,
        email,
        phone: phone || null,
        company: company || null,
        message: message || null,
        source: "contact_form",
        payload: body, // captures all fields, including custom ones
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
