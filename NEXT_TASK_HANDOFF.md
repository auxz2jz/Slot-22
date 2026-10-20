# NEXT TASK HANDOFF — SLOT-22 CLASH VILLAGE PLANNER
Checkpoint written 2026-10-19. User explicitly requested STOP development and prepare a handoff because the conversation appeared stuck in a loop.

## Non-negotiable next-session instruction
**Do not continue coding, redesigning, replaying old steps, or editing player data automatically.** Start by opening this file, show the user the checkpoint, and ask for the specific authorization to resume. Keep work in small atomic tasks, one verified step at a time, with checkpoints, as required by AGENTS.md and the Master Instruction Library. Do not re-read entire historical chats or rerun broad investigations. The current request is to SAVE/PAUSE, not to implement more features.

## Authoritative saved state
- Repository: https://github.com/auxz2jz/Slot-22
- Website last verified as v21: https://auxz2jz.github.io/Slot-22/?v=21
- Existing GitHub file data/player-state.json was ALREADY committed by user workflow: commit 710e5e50e233cd716b7b02de84b0736233458857, 2026-10-19 22:36:04 UTC. File SHA at pause: 42f60b9a5a6e97191cc8f6ce0e87ed41ff0b4370, bundle revision 37, active profile revision 25, snapshot game timestamp 2026-10-19 22:35:21 UTC / 3:35:21 PM Pacific. It MUST remain unchanged by development/handoff operations. Re-fetch before any later changes: user may have newer phone or GitHub data.
- Profile: #QVLP9RVV; saved manual values Gold 19,000,000; Elixir 17,504,427; Dark 408,530; Gems 4,049; Builder Gold 3,055,184; Builder Elixir 1,352,108; Loot Cart Gold 17M, Elixir 17M, Dark 170K; equipment ore Shiny 940, Glowy 222, Starry 11. These are user-entered/saved figures, NOT game-live balances.
- Ongoing Home Village construction from latest JSON (stored current levels, each has a timer): Clan Castle Lv9, Army Camp Lv10, Spell Factory Lv6, Inferno Tower Lv7, Pet House Lv3. Five standard Home builders occupied at dated snapshot.
- Ongoing Builder Base construction: Builder Cannon Lv7 and Star Laboratory Lv7 (each has timer). Actual Star Laboratory building ID 1000046, separate from Builder Hall ID 1000034.
- Home Laboratory: Freeze Spell Lv4 has active timer (46,295 seconds remaining at dated export); helper_recurrent true on Freeze record. Pet House: Electro Owl Lv3 has active timer (100,791 seconds remaining at export), meaning the user HAS STARTED the Owl 2 -> 3 upgrade. DO NOT recommend starting Owl 2 -> 3 again. A new snapshot should update pet priority after this task finishes.
- Five Home heroes in last checked snapshot: Barbarian King44, Archer Queen48, Grand Warden28, Royal Champion20, Minion Prince50; no hero construction timer in most recent snapshot.
- Helpers at saved snapshot: Builder's Apprentice Lv7 cooldown 35,194s; Lab Assistant Lv8 cooldown 35,194s; Alchemist Lv3 no cooldown recorded; Prospector Lv1 no cooldown recorded. Lack of a timer is not proof unused or ready. Separate per-helper use within shared 23-hour workday.
- Saved 50% event/returning boost and Gold Pass benefits were discussed; DO NOT assume unconfirmed expiration or stack discounts. Player-supplied in-game quote should supersede third-party price reference. Preserve all Magic Items, season rewards, upgradeQuotes, boost fields, data/profile history, notes and phone-local state.

## Most recent implementation state
- App static assets in GitHub were last fetched as index.html version 21 and sw.js cache slot22-static-v21. Existing code includes app.js, command-center.mjs, full-plan.mjs, full-plan-view.mjs, experience.mjs, helper-advice.mjs, upgrade-reference.mjs, tests, and AGENTS.md. Do not assume v19 is current!
- docs/CODEX_HANDOFF.md and ROADMAP.md have existing V21 checkpoints (see newest ends of both files). V21 has a compact resource-first dashboard, seven queue cards, structure drill-ins, quote/discount handling, and older extensive panels behind details. Do not rebuild from scratch.
- User reports clutter and a perceived loop: ultimate desired experience is ONE focused mobile command center with resources, workers/assistants, ordered priority and actionable per-building drill-ins. Decision engine should rank one next and following alternatives for EACH real upgrade queue (Home builders and Heroes, Builder Base builders, Home Laboratory shared spells/troops/siege research, Star Laboratory research, Pet House pet research, Blacksmith ore equipment, Helper Hut). Include unlock prerequisites, real discounted price/time when verified, expiry if actually known, affordability only when balances trustworthy, and next task after completion. Every structure can be browsed, but not every structure has its own independent worker (Walls, collectors and troop/spell production are not separate research queues). User wants consolidation and clarity, not another wall of cards.
- THIS requested redesign was NOT implemented in the immediately preceding assistant message; a concept was shown and the code was verified already at v21. No UI edits were authorized in the current pause request.
- Existing browser physical Android acceptance remains unverified; do not claim it passed.

