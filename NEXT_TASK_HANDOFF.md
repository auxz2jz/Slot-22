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
