# dungeon-web

React frontend for the Dungeon Master AI app. Users create characters, run campaigns, and interact with an AI Dungeon Master via chat. All AI logic lives in the FastAPI backend at `../dungeon-service` — this frontend never calls an AI provider directly.

## Tech Stack

- **Vite 6** + **React 18** + **TypeScript**
- **React Router v7** — file-based routing via `src/app/routes.tsx`
- **Tailwind CSS v4** — via `@tailwindcss/vite` plugin (not PostCSS)
- **shadcn/ui** — Radix UI primitives in `src/app/components/ui/`
- **Motion** (`motion/react`) — animations; import from `motion/react`, not `framer-motion`
- **Lucide React** — icons

## Project Structure

```
src/
  main.tsx                     # Entry point
  assets/art/                  # Public-domain paintings (jpg), used only via the art registry
  dev/                         # Dev-only preview: preview-session.ts (?preview=1) + fixtures.ts
  app/
    App.tsx                    # RouterProvider wrapper
    routes.tsx                 # All routes defined here
    art/
      registry.ts              # ARTWORKS: src, alt, artist, licence, focal points per painting
    pages/                     # One file (or folder) per route
      landing/                   # Public landing page + its sections
      home/                      # Dashboard (/dashboard): hero, roster, continue-target
      campaign/                  # Adventure page + co-located components
        index.tsx
        play-header.tsx
        art-band.tsx
        chat-interface.tsx
        character-sheet.tsx
        notes-section.tsx
        dice-roller.tsx
      campaign-list.tsx
      character-creation.tsx
      history.tsx
      settings.tsx
      auth-callback.tsx
      not-found.tsx
    components/
      ui/                        # shadcn/ui primitives only — don't add custom logic here
      shared/                    # Custom components reusable across pages
        layout.tsx               # App shell (navbar + outlet)
        navbar.tsx               # variant "solid" | "overlay" (overlay on /dashboard)
        nav-links.tsx
        wordmark.tsx             # `linked` prop
        user-menu.tsx
        art-image.tsx            # Painting with focal point; keeps ground colour if it fails to load
        credits.tsx              # Artist / licence line for a painting
        protected-route.tsx
        image-with-fallback.tsx
    context/                     # React contexts
      auth-context.tsx           # JWT auth state, useAuth hook
  styles/                      # Global CSS (index, theme, fonts, tailwind)
```

## Dev Commands

```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Production build
npx vitest run   # Tests
```

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Landing` | Public landing page |
| `/auth/callback` | `AuthCallback` | OAuth return handler |
| `/dashboard` | `Home` | Dashboard: hero, hero roster, recent campaigns |
| `/character/new` | `CharacterCreation` | New character wizard |
| `/adventure/:id` | `Campaign` | Active session (3-panel layout) |
| `/campaigns` | `CampaignList` | All saved campaigns |
| `/history` | `History` | Past campaign log |
| `/settings` | `Settings` | App settings |
| `*` | `NotFound` | Fallback |

All routes except `/`, `/auth/callback` and `*` sit behind `ProtectedRoute`.

## Look

Dark fantasy, "B3" palette. Full rationale: `docs/superpowers/specs/2026-10-22-dark-fantasy-redesign-design.md` (design notes, if present; not committed).

- **Tokens** live in `src/styles/theme.css`: the palette is mapped onto the shadcn variables (`background`, `card`, `border`, `primary`, ...), plus extra tokens `raised`, `faint`, `ember`, `gold`. Use the tokens, never raw hex or other hues.
- **Two faces** (loaded in `src/styles/fonts.css`, exposed as `--face-display` / `--face-body`): `font-display` (Metal Mania) only for the wordmark, page titles, and character and campaign names; `font-sans` (Barlow 400/500/600) for everything else. Use tabular figures on numbers.
- **Gold** marks the one primary action per screen (44px button) and the focus ring (2px, 3px offset). **Ember** is only for wounds/HP, dice results and destructive emphasis.
- Radius 4px; panels are surface fill + 1px border. No shadows (except menus/dialogs/popovers), blur, gradients (except the neutral black scrim over art), glows, emoji, icon-in-box decoration or uppercase tracked labels.
- **Art**: paintings are public-domain files in `src/assets/art/`, registered in `src/app/art/registry.ts` (alt text, artist, licence, focal points). Render them with `ArtImage` and credit them with `Credits` (both in `components/shared/`); never import the jpgs directly.
- Motion on app screens is feedback only (press, hover, dialog, message arrive); the landing page has a richer motion layer. Respect `prefers-reduced-motion`.

## Visual checks

Preview mode seeds a fake login and stubs the API from `src/dev/fixtures.ts`. It works in dev only: start `npm run dev` and add `?preview=1` to any route, e.g. `http://localhost:5173/dashboard?preview=1`.

The taste-skill inspector runs a real browser against a page. Point `CHROME_PATH` at a headless Chrome first:

```bash
TASTE=~/.claude/plugins/cache/taste-skill/taste-skill/2.1.4/skills/taste-skill
export CHROME_PATH=<path to chrome-headless-shell>
node $TASTE/scripts/lint.mjs --app <changed files>
node $TASTE/scripts/inspect.mjs --app "http://localhost:5173/dashboard?preview=1" --out .taste-skill/after/dashboard --allow font-not-dealt
# the landing page is inspected without --app and without ?preview=1
```

Output (screenshots at desktop, tablet, mobile, and RESULT lines) goes under `.taste-skill/`, which is git-ignored.

## Conventions

- **No AI calls from the frontend.** All DM responses go through `dungeon-service` (FastAPI at `../dungeon-service`). The current `pages/campaign/chat-interface.tsx` uses mock responses — replace with API calls.
- **Prefer shadcn/ui components** over MUI. MUI is a legacy dependency from the Figma export; avoid adding new MUI usage.
- **Tailwind for all styling.** No inline styles or CSS modules.
- **`@` alias** maps to `src/` — use `@/app/components/...` for imports.
- **One component per file.** Keep files focused; extract sub-components when a file grows large.
- **TypeScript strict** — avoid `any`. Define interfaces for all props and API response shapes.
- **Animations via Motion** — use `motion/react`. Wrap new interactive elements with motion for consistency with the existing UI feel.

## Related Services

- `../dungeon-service` — Python FastAPI backend (AI DM logic, campaign persistence)
