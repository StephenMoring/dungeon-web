# Dark Fantasy Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle every screen of dungeon-web to the approved B3 "Pandemonium" dark fantasy direction, built on swappable theme tokens and a small art registry, with every screen passing the taste skill's checks.

**Architecture:** B3 values replace the shadcn variables in `src/styles/theme.css` (plus four new tokens), so `components/ui/` inherits the look. Art lives in `src/assets/art/` behind a typed registry (`src/app/art/registry.ts`) consumed by an `ArtImage` and a `Credits` component. A dev-only preview session (`?preview=1`) fakes auth and API responses so the taste inspector can photograph protected routes. Pages are then rebuilt one at a time with the taste skill's run.

**Tech Stack:** Vite 6, React 18, TypeScript strict, Tailwind v4 (`@tailwindcss/vite`), shadcn/ui, `motion/react`, lucide-react, Vitest + Testing Library (jsdom).

**Spec:** `docs/superpowers/specs/2026-10-22-dark-fantasy-redesign-design.md` (approved; the executor reads it alongside this plan). Mockup: `.superpowers/brainstorm/17674-1792699189/content/b3-pandemonium.html`.

## Global Constraints

- Work on branch `feat/dark-fantasy-redesign`. Never `git add` anything under `docs/superpowers/`, `.superpowers/` or `.taste-skill/` (owner: do not commit the spec). Add `.taste-skill/` to `.gitignore` in Task 1.
- Palette (exact): ground `#0b0806`, surface `#16110d`, raised `#231a14`, border `#2e231b`, control border `#45352a`, text `#f1eee9`, muted `#cdbfae`, faint `#ab9a84`, ember `#ff5a1f` (text on it `#1a0800`), gold `#f2b544` (text on it `#1c1203`). No other hues anywhere.
- Ember only for wounds/HP, dice results and destructive emphasis. Gold only for the one primary action per screen.
- Faces: `"Metal Mania"` for wordmark, page titles, character and campaign names only; `"Barlow"` 400/500/600 for everything else. Tabular figures on all numbers.
- Radius 4px on panels, buttons, inputs. Panels: surface fill + 1px border. No shadows except menus/dialogs/popovers. No blur, gradients (except the neutral black scrim over art), glows, emoji, icon-in-box decoration, uppercase tracked labels, purple/violet/pink/emerald/blue classes.
- Primary button 44px tall, gold. Focus: 2px gold outline, 3px offset.
- Motion on app screens is feedback only (press, hover, dialog open, message arrive); landing gets the skill's motion layer. Respect `prefers-reduced-motion`.
- Stack unchanged; no new npm dependencies; no new MUI usage; nothing custom added to `src/app/components/ui/`.
- Data/API behaviour unchanged except Task 6's reuse of `getCampaigns()`.
- `TASTE=/home/steph/.claude/plugins/cache/taste-skill/taste-skill/2.1.4/skills/taste-skill`
- `CHROME_PATH=/home/steph/.local/share/chrome-for-testing/chrome-headless-shell/linux-156.0.8078.47/chrome-headless-shell-linux64/chrome-headless-shell` (export before any inspect).
- **Screen gate** (used by every screen task; `<route>` and `<name>` given per task; dev server `npm run dev` running):
  1. `node $TASTE/scripts/lint.mjs --app <changed files>` → `0 FAIL`.
  2. `node $TASTE/scripts/inspect.mjs --app "http://localhost:5173<route>?preview=1" --out .taste-skill/after/<name> --allow font-not-dealt` → `0 FAIL`; every WARN fixed or defended in one sentence in the task's notes (the story pane's `panel-void` is pre-accepted).
  3. Open every screenshot it lists (desktop, tablet, mobile), answer the seven questions of `$TASTE/references/app-screens.md` §2.7 in writing, fix the worst three, re-inspect. At most three rounds.
- Baseline: `npx vitest run` has one pre-existing failure (`user-menu.test.tsx › renders an img when avatar is non-null`). It must not get worse; Task 4 investigates it.

## Review Focus

