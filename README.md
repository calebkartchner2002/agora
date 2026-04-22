# agora

E-commerce marketplace with:

- a **FastAPI** backend in `api/`
- a **Next.js** frontend in `web/`
- **Postgres** running through Docker Compose

## Prerequisites

- Docker and Docker Compose
- Node.js `20` and npm

## Local setup

### 1. Configure frontend environment

The frontend reads the API base URL from `web/.env.local`.

If you need to recreate it, use:

```bash
cp web/.env.example web/.env.local
```

Default local value:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 2. Optional backend integration config

The API container reads these environment variables from the root shell environment when you start Docker Compose:

- `CHANNEL3_API_KEY`
- `CHANNEL3_API_URL` (defaults to `https://api.trychannel3.com`)

The app will start without `CHANNEL3_API_KEY`, but Channel3-backed product search will fail until that key is set.

Example:

```bash
export CHANNEL3_API_KEY=your-key-here
```

## Start the project

Start the API and Postgres from the repository root:

```bash
docker compose up -d
```

Start the frontend in a second terminal:

```bash
cd web
npm run dev
```

## What starts where

| Service | URL / Port | Notes |
| --- | --- | --- |
| Frontend | `http://localhost:3000` | Next.js dev server |
| API | `http://localhost:8000` | FastAPI app |
| API health | `http://localhost:8000/health` | Returns API status |
| DB health | `http://localhost:8000/health/db` | Confirms DB connectivity |
| Postgres | `localhost:5432` | Username `agora`, password `agora`, database `agora` |

## Verify startup

Once both processes are running:

```bash
curl http://localhost:8000/health
curl http://localhost:8000/health/db
```

Then open `http://localhost:3000` in your browser.

## Stop the project

Stop the frontend dev server with `Ctrl+C` in the terminal where `npm run dev` is running.

Stop the API and database from the repo root:

```bash
docker compose down
```

## Useful local commands

### Frontend

```bash
cd web
npm run dev
npm run build
npm run lint
```

### API

```bash
docker compose up -d
docker compose logs -f api
docker compose down
```
