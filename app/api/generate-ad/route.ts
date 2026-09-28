import { NextResponse } from "next/server";

export const runtime = "nodejs";

const requestsByAddress = new Map<string, { count: number; resetsAt: number }>();

const schema = {
  type: "object",
  properties: {
    headline: { type: "string" },
    body: { type: "string" },
    callToAction: { type: "string" },
  },
  required: ["headline", "body", "callToAction"],
  additionalProperties: false,
};

export async function POST(request: Request) {
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const usage = requestsByAddress.get(address);
  if (usage && usage.resetsAt > now && usage.count >= 10) {
    return NextResponse.json({ error: "Please wait a minute before generating more ads." }, { status: 429 });
  }
  if (!usage || usage.resetsAt <= now) {
    requestsByAddress.set(address, { count: 1, resetsAt: now + 60_000 });
  } else {
    usage.count += 1;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI is not configured yet. Add OPENAI_API_KEY to .env.local and restart the app." },
      { status: 503 },
    );
  }

  let brief: Record<string, unknown>;
  try {
    brief = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a valid ad brief." }, { status: 400 });
  }

  const product = typeof brief.product === "string" ? brief.product.trim().slice(0, 200) : "";
  const audience = typeof brief.audience === "string" ? brief.audience.trim().slice(0, 200) : "";
  const platform = typeof brief.platform === "string" ? brief.platform.trim().slice(0, 80) : "";
  const tone = typeof brief.tone === "string" ? brief.tone.trim().slice(0, 80) : "";

  if (!product || !audience || !platform || !tone) {
    return NextResponse.json({ error: "Complete each field in the creative brief." }, { status: 400 });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_TEXT_MODEL || "gpt-5-mini",
        store: false,
        input: [
          {
            role: "system",
            content:
              "Write concise, truthful advertising copy. Do not invent product claims, prices, awards, guarantees, or features. Return a short headline, one or two sentence body, and a short call to action.",
          },
          {
            role: "user",
            content: JSON.stringify({ product, audience, platform, tone }),
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "ad_copy",
            strict: true,
            schema,
          },
        },
      }),
      signal: AbortSignal.timeout(45000),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("OpenAI API error:", data?.error?.message || response.status);
      return NextResponse.json(
        { error: "The AI service could not generate this ad. Check your API key and try again." },
        { status: 502 },
      );
    }

    const outputText = data.output
      ?.flatMap((item: { content?: Array<{ type?: string; text?: string }> }) => item.content ?? [])
      .find((item: { type?: string }) => item.type === "output_text")?.text;

    if (typeof outputText !== "string") {
      return NextResponse.json({ error: "The AI service returned an empty response. Please try again." }, { status: 502 });
    }

    return NextResponse.json(JSON.parse(outputText));
  } catch (error) {
    console.error("Ad generation request failed:", error);
    return NextResponse.json(
      { error: "Could not reach the AI service. Try again in a moment." },
      { status: 502 },
    );
  }
}
