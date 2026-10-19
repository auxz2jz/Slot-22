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

## October event and inventory editing (2026-10-18)
- [x] S22-028: Separate what is CLAIMED from what is ACTUALLY OWNED; actual Books/Runes/Potions remain editable above normal limits.
- [x] S22-029: Add editable reward entries (Silver, Gold, Other Event), each fixed or choose-one, and correct original 49 item definitions.
- [x] S22-030: Show unclaimed, claimed, all, and either/or filters. Confirm claims manually; never change resource/magic inventory automatically.
- [x] S22-031: Support extra inventory item names and quantities for items outside the starting list.
- [x] S22-032: Unit tests and real browser acceptance for creating and editing rewards, choosing one, and saving inventory > usual capacity.
- [ ] S22-033: Ask user to inspect event's Unclaimed rewards only filter, compare with tracker, enter actual Magic Item holdings and validate on their Android phone.

## 2026-10-18 JSON insights and Helper Hut integration
- [x] S22-034 — Audit imported JSON top-level fields and reveal previously unrepresented helpers, boost metadata, house parts, skins, decorations and obstacles.
- [x] S22-035 — Display recorded Builder Apprentice (7), Lab Assistant (8), and ambiguous third-helper ID (level 3, likely Alchemist) from player export, without claiming helper availability when cooldown absent.
- [x] S22-036 — Add B.O.B. milestones computed from actual gear-up flags, Builder Base defense/troop levels and combined hero levels.
- [x] S22-037 — Provide per-section counts plus read-only full export in a new JSON insights & helpers tab, and helper overview cards.
- [x] S22-038 — Automated helper/BOB tests and Chrome regression; user Android verification pending.
- [ ] S22-039 — Consider secure official API synchronization of public player stats with a backend/GitHub Actions secret; do not require in-game verification token or expose developer API key. Manual village JSON remains needed for precise structures and timers.

## 2026-10-18 Comprehensive imported-JSON intelligence
- [x] S22-040 Parse ALL available game JSON sections without dropping raw records; display category counts and unknown IDs rather than guessing item names.
- [x] S22-041 Derive actionable Home/Builder wall distributions, Hero and equipment levels, spell and Builder Base troop research, timers, cosmetic/obstacle counts, and clock tower cooldown.
- [x] S22-042 Compare consecutive exports of the same account by game ID, item count, and total levels; show uncertain aggregate changes honestly and preserve at most five concise summaries per profile.
- [x] S22-043 Preserve imported original raw JSON, manually entered currency/Magic Items, event reward choices, and account separation. Auto-import does not spend, start, or mark upgrades completed.
- [ ] S22-044 User Android acceptance with a fresh game JSON and verification of timer/cooldown accuracy and unknown game IDs.

## 2026-10-18 helper roadmap and safe data synchronization
- [x] S22-045: Add repeatable Helper Hut priorities to main account roadmap based on snapshot: Builder's Apprentice L7, Lab Assistant L8, third helper ID 93000002 L3 likely Alchemist, and unverified Gold Pass Prospector. No assumed availability or Gems spending.
- [x] S22-046: Add an additive idempotent helper-plan module for existing browser-local state, all account changes and new village JSON imports. Do not replace saved Magic Items, reward choices, currencies, or non-helper roadmap statuses.
- [x] S22-047: Display Helper Hut above upgrade roadmap, link to latest JSON insights, and label GitHub fine-grained PAT vs in-game account verification token vs official developer API credential.
- [x] S22-048: Record secure manual-import/GitHub-upload routine in docs/GAME_DATA_AND_SYNC.md, including last-snapshot caveats, extra JSON sections, and public repo privacy.
- [ ] S22-049: User Android acceptance: inspect updated Helper Hut routines without GitHub Load, verify one fresh game export import, record manual inventory/claims, and test GitHub Save with a user-generated restricted fine-grained token after local backup.
- [ ] S22-050: Optional public-player API refresh via protected backend and server-side developer key; must never assume balances, helper availability, village timers, or season claims from the public API.

## 2026-10-19 targeted bug fix — progress bars survive JSON re-import
- [x] S22-051 (candidate) — Preserve per-profile first-observed upgrade timestamp when importing newer game JSON. Match same category, entity ID, and level, prefer closest finish; use updated remaining time without resetting elapsed-fill start. Duplicate upgrades match once each; replacement upgrades start a fresh anchor. No manual balances or event data changed.
- [x] S22-052 (candidate) — Add unit regression tests for repeat imports, duplicate buildings, completed/replaced upgrades, and elapsed-fill calculations. Make existing browser reward tests accept additional user-edited reward entries rather than assuming exactly 49 total.
- [ ] S22-053 — Confirm new GitHub Actions checks and Pages publication; physically test on Android using docs/GUIDED_TESTING.md, retaining older known-good source. Do not treat CI success as Android verification.

**Limitation:** Progress bars show elapsed time since first observation in planner, not the fraction of the entire Clash upgrade; source export omits real start and original duration. The per-profile `upgradeTracking` metadata is part of local backups and explicit GitHub Save/Load. Manual currency, Magic Items, Gold Pass claims, and roadmap remain independent. Recommended next model GPT-6 Medium for routine Android/UI checks, High for inconsistent multi-device state.
