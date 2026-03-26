# Navbar Design Spec

## Goal

Add a persistent glass-style navbar to all protected pages. The navbar provides breadcrumb navigation on the left and a user avatar dropdown on the right.

---

## Scope

Appears on all routes wrapped by `Layout` — dashboard, campaigns, history, settings, character creation, campaign session, and the 404 not-found page. Does not appear on the landing page or auth callback.

---

## Visual Style

Glass: semi-transparent background (`rgba(255,255,255,0.04)`), backdrop blur (`backdrop-blur-md`), subtle bottom border (`border-b border-white/5`). Matches the existing cinematic dark aesthetic without blocking the particle/gradient background effects.

Height: `h-14` (56px). Fixed at the top of the layout. Content area fills the remaining height below.

---

## Components

### `src/app/components/shared/navbar.tsx`

Renders the full navbar bar. Reads current location via `useLocation()` to compute the breadcrumb.

**Left side — icon + breadcrumb:**

A gradient icon square (placeholder `⚔` for now, replaceable with a real asset later), followed by a breadcrumb computed from the current pathname.

**Breadcrumb path-matching strategy:**

Use a static ordered lookup array — check each entry's `match` function against `location.pathname` from top to bottom, return the first match:

```ts
const BREADCRUMBS = [
  { match: (p: string) => p === "/dashboard",          segments: ["Dashboard"] },
  { match: (p: string) => p === "/campaigns",          segments: ["Dashboard", "Campaigns"] },
  { match: (p: string) => p === "/history",            segments: ["Dashboard", "History"] },
  { match: (p: string) => p === "/settings",           segments: ["Dashboard", "Settings"] },
  { match: (p: string) => p === "/character/new",      segments: ["Dashboard", "New Character"] },
  { match: (p: string) => p.startsWith("/adventure/"), segments: ["Dashboard", "Campaign"] },
];
```

If no entry matches (e.g. the 404 not-found route), render only the icon — no breadcrumb text.

**Rendering rules:**

- "Dashboard" when it is a link: `text-violet-400 hover:text-violet-300` rendered as `<Link to="/dashboard">`
- "Dashboard" when the current path is `/dashboard` (i.e. already on the dashboard): render as `<span className="text-muted-foreground">` — plain text, not a link. Standard breadcrumb convention: do not link to the current page.
- The second segment (if present): `<span className="text-foreground/90">` — plain white text, never a link.
- The `/` separator: `<span className="text-muted-foreground/40">` — faint, not interactive.

The campaign name segment shows "Campaign" as a static placeholder for now. It will be replaced with real campaign name data in a future task when the campaign page exposes that context.

**Right side — `<UserMenu />`**

---

### `src/app/components/shared/user-menu.tsx`

Avatar button that opens a shadcn `DropdownMenu`.

**Nullability:** `UserMenu` is only rendered inside `Layout`, which is only reached through `ProtectedRoute`. By the time this component renders, `user` is guaranteed non-null. Add an early return guard (`if (!user) return null`) at the top of the component — this satisfies TypeScript without adding dead UI logic.

**Avatar image:** If `user.avatar` is non-null, construct the Discord CDN URL as:
```
https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}.png
```
Render as `<img src={...} alt={user.username} className="w-8 h-8 rounded-full" />`. Add an `onError` handler that hides the image and shows the initials fallback instead (use a local `useState<boolean>` named `avatarError`). This handles stale Discord avatar hashes gracefully.

**Avatar fallback:** If `user.avatar` is null, or if the image fails to load (`avatarError === true`), render a gradient circle:
```tsx
<div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
  {user.username[0].toUpperCase()}
</div>
```

**Dropdown trigger:** Wrap the avatar in `DropdownMenuTrigger` with `asChild` and add `aria-label="Open user menu"` to the inner button element.

**Dropdown items:**

1. **Profile** — use `DropdownMenuItem asChild` with a `<Link to="/profile">` inside. The `asChild` prop is required to make Radix render the Link's anchor correctly instead of a nested button. The profile page does not exist yet; this is a placeholder link.

2. **Logout** — use a plain `<DropdownMenuItem>` with an `onClick` handler (not a Link, not asChild). The handler calls `useAuth().logout()` then `navigate("/", { replace: true })`. Navigating to `/` is intentional: unauthenticated users always land on the Landing page at `/`, and `logout()` does not navigate itself by design.

---

## Layout Changes

The current `src/app/components/shared/layout.tsx` inner structure is:

```tsx
<div className="relative z-10 h-full">
  <Outlet />
</div>
```

The `h-full` inherits from the outer `h-screen` wrapper — retain it. Change this div to:

```tsx
<div className="relative z-10 h-full flex flex-col">
  <Navbar />
  <main className="flex-1 overflow-hidden">
    <Outlet />
  </main>
</div>
```

`flex flex-col` on the wrapper + `flex-1` on `<main>` makes the content area fill exactly the height remaining after the navbar. `overflow-hidden` on `<main>` is intentional — it is required by the campaign session's 3-panel layout which manages its own internal scroll. Pages such as Settings, History, and Campaign List that need vertical scroll must implement their own `overflow-y-auto` scroll container as the root element of their page component. This is the correct pattern: pages own their scroll behaviour, the layout shell does not.

---

## Data Dependencies

- `useAuth()` — provides `user.avatar`, `user.id`, `user.username` for avatar display; `logout()` for the logout action
- `useLocation()` — provides current path for breadcrumb computation in `Navbar`
- `useNavigate()` — used in logout handler inside `UserMenu`

No new API calls. No new context.

---

## Accessibility

- `DropdownMenuTrigger` inner button must have `aria-label="Open user menu"`
- Avatar `<img>` must have `alt={user.username}`

---

## Out of Scope

- Profile page (link is a placeholder)
- Real campaign name in breadcrumb (shows "Campaign" for now)
- Mobile/responsive behaviour
- Notification badges or additional nav items
