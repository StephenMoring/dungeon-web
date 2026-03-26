# Navbar Design Spec

## Goal

Add a persistent glass-style navbar to all protected pages. The navbar provides breadcrumb navigation on the left and a user avatar dropdown on the right.

---

## Scope

Appears on all routes wrapped by `Layout` — dashboard, campaigns, history, settings, character creation, and campaign session. Does not appear on the landing page or auth callback.

---

## Visual Style

Glass: semi-transparent background (`rgba(255,255,255,0.04)`), backdrop blur, subtle white border-bottom. Matches the existing cinematic dark aesthetic without blocking the particle/gradient background effects.

Height: `52px`. Fixed at the top of the layout. Content area fills the remaining height below.

---

## Components

### `src/app/components/shared/navbar.tsx`

Renders the full navbar bar. Reads current location via `useLocation()` to compute the breadcrumb.

**Left side — icon + breadcrumb:**
- A gradient icon square (placeholder `⚔` for now, can be replaced with a real asset later)
- Breadcrumb built from current path:

| Path | Breadcrumb |
|------|-----------|
| `/dashboard` | Dashboard |
| `/campaigns` | Dashboard / Campaigns |
| `/history` | Dashboard / History |
| `/settings` | Dashboard / Settings |
| `/character/new` | Dashboard / New Character |
| `/adventure/:id` | Dashboard / Campaign |

"Dashboard" is always a `<Link to="/dashboard">` in purple. The second segment (if present) is plain white text, not a link. The `/` separator is muted.

The campaign name is shown as "Campaign" for now — a static placeholder. It can be replaced with real campaign name data later when that context is available in the campaign page.

**Right side — `<UserMenu />`**

### `src/app/components/shared/user-menu.tsx`

Avatar button that opens a shadcn `DropdownMenu`.

**Avatar:** Shows the user's Discord avatar image if `user.avatar` is non-null. Falls back to a gradient circle with the user's initials (first letter of `user.username`) if avatar is null.

**Dropdown items:**
1. Profile — `<Link to="/profile">` (page does not exist yet, link is a placeholder)
2. Logout — calls `useAuth().logout()` then `navigate("/", { replace: true })`

---

## Layout Changes

`layout.tsx` currently renders `<Outlet />` inside a full-height div. After this change:

```
<div h-screen>
  backgrounds + particles
  <div relative z-10 h-full flex flex-col>
    <Navbar />                    ← new, fixed height
    <main flex-1 overflow-hidden> ← shrinks to fill remaining space
      <Outlet />
    </main>
  </div>
</div>
```

`overflow-hidden` stays on the main content area so the existing campaign 3-panel layout is not affected.

---

## Data Dependencies

- `useAuth()` — provides `user.avatar`, `user.username` for the avatar display
- `useLocation()` — provides current path for breadcrumb computation
- `useNavigate()` — used in logout handler

No new API calls. No new context.

---

## Out of Scope

- Profile page (link is a placeholder)
- Real campaign name in breadcrumb (placeholder "Campaign" for now)
- Mobile/responsive behaviour
- Notification badges or additional nav items
