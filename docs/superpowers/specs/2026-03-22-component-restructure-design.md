# Component Restructure Design

**Date:** 2026-03-22
**Status:** Approved

## Overview

Reorganise `src/app/` from a flat component structure into a layer-grouped structure: shadcn UI primitives, shared custom components, and page-specific components co-located with their owning page.

## Goals

- Clear ownership: page-specific components live next to the page that uses them
- Shared components are explicitly promoted to `components/shared/`
- Scales naturally — new pages get their own subfolder when they need co-located components

## Proposed Structure

```
src/app/
  components/
    ui/             # Unchanged — shadcn/Radix UI primitives only
    shared/         # Custom components reusable across pages
      layout.tsx
      image-with-fallback.tsx
  pages/
    home.tsx                    # Flat — no co-located components
    campaign-list.tsx           # Flat
    character-creation.tsx      # Flat
    history.tsx                 # Flat
    settings.tsx                # Flat
    not-found.tsx               # Flat
    campaign/                   # Subfolder — owns multiple components
      index.tsx
      chat-interface.tsx
      character-sheet.tsx
      notes-section.tsx
      dice-roller.tsx
```

## File Moves

| From | To |
|------|----|
| `components/layout.tsx` | `components/shared/layout.tsx` |
| `components/figma/ImageWithFallback.tsx` | `components/shared/image-with-fallback.tsx` |
| `components/chat-interface.tsx` | `pages/campaign/chat-interface.tsx` |
| `components/character-sheet.tsx` | `pages/campaign/character-sheet.tsx` |
| `components/notes-section.tsx` | `pages/campaign/notes-section.tsx` |
| `components/dice-roller.tsx` | `pages/campaign/dice-roller.tsx` |
| `pages/campaign.tsx` | `pages/campaign/index.tsx` |

## Import Updates

- `routes.tsx`: update Layout import path, update Campaign import path
- `pages/campaign/index.tsx`: update imports for chat-interface, character-sheet, notes-section
- `pages/campaign/chat-interface.tsx`: update import for dice-roller
- Any other files importing moved components

## Conventions (post-restructure)

- New page-specific components go in `pages/<page>/`
- Components used by 2+ pages go in `components/shared/`
- `components/ui/` is for shadcn primitives only — no custom logic
