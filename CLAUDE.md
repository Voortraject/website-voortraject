# CLAUDE.md

> This file is loaded every session. Keep it concise and scannable.
> Convention: this file stays in **English**.

## Project Context

- **Project:** Voortraject website (voortraject.nl) — the public marketing/information
  website for Voortraject, a sustainability intermediary ("verduurzamingsintermediair")
  in the north of the Netherlands (Groningen region) that supports contractors
  ("uitvoerders") and residents ("bewoners") through the insulation/sustainability
  journey ("verduurzamingstraject"), often under the **Nij Begun** subsidy scheme.
  Positioning (from the site): *"Uitvoerders houden focus op planning en uitvoering,
  bewoners krijgen rust en duidelijkheid."*
  - **Not to be confused with** the separate **Voortraject CRM** repo (internal app). This
    repo is the public-facing website only.
- **Stack:** React 18 + Vite + TypeScript + Tailwind + shadcn/ui (Radix), originally built
  in Lovable. Lovable is still used by part of the team; both Lovable and Claude Code sync
  through this GitHub repo, **which is the source of truth.**
- **Package manager:** **bun** (`bun.lockb` present; scripts use `bunx`). A stray
  `package-lock.json` also exists but bun is authoritative. Commands:
  - dev: `bun run dev` (runs `generate-sitemap.ts` first via `predev`)
  - build: `bun run build` (sitemap via `prebuild`, then `vite build`)
  - test: `bun run test` (vitest, jsdom + Testing Library)
  - lint: `bun run lint` (eslint)
- **Backend:** the site talks to **two** Supabase projects:
  1. **Own project** `zvsmazjcfzjyvnjrlnma` — primary backend, via env vars
     `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` (note: *publishable* key, Lovable
     naming, not `ANON_KEY`). Client: `src/integrations/supabase/client.ts`
     (auto-generated — do not hand-edit). Typed against `types.ts` in the same folder.
  2. **CRM project** `lfelnfukbrxznkevnevr` — secondary/external connection, **hardcoded
     anon key** in `src/integrations/supabase/external-client.ts` (exported as
     `supabaseExternal`). Used to write into the shared CRM database (e.g. leads / contact
     submissions). **A schema change on the CRM project affects the CRM app too** — extra
     care, explicit confirmation.
  - **Never invent table or column names** — read them from `supabase/` (SQL migrations)
    and the generated `types.ts`. Be explicit about *which* client (`supabase` vs
    `supabaseExternal`) a query targets.
- **Production:** this GitHub repo is built by **Cloudflare Pages**. **`main` = production
  and auto-deploys.**
- **Analytics / consent (live on the site):** Google Tag Manager (`GTM-P6W5MNN4`),
  Axeptio cookie consent, Microsoft Clarity (loaded only after consent via Google Consent
  Mode). Respect consent gating — do not load trackers before the user's choice.
- **Design ("huisstijl"):** "Institutional B2B" house style — calm, trustworthy. Colors are
  **HSL design tokens** in `src/index.css`, mapped in `tailwind.config.ts`. Always use these
  tokens; **never hardcode hex colors.** Full palette:
  - **Primary / brand**
    - `--primary` deep ink blue `#152C4E` → headings, header, buttons
    - `--accent` mustard/oker `#E8B547` → highlights, CTAs, accents
    - `--accent-hover` oker hover `#D9A538`
  - **Background & neutral**
    - `--background` off-white `#FBFAF7` → page background
    - `--secondary` sand `#F0E4D0` → subtle surfaces
    - `--card` white `#FFFFFF` → cards
    - `--card-soft` cream `#FAF5EC` → soft card background
    - `--border` `#E5E2DB` → lines and borders
  - **Text**
    - `--foreground` near-black `#2B2B2B` → body text
    - `--muted-foreground` muted `~#6B6B6B` → subtle text
  - **Fonts** (loaded in `index.html` from Google Fonts):
    - **Manrope** (300–800) → default for almost everything: body, buttons, labels, nav
      (set as `font-sans` / `font-display`, default in `src/index.css` + Tailwind)
    - **Inter Tight** (Inter as fallback) → large headings/heroes only:
      `.h1-hero`, `.h2-section`, `.h3-block`
    - **JetBrains Mono** (400/500) → monospace; loaded but barely used (code samples)
- **Routing & SEO:** `react-router-dom` (multi-route SPA), `react-helmet-async` for per-page
  meta, and a generated `sitemap.xml` (`scripts/generate-sitemap.ts`, runs on dev/build).
- **Forms:** `react-hook-form` + `zod` validation.

---

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `./tasks/lessons.md` with the pattern (or this file's Core Principles if the lesson is generic)
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review `./tasks/lessons.md` at session start for relevant project lessons

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes -- don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests -- then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

### 7. Error Recovery
- After 2 failed attempts at the same approach, stop and ask the user for guidance
- Do not retry the same fix in a loop — if it didn't work twice, rethink the approach
- When stuck, explain what was tried, what failed, and suggest alternative directions

### 8. Safety and Security
- Maintain a `.claudeignore` file in the project root that prevents sensitive files from being sent to the cloud
- At minimum, `.claudeignore` should include: `.env`, `.env.*`, `credentials.json`, `*.pem`, `*.key`, `secrets.*`
- Store API keys, passwords, tokens, and other secrets locally in a `.env` file
- Claude may read and use `.env` values for logic and configuration, but they must never be leaked to remote services
- Treat all credentials as local-only: reference them in code, never hardcode or commit them

## Task Management

1. Plan First: Write plan to `./tasks/todo.md` (project root) with checkable items
2. Verify Plan: Check in before starting implementation
3. Track Progress: Mark items complete as you go
4. Explain Changes: High-level summary at each step
5. Document Results: Add review section to `./tasks/todo.md`
6. Capture Lessons: Update `./tasks/lessons.md` (project root) after corrections

## Core Principles

- Simplicity First: Make every change as simple as possible. Impact minimal code.
- No Laziness: Find root causes. No temporary fixes. Senior developer standards.
- Minimal Impact: Only touch what's necessary. No side effects with new bugs.
- Scope Discipline: Do not modify code outside the requested scope. Suggest improvements you notice, but don't apply them unless asked.
- Read Before Edit: Always read a file before modifying it. Never edit based on assumptions about file contents.

---

## Project-specific Rules

1. **Never work directly on `main`.** Per logical change: create a descriptive branch →
   open a PR → review → merge → delete the branch. `main` auto-deploys to production via
   Cloudflare Pages.

2. **Data integrity (critical).** The link between frontend queries and the Supabase schema
   is sacred. For every change to a `.from()` / `.insert()` / `.update()` query, table and
   column names must match the **live schema exactly** — do not assume, do not rename.
   First read the schema in `supabase/` and the generated types in
   `src/integrations/supabase/types.ts`. After any schema change, **always regenerate the
   Supabase types** so code and database stay in sync.

3. **Database changes** (RLS policies, functions, grants) go through **SQL migrations**, not
   the frontend branch, and only after **explicit confirmation**.

4. **Use the existing design tokens** (Tailwind config + CSS variables). Never hardcode colors.

5. **Respect the consent layer.** GTM / Microsoft Clarity load only after Axeptio consent
   (Google Consent Mode). Do not add trackers or scripts that fire before consent.

6. **The `service_role` key must never live in this repo.** Only the public anon key belongs
   client-side.

7. **SEO & accessibility matter** (this is a public marketing site): keep meta tags, the
   JSON-LD Organization schema, semantic HTML, alt text, and Lighthouse performance healthy
   when changing pages.