- **A new user with no characters** opens the dashboard: the hero says "Forge a hero" and goes to `/character/new`; the roster shows only the dashed "Forge a hero" card. → test in Task 5.
- **The campaigns request fails or the id is unknown** on `/adventure/:id`: the header reads "Campaign #<id>" and the page still plays. → test in Task 6.
- **A painting fails to load:** the area keeps the ground colour and the text over it stays readable (no broken-image icon). → test in Task 3.
- **Long names** ("Ysolde the Pale of the Ninth Ash-Wood", a 60-character campaign name) at 390px wrap inside their card without horizontal scroll. → fixtures in Task 1 carry them; each screen gate's 390px screenshot checks it.
- **Keyboard-only player:** every link, button, chip and input shows the gold focus ring, and the phone nav menu opens and closes by keyboard. → test in Task 4 (menu), inspector focus check in each gate.

---

### Task 1: Preview session, fixtures and the "before" record

**Files:**
- Create: `src/dev/preview-session.ts`, `src/dev/fixtures.ts`, `src/dev/preview-session.test.ts`
- Modify: `src/main.tsx`, `.gitignore`

**Interfaces:**
- Produces: `isPreviewRequested(search: string): boolean`; `startPreviewSession(): void` (seeds `localStorage` `dungeon_jwt` = `"preview"` and `dungeon_user` = `{"id":"preview","username":"Aldric","avatar":null,"email":null}`, then replaces `window.fetch` with a stub answering from fixtures; unknown URLs fall through to the real fetch). Fixture exports: `PREVIEW_CHARACTERS: CharacterWithCampaign[]` (3: Aldric of Vézelay/Sellsword with campaign id 7 "The Bell of Saint-Lazare"; "Ysolde the Pale of the Ninth Ash-Wood"/Witch with none; a third with a 60-character campaign name), `PREVIEW_CAMPAIGNS: Campaign[]`, `PREVIEW_TURNS: MessageHistory[]` (the three B3 lines), classes and races lists.
- Stub routes: `GET /api/characters/` → characters; `GET /api/campaigns/` → campaigns; `GET /api/campaigns/:id/characters` → `[{id}]` of that campaign's character; `GET|POST /api/characters/:id/turns` → turns / `{message}`; `GET /api/characters/classes|races`.

- [ ] **Step 1: Write failing tests** in `src/dev/preview-session.test.ts`: `isPreviewRequested("?preview=1") === true`, `isPreviewRequested("") === false`; after `startPreviewSession()`, `localStorage.getItem("dungeon_jwt") === "preview"` and `await (await fetch("/api/campaigns/")).json()` deep-equals `PREVIEW_CAMPAIGNS`.
- [ ] **Step 2:** `npx vitest run src/dev` → FAIL (module not found).
- [ ] **Step 3: Implement** both files; in `src/main.tsx` wrap the render in `function boot(): void` and call it either directly or, when `import.meta.env.DEV && isPreviewRequested(location.search)`, after `import("./dev/preview-session").then((m) => m.startPreviewSession())` resolves (dynamic import inside the DEV guard so production drops it; no top-level `await`).
- [ ] **Step 4:** `npx vitest run src/dev` → PASS. `npm run build && ! grep -rl "preview-session\|Ninth Ash-Wood" dist` → no output.
- [ ] **Step 5: Record the before.** Add `.taste-skill/` to `.gitignore`. With `npm run dev` running, inspect each route into `.taste-skill/before/<name>` (`/` landing without `--app`; `/dashboard`, `/adventure/7`, `/campaigns`, `/character/new`, `/history`, `/settings`, `/nope` with `--app`, all with `?preview=1`). Save the RESULT lines into `.taste-skill/before/summary.txt`.
- [ ] **Step 6: Commit** `src/dev src/main.tsx .gitignore` — `chore: dev-only preview session for visual checks`.

### Task 2: Theme tokens and faces

**Files:**
- Modify: `src/styles/theme.css`, `src/styles/fonts.css`, `index.html` (title "Dungeon")

**Interfaces:**
- Produces Tailwind utilities used by every later task: `bg-background bg-card bg-raised border-border text-foreground text-muted-foreground text-faint bg-ember text-ember bg-gold text-gold font-display font-body`.

