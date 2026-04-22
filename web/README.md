# Web app

This is the Next.js frontend for Agora.

## Run locally

From `web/`:

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

## Environment

Create `web/.env.local` from `web/.env.example` if you do not already have it:

```bash
cp .env.example .env.local
```

The frontend expects the API at:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Full project startup

The frontend depends on the backend being available. Start the API and Postgres from the repo root first:

```bash
docker compose up -d
```

Then start the frontend:

```bash
cd web
npm run dev
```

See the repository root `README.md` for the full setup and service overview.
