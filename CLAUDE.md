# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Arcade Vault is an online platform for playing games and competing for the highest score. It is at the create-next-app starting point: `app/page.tsx` and `app/layout.tsx` still hold the template content and metadata.

Work follows Spec Driven Design with the `/spec` and `/spec-impl` skills from https://github.com/Klerith/fernando-skills (install: `npx skills@latest add Klerith/fernando-skills`).

## Commands

- `npm run dev`: dev server at http://localhost:3000
- `npm run build`: production build (also type-checks)
- `npm run lint`: ESLint 9 flat config (`eslint.config.mjs`, next core-web-vitals + typescript)
- Type-check only: `npx tsc --noEmit`

No test framework is configured yet.

## Stack and configuration

- **Next.js 16.4 (App Router) + React 19.3 + TypeScript strict.** APIs differ from older Next.js; check `node_modules/next/dist/docs/` (`01-app/` covers the App Router) before using a Next API.
- `next.config.ts` enables `cacheComponents` (Cache Components / `"use cache"` model), `partialPrefetching`, and `experimental.agentFeedback`. Write data fetching and caching against the Cache Components model, not the legacy `fetch` cache / route segment config options.
- **Tailwind CSS v4**, wired through Turbopack with the `@tailwindcss/turbopack` loader on `*.css` (no PostCSS config, no `tailwind.config.*`). Theme tokens live in `app/globals.css` under `@theme inline`; light/dark colors are CSS variables switched via `prefers-color-scheme`.
- Layout and page props use the global generated types (e.g. `LayoutProps<"/">`) rather than hand-written prop types.
- Path alias: `@/*` maps to the repo root.
