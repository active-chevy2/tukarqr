# Analytics and ratings

Product events go to GA4. Written ratings go to Discord through a Pages Function. QR payloads, merchant names, and feedback text are not sent to GA4.

## Events

Every event also includes `locale` (`ms` or `en`), `page` (pathname), and `theme` (`light`, `dark`, or `system`).

| Event | When it fires | Extra params |
| --- | --- | --- |
| `tukarqr_decode` | A decode batch succeeds | `count`, `source` (`upload` or `camera`) |
| `tukarqr_decode_fail` | Images in that batch fail | `count`, `source` |
| `tukarqr_download` | A PNG or ZIP download succeeds | `export_source` (`single` or `bulk`), `layout`, `ratio`, `file_count` (bulk only) |
| `tukarqr_share` | Native share of a QR image succeeds | `export_source` (`single`), `layout`, `ratio` |
| `tukarqr_copy` | Clipboard copy of a QR image succeeds | `layout`, `ratio` |
| `tukarqr_export_fail` | Download, copy, or share fails | `action`, `export_source`, `layout`, `ratio` |
| `tukarqr_app_share` | The site link is shared from the rating prompt | `method` (`native` or `clipboard`) |
| `tukarqr_rating_submit` | A star rating is accepted | `value` (1–5), `has_feedback` |
| `tukarqr_locale_change` | The language switcher is used | `to` |
| `tukarqr_mcp_copy` | MCP endpoint, install JSON, or a prompt is copied | `target` (`endpoint`, `install`, or `prompt`) |

Suggested funnel: `tukarqr_decode` → `tukarqr_download` → `tukarqr_share`.

Bulk ZIP download and each card export call the rating prompt after a successful export, unless the visitor already submitted a rating.

## GA4 admin (do this once)

Measurement ID: `G-HNKBBJPS5M`. Override with `NEXT_PUBLIC_GA_MEASUREMENT_ID` if the stream changes. `NEXT_PUBLIC_*` values are baked in at build time, so redeploy after changing them.

In Admin → Custom definitions, create event-scoped dimensions:

`export_source`, `layout`, `ratio`, `source`, `method`, `count`, `file_count`, `action`, `has_feedback`, `locale`, `page`, `theme`, `target`, `to`

Mark `tukarqr_decode` and `tukarqr_download` as key events. Optionally mark `tukarqr_share` too.

Check Admin → Data settings → Data filters so an internal-traffic filter is not dropping every hit.

Consent Mode defaults to analytics storage granted and ad storage denied. There is no consent banner. Cloudflare Web Analytics is optional and separate: enable it in the Cloudflare dashboard for `tukarqr.my` if you want page views that are less affected by ad blockers. Do not treat it as a replacement for these product events.

## How to verify

1. View source on the production site and confirm `gtag/js?id=G-HNKBBJPS5M`.
2. Open GA4 → Reports → Realtime.
3. Decode a QR, download it, then share it.
4. Look for `tukarqr_decode` and `tukarqr_download` within about 30 seconds.
5. Standard Events reports can lag 24–48 hours. Do not compare them with Discord, which is one message per rating.

## Cloudflare Pages

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Build env, optional | Overrides the default GA4 ID |
| `DISCORD_RATING_WEBHOOK_URL` | Runtime secret for Pages Functions | Discord webhook used only by `/api/rating` |

The function also falls back to `NEXT_PUBLIC_DISCORD_RATING_WEBHOOK_URL` if set in Pages settings. Client code never references it, so it is not bundled; prefer renaming it to `DISCORD_RATING_WEBHOOK_URL`.

After adding or changing `NEXT_PUBLIC_*`, redeploy. The rating function is `functions/api/rating.ts`. It accepts POST JSON `{ "value": 1-5, "feedback"?: string }` from `https://tukarqr.my` (and localhost). Feedback is capped at 500 characters.

`npm run dev` does not serve Pages Functions. Rating submit will fail locally until the site is deployed, or until you run a production build and `npx wrangler pages dev out`.

## Rating path

```text
Browser  -- POST /api/rating -->  Pages Function  -- webhook -->  Discord
Browser  -- gtag event tukarqr_rating_submit -->  GA4 (value + has_feedback only)
```