- [ ] **Step 1:** Replace `:root` in `theme.css` with the palette mapped onto the shadcn names: `--background` ground, `--foreground` text, `--card`/`--popover` surface, `--primary` gold + `--primary-foreground #1c1203`, `--secondary`/`--muted`/`--accent` raised with text/muted foregrounds, `--muted-foreground` muted, `--destructive` ember + `#1a0800`, `--border` border, `--input` control border, `--input-background` raised, `--ring` gold, `--radius: 0.25rem`, charts and sidebar onto the same values. Add `--raised`, `--faint`, `--ember`, `--gold`, `--font-display: "Metal Mania", serif`, `--font-body: "Barlow", system-ui, sans-serif`. Delete the `.dark` block (tokens are global). In `@theme inline` add `--color-raised --color-faint --color-ember --color-gold --font-display --font-sans: var(--font-body)`. Base layer: `body` uses `font-body`, `font-variant-numeric` left default; headings keep sizes.
- [ ] **Step 2:** `fonts.css`: `@import url('https://fonts.googleapis.com/css2?family=Metal+Mania&family=Barlow:wght@400;500;600&display=swap');`
- [ ] **Step 3:** `npm run build` → succeeds. `node $TASTE/scripts/lint.mjs --app src/styles` → `0 FAIL`.
- [ ] **Step 4:** `npx vitest run` → no new failures.
- [ ] **Step 5: Commit** — `feat: B3 theme tokens and faces`.

### Task 3: Art registry, ArtImage, Credits

**Files:**
- Create: `src/assets/art/pandemonium.jpg`, `src/assets/art/wrath.jpg` (copy from `.superpowers/brainstorm/17674-1792699189/content/`), `src/app/art/registry.ts`, `src/app/components/shared/art-image.tsx`, `src/app/components/shared/credits.tsx`, tests `src/app/art/registry.test.ts`, `src/app/components/shared/art-image.test.tsx`, `src/app/components/shared/credits.test.tsx`

**Interfaces:**
- Produces:
  - `type ArtId = "pandemonium" | "wrath"` (Task 11 extends it).
  - `interface Artwork { id: ArtId; src: string; width: number; height: number; alt: string; title: string; artist: string; year: string; licenceName: string; licenceUrl: string; sourceUrl: string; focal: { desktop: string; phone: string }; zoom?: number }`
  - `ARTWORKS: Record<ArtId, Artwork>`; `getArtwork(id: ArtId): Artwork`.
  - `<ArtImage id={ArtId} className?: string />` — `object-cover`, `object-position` from `focal` (phone below 760px), `brightness(.85) contrast(1.05)`, optional `scale(zoom)` with origin = focal; wrapper has `bg-background`; on `onError` the `<img>` is hidden.
  - `<Credits ids={ArtId[]} className?: string />` — one `<p>`: "Pictures: “Title” by Artist, Year, <licence link>, via Wikimedia Commons; …" with title linking to `sourceUrl`.
- Values: pandemonium 2634×1758, "Pandemonium", John Martin, "1841", focal desktop `64% 55%` phone `70% 50%`, source `https://commons.wikimedia.org/wiki/File:Le_Pandemonium_-_John_Martin_-_Mus%C3%A9e_du_Louvre_Peintures_RF_2006_21_-_sans_cadre.jpg`; wrath 3136×2023, "The Great Day of His Wrath", John Martin, "about 1851", focal `44% 34%` both, zoom 1.9, source `https://commons.wikimedia.org/wiki/File:John_Martin_-_The_Great_Day_of_His_Wrath_-_Google_Art_Project.jpg`. Licence "public domain", `https://creativecommons.org/publicdomain/mark/1.0/`. Alt texts as in the B3 mockup.

