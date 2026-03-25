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
            └─ Redirect to Discord OAuth
                 └─ Discord redirects to /auth/callback?code=...
                      └─ POST code to dungeon-service /auth/discord/callback
                           └─ Receive JWT + user info
                                └─ Store JWT in localStorage
                                     └─ Redirect to /dashboard
```

## Architecture

### New Files

| File | Purpose |
|------|---------|
| `src/app/context/auth-context.tsx` | AuthContext + useAuth hook. Stores JWT + user info, reads from localStorage on mount. Exposes `login(jwt, user)`, `logout()`, `isAuthenticated`, `user`. |
| `src/app/components/shared/protected-route.tsx` | Checks `isAuthenticated`. Redirects to `/` if no JWT, otherwise renders `<Outlet />`. |
| `src/app/pages/landing.tsx` | Public marketing page (Hero + Features + Pricing + Login CTA). |
| `src/app/pages/auth-callback.tsx` | Handles `/auth/callback`. Extracts `?code=` from URL, POSTs to backend, stores JWT, redirects to `/dashboard`. |

### Modified Files

| File | Change |
|------|--------|
| `src/app/routes.tsx` | Add `/`, `/auth/callback`, `/dashboard` routes. Wrap protected routes in `ProtectedRoute`. |
| `src/app/App.tsx` | Wrap `RouterProvider` with `AuthProvider`. |
| `src/main.tsx` | No change expected. |

### Route Table (final)

| Path | Component | Protected |
|------|-----------|-----------|
| `/` | `Landing` | No — redirects to `/dashboard` if authenticated |
| `/auth/callback` | `AuthCallback` | No |
| `/dashboard` | `Home` (existing) | Yes |
| `/character/new` | `CharacterCreation` | Yes |
| `/campaign/:id` | `Campaign` | Yes |
| `/campaigns` | `CampaignList` | Yes |
| `/history` | `History` | Yes |
| `/settings` | `Settings` | Yes |
| `*` | `NotFound` | No |

## Auth Implementation

### AuthContext

```ts
interface User {
  id: string;
  username: string;
  avatar: string | null;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (jwt: string, user: User) => void;
  logout: () => void;
}
```

- JWT stored in `localStorage` under key `"dungeon_jwt"`.
- On mount, reads JWT from localStorage. If present, sets `isAuthenticated = true`.
- User info stored alongside JWT in localStorage as `"dungeon_user"` (JSON).
- `logout()` clears both keys and redirects to `/`.

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

Both values come from Vite env vars (`VITE_DISCORD_CLIENT_ID`, `VITE_DISCORD_REDIRECT_URI`).

**Callback handler** (`/auth/callback`):
1. Read `code` from `window.location.search`
2. POST `{ code }` to `dungeon-service` at `/auth/discord/callback`
3. On success: call `login(jwt, user)`, navigate to `/dashboard`
4. On error: show error state with retry link to `/`

## Landing Page

**Visual style:** Cinematic dark. Matches the app's dark background + purple/emerald gradients. Bold oversized typography, dramatic radial gradients in hero. Reuses the existing floating particle effect from `Layout`.

**Sections:**
1. **Nav** — Logo + "Login with Discord" button (top right)
2. **Hero** — Overline label, large headline, subtext, two CTAs ("Start Playing Free" → Discord OAuth, "See how it works ↓" → smooth scroll to features)
3. **Features** — 3 cards: AI Dungeon Master, Character Builder, Campaign History
4. **Pricing** — Free tier ($0) + Pro tier ($9/mo) with dummy limits
5. **CTA footer** — "Ready to roll?" + Discord login button

**Note:** The particle effect lives in `Layout`. The landing page will be inside the same `Layout` wrapper so particles render automatically.

## Error Handling

- `/auth/callback` — if `code` is missing or backend returns error: show an error message with a "Try again" link back to `/`.
- `ProtectedRoute` — on redirect, preserve the originally requested path in state so the user lands on the right page after login (e.g., a shared campaign link).

## Out of Scope

- Email/password auth
- Social login beyond Discord
- Token refresh / expiry handling (implement when backend adds it)
- Mobile-responsive polish (add in a follow-up)
