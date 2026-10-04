# Autumn Lane

A cozy autumn neighborhood with a drag-to-turn gumball machine. Complete a clockwise turn, then open the ball for a kind thought. Sound is optional and starts muted.

## Edit your affirmations

Edit **`lib/affirmations/src/affirmations.json`**. Each entry has a unique `id` and a non-empty `text`:

```json
{ "id": "your-own-reminder", "text": "Your affirmation goes here." }
```

Keep the surrounding JSON array and commas between entries. The eight starter affirmations are examples you can replace. Commit and redeploy after changing the collection. No database or API key is needed.

## Deploy on Vercel

1. Push this repository to your Git provider and import it into Vercel.
2. Keep the **Root Directory at the repository root**, not `artifacts/autumn-lane`.
3. Select the **Other** framework preset. The included `vercel.json` provides the install command, build command, and output directory.
4. Deploy. No environment variables or external services are required.

The site uses React/Vite and a Vercel Node.js serverless function at `api/affirmations/random.ts`. Next.js is not required. The frontend calls the same-origin endpoint `/api/affirmations/random`; the function and development Express server share the same JSON collection and selection logic.

## API

`GET /api/affirmations/random`

```json
{ "id": "enough", "text": "You are enough, exactly as you are today." }
```

Responses are not cached, so each turn makes a fresh random selection. Random results can repeat. Invalid or empty collections return HTTP 503 rather than fabricated content.

## Development

Use the existing API Server and Autumn Lane workflows for the live preview.

- `pnpm run typecheck` — check all workspace packages.
- `pnpm --filter @workspace/api-spec run codegen` — regenerate types after changing the OpenAPI contract.
- `NODE_ENV=production pnpm --filter @workspace/autumn-lane run build` — build the static frontend.

Optional audio is synthesized in the browser; no audio files or third-party requests are needed.