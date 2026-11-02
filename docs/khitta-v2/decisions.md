# KHITTA V2 — decisions and architecture record

Living record for the upgrade from Ibda to KHITTA | خِطّة. Updated as each phase completes.

## Baseline

- `competition-v1` (local tag) → `fe05cb7`, the working competition demo on `main`.
- V2 work happens on the `khitta-v2` branch. `main` stays the competition demo until a merge is approved.
- Baseline on 2026-11-01: typecheck, lint and production build pass (11 routes).

## Decisions

1. **Authentication + database: Supabase.** Multiple users, multiple saved projects per user, project history and modular plan sections. Introduced in Phase 3.
2. **Arabic and English, switchable at any time.** Arabic is RTL, English is LTR. A project is not tied to one language and is never duplicated per language. Structured data (numbers, emirate, channel, budget) is stored as language-neutral codes and values; only Claude's written text is language-bound. Each module revision records its `sourceLocale`; the other language is a translation layer attached to that same revision (Phase 2).
3. **Editing keeps the same project.** When core information changes (budget, location, product/service, target customer, sales channel, business model): work out the affected modules, show the founder what will update, keep unaffected modules, regenerate affected modules in dependency order, and keep earlier versions. A new project is created only when the founder starts a different idea.
4. **Logo and visual identity wait** until the core architecture is stable (Phase 7).
5. **Preserve the working agent.** Each phase keeps the current functionality and AI behaviour unless a change is separately approved. No big-bang rewrite.

## Plan modules (Phase 1)

The plan is stored as modules, one per existing Claude request. Prompts, schemas and request boundaries are unchanged in Phase 1.

| Module | Produces |
|---|---|
| `assessment` | Idea summary, target customer, positioning, feasibility, assumptions, open questions, next step |
| `financials` | Unit, budget, startup costs, pricing, unit costs, monthly sales, price bands |
| `narrative` | Market, risks, next actions, supplier and marketing previews |
| `setup` | UAE licensing route, steps, requirements, official sources |
| `suppliers` | Supplier categories, supplier types, first orders (reads `financials`) |
| `marketing_strategy` | Objective, channels, 13-week plan |
| `marketing_execution` | Content pillars, budget split, KPIs, next move |
| `marketing_calendar` | Launch-month posts, competitor patterns |

Derived views are calculated from modules and never stored: fitted costs, margins, cash flow, break-even, supplier totals, marketing budget split, launch readiness, the Launch Pack.

## Dependency map

What each module should react to when core information changes.

| Core field | Modules affected directly |
|---|---|
| Budget | financials, assessment, narrative |
| Location (emirate, area) | setup, financials, narrative, assessment, suppliers, marketing_strategy, marketing_calendar |
| Product/service, business model, idea | all modules |
| Target customer | assessment, narrative, financials, marketing_strategy, marketing_execution, marketing_calendar |
| Sales channel | financials, setup, suppliers, assessment, narrative, marketing_strategy, marketing_execution, marketing_calendar |
| Target price | financials, assessment, marketing_execution |
| Stage | assessment, narrative |

Module links: `suppliers` depends on `financials`. Anything downstream of an affected module is affected too.

## Phases

| Phase | Scope |
|---|---|
| 0 | Freeze the competition version, branch, record decisions, baseline checks |
| 1 | Modular generation behind the existing app (no visible change) |
| 2 | KHITTA name and copy, English/Arabic with RTL/LTR, translation layer for module text |
| 3 | Supabase: accounts, projects, core versions, module revisions, generation runs, dashboard |
| 4 | Shorter onboarding writing `CoreInfo` |
| 5 | Edit core information: impact preview, selective regeneration, history |
| 6 | Full plan view and print/PDF |
| 7 | Visual identity and logo |
| 8 | Production hardening |

## Phase 2 — language and branding (implemented, awaiting review)

- Interface copy lives in `src/i18n/dictionaries/en.ts` and `ar.ts`; Arabic must match the English keys (tested).
- The language is chosen with the EN / عربي switcher and kept in the `khitta-locale` cookie; `<html lang dir>` follow it. The founder's answers and results are kept when switching.
- Answers are stored in English whatever the interface language, so the analysis input is unchanged; the dictionary shows them in the interface language.
- Text the builders add around Claude's output is worded by the dictionary; figures are identical in both languages (tested).
- Approved: the prompts and schema descriptions now call the product KHITTA (خِطّة) instead of Ibda. Results saved before the rename can still say "Ibda".
- Approved: generated content follows the interface language.
  - A new plan is generated in the interface language: the browser sends `locale`, and Arabic adds an output-language rule to every plan prompt (English prompts are unchanged). Codes, enum values and source ids stay in English.
  - Switching language after a plan exists translates its text once (`/api/translate`) instead of generating it again, so figures, codes and structure are identical in both languages. The translation is kept with the result (`translations[locale]`); results record the language Claude wrote them in.
  - The abaya demo has an Arabic text overlay (`src/features/demo`); every figure comes from the English demo (tested).
  - The founder's own free-text answers (for example the business name) show as they typed them.

Deferred until separately approved: splitting `assessment` and `narrative` into smaller modules, and passing more upstream output into prompts (for example, aligning the marketing calendar with the strategy's launch week). Both change AI output.
