# Dark fantasy redesign — design

Date: 2026-10-22 · Status: draft for approval

## Intent

dungeon-web looks like every AI-generated app: purple-to-pink gradient text, glass navbars, floating
particles, icon-topped cards, a different accent colour on every card. The owner wants it to feel
personal and unmistakably dark fantasy: the menace of Elden Ring and 80s fantasy cover art, read
through Romantic apocalypse painting.

The approved direction is **B3 "Pandemonium"** (mockup:
`.superpowers/brainstorm/17674-1792699189/content/b3-pandemonium.html`, screenshots in
`.taste-skill/b3/`). Real public-domain paintings by John Martin carry the atmosphere; the interface
on top of them is quiet, solid and readable, so a four-hour play session stays comfortable.

## Goals

- Every screen in the app adopts B3: landing, dashboard, campaign play, campaign list, character
  creation, history, settings, not-found, auth callback, and the shared shell (layout, navbar, user
  menu).
- The look is built from theme tokens, not hard-coded colours, so a later feature can swap the
  palette, the faces or the art per user or per campaign.
- Every screen passes the taste skill's checks (below) at 1440, 768 and 390 px.
- Nothing that works today breaks: routes, auth, API calls, forms, dialogs, existing tests.

## Non-goals

- The theme picker and per-campaign theming themselves. This work only makes them possible.
- Changing behaviour, data or API calls. Mock data stays mock (see "Known content issues").
- Replacing the art with 80s airbrushed artwork. The owner may supply generated or commissioned art
  later; the layout must accept a swapped image without code changes beyond the asset and its credit.
- Removing the MUI dependency (only: add no new MUI usage).

## Anti-goals (a failure even if it technically works)

- Anything from the current look surviving: gradient text, glass/backdrop blur, floating particles,
  glows, violet/indigo/purple/pink accents, a different accent per card, emoji or icon-in-tinted-box
  decoration, tiny tracked uppercase labels.
- Hand-drawn CSS/SVG stand-ins for scenery (moons, castles, stars). Rejected as clip art.
- The flat "screenprint" treatment (solid cyan/pink colour blocks). Rejected as looking terrible.
- Body text set in the display face, or anything that makes the DM's prose hard to read in a long
  session.
- A distinctive dashboard followed by stock-template screens elsewhere: the idea carries everywhere.

## The look (decided)

### Palette — taken from the paintings

| Token role | Value | Use |
| --- | --- | --- |
| ground | `#0b0806` | page background (warm soot black) |
| surface | `#16110d` | panels and cards, one step up |
| raised | `#231a14` | nested: player chat lines, inputs, bar tracks |
| border | `#2e231b` | 1px panel edges |
| control border | `#45352a` | inputs, outlined controls |
| text | `#f1eee9` | all running text, full strength |
| muted | `#cdbfae` | secondary text |
| faint | `#ab9a84` | meta, placeholders (still ≥ 4.5:1) |
| ember | `#ff5a1f` | **only** wounds/HP, dice results, destructive emphasis; dark text on it (`#1a0800`) |
| gold | `#f2b544` | **only** the one primary action per screen; dark text on it (`#1c1203`) |

No other hues. Status that is not wounds or dice (saved, errors) uses muted text plus an icon, with
ember reserved for errors that need attention. These map onto the existing shadcn variables in
`src/styles/theme.css` (`--background`, `--card`, `--primary`, `--destructive`, `--ring`, …) so the
`ui/` primitives inherit the look without per-use overrides.

### Type

- **Metal Mania** (display): the wordmark, page titles, character names, campaign names, card names.
  Never body text, never labels, never buttons.
- **Barlow** 400/500/600 (text): everything else. Tabular figures on all stats and numbers.
- App screens keep titles at 24–32px; only the landing hero and the dashboard hero go larger
  (dashboard hero ≈ 68px desktop / 44px phone, as in B3).

### Surfaces and components

- Solid panels: surface fill + 1px border, radius 4px. No shadows except true overlays (menus,
  dialogs, popovers). No blur anywhere.
- Primary button: gold fill, square-ish (4px radius), 44px tall. One per screen. Everything else is a
  ghost or outlined button in text/muted.
- Hover/focus: border brightens one step; focus ring 2px gold, offset 3px.
- Icons: lucide, outline, 16px, muted, only where they help (back arrow, send, delete). No coloured
  icons, no icon decoration on headings.

