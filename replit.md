# Zubaan — Living Heritage

An oral-history archive that preserves Indian craft traditions through artisan voices, accessible learning, and living lineage.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/zubaan/src/App.tsx` — routed React experience and reusable archive/listening/recording flows.
- `artifacts/zubaan/src/index.css` — shared paper, ink, textile texture, typography, and motion tokens.
- `artifacts/api-server/src/routes/zubaan.ts` — demo-safe archive data and recording, learning, and lineage endpoints.
- `lib/api-spec/openapi.yaml` — source of truth for the typed API contract.

## Architecture decisions

- The prototype keeps archive content and mutations in the API server's local process memory so demo interactions work without authentication or external services.
- The frontend uses generated API hooks from the OpenAPI contract rather than duplicating request types.
- Audio is represented as a low-bandwidth-friendly recording flow with browser APIs and local UI states; the visual stitch player keeps the listening identity independent of a heavy audio library.
- Portraits and craft imagery are local CSS texture tiles so the experience remains polished without external image dependencies.

## Product

- Explore and filter eight heritage capsules across craft, language, and region.
- Record and save an artisan voice, with a simple mobile-first interface.
- Listen through an editorial capsule page with a running-stitch player, original dialect, English bridge, and contextual craft vocabulary.
- Request a direct learning session, preview the artisan-facing voice message, accept/decline in the inbox, and follow the tradition through a lineage tree.
- Submit learner continuations and read the project's AI-as-preservation philosophy.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- API and web services are separate managed workflows; restart the exact artifact workflows after service or build changes.
- The frontend Vite service requires workflow-provided `PORT` and `BASE_PATH`; use the managed workflow or provide both when running a production build manually.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
