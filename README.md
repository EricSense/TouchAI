# Billion Universe

**Build your own business universe.**

Billion Universe is a visual operating system for everything a person is building — businesses, projects, ideas, skills, resources, goals, and people — on one interconnected canvas.

## The core loop

1. Create an account and a private Universe.
2. Add nodes to an infinite canvas.
3. Connect them with relationships.
4. Move the map. Save it. Return later.
5. Read insights, then ask Universe Intelligence what to build next.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- React Flow (`@xyflow/react`)
- Prisma + SQLite
- Signed-cookie authentication

## Run locally

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Vercel preview builds as Next.js (this repo used to be Vite). The deploy creates a SQLite schema during build. On Vercel the live database lives in `/tmp`, so preview data can reset between instances — set `DATABASE_URL` and `AUTH_SECRET` in the Vercel project for a durable host later.

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Landing |
| `/signup` `/login` | Authentication |
| `/dashboard` | Universe summary |
| `/universe/:id` | Interactive canvas |
| `/insights` | Graph analytics |
| `/intelligence` | Universe Intelligence (structured mock strategist) |
| `/settings` | Profile, universe name, logout |

Universe Intelligence is intentionally not a full model in this MVP. It reads the live graph and answers with placeholder strategist logic so the architecture and UI are already in place.
