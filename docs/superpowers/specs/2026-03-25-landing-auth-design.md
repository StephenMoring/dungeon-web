# Landing Page & Auth Design

**Date:** 2026-03-25
**Status:** Approved

## Overview

Replace the current public `/` route (dashboard) with a marketing/login landing page. Authenticated users are redirected straight to the dashboard. Unauthenticated users see a full marketing page with Hero, Features, Pricing, and a Discord OAuth login CTA.

## User Flow

```
User visits /
  ├─ JWT present → redirect to /dashboard
  └─ No JWT → Landing page
       └─ Click "Login with Discord"
            └─ Write attempted path to sessionStorage (if coming via ProtectedRoute)
            └─ Redirect to Discord OAuth (full-page navigation)
                 └─ Discord redirects to /auth/callback?code=...
                      └─ POST code to /api/auth/discord/callback (dungeon-service via proxy)
                           └─ Receive JWT + user info
                                └─ Store JWT in localStorage
                                     └─ Read from sessionStorage, redirect to original path or /dashboard
```

## Architecture

### New Files

| File | Purpose |
|------|---------|
| `src/app/context/auth-context.tsx` | AuthContext + useAuth hook. Stores JWT + user info, reads from localStorage on mount. Exposes `login(jwt, user)`, `logout()`, `isAuthenticated`, `user`. |
| `src/app/components/shared/protected-route.tsx` | Checks `isAuthenticated`. If no JWT, writes current path to `sessionStorage` under `"dungeon_redirect_after_login"`, then redirects to `/`. |
| `src/app/pages/landing.tsx` | Public marketing page (Hero + Features + Pricing + Login CTA). Has its own layout wrapper — does NOT use the shared `Layout` component (see Layout section below). |
| `src/app/pages/auth-callback.tsx` | Handles `/auth/callback`. Extracts `?code=` from URL, POSTs to backend, stores JWT, redirects to saved path or `/dashboard`. Shows loading and error states. |
| `.env.example` | Documents required env vars. Developers must create `.env.local` from this. Note: `.gitignore` has `.env*` — add `!.env.example` negation so this file is committed. |

### Modified Files

| File | Change |
|------|--------|
| `src/app/routes.tsx` | Add `/`, `/auth/callback`, `/dashboard` routes. Wrap protected routes in `ProtectedRoute`. Landing sits outside the `Layout` wrapper. |
| `src/app/App.tsx` | Wrap `RouterProvider` with `AuthProvider`. |
| `.gitignore` | Add `!.env.example` negation after `.env*` line so the example file is committed. |

### Route Table (final)

| Path | Component | Layout | Protected |
|------|-----------|--------|-----------|
| `/` | `Landing` | Own wrapper | No — redirects to `/dashboard` if authenticated |
| `/auth/callback` | `AuthCallback` | None (blank/spinner) | No |
| `/dashboard` | `Home` (existing) | `Layout` | Yes |
| `/character/new` | `CharacterCreation` | `Layout` | Yes |
| `/adventure/:id` | `Campaign` | `Layout` | Yes |
| `/campaigns` | `CampaignList` | `Layout` | Yes |
| `/history` | `History` | `Layout` | Yes |
| `/settings` | `Settings` | `Layout` | Yes |
| `*` | `NotFound` | `Layout` | No |

## Layout Considerations

The existing `Layout` component uses `h-screen overflow-hidden`, which clips scrolling content. The multi-section landing page requires vertical scrolling.

**Solution:** `Landing` is placed **outside** the `Layout` route wrapper in `routes.tsx`. It provides its own root container with the dark background and ambient gradient effects. The floating particles effect is replicated directly in `landing.tsx` (copied from `layout.tsx`) for visual consistency without coupling to `Layout`.

The shared `Layout` remains unchanged and continues to wrap all authenticated routes. The `*` catch-all `NotFound` route must remain as a child of the `Layout` route wrapper to preserve navigation chrome on 404 pages.

## Auth Implementation

### AuthContext

```ts
interface User {
  id: string;
  username: string;
  avatar: string | null;
  email: string | null;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;  // derived: user !== null
  login: (jwt: string, user: User) => void;
  logout: () => void;
}
```

- JWT stored in `localStorage` under key `"dungeon_jwt"`.
- User info stored in `localStorage` under key `"dungeon_user"` (JSON).
- `isAuthenticated` is derived as `user !== null` — never stored as a separate flag.
- **On mount:** Read JWT and user from localStorage. Before setting state, perform a structural check:
  - JWT is a non-empty string
  - User JSON parses successfully and has `id` and `username` fields
  - If either check fails, clear both keys and treat as unauthenticated.