- [ ] **Step 1: Failing tests:** `getArtwork("wrath").zoom === 1.9`; every artwork has non-empty `alt` and `sourceUrl`; `<Credits ids={["pandemonium","wrath"]} />` renders links named "“Pandemonium”" and "“The Great Day of His Wrath”" with those hrefs; `<ArtImage id="pandemonium" />` renders an `img` with the alt, and after `fireEvent.error(img)` the img is not visible while the wrapper remains.
- [ ] **Step 2:** `npx vitest run src/app/art src/app/components/shared/art-image.test.tsx src/app/components/shared/credits.test.tsx` → FAIL.
- [ ] **Step 3:** Implement the three modules.
- [ ] **Step 4:** Same command → PASS.
- [ ] **Step 5: Commit** — `feat: art registry with credited John Martin paintings`.

### Task 4: Shell — layout, navbar, user menu

**Files:**
- Create: `src/app/components/shared/wordmark.tsx`, `src/app/components/shared/nav-links.tsx`
- Modify: `layout.tsx`, `navbar.tsx`, `user-menu.tsx`, `navbar.test.tsx`, `user-menu.test.tsx` (all in `src/app/components/shared/`)

**Interfaces:**
- Produces: `<Wordmark className?: string />` (Metal Mania "Dungeon", links to `/dashboard`); `NAV_ITEMS = [{to:"/dashboard",label:"Dashboard"},{to:"/campaigns",label:"Campaigns"},{to:"/history",label:"History"},{to:"/settings",label:"Settings"}]`; `<Navbar variant?: "solid" | "overlay" />` (root carries `data-variant`); `Layout` renders `variant="overlay"` positioned absolutely over `<main>` when `pathname === "/dashboard"`, else a solid band in flow.
- Active link: `aria-current="page"` on an exact path match, text colour; others muted. On `/adventure/:id` and `/character/new` no link is active. Below 760px the links collapse into a "Menu" button opening the shadcn `Sheet` with the same links.

- [ ] **Step 1: Rewrite `navbar.test.tsx`** ("Navbar links"): on `/campaigns` all four links exist and Campaigns has `aria-current="page"`; on `/adventure/7` none has `aria-current`; the wordmark link "Dungeon" points to `/dashboard`; `render(<Navbar variant="overlay" />)` root has `data-variant="overlay"`; the "Menu" button opens a dialog containing the four links and `Escape` closes it (keyboard focus case from Review Focus).
- [ ] **Step 2:** `npx vitest run src/app/components/shared/navbar.test.tsx` → FAIL.
- [ ] **Step 3:** Implement: Layout drops gradients/blobs/particles and the `dark` class; Navbar as above; UserMenu fallback avatar `bg-raised text-foreground`, focus ring gold. Investigate the pre-existing `renders an img` failure; fix it if the cause is in `user-menu.tsx`, otherwise record why in the task notes.
- [ ] **Step 4:** `npx vitest run` → navbar suite PASS, no new failures.
- [ ] **Step 5: Screen gate** for `/settings` (`<name>` = `shell`), judging only the navbar and ground.
- [ ] **Step 6: Commit** — `feat: B3 shell with wordmark and top-level links`.

### Task 5: Dashboard

**Files:**
- Create: `src/app/pages/home/continue-target.ts`, `continue-target.test.ts`, `dashboard-hero.tsx`, `hero-roster.tsx` (in `src/app/pages/home/`)
- Modify: `src/app/pages/home.tsx` → move to `src/app/pages/home/index.tsx` (update `routes.tsx` import)

**Interfaces:**
- Consumes: `ArtImage`, `Credits` (Task 3); `CharacterWithCampaign`, `getCharacters`, `createCampaign` (existing).
- Produces: `continueTarget(items: CharacterWithCampaign[]): { kind: "continue"; campaignId: number; campaignName: string } | { kind: "forge" }` — first item in array order whose `character.campaign_id` is set; name from `item.campaign?.name ?? "your campaign"`.