## CI at time of pause
Latest commit 710e5e50e233cd716b7b02de84b0736233458857 (v21 code plus newer user snapshot): static/unit checks SUCCESS, GitHub Pages deploy SUCCESS. Browser startup smoke test FAILURE and Reward editor browser acceptance FAILURE.
- Browser smoke run 39336100061/job 118345857271 started browser, rendered full strategy/factory/popup/helper tests successfully and reported no browser JS errors, but the "ACCOUNT & COMMA FORMATTING" browser probe returned `added: false` (all other probe fields true) so exit code 1. Next session should inspect browser-smoke.mjs account-add test and relevant UI/data; it may be stale test assumptions, an application bug, or interaction timing. Investigate MINIMALLY; never erase real profiles or overwrite data.
- Reward acceptance run 39336099980/job 118345860888 failed because Chrome debugger never appeared; CI infrastructure flake versus application behavior unproven. Retry only after authorized.
- An earlier code-only commit e3fc5ba78db5cf1d5bbdeed317caa5de2f92f5ae showed successful browser smoke, before newer user data. Do not claim latest all checks pass.

## Suggested atomic resumption sequence — NOT STARTED
1. User authorizes resume. Read this file, current AGENTS.md, targeted newest docs/CODEX_HANDOFF.md tail and current saved data timestamp/version, not whole conversation.
2. Assess the v21 phone UI and ask user for screenshot/desired minimal home layout if needed. Make a concise design acceptance checklist for one compact dashboard: resource strip, current jobs, ranked next action for each worker/research station, assistants, structure drill-ins. Remove duplicate top-level panels rather than adding more.
3. Independently verify precise Gold Pass/returning-event discounted costs and time limits using game evidence; unknown values remain unknown.
4. Diagnose account-add browser test `added: false` with small targeted change and rerun tests. Handle Chrome debugger failures as separate reliability issue. Record completed tasks before next task.
5. Implement only ONE small approved UI/design improvement at a time. Never mutate player-state.json, never reload GitHub data on phone to fetch code, and always protect newer local state with backup first.
6. Verify GitHub Actions and physically test Android before declaring a release.

## Safe resume prompt
"Resume Slot-22 from NEXT_TASK_HANDOFF.md. First summarize the verified checkpoint and the single smallest next task; preserve all data. Do not edit code or run large investigations until I approve your proposed next task."

## Stop state
The current assistant halted active work after writing this handoff. No new application changes, saved profile edits, game commands, Gems spending, or discount changes should be performed as part of this checkpoint.


## UPDATED POST-RESUMPTION CHECKPOINT — v22 verified developer release
This section supersedes the prior STOP/PAUSE state from 2026-10-19: the user explicitly resumed, approved tasks S22-093–S22-096, and requested a completed, usable application. The app is now version 22, not v21. The earlier detailed data snapshot can still be used as a dated checkpoint; re-fetch any current game state before making recommendations.

**What is complete:** S22-093 diagnosed outdated absolute account-count browser assertions; S22-094 changed only the browser test to relative +1 per new profile and got all CI green; S22-095 identified redundant six-queue Whole Village Plan display under Advanced; S22-096 removed the duplicate render call/import, redirected the free-builder advanced button to the working Home Builder Command Center drill-in, removed the obsolete scroll handler, updated Chrome smoke assertions for the seven lane cards and drill-ins, and released the PWA assets/cache as v22.

**Main modules now:** app.js uses renderCommandCenter(state) on Overview, with Advanced panels still collapsed and available (helper cards, resource editor, builder timeline, factory audit and full roadmap). full-plan.mjs remains the shared pure queue strategy engine; full-plan-view.mjs is no longer loaded or precached, but its source file was not deleted. command-center.mjs renders seven interactive stations and all per-building drill-ins, with saved costs/discount confirmation and subsequent upgrade suggestions.

