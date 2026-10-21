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


## October 19 — v22 consolidated Command Center and test repairs
- [x] S22-093: Investigate failing account-addition browser test. Root cause: the test assumed one initial profile; saved JSON already included two profiles. Read-only investigation.
- [x] S22-094: Fix tests/browser-smoke.mjs to check +1 profiles per import rather than absolute counts. All four workflows green at test fix commit 2a429b4c6858b2f40898ef6da1fef3f13295ca44.
- [x] S22-095: Read-only audit of compact v21 Overview and duplicated advanced panels. Determined command-center.mjs already houses resource strip, seven independent lanes, per-structure details, quotes and ranked next actions. Redundant full-plan-view.mjs six-queue panel re-presented the same candidates.
- [x] S22-096: Remove redundant full-plan-view.mjs panel from Overview without deleting full-plan.mjs calculations or any feature/state. Keep advanced resources, helper details, factory audit, roadmap and timeline accessible under Advanced. Link legacy builder nudge directly to command-center Home Builder lane; remove dead jump-full-plan action. Upgrade browser smoke to check consolidated seven-lane experience with next Hero/Freeze Spell/pet and absence of duplicate. Publish site/cache v22; no data/player-state.json changes.
- [x] CI verification for v22 code at d2fe0363b7e6245a9ac991eea8680dfdd223af92: Verify static web app success, Browser startup smoke success (all consolidated lane checks true, no browser JS errors), Pages deployment success, Reward editor browser acceptance success after retry attempt 2. First reward run failed before app tests due to intermittent Chrome debugger startup, not application assertion.
- [ ] S22-097: User Android visual/tap-through acceptance: https://auxz2jz.github.io/Slot-22/?v=22 — do not load old GitHub state solely to get new code; preserve any newer unsynced phone-local data. Verify each queue and building/factory drill-in, including 50% discount from actual in-game evidence and unknown price warning. Only fix specific proven errors in small tasks.
- [ ] Optional future catalog expansion: upgrade-reference.mjs still covers only 21 key owned structure/equipment categories. The tracker must label non-catalog prices/times and boost expiration unknown rather than fabricate them. Expand after a verified game-data source and known active discounts; this is additional data coverage, not a blocker to v22 UI release.

**Verified developer release:** v22 code passes CI and is published; actual Android acceptance is still pending. Village snapshot, manual currencies, reward choices, ores, profiles, upgrade quotes, discounts and Magic Items are unchanged by this project work.


## October 19 — v23 visual workforce dashboard
- [x] S22-098: Replace the duplicate text-heavy seven-card Overview listing with a picture-led Command Center while retaining the existing ranked recommendation engine and all seven independently meaningful lanes.
- [x] Top-level now shows nine saved currencies/ores with actual resource images; five Home builder job cards (verified Builder Hut count), two Builder Base construction display slots, four separate Helper Hut assistants, Laboratory/Star Laboratory/Pet House/Blacksmith independent-upgrade cards, and a six-category next-up shortlist.
- [x] Each builder/assistant card opens an individual detail dialog: current job/recorded assignment if known, first observed timestamp (never falsely labeled actual game start), estimated finish/cooldown, progress since first observed, and ranked next job or suggested assistant use. Game-export builder identities and assistant usage are not invented. When the ETA passes, show refresh-JSON warning instead of claiming a builder became available.
- [x] Retain the complete structure finder, in-game cost quote input, manual boost controls, snapshots, full roadmap, older timelines and advanced diagnostic panels in collapsible/secondary sections; no game or spending automation.
- [x] Add tests/visual-command.test.mjs and targeted Chrome browser checks for five pictured workers, two Builder Base slots, four assistants, four non-builder stations, six next-up items, nine resource icons, worker/assistant dialog navigation and honest time labeling; responsive CSS, cache/site v23.
- [ ] S22-099: Physical Android (Samsung) visual acceptance for https://auxz2jz.github.io/Slot-22/?v=23. Confirm pictures load and cards are tappable; import a fresh game JSON when convenient so completed jobs do not persist as unconfirmed historical timers. Do not use GitHub Load only to refresh code; phone-local state can be newer.
**Data safety:** no changes to data/player-state.json or saved reward, resource, helper, boost, inventory, equipment and roadmap records. User's existing two profiles and phone-local edits must remain unchanged.


