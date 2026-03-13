# Sprout

## What This Is

Sprout is a gamified habit-tracking and digital garden application inspired by Tamagotchi. Users hatch and nurture a digital "Sprout" by completing real-world habits, quests, and daily care actions.

## Core Value

Making self-care and habit formation intrinsically rewarding through emotional connection and visual growth of a digital companion.

## Requirements

### Validated

- ✓ LocalStorage-based game engine (`useSproutEngine.js`)
- ✓ Core Tamagotchi care actions (Water, Feed, Sun, Pet)
- ✓ Habit and Quest completion logic
- ✓ Spark and Sprout points economy
- ✓ Onboarding flow with seed animation and vibe selection
- ✓ Home dashboard with animated Sprout character
- ✓ Dynamic backgrounds based on time/theme

### Active

- [ ] Connect AI Photo Verification UI to a functional flow
- [ ] Implement Digital Garden detailed view (past sprouts, achievements, garden items)
- [ ] Build out Sprout Shop (spending points on cosmetics/items)
- [ ] Implement Bounty Board (dynamic quests and challenges)
- [ ] Vaults implementation (long-term savings/staking of points)

### Out of Scope

- Multi-player real-time interaction — keeping the focus on personal growth first.

## Context

The app is built with React, Vite, and Framer Motion. It relies heavily on smooth animations and a premium, playful aesthetic. Currently, data persistence is handled via `localStorage`, but it's designed with an engine that could be hooked up to a real backend. GSD is used to manage the project roadmap and milestones.

## Constraints

- **Tech Stack**: React, Vite, Framer Motion, standard CSS (no Tailwind).
- **Aesthetic**: Must remain highly polished, adhering to the existing "premium 3D/glassmorphism / dynamic colors" feel.
- **Storage**: Currently local-only, but state needs to be strictly managed.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Local storage first | Faster iteration and offline capability | — Pending |
| GSD initialization | To maintain momentum and fully complete all missing tabs | — Pending |

---
*Last updated: 2026-03-13 after initialization*