### Art

- `Pandemonium` (John Martin, 1841) — dashboard hero, full-bleed, `object-position` on the warrior
  (≈64% 55% desktop, 70% 50% phone), `filter: brightness(.85) contrast(1.05)`, neutral black scrim
  behind the hero text only.
- `The Great Day of His Wrath` (John Martin, c. 1851) — the band above the campaign play screen,
  zoomed to the red sun (≈ scale 1.9, origin 44% 34%), 150px desktop / 110px phone.
- Both are public domain; source files and credits are in
  `.superpowers/brainstorm/17674-1792699189/content/{pandemonium.jpg,wrath.jpg,credits.json}`. They
  move into the app's assets, and a credit line (title, artist, year, licence link, source link) is
  shown in the app — the footer of the landing page and a small line on settings is enough; a caption
  under the dashboard hero ("John Martin, Pandemonium, 1841") as in B3.
- The landing page needs more pictures (the skill's page floor is four real pictures). They are found
  with the skill's `assets.mjs` in the **same family** — Romantic apocalypse/sublime oils, ideally
  more John Martin — looked at before use, credited, and given the same treatment. No duotone, tint
  or colour wash (skill rule).
- Art is referenced through one place (a small art registry: id → file, alt, credit, focal point) so
  swapping a picture, or giving a campaign its own, is a data change.

## Screen by screen

**Shell (`layout.tsx`, `navbar.tsx`, `user-menu.tsx`).** Remove the ambient gradients, blobs and
particles; the ground is flat. The B3 tokens apply globally (`:root`), not only under `.dark`, so the
landing and auth callback pages outside `Layout` get them too. *(Builder's call, settled.)*

The navbar holds the Metal Mania wordmark "Dungeon" (a small shared component, replacing the ⚔
gradient tile, linking to `/dashboard`), **top-level links Dashboard · Campaigns · History · Settings**
(active link brightens from muted to text, no pill, no colour) and the user menu (avatar fallback a
raised-tone circle with the initial, no gradient). Breadcrumbs are dropped: the links replace them
and keep `/campaigns`, `/history` and `/settings` reachable now that the dashboard's button row goes.
The label stays "History"; the mockup's "Chronicle" was sample copy. *(My call; update
`navbar.test.tsx` accordingly.)* On phones the links fold into a menu.

Placement over the art *(my call, from the approved mockup)*:
- Dashboard: the navbar sits transparently on top of the Pandemonium hero, inside its scrim, as in
  B3. Everywhere else it is a solid band on the ground.
- Campaign play: the solid navbar stays at the top (navigation must stay one click away); the Wrath
  band sits directly under it. The play screen's height budget accounts for both.
- Not found sits inside `Layout` and keeps the navbar; `UserMenu` already renders nothing when
  logged out.

**Landing (`/`).** A marketing page, so it follows the taste skill's full **page run**, not the app
run: argument, copy deck, `draw.mjs` with `--keep palette,type` to deal composition only, imagery
(≥ 4 real pictures, same family), the one live element, the motion layer, the inspector without
`--app`. Discord login stays the primary action (keep Discord's own button colour only if the skill's
brand exception is used; otherwise gold with the Discord mark). Current eyebrows, emoji feature cards
and gradient headline go.

**Dashboard (`/dashboard`, `home.tsx`).** B3 home: Pandemonium hero with headline, one sentence and
the gold "Continue <campaign>" action, then "Your heroes" as solid cards (name in display face,
class · campaign name or "No campaign yet", a gold text action: Continue / Begin), with a dashed
"Forge a hero" card.

The data has no timestamps and no level *(my call, no new API calls)*: the hero action continues the
**first character in `getCharacters()` order that has a campaign**; if none has one, it reads "Forge
a hero" and goes to `/character/new`. Level is not shown (B3's "level 3" was sample data). The new-campaign dialog keeps its
behaviour, restyled. The two big "New Campaign / All Campaigns" gradient cards and the bottom button
row are replaced by the hero action, the roster and the navbar.

**Campaign play (`/adventure/:id`, `campaign/*`).** B3 campaign: Wrath band, then a header row (back,
campaign name in display face, the character's name and class as the meta line, Save), then the three
panes. The campaign name comes from the existing `getCampaigns()` call, matched by id, falling back
to "Campaign #id" while loading or if not found; there is no session number or time of day in the
data, so B3's "Session 4 · Night" is dropped *(my call: reuses an existing endpoint, no API change)*.
The panes:
- Character sheet: name in display face, meta line, Wounds as a large tabular figure over an ember
  bar, stats as a two-column list. Editing stays possible (inputs styled as raised fields).
- Story (chat): DM messages as plain prose at 16px, max ~62ch; player lines right-aligned on raised;
  dice results as an ember chip; the composer at the bottom with the gold "Act" button; the dice
  roller restyled to match (ember for results, critical success/fail distinguished by text, not
  extra hues). Typing indicator kept, restyled.
- Notes: plain list/textarea on surface.
On phones the panes stack with the story first, then character, then notes.

**Campaign list, History, Character creation, Settings, Not found, Auth callback.** App-screen run
(B3 tokens and type; taste app rules). Each gets a display-face title, solid panels, one gold primary
action, no per-card accent colours:
- Campaign list: rows/cards with name, character, last played, description; Continue as the row
  action; delete as a muted icon that turns ember on hover, with the existing confirm behaviour.
- History: sessions as a chronicle list; the four-stat strip becomes one divided panel in text
  colour, no per-stat colours.
- Character creation: class/race/background pickers as selectable chips where the selected state is
  a text-coloured border + raised fill (not three different colours); stats with tabular figures; the
  AI "generate" action is secondary, the create action is the gold primary.
- Settings: one view, label column + panel rows per the skill; the art credit line lives here too.
- Not found: Metal Mania "Lost in the dark" style title, one sentence, gold "Back to the dashboard".
- Auth callback: the plain ground with the wordmark and a quiet loading line.

## Constraints

- Stack stays as is: Vite 6, React 18, TS strict, Tailwind v4 via `@tailwindcss/vite`, shadcn/ui in
  `components/ui/` (no custom logic added there — theme via tokens), Motion from `motion/react`,
  lucide icons. No new dependencies needed beyond fonts.
- Motion: app screens use motion only as feedback (press, hover, a dialog opening, a message
  arriving). The landing page gets the skill's motion layer. Respect `prefers-reduced-motion`.
- The taste skill is followed in full for every screen (see `[[follow-skills-fully]]` in the owner's
  notes): record the before (`inspect.mjs --out .taste-skill/before`), build, lint, inspect, look at
  every screenshot, critique, fix, up to three rounds, inspect into `.taste-skill/after`.
- The inspector needs `CHROME_PATH` set to
  `~/.local/share/chrome-for-testing/chrome-headless-shell/linux-156.0.8078.47/chrome-headless-shell-linux64/chrome-headless-shell`.
- Protected routes need a logged-in session for the inspector to see them; how to provide one (a
  test token in localStorage, a dev-only bypass, or rendering the pages with mocked API in a
  harness) is the builder's call, but it must not ship to production.
- Allowed inspector exceptions, and only these: `font-not-dealt` (Metal Mania/Barlow replace the
  dealt Inter by design), and the neutral black scrims behind text on the art (mark the line with
  `taste-skill-ignore`). The `panel-void` warning on the story pane of a short conversation is
  accepted. Every other FAIL is fixed.
- Existing tests (`navbar`, `user-menu`, `protected-route`) keep passing; update them where markup
  intentionally changes (e.g. the wordmark replacing the ⚔ tile) and add tests for any new shared
  component that has behaviour (the art registry lookup, the credits line).

## Known content issues (not fixed here, flagged)

- History shows hard-coded figures (63 sessions, 142h, 4 campaigns, 28 quests) and sample sessions.
  The taste skill bans invented figures; the redesign keeps them only because data is out of scope,
  and the report lists them for replacement.
- The user menu links to `/profile`, which has no route.
- CLAUDE.md's route table is out of date (dashboard is `/dashboard`, play is `/adventure/:id`,
  landing at `/`); update it as part of this work.

## Left to the builder

- Component breakdown and file names (e.g. a shared `PageTitle`, `Panel`, `ArtBand`, `Credits`),
  keeping one component per file.
- Self-hosting the fonts versus loading from Google Fonts.
- Where art files live (`src/assets/art/` or `public/art/`) and the registry's exact shape.
- How each app screen is composed within the B3 rules, decided by the skill's app run.
- The order of work, as long as the shell and tokens land first.
