# Ibda (ابدأ) — AI Business Launch Agent

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 (Next picks the next free port if 3000 is taken).

## Structure

```
src/
  app/
    layout.tsx              Root layout: fonts, metadata, global styles
    globals.css             Theme tokens (colors, animations, utilities)
    (marketing)/            Public pages: navbar + footer shell
      page.tsx              Landing page
  components/
    ui/                     Reusable primitives (Button, Container, Logo, …)
    landing/                Landing page sections
  config/site.ts            Site name, nav links and the central route map
  content/landing.ts        Landing page copy and data
  lib/                      Small helpers
```

## Adding app screens

Create a new route group, e.g. `src/app/(app)/start/page.tsx` with its own
`layout.tsx`, then set `routes.start` in `src/config/site.ts` to `"/start"` —
every "Start My Business" button will point there.