## October 19 — v24 Main Village banner and visible assistants
- [x] User verified v23 on Samsung Android with screenshots, liked the new resource-first visual Command Center but could not easily locate the four assistants, and requested the old Main Village Town Hall image, profile identity, and 9/2/40 roadmap milestone bar restored *inside* the new dashboard.
- [x] S22-100: Reuse existing `dashboard.mjs:coverFor(profile)` as a compact card at the TOP of the new Command Center. Display actual selected profile name, Town Hall picture/level, Builder Hall level, player tag, and existing roadmap count/progress. No new village facts inferred.
- [x] Remove the old duplicate `coverFor(state)` from the expanded Advanced panel, while preserving resource vaults, timelines, extra editing and all data.
- [x] Move four Helper Hut assistant tiles immediately after the five Home builder tiles, ahead of Builder Base construction. Add an obvious Assistants (4) shortcut in the top controls which scrolls/focuses the assistant cards. Keep all individual assistant detail behavior.
- [x] Responsive compact styles and unit/browser acceptance assertions verify a single village banner, correct identity/levels, correct assistant order and working shortcut.
- [x] Release PWA and HTML assets as v24: https://auxz2jz.github.io/Slot-22/?v=24
- [ ] S22-101: User visual/touch acceptance on Android for v24. Confirm that banner dimensions are comfortable and Assistants (4) navigation is easy to use; adjust only what user identifies as necessary.
**Data preservation:** never change `data/player-state.json` or auto-overwrite newer phone-local state. Keep importing fresh game JSON separate from code/PWA updates.


## October 19–20 — v25 full licensed upgrade database and strategy guides
- [x] S22-102: User requested as much useful Clash Ninja upgrade-tracking content and guide coverage as permitted. Clash Ninja's own terms prohibit reproducing its site text/images without written consent; linked source guides and ORIGINAL short explanatory notes were used rather than copying articles.
- [x] MIT-licensed game upgrade data compiler `scripts/generate-upgrade-reference.mjs` importing factual numeric fields, requirements, resource costs, times, equipment ore tiers and separate temporary Supercharge records from `chiefpansancolt/clash-of-clans-data`. Full original MIT license included in `docs/THIRD_PARTY_GAME_DATA_LICENSE.md`.
- [x] Dedicated `.github/workflows/refresh-upgrade-data.yml` reads only upstream public JSON using sparse checkout, compiles `extended-reference.mjs` and commits ONLY that generated file to main. It does not read/edit any saved user state. Pipeline successfully produced **222** reference categories, including **18** categories with independent Supercharge levels; **174/175** unique item types in Main Village's Oct 19 saved export are covered. One unknown Hero Equipment identifier 90000061 is deliberately left unknown pending a verified data source.
- [x] `command-center.mjs` integrates full MIT reference with manual in-game quotes still taking first precedence; rankable costs and prerequisite checks use extended source. Uncatalogued entries remain unknown rather than being fabricated; discounts use only user-confirmed levels, without double-stacking.
- [x] `upgrade-directory.mjs` adds a **separate Upgrade database** screen with owned structures, traps, walls, heroes, troops, spells, siege machines, Builder Base research, pets and Hero Equipment, costs, durations, ore amounts, eligibility, and real search/group/status filters. Its reference-eligibility is NOT confirmation that an in-game builder is available.
- [x] `strategy-guides.mjs` adds a distinct **Strategy guides** tab containing 14 linked third-party guide articles (mostly Clash Ninja, plus official Supercell), with brief independently written notes and TH14/BH9 tailored suggestions. Source guides remain on the authors' websites.
- [x] Main dashboard remains visual and uncluttered; further details are behind the new tabs and a collapsed Upgrade database & Guides section. Builder detail includes estimated cost and duration of its own next recommended job.
- [x] Extended tests guard catalog generation, Supercharges, licensing, coverage, status/gating, resources, ore and guide links; browser checks exercise searching, filtering, opening a detail and switching tabs without changing saved data.
- [x] Release v25 has HTML query and service-worker cache updated to include three new modules plus generated numeric reference. URL: https://auxz2jz.github.io/Slot-22/?v=25
- [ ] S22-103: optional next phase requested by comparison with Clash Ninja: real multi-job builder/research/pet timeline and resource-gap forecast for planned upgrades, using dated JSON and complete database, before adding notifications. Do this as small tested atomic tasks; user does not want another overwhelming dashboard.
- [ ] S22-104: physical Android acceptance for v25 tab visibility, search filters, guide links, and new cost/time details. Use current phone local state; do NOT reload stale GitHub saved data simply to get new code.