**Verified at v22 code commit d2fe0363b7e6245a9ac991eea8680dfdd223af92:** GitHub static/unit tests SUCCESS; browser startup smoke SUCCESS with all seven stations, no duplicate panel, ranked Grand Warden, Freeze Spell and pet suggestions verified, no JS errors; reward-editor browser acceptance SUCCESS after its Chrome-debugger startup failed once then succeeded on retry; GitHub Pages deployment SUCCESS. Chrome debugger intermittent CI startup is a separate environment reliability issue, not evidence of a UI defect.

**Protected user data:** data/player-state.json remained unmodified: SHA 42f60b9a5a6e97191cc8f6ce0e87ed41ff0b4370, bundle revision 37, two saved profiles #QVLP9RVV and #GVPCRLJQ8, snapshot main profile dated Oct 19, 2026 3:35:21 PM Pacific. Your phone can have fresher unsynced data: never force GitHub Load for a code update. Never invent or double-apply Gold Pass/returning boosts. Confirm exact in-game prices/times where catalog coverage is missing; upgrade-reference.mjs has 21 partial categories.

**Only remaining acceptance check for v22:** user opens https://auxz2jz.github.io/Slot-22/?v=22 on Android, validates resources and the seven station taps, building/factory detail and following recommendations, and reports a specific issue if one exists. CI success does not establish phone visual acceptance. Broader coverage of every price/time is OPTIONAL follow-on data work, not proof v22 UI is unusable. No future changes should be made without a concrete task and checkpoint.

**Smallest next task if user requests:** S22-097 guided Android acceptance, asking which station is missing a recommended upgrade or which element remains cluttered; reproduce one issue, then implement one atomic fix at a time. Do not restart design work or re-read the entire past chat.


## V23 — WORKFORCE VISUAL RELEASE CHECKPOINT
User asked to continue in this SAME CHAT; previous statement that GitHub tools were not available was incorrect. After explicit approval to implement S22-098, the assistant directly modified this repo. The next version is v23. GitHub site: https://auxz2jz.github.io/Slot-22/?v=23.

Source changes: visual-command.mjs is a NEW standalone, read-only HTML rendering module for five Home builder positions, two Builder Base positions, four Helper Hut assistants, separate Laboratory/Star Laboratory/Pet House/Blacksmith upgrade cards, and a six-category priority shortlist. It uses community ClashKing pictures via existing artwork.mjs, and resource icons for nine saved balances/ores. Each builder or assistant card opens a detail showing dated activity, safe time/bar estimates, and the next recommended action; app.js owns click handlers. command-center.mjs consumes the new UI, retains the structure finder and per-facility detail, and keeps cost quote/discount settings. styles.css adds responsive visual cards and status bars. The PWA service-worker cache version and index asset query are v23. tests/visual-command.test.mjs and tests/browser-smoke.mjs cover both pure logic and browser UI.

CRITICAL GAME-DATA HONESTY: Clash's exported builder huts show count, but not named builder identities or assignments. The app labels Builder 1..5 by ordered active jobs (earliest estimated completion first); these are visual display slots, not real in-game builder IDs. Snapshot's timer + timestamp gives an estimated FINISH, not actual START. upgradeTracking.firstSeenAt is when the tracker first observed a job, not actual start; progress bars explicitly say "since first observed". ETA passed does not prove the builder is available. Helpers lacking assignment/cooldown must NOT be called ready, and suggested targets must be distinguished from recorded target/recurrent state. Heroes require Home builders; Lab, Star Lab and pet upgrades do not; equipment is on-demand ore-based.

S22-098 check: Latest saved GitHub bundle still had SHA 42f60b9a5a6e97191cc8f6ce0e87ed41ff0b4370, bundle revision 37, two profiles #QVLP9RVV and #GVPCRLJQ8, dated October 19, 2026 15:35 Pacific. Do NOT mutate or reset; phone-local saved profile may be newer. User asked for minimal text on main dashboard; preserve detail behind tap-open cards.

NEXT: verify all four GitHub Actions for the FINAL v23 code/docs commit, and only then call web release verified. S22-099 physical Android visual tap-through is pending and cannot be claimed passed solely from Chrome headless tests. If user reports a problem, address one small atomic issue rather than resuming large design plans. No need for a different chat to continue Slot-22.
