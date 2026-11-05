import {
  buildDiscordRatingPayload,
  isAllowedRatingOrigin,
  parseRatingSubmission,
} from "../../lib/rating-message";

interface RatingEnv {
  DISCORD_RATING_WEBHOOK_URL?: string;
  NEXT_PUBLIC_DISCORD_RATING_WEBHOOK_URL?: string;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestPost(context: {
  request: Request;
  env: RatingEnv;
}): Promise<Response> {
  const origin = context.request.headers.get("Origin");
  if (!isAllowedRatingOrigin(origin)) {
    return json({ ok: false, error: "forbidden" }, 403);
  }

  const webhook =
    context.env.DISCORD_RATING_WEBHOOK_URL ||
    context.env.NEXT_PUBLIC_DISCORD_RATING_WEBHOOK_URL;
  if (!webhook) {
    return json({ ok: false, error: "not_configured" }, 503);
  }

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return json({ ok: false, error: "invalid_body" }, 400);
  }

  const parsed = parseRatingSubmission(body);
  if (!parsed.ok) {
    return json({ ok: false, error: parsed.error }, 400);
  }

  const { value, feedback } = parsed.submission;
  const discord = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildDiscordRatingPayload(value, feedback)),
  });

  if (!discord.ok) {
    console.error("rating upstream", discord.status);
    return json({ ok: false, error: "upstream" }, 502);
  }

  return json({ ok: true });
}
