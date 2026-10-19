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

## 2026-10-19 timestamp-driven live ETA and progress (v0.3.1 candidate)
- [x] S22-054 — Compare each new game's `timestamp` with the saved snapshot; reject older/datumless exports when a newer dated export is stored, without mutating saved user state. Preserve per-upgrade first-observed anchor across updated ETAs from boosters/helpers.
- [x] S22-055 — Display **Game snapshot generated**, countdown, **Estimated finish** (snapshot timestamp + upgrade remaining seconds in the phone's local date/time), and **% tracked** for each active upgrade. Advance percentage/countdowns using `Date.now()` without a new JSON import; app refresh interval now 10 seconds. Progress is a tracked observation window, not original full construction duration.
- [x] S22-056 — Add new unit tests for stale and repeat JSON, ETA acceleration/extension, and original timestamp + 17h05m calculation; add Chrome smoke coverage of estimated finish and tracked percent. Add a device guided test.
- [ ] S22-057 — Verify latest GitHub Actions and Pages for this candidate, then user confirms on actual Android phone. Do not infer Android success from Chrome CI. No modifications to canonical `data/player-state.json`, GitHub credentials, Gold Pass, Magic Items, balance or roadmap contents.

**Recovery / next action:** Keep prior checked-in version and known-good user data, confirm the latest four GitHub Actions suites, then have user use the newly deployed planner to import a fresh JSON and confirm the ETA and tracked %; if anything looks wrong, export diagnostics and compare dated game snapshot. Recommended GPT-6 Medium for targeted Android/UI debugging, High if timestamp or multiple-device state is inconsistent.

## 2026-10-19 auto-detected helper assignments from new JSON (v14 candidate)
- [x] S22-058 — Parse helper_timer/helper_recurrent from the ACTUAL target upgrade record; associate Builder's Apprentice only with uniquely identified Home buildings/heroes and Lab Assistant only with Home research. Combine with helper_cooldown from helper record, anchored to JSON timestamp. Never invent a status when a field is missing or more than one assignment matches.
- [x] S22-059 — Surface assigned target, helper level, recurring option, live session/cooldown estimates in existing Helper Hut UI in Overview and JSON insights, and mark supported upgrade queue tiles. A stale snapshot never proves ongoing work/availability; expired timers prompt refresh.
- [x] S22-060 — Expand unit and real-browser tests using actual October 19 Archer Queen record: target Lv47, helper_timer 3587, helper_recurrent true; Builder's Apprentice L7 helper_cooldown 82787; missing/ambiguous assignments; rendering and rollover.
- [ ] S22-061 — Confirm all four CI workflows for latest code/docs commit, then obtain real Android user confirmation after opening v14. No user data, saved GitHub player state, resources, rewards, magic items, roadmap or access credentials were modified as part of the code deployment.

**Checkpoint:** Application code + cache v14 published at source commit 90562246336553f02be2af3eec4bf302c16dc8b0; its unit verification, Chrome smoke, reward browser acceptance and Pages deployment all succeeded. Later commits only document the result and may trigger fresh CI. User must personally test on Android. Next recommended GPT-6 Medium to check UI and real import; High for contradictory new helper game encoding or multi-account conflicts. Do not rework unrelated features.

## 2026-10-19 — immediate builder-available upgrade recommendations (v15 candidate)
- [x] S22-062 — Derive a conservative minimum number of free Home builders from observed Builder Hut count (data 1000015) minus currently timed Home building, hero and trap upgrades. Do NOT treat expired projected timers as confirmed completions, guess a B.O.B. sixth builder, or infer capacity when huts are absent.
- [x] S22-063 — Filter the existing planned Home/Builder roadmap against REAL upgradeable current building/hero records at the correct level (including duplicates of same building). Resolve duplicated catalog names such as Army Camp in Home versus Builder Base, prioritize manually *saved* affordability and roadmap order, and clearly label costs as estimates. No game action or automatic deductions.
- [x] S22-064 — Open a mobile-friendly modal immediately upon importing a NEWER village JSON that confirms a free builder and actionable recommendation. Show top three, button to inspect exact existing roadmap task, Not now, and overview banner. Per-account last-shown and dismissed timestamps persist in local state/backups; duplicate same-timestamp imports do not repeat popup.
- [x] S22-065 — Add unit tests for five huts/four jobs, all occupied, missing capacity, duplicate names, trap occupancy, no outdated completed Queen recommendations and affordability order, plus Chrome browser acceptance of modal on new JSON, dismissal and non-repeating imports. Static site cache v15.
- [ ] S22-066 — Confirm ALL latest GitHub Actions workflows, Pages deployment and physical Android acceptance. Verify popup on first fresh JSON import, correct eligible suggestions and unchanged in-game/manual resources.

**Latest user-data example:** Oct 19 11:46 AM Clash snapshot: five Home Builder Huts, four ongoing Home constructions (Clan Castle, Army Camp, Inferno Tower and Pet House), no active Hero/trap build; Archer Queen Level 48. Recommended next eligible plan is Spell Factory 6→7, then additional Army Camp/Inferno Tower upgrades according to roadmap/cost. Snapshot shows free status *at snapshot time only*, not continuously. Always recheck in game.

**Checkpoint & recovery:** Preserve the known-good app source and profile data untouched (data/player-state.json never modified by this feature). At code commit a09e79aafd7ec4a0ebc1622d9c66f254bf8c7035 tests including simulated JSON dialog passed; subsequent v15 code + docs must pass CI again. If GitHub-hosted Chrome debugger occasionally fails to start, check job logs and retry specific affected run only; that is not evidence of a program defect. Recommend GPT-6 Medium for Android validation and minor UX adjustments, High for nontrivial multi-device merges or ambiguous game data.

## October 19 — independent idle Laboratory / Star Laboratory recommendations (v16 candidate)
- [x] S22-067 — Parse distinct dated queues for Home Laboratory units/spells/siege machines, Builder Base Star Laboratory units2, and Pet House pets. Require valid specific lab building and full arrays; remain unknown if Lab is upgrading or data missing; never infer idle from elapsed projected timer or a Lab Assistant cooldown.
- [x] S22-068 — Match planned Lab roadmap tasks to exact recorded levels and IDs, including Freeze Spell 4→5 at current Level 4; resolve the generic Builder Base level-18 troop target into a concrete currently-Level-15 Hog Glider 15→16 suggestion (cost unknown), not automatic research. Pet House upgrading → no unsupported unlock recommendation.
- [x] S22-069 — Upgrade import-time pop-up to show independent categories for free construction builder and idle Home/Star Labs, or only research when all construction builders are busy. Maintain same-snapshot dismissal/prompt history per profile; add overview research nudges. Never deduct resources or start game action.
- [x] S22-070 — Unit tests for idle/busy/unknown queues and exact recommended levels; Chrome browser acceptance checks combined 3-queue and laboratory-only modals. Cache v16.
- [ ] S22-071 — Verify latest GitHub Actions static, smoke, reward and Pages deployment; perform Android physical test using newest actual game JSON, including dismiss and same-snapshot deduplication.

**Checkpoint:** Latest saved GitHub village snapshot dated 2026-10-19 11:46 AM Pacific had Home Laboratory level 12, no ongoing Home research, Freeze Spell level 4; Star Laboratory level 9, no ongoing Builder Base troop research, Hog Glider level 15; Pet House structure itself upgrading. Code + tests and cache bump at commit b1843dd2c5b19960b29830c3f2b954b8637004bc passed static verification, Chrome startup/popup test and reward acceptance; Pages deployment check separately. NO mutations to data/player-state.json or any manually reported balances, inventory, Gold Pass, roadmap statuses. Recommended GPT-6 Medium for Android acceptance.


## 2026-10-19 — audit every factory, Star Lab bug fix, and pet research (v17 candidate)
- [x] S22-072 — Check newest user GitHub state generated 2026-10-19T19:32:24Z. Five Home construction timers (Clan Castle, Army Camp, Spell Factory, Inferno Tower, Pet House), two Builder Base construction timers (Builder Cannon, Star Laboratory). Home Lab Freeze Spell 4→5 busy; Star research idle; pet research idle.
- [x] S22-073 — Fix wrong building ID 1000034 (Builder Hall) confused for Star Laboratory 1000046; level-cap-aware Builder Base research only. Hog Glider15→16 requires true Star Lab9; current Star Lab7→8 upgrading so recommend level-compatible Raged Barbarian13→14, not locked Hog Glider. No invented costs.
- [x] S22-074 — Pet House structure construction does not disable independent pet upgrades; prefer currently owned, available pet (Electro Owl2→3 or L.A.S.S.I3→4) and do not propose nonexistent/unlocked Unicorn. Optional pet inventory button.
- [x] S22-075 — Add Overview audit of army/factory building statuses and bounded TH14/BH9 progression opportunities. Spell Factories/Workshop/Barracks do not each grant independent research workers; production jobs not needed. Extend unit and browser tests to cover corrected snapshot and multi-queue popup. Website cache v17.
- [ ] S22-076 — All latest four GitHub Actions suites and Pages publication (verify after docs), then physical Android screenshots and next game JSON import. User owns changes to player-state.json; do not overwrite manually saved resources or old task statuses.
**Checkpoint:** Application/test code completed in main at browser test commit cb57bb029dc7d1967dc928d4d2dca02644961dd8 and cache v17 commit 915007096343eee01d629be3aa78ae494a584f72. Source verified by unit suite at code state but Chrome debugger may intermittently fail on GitHub Actions; check runner logs before modifying code. If browser assertion fails, debug actual state using logs. Next recommended GPT-6 Medium for browser/Android verification, High for new game mechanics or unknown export categories.

## October 19 — Helper Hut action recommendations (v18)
- [x] S22-077: Confirm saved JSON has Builder's Apprentice L7/cooldown 46115 at export, Lab Assistant L8, Alchemist L3 and Gold Pass Prospector L1; usage of other helpers is unknown.
- [x] S22-078: Implement pure helper-advice.mjs using current active Home buildings and Laboratory work to recommend Builder/Lab targets, plus conditional resource and ore conversions for Alchemist/Prospector. All share one 23h workday reset but each gets a separate use. No inferred ready states.
- [x] S22-079: Show assistant-specific next tasks in Helper Hut overview and fresh JSON popup alongside any builder/research queue recommendations, once per imported snapshot.
- [x] S22-080: Add unit tests and browser assertions; cache v18 and syntax validation; all four GitHub checks passed at app code commit b5a9232e708c609bfa67e4bda5bd932f201d59a9.
- [ ] S22-081: Confirm Android visual display with newly imported game JSON; preserve unsynced phone data and prior resource/Magic Item tracking.

## October 19 — V19 complete village upgrade pipeline
- [x] S22-082: Inspect latest saved Oct 19 12:52 PM Pacific JSON; audit 5 Home construction jobs, 2 Builder Base jobs, active Freeze Spell, 5 idle Home Heroes, idle pet research and Hero Equipment opportunities.
- [x] S22-083: Add full-plan.mjs, full-plan-view.mjs — Home builders and Hero Hall, Builder builders/B.O.B., shared Home Lab spell/troop/siege research, Star Lab, Hero Pets, Blacksmith ore equipment, Helper Hut, and expandable exhaustive 4-category buildings/traps table.
- [x] S22-084: Rank current next and follow-ons; Warden28->29/Queen48->49 and Army Camps after builder frees; Freeze Spell5->6 after current research (verify unlock), Electro Owl2->3 now, Unicorn after Pet House4 unlock, Eternal Tome8->9 if ore allows; Star Lab level7 research may be started during structure construction per official 2022 notes but Hog15->16 requires Lv9. Every candidate requires in-game eligibility/cost check.
- [x] S22-085: Show plan on Overview after every fresh import and use its offensive priorities for free-builder popup; do not let stale manually marked roadmap tasks determine all choices. Add unit and browser regression tests, cache v19.
- [ ] S22-086: Confirm all four latest GitHub Actions and Pages, Android physical validation, and follow-up after user's next real game JSON. Do not touch manually saved currency, event rewards, magic items or game JSON when developing logic.

## October 19 — compact Village Command Center v21
- [x] S22-087: Check newest saved JSON 2026-10-19 20:31:55 UTC: Electro Owl 2→3 now upgrading, Freeze Spell 4→5 running and Lab Assistant + Builder Apprentice each have recorded cooldown; five Home and two Builder construction jobs ongoing. Never mark Owl idle in recommendations.
- [x] S22-088: Replace cluttered Overview with compact resources + seven queue cards and drill-in to factories, Heroes, spells, pets and buildings. Keep previous detailed panels collapsed and accessible.
- [x] S22-089: Add per-profile optional confirmed Builder/Research Gold Pass boost settings and manually reported 50% returning boost, without stacking discounts. boostEnd still unknown. User may save exact game quoted prices/durations; never double discount displayed prices.
- [x] S22-090: Add offline MIT reference per-level costs/durations/prerequisites for 21 key owned upgrade types sourced October 17, then rank strategic value, unlocks, saved affordability and duration. Uncovered types remain unknown. No user-state changes.
- [x] S22-091: Unit/browser regression for quote entry, modal navigation, Gold Pass and returning boost math, helper popups and data preservation. Four CI workflows passed at code commit 4253e3f1a94e3029d1bcffcc5ee8d46507e403fc.
- [ ] S22-092: Verify latest docs commit workflows/Pages and user Android visual acceptance of v21. Expand reference catalog coverage after the compact baseline is accepted.