**Data preservation:** `data/player-state.json`, private local-storage state, all two profiles, saved manual balances, Magic Items, rewards, per-account upgrade quotes, and builder/assistant histories must never be overwritten by a code/data release. None of the v25 development tasks changed `data/player-state.json`.


## October 20 — v27 Screenshot-to-resources OCR
- [x] S22-105: User requested Home Village and Builder Base resource balances to be read from screenshots on Samsung Android, while retaining full manual review before any resource is saved. Distinguish this from the official game village JSON, which still does not contain current balances.
- [x] Add `resource-ocr.mjs`: strict pure parser accepting 19,000,000 / 19 000 000 / 19.000.000 and K/M/B abbreviations (always flagged as approximate), rejects malformed numbers, duplicate conflicting shared Gems values, and ambiguous partial counter stacks. Manual typed correction permitted, but no auto-apply. Unit tests `tests/resource-ocr.test.mjs` cover all.
- [x] Add `resource-scan.mjs`: local image file input for BOTH villages, phone-friendly original/cropped preview (top-right default, right-side and whole screenshot fallbacks, normal/high-contrast modes), lazy-load pinned Tesseract.js v5.1.1 browser WASM OCR, read candidate numbers and propose per-resource amounts. Show saved balances alongside editable suggested values; only checked rows are saved after explicit Save action. Warn and require explicit acceptance of rounded K/M/B values. Home slots Gold/Elixir/Dark Elixir/Gems; Builder slots Builder Gold/Builder Elixir/Gems. If both checked Gems differ, abort entire save; no silent winner.
- [x] Local processing/privacy: images use transient blob: URLs, Canvas and WebAssembly workers. No screenshot bytes, OCR raw text, or image metadata are included in localStorage, GitHub sync or saved backup. Images are never uploaded to the app or a third-party OCR API. External CDN is used ONLY to download the open-source client OCR engine and trained-language files on first use; an internet connection is required then. Do not claim fully offline first-use functionality. OCR process is destroyed/revoked on navigation. A file changed while recognition is running invalidates stale results; clear is blocked during active recognition.
- [x] Integrate a visible `Scan resources` tab and a small `📷 Scan resources from screenshots` button directly above Command Center resource tiles. Keep legacy manual resource fields. The selected profile's local `resources` object alone is patched on confirmation and saveLocal is invoked. No balances altered by selecting or scanning image; no game action, automatic resource spend, implicit GitHub save/load or profile switching.
- [x] Add responsive styles for Android landscape screenshot previews and a mobile-first review form; CSS and PWA cache updated to v27, added new modules to service-worker precache; CSP restricted to required CDN/worker/WASM/language origins and local blob/data image preview.
- [x] Browser Chrome smoke uses a real synthetic PNG upload but mocks OCR output to validate no automatic writes, explicit Home/Builder resource updates, preserving Gems if unchecked, account isolation, retention of all Magic Items, rewards and roadmap, and no repeat write. Separate `tests/browser-ocr-live.mjs` workflow runs REAL Tesseract.js WebAssembly in Chrome against a synthetic screenshot: four resource amounts 19,000,000 / 17,504,427 / 408,530 / 4,049 recognized correctly with all suggestions prepared, **nothing saved**. No user's screenshot was involved.
- [ ] S22-106: physical Samsung Android acceptance with USER'S actual October 2026 Home and Builder screenshots. Open https://auxz2jz.github.io/Slot-22/?v=27, choose each screenshot; if not all numbers recognized, try Entire right side or High contrast and send a screenshot of the app's preview/review for position tuning. NEVER infer exact resources from approximate OCR or bypass confirmation. Do not overwrite any unsynced phone-local data.
- [ ] Future optional: scan Ore inventory screen separately if user requests it; no equipment ore figures are currently inferred from Home/Builder upper-right HUD.

**Data safety:** No source release or screenshot OCR code changed `data/player-state.json`; preserve existing two profiles, user-entered resources, gems, ores, rewards, Magic Items and progress until an explicit per-account review/save. The source public GitHub state is older than possible Samsung-local edits.


## October 20 — v28 user-drawn resource crop (S22-107)
- [x] S22-107a: small bounded rectangle helpers and unit tests, existing v27 main stays intact.
- [x] S22-107b: touch/mouse draw/move/resize selection around HUD resources, optional single-resource OCR target, normalized crop zoom up to 4×, and preset fallback. Saving layout stores only per-village normalized box coordinates and aspect ratio on this device; no screenshot or recognized text is persisted.
- [x] S22-107c: reject zero/multiple or contradictory-label single-target OCR results. Only explicit checked + confirmed field updates can modify the active profile.
- [ ] S22-107d: GitHub browser/unit/live-OCR checks and Samsung Android visual acceptance; distinguish CI from hardware confirmation. Keep v27 as last candidate until new version works on device.
- [ ] S22-108: on actual Samsung screenshot test Home and Builder separately with upper-right box, one-row targeting if full stack fails, compare every OCR digit, and verify no balance changes before Save checked balances. No automatic GitHub Load and never write data/player-state.json during release.