- [ ] **Step 1: Failing tests:** `continueTarget([])` → `{kind:"forge"}`; with `[noCampaign, aldric(7), other(9)]` → `{kind:"continue", campaignId:7, campaignName:"The Bell of Saint-Lazare"}`; render the page with `getCharacters` mocked to `[]` → a link "Forge a hero" to `/character/new` and no "Continue" text (Review Focus: new user).
- [ ] **Step 2:** `npx vitest run src/app/pages/home` → FAIL.
- [ ] **Step 3:** Implement per spec "Dashboard": hero (Pandemonium, scrim, h1 headline "The gate is already burning", one sentence, gold action from `continueTarget`, caption "John Martin, Pandemonium, 1841"), "Your heroes" roster (no level), dashed Forge card, restyled new-campaign dialog (same behaviour). Remove the gradient action cards and the bottom button row.
- [ ] **Step 4:** Tests PASS; `npx vitest run` no new failures.
- [ ] **Step 5: Screen gate** `/dashboard`, name `dashboard`.
- [ ] **Step 6: Commit** — `feat: B3 dashboard`.

### Task 6: Campaign play

**Files:**
- Create: `src/app/pages/campaign/campaign-name.ts`, `campaign-name.test.ts`, `art-band.tsx`, `play-header.tsx`
- Modify: `index.tsx`, `chat-interface.tsx`, `character-sheet.tsx`, `dice-roller.tsx`, `notes-section.tsx` (all in `src/app/pages/campaign/`)

**Interfaces:**
- Consumes: `ArtImage`; `getCampaigns`.
- Produces: `campaignName(campaigns: Campaign[] | null, id: string): string` → matching `name`, else `` `Campaign #${id}` ``.

- [ ] **Step 1: Failing tests:** `campaignName(null,"7") === "Campaign #7"`; unknown id → `"Campaign #99"`; match → `"The Bell of Saint-Lazare"`; render `Campaign` at `/adventure/99` with `getCampaigns` rejecting → heading "Campaign #99" and the story composer present (Review Focus).
- [ ] **Step 2:** `npx vitest run src/app/pages/campaign` → FAIL.
- [ ] **Step 3:** Implement per spec "Campaign play": Wrath band (150px / 110px phone) under the solid navbar; header (back, display-face name, character name · class meta, Save as outlined secondary); three panes `260px 1fr 240px`, 16px gap; chat DM prose 16px max 62ch, player lines on raised right-aligned, dice result ember chip, gold "Act"; dice roller ember results, critical shown in words; notes on surface; phone order story → character → notes.
- [ ] **Step 4:** Tests PASS; full suite no new failures.
- [ ] **Step 5: Screen gate** `/adventure/7`, name `campaign`.
- [ ] **Step 6: Commit** — `feat: B3 campaign play screen`.

### Task 7: Campaign list

**Files:** Modify `src/app/pages/campaign-list.tsx`

- [ ] **Step 1:** Restyle per spec: Metal Mania title "Campaigns", gold "New campaign" primary, rows with name (display), character, description, Continue row action; delete as muted icon button turning ember on hover with existing confirm. No per-card colours, no gradient.
- [ ] **Step 2:** `npx vitest run` no new failures; `npm run build` succeeds.
- [ ] **Step 3: Screen gate** `/campaigns`, name `campaigns`.
- [ ] **Step 4: Commit** — `feat: B3 campaign list`.

### Task 8: Character creation

**Files:** Modify `src/app/pages/character-creation.tsx`; Create `src/app/pages/character-creation/choice-chip.tsx` only if the file passes ~350 lines after the change (then move the page to `character-creation/index.tsx`).

- [ ] **Step 1:** Restyle per spec: chips for class/race/background with one selected style (`border-foreground bg-raised`), `aria-pressed` on each chip; stats with tabular figures; "Generate" outlined secondary; "Create" gold primary.
- [ ] **Step 2:** Add test `character-creation.test.tsx`: clicking a class chip sets `aria-pressed="true"` on it and `false` on the previous one.
- [ ] **Step 3:** `npx vitest run` → new test PASS, no new failures.
- [ ] **Step 4: Screen gate** `/character/new`, name `character-new`.
- [ ] **Step 5: Commit** — `feat: B3 character creation`.

### Task 9: History

**Files:** Modify `src/app/pages/history.tsx`

