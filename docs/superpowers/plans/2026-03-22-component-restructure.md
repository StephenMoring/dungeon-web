# Component Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganise `src/app/` into a layer-grouped structure: shadcn UI primitives, shared custom components, and page-specific components co-located with their owning page.

**Architecture:** Move shared components to `components/shared/`, move campaign-specific components into `pages/campaign/` alongside the campaign page, and update all affected imports. No behaviour changes — purely structural.

**Tech Stack:** Vite, React, TypeScript

**Spec:** `docs/superpowers/specs/2026-03-22-component-restructure-design.md`

---

## File Map

| Action | Path |
|--------|------|
| Create dir | `src/app/components/shared/` |
| Move | `src/app/components/layout.tsx` → `src/app/components/shared/layout.tsx` |
| Move | `src/app/components/figma/ImageWithFallback.tsx` → `src/app/components/shared/image-with-fallback.tsx` |
| Delete dir | `src/app/components/figma/` |
| Create dir | `src/app/pages/campaign/` |
| Move | `src/app/pages/campaign.tsx` → `src/app/pages/campaign/index.tsx` |
| Move | `src/app/components/chat-interface.tsx` → `src/app/pages/campaign/chat-interface.tsx` |
| Move | `src/app/components/character-sheet.tsx` → `src/app/pages/campaign/character-sheet.tsx` |
| Move | `src/app/components/notes-section.tsx` → `src/app/pages/campaign/notes-section.tsx` |
| Move | `src/app/components/dice-roller.tsx` → `src/app/pages/campaign/dice-roller.tsx` |
| Modify | `src/app/routes.tsx` — update Layout import |
| Modify | `src/app/pages/campaign/index.tsx` — update sibling + ui imports |

---

## Task 1: Move shared components

**Files:**
- Create: `src/app/components/shared/layout.tsx`
- Create: `src/app/components/shared/image-with-fallback.tsx`
- Delete: `src/app/components/layout.tsx`
- Delete: `src/app/components/figma/ImageWithFallback.tsx`

- [ ] **Step 1: Move layout.tsx**

```bash
mkdir -p src/app/components/shared
git mv src/app/components/layout.tsx src/app/components/shared/layout.tsx
```

- [ ] **Step 2: Move ImageWithFallback.tsx**

```bash
git mv src/app/components/figma/ImageWithFallback.tsx src/app/components/shared/image-with-fallback.tsx
rmdir src/app/components/figma
```

- [ ] **Step 3: Update Layout import in routes.tsx**

In `src/app/routes.tsx`, change:
```ts
// Before
import { Layout } from "./components/layout";

// After
import { Layout } from "./components/shared/layout";
```

- [ ] **Step 4: Verify dev server starts without errors**

```bash
npm run dev
```
Expected: dev server starts, no TypeScript/import errors in terminal.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: move shared components to components/shared/"
```

---

## Task 2: Move campaign page and its components

**Files:**
- Create: `src/app/pages/campaign/index.tsx`
- Create: `src/app/pages/campaign/chat-interface.tsx`
- Create: `src/app/pages/campaign/character-sheet.tsx`
- Create: `src/app/pages/campaign/notes-section.tsx`
- Create: `src/app/pages/campaign/dice-roller.tsx`
- Delete: `src/app/pages/campaign.tsx`
- Delete: `src/app/components/chat-interface.tsx`
- Delete: `src/app/components/character-sheet.tsx`
- Delete: `src/app/components/notes-section.tsx`
- Delete: `src/app/components/dice-roller.tsx`

- [ ] **Step 1: Create the campaign/ directory and move the page**

```bash
mkdir -p src/app/pages/campaign
git mv src/app/pages/campaign.tsx src/app/pages/campaign/index.tsx
```

- [ ] **Step 2: Move campaign-specific components**

```bash
git mv src/app/components/chat-interface.tsx src/app/pages/campaign/chat-interface.tsx
git mv src/app/components/character-sheet.tsx src/app/pages/campaign/character-sheet.tsx
git mv src/app/components/notes-section.tsx src/app/pages/campaign/notes-section.tsx
git mv src/app/components/dice-roller.tsx src/app/pages/campaign/dice-roller.tsx
```

- [ ] **Step 3: Update imports in campaign/index.tsx**

In `src/app/pages/campaign/index.tsx`, update the three component imports (now siblings) and the ui/button path (depth increases):

```ts
// Before
import { CharacterSheet, CharacterData } from "../components/character-sheet";
import { ChatInterface } from "../components/chat-interface";
import { NotesSection } from "../components/notes-section";
import { Button } from "../components/ui/button";

// After
import { CharacterSheet, CharacterData } from "./character-sheet";
import { ChatInterface } from "./chat-interface";
import { NotesSection } from "./notes-section";
import { Button } from "../../components/ui/button";
```

- [ ] **Step 4: Update ui imports in chat-interface.tsx**

In `src/app/pages/campaign/chat-interface.tsx`, the `./ui/` imports break when the file moves out of `components/`. Update them:

```ts
// Before
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

// After
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { ScrollArea } from "../../components/ui/scroll-area";
```

Also confirm the DiceRoller import reads `"./dice-roller"` (already a sibling — no change needed).

- [ ] **Step 5: Verify dev server starts and campaign route works**

```bash
npm run dev
```
Navigate to `http://localhost:5173/campaign/1` — the 3-panel layout (character sheet, chat, notes) should render without errors. Check the browser console for any import failures.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: move campaign components into pages/campaign/"
```

---

## Task 3: Verify build and update CLAUDE.md

- [ ] **Step 1: Run production build**

```bash
npm run build
```
Expected: build completes with no errors. Warnings about bundle size are acceptable.

- [ ] **Step 2: Update CLAUDE.md project structure section**

In `CLAUDE.md`, update the file structure block to reflect the new layout:

```
src/
  main.tsx
  app/
    App.tsx
    routes.tsx
    pages/
      home.tsx
      campaign-list.tsx
      character-creation.tsx
      history.tsx
      settings.tsx
      not-found.tsx
      campaign/                  # Campaign session page + co-located components
        index.tsx
        chat-interface.tsx
        character-sheet.tsx
        notes-section.tsx
        dice-roller.tsx
    components/
      ui/                        # shadcn/ui primitives only
      shared/                    # Custom components reusable across pages
        layout.tsx
        image-with-fallback.tsx
  styles/
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md structure after component restructure"
```