- `logout()` clears both localStorage keys and sets `user` to `null`. It does **not** navigate — callers call `navigate('/')` after `logout()`.

### Deep Link Preservation

React Router `location.state` does not survive the external redirect to Discord and back. Deep link preservation uses `sessionStorage` instead:

1. **`ProtectedRoute`** — when redirecting unauthenticated users, writes the attempted path to `sessionStorage` under `"dungeon_redirect_after_login"` before navigating to `/`.
2. **Landing page login handler** — when the user clicks "Login with Discord", constructs the Discord OAuth URL and does a full-page redirect. The `sessionStorage` value written in step 1 persists through this external navigation.
3. **`AuthCallback`** — after successful login, reads and clears `"dungeon_redirect_after_login"` from `sessionStorage`. Navigates to that path, or `/dashboard` if nothing is stored.

```ts
// ProtectedRoute — before redirecting
sessionStorage.setItem('dungeon_redirect_after_login', location.pathname);

// AuthCallback — after successful login
const from = sessionStorage.getItem('dungeon_redirect_after_login') ?? '/dashboard';
sessionStorage.removeItem('dungeon_redirect_after_login');
navigate(from, { replace: true });
```

### Discord OAuth

The frontend only handles the redirect and the callback. It never calls Discord directly after the redirect.

**Login button target URL:**
```
https://discord.com/oauth2/authorize
  ?client_id={VITE_DISCORD_CLIENT_ID}
  &redirect_uri={VITE_DISCORD_REDIRECT_URI}
  &response_type=code
  &scope=identify%20email
```

Both values come from Vite env vars (`VITE_DISCORD_CLIENT_ID`, `VITE_DISCORD_REDIRECT_URI`). The `email` scope is requested and the `User` interface includes `email: string | null` to match.

**Callback handler** (`/auth/callback`):
1. Read `code` from `window.location.search`. If missing, show error state immediately — no network call.
2. Show loading state: full-screen spinner with "Signing you in..." text.
3. POST `{ code }` to `/api/auth/discord/callback` (proxied to `dungeon-service` at `localhost:8000/auth/discord/callback` via the existing Vite `/api` proxy). **The Vite proxy strips the `/api` prefix before forwarding**, so the backend must mount this route at `/auth/discord/callback`, not `/api/auth/discord/callback`.
4. On success: call `login(jwt, user)`, read `from` from `sessionStorage`, navigate to `from` or `/dashboard`.
5. On error: show error message with a "Try again" link back to `/`.

### Environment Variables

`.gitignore` has `.env*` which would exclude `.env.example`. Add `!.env.example` as a negation rule immediately after `.env*` in `.gitignore`.

Create `.env.local` (gitignored) from `.env.example`:

```
VITE_DISCORD_CLIENT_ID=your_discord_client_id
VITE_DISCORD_REDIRECT_URI=http://localhost:5173/auth/callback
```

## Landing Page

**Visual style:** Cinematic dark. Dark background matching the app, bold oversized typography, radial gradients in hero. Floating particle effect replicated from `Layout` directly in `landing.tsx`.

**Sections:**
1. **Nav** — Logo + "Login with Discord" button (top right)
2. **Hero** — Overline label, large headline, subtext, two CTAs ("Start Playing Free" → Discord OAuth, "See how it works ↓" → smooth scroll to features)
3. **Features** — 3 cards: AI Dungeon Master, Character Builder, Campaign History
4. **Pricing** — Free tier ($0, placeholder limits) + Pro tier ($9/mo, placeholder limits). Content is dummy data — copy TBD.
5. **CTA footer** — "Ready to roll?" + Discord login button

## Error Handling

- `/auth/callback` — missing `code`: show error immediately, no network call.
- `/auth/callback` — backend error: show error message with "Try again" link to `/`.
- `ProtectedRoute` — writes attempted path to `sessionStorage` before redirecting to `/`.

## Implementation Notes

- `src/app/context/` is a new directory — create it alongside `auth-context.tsx`. Update `CLAUDE.md` to document it in the project structure.

## Out of Scope

- Email/password auth
- Social login beyond Discord
- Token refresh / expiry handling (implement when backend adds it)
- Mobile-responsive polish (add in a follow-up)