- [ ] **Step 1:** Restyle: title "History", sessions as a chronicle list (campaign name display face, date/duration muted, summary at 16px, highlights as muted inline list — no pills), the four figures as one divided panel in text colour. Keep the existing mock data untouched; add a `// TODO(data):` comment above it naming the spec's "Known content issues".
- [ ] **Step 2:** Suite no new failures; build succeeds.
- [ ] **Step 3: Screen gate** `/history`, name `history`.
- [ ] **Step 4: Commit** — `feat: B3 history`.

### Task 10: Settings, Not found, Auth callback

**Files:** Modify `src/app/pages/settings.tsx`, `src/app/pages/not-found.tsx`, `src/app/pages/auth-callback.tsx`

- [ ] **Step 1:** Settings per `app-screens.md` §8.2 (label column + panel rows, one save model as today), plus a "Pictures" row rendering `<Credits ids={["pandemonium","wrath"]} />`. Not found: display title "Lost in the dark", one sentence, gold "Back to the dashboard". Auth callback: ground, `<Wordmark />`, one muted loading line (keep its logic).
- [ ] **Step 2:** Suite no new failures; build succeeds.
- [ ] **Step 3: Screen gates** `/settings` (`settings`), `/nope` (`not-found`); auth callback checked by screenshot only (it redirects).
- [ ] **Step 4: Commit** — `feat: B3 settings, not found, auth callback`.

### Task 11: Landing page (taste page run)

**Files:** Modify `src/app/pages/landing.tsx`; Create `src/app/pages/landing/*.tsx` section components as the dealt blueprint requires (move page to `landing/index.tsx`); add art files to `src/assets/art/` and ids to `ArtId`/`ARTWORKS`.

- [ ] **Step 1:** Follow `$TASTE/SKILL.md` "The run" steps 1–5 in full, writing notes to `.taste-skill/landing/notes.md`: inventory, argument, `node $TASTE/scripts/draw.mjs --sector <closest> --brief "AI Dungeon Master for grim dark fantasy campaigns, played in the browser" --sections <from argument> --keep palette,type --options 3 --out .taste-skill/landing`, choose and deal, the idea sentence, the one live thing, the copy deck. Primary action stays Discord login (`handleLogin` unchanged), gold with the Discord mark.
- [ ] **Step 2:** Imagery: `node $TASTE/scripts/assets.mjs` searches in the same family (start with "John Martin", "apocalypse painting", "sublime painting night"); open each candidate; `--get` at least two more so the page carries ≥ 4 real pictures; add them to the registry; footer `<Credits>` lists every picture on the page.
- [ ] **Step 3:** Build sections per the sheet; motion layer per SKILL.md step 9 with `motion/react` and reduced-motion fallbacks.
- [ ] **Step 4:** Extend `registry.test.ts`: every `ArtId` has a credit with `sourceUrl`. `npx vitest run` → PASS.
- [ ] **Step 5: Gate:** `lint.mjs src/app/pages/landing`; `inspect.mjs "http://localhost:5173/" --out .taste-skill/after/landing --allow font-not-dealt` (no `--app`) → 0 FAIL; critique with `$TASTE/references/critique.md`, fix top three, at most three rounds.
- [ ] **Step 6: Commit** — `feat: B3 landing page`.

### Task 12: Sweep and docs

**Files:** Modify `CLAUDE.md`; any file the sweep finds.

- [ ] **Step 1:** `grep -rnE "purple|violet|pink-|emerald|blue-|teal|gradient|backdrop-blur|tracking-\[" src/app --include=*.tsx | grep -v components/ui` → no output (fix any hit).
- [ ] **Step 2:** Update CLAUDE.md: route table (`/` Landing, `/auth/callback`, `/dashboard`, `/character/new`, `/adventure/:id`, `/campaigns`, `/history`, `/settings`), project structure (art registry, `src/dev/`), a "Look" section pointing at the tokens and the spec, and how to run the preview + inspector.
- [ ] **Step 3:** `npx vitest run` (no new failures vs baseline), `npm run build` succeeds, re-run every screen gate's inspect into `.taste-skill/after/`, then write `.taste-skill/after/summary.txt` with before/after RESULT lines side by side.
- [ ] **Step 4: Commit** — `docs: update CLAUDE.md for the B3 redesign`.
