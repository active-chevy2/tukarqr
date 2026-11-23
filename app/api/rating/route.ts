import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const webhookUrl =
    process.env.DISCORD_RATING_WEBHOOK_URL ||
    process.env.NEXT_PUBLIC_DISCORD_RATING_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json(
      { ok: false, error: "Rating webhook is not configured on this server." },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const rating = Number(body.rating ?? body.stars ?? 0);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { ok: false, error: "Rating must be between 1 and 5." },
      { status: 400 }
    );
  }

  const comment =
    typeof body.comment === "string"
      ? body.comment.trim()
      : typeof body.feedback === "string"
        ? body.feedback.trim()
        : typeof body.message === "string"
          ? body.message.trim()
          : "";

  const page = typeof body.page === "string" ? body.page : "/";
  const locale = typeof body.locale === "string" ? body.locale : "en";
  const starsText = "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));

  const lines = [
    `**TukarQR Rating:** ${starsText} (${rating}/5)`,
    `**Locale:** \`${locale}\` | **Page:** \`${page}\``,
  ];

  if (comment) {
    lines.push(`**Feedback:**\n${comment.slice(0, 1500)}`);
  }

  try {
    const discordRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: lines.join("\n") }),
    });

    if (!discordRes.ok) {
      return NextResponse.json(
        { ok: false, error: "Failed to forward rating." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Upstream webhook request failed." },
      { status: 502 }
    );
  }
}
