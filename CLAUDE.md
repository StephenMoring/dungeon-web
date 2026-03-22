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
  app/
    App.tsx                    # RouterProvider wrapper
    routes.tsx                 # All routes defined here
    pages/                     # One file per route
    components/
      ui/                      # shadcn/ui primitives only — don't add custom logic here
      layout.tsx               # Root layout (ambient bg, particles)
      chat-interface.tsx       # DM chat panel
      character-sheet.tsx      # Character stats panel
      notes-section.tsx        # Campaign notes panel
  styles/                      # Global CSS (index, theme, fonts, tailwind)
```

## Dev Commands

```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Production build
```

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Home` | Dashboard with recent campaigns |
| `/character/new` | `CharacterCreation` | New character wizard |
| `/campaign/:id` | `Campaign` | Active session (3-panel layout) |
| `/campaigns` | `CampaignList` | All saved campaigns |
| `/history` | `History` | Past campaign log |
| `/settings` | `Settings` | App settings |

## Conventions

- **No AI calls from the frontend.** All DM responses go through `dungeon-service` (FastAPI at `../dungeon-service`). The current `chat-interface.tsx` uses mock responses — replace with API calls.
- **Prefer shadcn/ui components** over MUI. MUI is a legacy dependency from the Figma export; avoid adding new MUI usage.
- **Tailwind for all styling.** No inline styles or CSS modules.
- **`@` alias** maps to `src/` — use `@/app/components/...` for imports.
- **One component per file.** Keep files focused; extract sub-components when a file grows large.
- **TypeScript strict** — avoid `any`. Define interfaces for all props and API response shapes.
- **Animations via Motion** — use `motion/react`. Wrap new interactive elements with motion for consistency with the existing UI feel.

## Related Services

- `../dungeon-service` — Python FastAPI backend (AI DM logic, campaign persistence)
