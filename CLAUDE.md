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
  assets/art/                  # Public-domain paintings (webp, ≤2000px, no metadata), used only via the art registry
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
        chat-interface.tsx         # Streams turns and combat rounds (SSE); story items: messages, roll and round cards, notes, errors; the action box, combat buttons, Rest, or the death message
        roll-card.tsx              # Live d20 check result; narration is held until it settles
        round-card.tsx             # A combat round's rolls (player, then each enemy); holds narration and HP until it settles
        combat-actions.tsx         # Replaces the action box during a fight: your HP, enemy targets with HP, Attack / Defend / Flee
        health-bar.tsx             # HP meter (ember), used on the sheet and in fights
        rest-overlay.tsx           # The campfire rest: covers the story for the server's rest time, then heals
        campfire.tsx               # The animated campfire (still under reduced motion)
        character-sheet.tsx
        notes-section.tsx
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
        navbar.tsx               # variant "solid" | "overlay" (overlay is rendered inside the dashboard hero; Layout skips the navbar there)
        nav-links.tsx
        wordmark.tsx             # `linked` prop
        user-menu.tsx
        art-image.tsx            # Painting with focal point; keeps ground colour if it fails to load
        credits.tsx              # Artist / licence line for a painting
        protected-route.tsx
        image-with-fallback.tsx
    auth/
      discord-login.ts           # Discord sign-in link with the OAuth state check (startDiscordLogin, takeOAuthState)
    context/                     # React contexts
      auth-context.tsx           # Session state from GET /api/auth/me (status loading | signed-in | signed-out), useAuth hook
  styles/                      # Global CSS (index, theme, fonts, tailwind)
```

## Production

`Dockerfile` builds the app (`VITE_DISCORD_CLIENT_ID` / `VITE_DISCORD_REDIRECT_URI` are build args, baked into the bundle) and serves `dist/` with Caddy. `Caddyfile`: HTTPS for `SITE_ADDRESS`, `/api/*` proxied to the API with streaming flushed, React routes fall back to `index.html`, long-cached `/assets`, and security headers including a Content-Security-Policy (scripts from this origin only; Google Fonts; avatars from `cdn.discordapp.com`). A new external script, font or image host must be added to that CSP. `dist/` is build output and not committed. The stack and its guide live in `../dungeon-service/infra/prod/`.

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
- **Art**: paintings are public-domain files in `src/assets/art/`, registered in `src/app/art/registry.ts` (alt text, artist, licence, focal points; pre-cut crops such as `wrath-band` set `creditOf` so they are credited once). Render them with `ArtImage` (lazy by default; pass `priority` only for a screen's above-the-fold hero) and credit them with `Credits` (both in `components/shared/`); never import the image files directly.
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

- **API calls go through `apiFetch` (`src/app/api/http.ts`).** The session is an httpOnly cookie the browser sends itself; page code never sees or stores a token, so never put one in `localStorage`. `apiFetch` adds `X-Requested-With: dungeon-web`, which the API requires on writes. Sign-in state comes from `/api/auth/me`; preview mode stubs it. Saving a character sends only the `preview_token` from `/characters/preview` (the server signed the generated stats; the page shows them read-only and asks to generate again if the details change). Discord sign-in must go through `startDiscordLogin()`: it stores a random OAuth `state`, and `/auth/callback` refuses any code whose state this browser didn't store (login CSRF).
- **No AI calls from the frontend.** All DM responses go through `dungeon-service` (FastAPI at `../dungeon-service`).
- **Turns stream.** `src/app/api/turn-stream.ts` posts to `/api/characters/{id}/turns/stream` and parses Server-Sent Events (`thinking`, `roll`, `text`, `combat`, `done`, `error`; combat rounds add `round`). Dice are rolled on the server; the frontend only animates the result. Rolls are not stored, so reloaded history shows narration only.
- **Combat and health come from the server.** When the DM starts a fight the turn stream sends `combat` (the encounter: enemies with HP, the player's HP). While a fight is active the action box becomes `CombatActions`; each button posts to `/api/characters/{id}/combat/stream` (`streamCombatRound`), which sends `round` (every roll, already saved), `combat` (HP after it), then narration. The page applies a round's `combat` state only when its `RoundCard` settles, so bars don't give the outcome away; if narration fails the round still stands and its state is applied at once. `src/app/pages/campaign/index.tsx` holds the character and encounter (`GET /api/characters/{id}/encounter` on load) and updates the character's HP from every `combat` event. A dead character (`died_at`) gets a closing message instead of the action box. **Rest** (shown when wounded, outside fights) calls `/rest`, and `RestOverlay` counts down the server's `seconds_left`, then calls `/rest/finish`; the server refuses an early finish, so never shorten the wait in the UI. A reload during a rest resumes it (`rest_started_at` on the character). Preview mode: `?preview=1&fight=1` opens an adventure mid-fight; the preview character is wounded, so Rest shows.
- **Prefer shadcn/ui components** over MUI. MUI is a legacy dependency from the Figma export; avoid adding new MUI usage.
- **Tailwind for all styling.** No inline styles or CSS modules.
- **`@` alias** maps to `src/` — use `@/app/components/...` for imports.
- **One component per file.** Keep files focused; extract sub-components when a file grows large.
- **TypeScript strict** — avoid `any`. Define interfaces for all props and API response shapes.
- **Animations via Motion** — use `motion/react`. Wrap new interactive elements with motion for consistency with the existing UI feel.

## Related Services

- `../dungeon-service` — Python FastAPI backend (AI DM logic, campaign persistence)
