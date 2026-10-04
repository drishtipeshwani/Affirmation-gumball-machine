# Autumn Lane

A cozy illustrated autumn neighborhood where turning a gumball machine dispenses an affirmation.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- The app requires no database, secrets, or external services.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- Content: editable JSON; the database scaffold is unused.
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- Frontend: `artifacts/autumn-lane`
- Affirmation collection and shared selection logic: `lib/affirmations`
- Preview API: `artifacts/api-server/src/routes/affirmations.ts`
- Vercel API: `api/affirmations/random.ts`
- API contract: `lib/api-spec/openapi.yaml`
- Vercel setup and editing instructions: `README.md`

## Architecture decisions

- Use the same content and selection logic in preview and Vercel so the two environments cannot drift.
- JSON is intentionally edited in source and redeployed: the owner requested an editable collection, not AI generation or an admin database.
- React/Vite plus a serverless API keeps Vercel support without requiring a framework migration.

## Product

- Drag-to-turn gumball machine; click the dispensed ball to reveal a random affirmation.
- Optional ambient and machine audio, muted by default.

## User preferences

- Polished 2D, warm, textured, storybook illustration inspired by the supplied sketch.
- Trees on the left, houses, a machine on the side, and leaves on the road and sidewalk.
- Drag to rotate only; do not add tap-to-spin. Keyboard accessibility remains available.
- Owner will add their own affirmation wording to JSON; include a few starter examples.
- Target deployment is Vercel.

## Gotchas

- On Vercel import the repository root, not the frontend subdirectory, so the API functions are included.
- Keep API responses uncached so turns produce fresh random selections.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
