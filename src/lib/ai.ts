/* eslint-disable @typescript-eslint/no-explicit-any */
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import { describeServiceAreas } from "@/lib/usStates";

export type GeneratedPost = { title: string; excerpt: string; body: string; tags: string[] };

// Default to the most capable model; a client can override via env.
const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

export function aiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function generateBlogPost(input: {
  topic: string;
  keywords?: string;
  tone?: string;
  length?: string;
}): Promise<GeneratedPost> {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("AI is not configured — add ANTHROPIC_API_KEY.");

  const client = new Anthropic();

  // Build company/market context so articles are industry-specific.
  const settings: any = await prisma.siteSettings.findFirst();
  const services = await prisma.service.findMany({
    where: { status: "PUBLISHED" },
    select: { title: true },
    orderBy: { order: "asc" },
    take: 20,
  });
  const areas = Array.isArray(settings?.serviceAreas) ? describeServiceAreas(settings.serviceAreas) : "";

  const context = [
    settings?.siteName && `Company: ${settings.siteName}`,
    settings?.mainMarket && `Main market: ${settings.mainMarket}`,
    settings?.subMarket && `Sub-market: ${settings.subMarket}`,
    areas && `Service areas: ${areas}`,
    services.length && `Services offered: ${services.map((s) => s.title).join(", ")}`,
    settings?.tagline && `Positioning: ${settings.tagline}`,
  ]
    .filter(Boolean)
    .join("\n");

  const lengthHint =
    input.length === "short" ? "about 500 words" : input.length === "long" ? "about 1200 words" : "about 800 words";

  const system =
    "You are an expert content writer and SEO/GEO strategist for a premium digital agency. " +
    "You write authoritative, engaging, well-structured blog articles tailored to a specific business's market and audience. " +
    "Write the body in Markdown with clear `##` headings, short paragraphs, and a natural, human voice. " +
    "Optimize subtly for search and AI discovery without keyword stuffing. " +
    "Never invent specific statistics, client names, or false claims.";

  const userPrompt =
    `Write a blog article for this business.\n\n${context}\n\n` +
    `Topic: ${input.topic}\n` +
    (input.keywords ? `Keywords to weave in naturally: ${input.keywords}\n` : "") +
    `Tone: ${input.tone || "professional and confident"}\n` +
    `Target length: ${lengthHint}\n\n` +
    `Return a title, a one-sentence excerpt, the article body in Markdown, and 3-6 relevant tags.`;

  const schema = {
    type: "object",
    properties: {
      title: { type: "string" },
      excerpt: { type: "string" },
      body: { type: "string" },
      tags: { type: "array", items: { type: "string" } },
    },
    required: ["title", "excerpt", "body", "tags"],
    additionalProperties: false,
  };

  // output_config (structured outputs) is GA; cast params since SDK types may lag.
  const res = (await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    system,
    messages: [{ role: "user", content: userPrompt }],
    output_config: { format: { type: "json_schema", schema } },
  } as any)) as Anthropic.Message;

  const block = res.content.find((b): b is Anthropic.TextBlock => b.type === "text");
  let data: Partial<GeneratedPost> = {};
  try {
    data = JSON.parse(block?.text ?? "{}");
  } catch {
    /* fall back to safe defaults below */
  }

  return {
    title: data.title || input.topic,
    excerpt: data.excerpt || "",
    body: data.body || "",
    tags: Array.isArray(data.tags) ? data.tags : [],
  };
}