## October 20 — v29 real HUD OCR fix (S22-109, candidate)
- [x] User reported v28 screenshot has a clean preview but OCR recognizes no reliable digits. Supplied **private screenshot** 1536×716 (NOT committed, no derived image saved to repo). Direct visual reading: Gold 19,000,000; Elixir 5,943,020; Dark Elixir 310,000; Gems 4,182. Spoken longer elixir amount conflicts with visible image.
- [x] S22-109a: measured separate Home Village HUD digit rows, anchored to screenshot height/right edge and limited to suitable full landscape images; add resource-hud.mjs pure rectangle and color-mask tests. Use normal OCR for Elixir/Dark/Gems and white-letter mask **before upscaling** for Gold; desktop local OCR isolated those four fields successfully. This is a local diagnostic, not Android Tesseract.js acceptance.
- [x] S22-109b: add Auto-read the four Home counters button and four per-row enlarged preview canvases, with strict one-candidate fail-closed parsing. Keep manual crop/target/review and Builder Base manual mode. No image upload, OCR persistence, other-account writes, or automatic saving.
- [ ] S22-109c: GitHub unit, Chrome smoke, and OCR live checks for v29; screenshot remains off public git. Android user verification still pending. If geometry does not match a different game layout, use manual crop; do NOT infer/swap balances.


## October 20 — v30 Gold-specific OCR diagnostic and correction (S22-110)
- [x] User tested v29 on Samsung and reports most resources work, but Gold returns some correct and some incorrect digits even after trying filters. Do not alter other resource paths or user data.
- [x] Private reproduction using previous full Home Village screenshot (never committed): native Tesseract Gold white-filter image with PSM7 reads EMPTY, but PSM8 (single word) reads exactly 19,000,000; native original image with PSM8 also reads 19,000,000.
- [x] S22-110a–d: Auto Gold now uses PSM8 and reads twice from independent white-digit and normal crops; two candidates must match exactly before checking the Gold field. Otherwise Gold remains unchecked, showing both texts for manual correction. Manual Home single-Gold selection also uses PSM8. Other resource OCR settings remain unchanged. Pure parser and Chrome browser smoke verify consensus/disagreement and no balance writes before confirmation.
- [ ] S22-110e: verify GitHub CI, browser, live synthetic OCR and Pages release; then request Samsung real-image acceptance. Existing data/player-state.json, user local balances and images not updated or committed.


## October 21 — v31 community base layout links (S22-111)
- [x] User authorized a **Base layouts** page for BOTH Home Village and Builder Base, with one-tap official Supercell in-game import/copy on Samsung. Do not confuse with importing game export JSON; the JSON contains hall/defense levels but NOT exact layout coordinates.
- [x] S22-111a: independently authored original UI text and curated, individually followed official `link.clashofclans.com` OpenLayout links for TH14 Home/War, BH9 Builder Base, and TH4 second profile. Sources attributed in each card. **No external copyrighted screenshots/images or scraped descriptions committed.**
- [x] S22-111b–c: account-specific hall levels from `export.buildings[1000001]` / `export.buildings2[1000034]`; view separate current Hall options, farming/hybrid/trophy/war links, external preview/source and Copy link clipboard; overview shortcut. Other levels show Hall-specific browse fallback, never incorrectly offer a TH14/BH9 link to a lower account. BB2 links use Supercell's actual `TH9:BB2` code, not an invented BH9 identifier. Unknown/early Builder Hall has no fabricated layout.
- [x] S22-111d–e: pure URL/hall/account/escaping tests and Chrome browser test cover direct links and verify no resource/profile changes from browse/copy. Code/assets use v31 PWA cache.
- [ ] S22-111f: confirm GitHub CI and deployment plus Samsung Android opening game links and saving compatible Home vs War vs Builder slot. Theoretical "best" is subjective and cannot be proved from in-game JSON; player chooses war, trophies or farming and reviews buildings/traps after importing. Layout link doesn't unlock defenses/equipment or guarantee win rates. Never edit player-state.json for UI release.
