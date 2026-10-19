# Clash Village Planner roadmap

Purpose: maintain upgrade roadmap, two-village inventory, currency, ores, Magic Items, and opt-in GitHub backup on a low-cost mobile-friendly website.

## Milestones
- [x] S22-001: Identify next unused GitHub repository and adopt instruction library (Slot-22).
- [x] S22-002: Responsive dashboard with editable Home Village, Builder Base, Loot Cart, Gems and ores.
- [x] S22-003: Clash of Clans JSON import, validated level/timer view, keep manual currencies intact.
- [x] S22-004: Editable roadmap statuses, priority queue, custom tasks, notes.
- [x] S22-005: Explicit local backup and GitHub Contents API save/load with SHA conflict detection; no token in code.
- [x] S22-006: Automated syntax and unit checks, guided test checklist, bounded local diagnostics.
- [ ] S22-007: Enable GitHub Pages and perform physical user acceptance on Samsung phone. No user-verified baseline yet.
- [ ] S22-008: Improve ID mapping and verified new-cost catalog with user-confirmed prices.
- [ ] S22-009: Optional notification/reminder mechanisms only with explicit opt-in.
- [ ] S22-010: Consider privacy-safe private storage if requested; the existing GitHub repo is public.

## Current suggested boost roadmap
Days 0–3: five Home builders active: Pet House 3→4, Clan Castle 9→10, first Army Camp 10→11, Inferno 7→8, Queen 47→48. Freeze Spell 3→4 and Electro Owl 1→2 independent. Builder Base Cannon 7→8 and Star Laboratory 7→8 active.
Days 3–7: when builders free, Spell Factory 6→7, remaining three Army Camps, second Inferno; in lab advance Freeze; after Pet House completes advance Unicorn. Builder Base Cannon 8→9 and Star Laboratory 8→9 for B.O.B.
Days 7–14: keep builders, lab and pet queue active as possible, make use of returning boost with confirmed in-game costs, decide Builder troop level 18 and combined hero level 45. Save Runes until Loot Cart largely spent and storage has room.
After boost ends: stop assuming 50% costs. Recalculate against in-game values; avoid wasting Gems and Magic Items.

All roadmap prices are estimates until game confirms them. User may edit every task.

## Version 0.2.0 — multi-profile maintenance (2026-10-18)

- [x] S22-011 — Versioned bundle with multiple player tags and safe migration from the prior single-profile localStorage/backup.
- [x] S22-012 — Profile selector, rename, and add-account via imported game JSON; imported account receives independent currencies, Magic Items and roadmap.
- [x] S22-013 — Grouped comma formatting for editable resource and Magic Item inputs, preserving editing caret.
- [x] S22-014 — Separate upgrade timer category labels from level/name for readability.
- [x] S22-015 — Migrate remote snapshot to profile bundle v2 without removing user export, balance notes or upgrade plan; regression tests and real-browser smoke.
- [ ] S22-016 — User test on actual Android phone with a second account; verify GitHub Load/Save across devices with explicit opt-in and do not leak tokens. Only implement fixes supported by actual evidence.

Next task: user tests new account import. Recommended GPT-6 Medium for targeted browser UX improvements; escalate to High if real GitHub conflict or data migration evidence is contradictory. Checkpoint before edits.

## v0.3.0 – Interactive Command Center (candidate)

- [x] S22-017 – Game-themed command header showing TH/BH and roadmap progress.
- [x] S22-018 – Editable per-account resource storage capacities with honest fill bars.
- [x] S22-019 – Home and Builder Base queue countdowns, independent lab and pet timers, snapshot-based progress.
- [x] S22-020 – Tappable upgrade quest trail and inventory card gallery/table toggle.
- [x] S22-021 – Cost preview and confirmed tracker-only record-upgrade action; no automatic Gems spending.
- [x] S22-022 – Automated browser and unit testing for new UI and multi-profile isolation.
- [ ] S22-023 – User Android visual acceptance, fixes based on actual reports.

## October 2026 Gold Pass tracker

- [x] S22-024: Transcribe 30 Silver plus 19 Gold remaining reward positions, including 22 exclusive choices. No screenshot overlap double-counting.
- [x] S22-025: New Season Pass prizes tab, claimed/remaining counts, optional selection, user-driven claim toggle, and claim guidance. No automatic inventory changes.
- [x] S22-026: Tests for complete reward catalog, choice validation, profile separation and zero currency changes.
- [ ] S22-027: User test on Android, reconcile actual reward collection by October 30 (October 31 season rollover).
All positions and recommendations are defined in pass-rewards.mjs and claim records are per-profile seasonalPlan.claims.
