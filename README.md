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
    (app)/                  App screens shell
      start/page.tsx        "Start My Business" onboarding conversation
      analysis/page.tsx     Agent workspace (simulated analysis run)
      plan/page.tsx         Business plan dashboard
  features/
    onboarding/             Onboarding flow: agent contract, questions,
                            state hook (useOnboarding) and chat UI
    launch-profile/         Profile handed from onboarding to analysis
    analysis/               Stage config, run engine (useAgentRun), workspace UI
    plan/                   BusinessPlan type, demo plan data, dashboard cards
  components/
    ui/                     Reusable primitives (Button, Container, Logo, …)
    landing/                Landing page sections
  config/site.ts            Site name, nav links and the central route map
  content/landing.ts        Landing page copy and data
  lib/                      Small helpers
```

## Onboarding agent

The onboarding UI talks to an `OnboardingAgent` (`src/features/onboarding/types.ts`).
The prototype uses `prototypeAgent`, a local rule-based stand-in that recognises
the abaya demo scenario and extracts emirate and AED budget from other ideas.
To use a real AI model, implement `analyzeIdea()` against your API and pass the
new agent to `useOnboarding(agent)`.
