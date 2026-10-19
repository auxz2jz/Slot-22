# Guided test — candidate v0.1.0

No phone/user-verified baseline exists yet. In app, open Test & diagnostics, follow these scenarios and export manual report.

1. Overview should show TH14/BH9, balances and building queues.
2. Edit Gold to a temporary value; refresh; verify it persists; restore actual value.
3. Import newer game JSON; buildings/levels/timers update, manual resources/items remain unchanged. Mismatched tags must fail safely.
4. Change roadmap status, reload and verify persistence.
5. Edit Magic Item stock, reload, restore correct count.
6. Download backup, then restore; state should be retained.
7. GitHub sync, ONLY if user approves public storage: enter restricted fine-grained token, Save, verify repository JSON changes. Load in another browser; confirm values. Simulate remote conflict; local data must be preserved.
8. Export diagnostics; verify report has event types/outcomes and no token or raw imported game data.
9. Reload after temporarily disconnecting from internet; basic static UI should work once cached. Remote GitHub operations will not work offline.

Checks are user-confirmed, not passed automatically. On failure preserve report, step number, and screenshot before changes.

## New version 0.2.0 multi-profile regression steps
1. Check main account resource inputs show commas, e.g. 19,000,000, and a smaller typed number updates while typing.
2. In Current upgrade queues, confirm categories (Pets, Spells, Heroes, Builder buildings) appear on a separate line with no glued text.
3. Import another player's game JSON. Confirm a second profile appears in Account selector, starts with zero currency/Magic Items and no copied upgrade roadmap.
4. Switch back to the original account. Confirm the original balance, inventory and roadmap are unchanged.
5. Rename each profile and refresh the page. Both display names and active selection should persist.
6. Download a full backup; restore it and verify both accounts survive. Old single-account backup should migrate into one v2 profile.
7. Optional public GitHub sync: save and load the **entire** multi-profile bundle, after reviewing privacy warning and backing up locally. Verify remote file includes both accounts and passwords/tokens do not appear.
Only the automation listed in browser smoke run 39190994116 is verified; actual phone interactions still require the user's confirmation.

## Version 0.3.0 – Smartphone acceptance

1. On Overview, see Hall banner, vault gauges and queue tiles rather than a loading screen.
2. Enter an actual Gold storage capacity; its gauge should show correctly rounded fullness and persist after refresh. Unknown capacity must not show a guessed percent.
3. Tap a queue tile; confirm correct building name and snapshot timer. Progress means since last imported export, not total construction completion.
4. Open Upgrade Roadmap; tap a step and inspect status, cost estimate, resource preview and notes.
5. Mark a task active; its status should change but balances must not be deducted.
6. Only for a real in-game upgrade already started, test Record upgrade & spend; explicitly confirm and verify exact one-time tracker-only subtraction, no Gems.
7. In Village Inventory, switch gallery/table views and tap an item in each. Test portrait Android.
8. Switch between profiles; capacities, balances and task statuses must stay separated.
9. Optionally use backup and explicit public GitHub Save/Load; review before publishing any account data.
10. Export diagnostics and report the specific test step if a screen fails. CI success is not user acceptance.

## October 2026 Season Pass reward checklist

1. Select Season Pass prizes from the nav on main player #QVLP9RVV. Verify 30 Silver and 19 Gold positions, 22 alternating two-option rewards.
2. On Choices only filter, select Builder Gold 1,000,000 for S08, mark claimed in app only and verify counts; undo if not actually collected in game.
3. Verify attempting to mark a choice claimed with no option selected is rejected.
4. Check existing balances, Books, Runes and another profile are not affected by a checklist claim.
5. Reload browser and confirm chosen claim is retained locally; backup before optional public GitHub load.
6. Only confirm actual claims after in-game collection; do not treat this tracker as a game connection.

## Editable October rewards and Magic Items — Android acceptance
1. Pass Rewards → Unclaimed rewards only in Clash of Clans is the authoritative event list. In the app, open Season Pass prizes. Existing main village has 49 originally reported positions; some may have since been claimed.
2. Mark each prize that was actually collected in-game. An either/or slot requires selecting one option first; it remains one reward.
3. Tap Edit to correct an original prize's options/note. Add a new prize in the top form: track Silver, Gold or Event, one prize or either/or pair. Verify it persists after reopening.
4. Switch to Magic Items & ores. Enter your actual Rune of Gold count e.g. 8 even if in-game capacity says 1/1; no forced clamping. Add a custom item name if needed.
5. Verify a claim/checklist edit DOES NOT change actual owned Magic Item counts or resources automatically, and switching profiles keeps their lists separate.
6. Download a local backup before using GitHub Load. Explicit GitHub Save publishes all game records in the public Slot-22 repo.

## Persistent builder-progress regression (2026-10-19 candidate)

1. Before importing again, use **↓ Backup** to save your full planner data. Do NOT choose GitHub Load if the phone has newer edits.
2. On the Overview **Live countdown board**, note the fill of one upgrade still running in Clash.
3. Import a fresh **game village JSON** for that SAME account and open Overview again. **Expected:** the same upgrade's bar continues from the first tracked observation instead of returning to 0%. The remaining-time countdown reflects the new snapshot.
4. Import the same JSON once more. **Expected:** bar stays at its prior tracked position (allowing normal clock movement). Resources, Magic Items, Gold Pass claims, and roadmap remain unchanged.
5. After a different upgrade genuinely begins, import another JSON. **Expected:** the new job starts a new observed-progress bar. These bars are elapsed time since first tracked, **not exact full-building construction progress** because game JSON lacks initial start times.
6. Refresh the page and switch accounts. **Expected:** tracking persists on the original profile, and the other profile has its own independent bars. If a bar resets unexpectedly, export **Test & diagnostics** plus a before/after planner backup; do not share credentials.

Automated tests cover repeated snapshot imports, duplicate same-type buildings, item/currency preservation, and fresh-job anchor reset. Actual Android visual acceptance is still required.

## Time-based estimate verification — candidate v0.3.1 (October 19, 2026)

1. Tap **↓ Backup** before working with new JSON. Keep phone-local edits safe; never use **Load from GitHub** without reviewing newer local changes.
2. On **Village overview → Live countdown board**, check **Game snapshot generated** is the time the village JSON was created (not the time the file was imported).
3. Under a currently upgrading building, note **Estimated finish**, the **remaining-time countdown**, and **% tracked**. Expected finish is `snapshot timestamp + timer seconds`. The timer should decrease using the phone's clock even without re-importing.
4. Import a fresh, newer JSON of the same account. Expected: the snapshot date, completion estimates and countdowns reflect the new export, while continuing upgrades keep their prior first-observed anchor instead of resetting their tracked progress.
5. If a boost or helper changes an upgrade finish time, import another JSON. Expected: the estimated finish adjusts and the same observed upgrade retains its anchor; the fill may adjust to the updated tracked window, not reset to a new zero baseline.
6. Attempt importing an **older JSON** after a newer one. Expected: show a clear error and preserve the newer village and all manually tracked resources, Magic Items, rewards and roadmap.
7. Wait until a timer has expired or import an export from a completed upgrade. Expected: expiry is labeled as unconfirmed until a new JSON confirms the upgrade's state; expired jobs are not marked completed automatically.
8. Check another account and restore your main one. Expected: no cross-account sharing of upgrade timers or manually tracked values. If not, export **Test & diagnostics**, avoid sharing tokens, and report the affected account/timer.

The display is estimated from the device clock and game export, not from live Supercell synchronization. A substantially incorrect device clock gives inaccurate results. Percent tracked is **not** the whole construction percentage because the JSON does not provide actual start time or original duration. Android visual confirmation is still required after GitHub Actions tests.

## Actual Helper Hut assignments and countdowns — v14 candidate (2026-10-19)

1. In **GitHub & backups**, first download a full local backup. Do not press **Load from GitHub** if this phone contains newer unsynced edits.
2. Open **Village overview**. In **Your helpers**, find **Builder's Apprentice — Level 7**. With the confirmed October 19 2:20 AM snapshot, its card should show **Assigned in snapshot: Archer Queen (Lv 47)**, **Repeat assignment: On**, a session countdown and a cooldown countdown. **Archer Queen's upgrade tile** should show **Builder's Apprentice assigned in JSON · repeats**.
3. The screenshot in game remains the authority. Session duration was **3,587 seconds** and cooldown **82,787 seconds** at the 2:20 AM export; values on screen must count down from the JSON's timestamp, not restart from when the file is imported or when the page is reloaded.
4. If the dated helper work-session estimate is past its end, expect **Session estimate elapsed · refresh JSON**, never an assertion that the helper is still working. If cooldown estimate expires, show **verify in game**, not **Ready**.
5. Open **JSON insights & helpers** and confirm the same assignment/timers. Re-import an **identical or newer** game JSON (not a planner backup); verify assignments refresh from new snapshot, and resources, Magic Items, event rewards, roadmap and other profiles remain unchanged.
6. For a snapshot without a helper assignment, show **Assignment not reported in this JSON** rather than falsely claiming idle/unassigned. For multiple possible targets, show ambiguity rather than guessing.
7. Repeat assignment is the game's helper_recurrent flag on the target upgrade, not on the helper record. Cooldown is the helper's helper_cooldown; session is target's helper_timer.
8. No feature here can assign, stop, collect rewards or spend Gems in Clash; updates are derived only from manual JSON imports. Report incorrect display with a redacted diagnostics export and screenshot, not GitHub credentials.

Automated regression covers link between Archer Queen and Builder's Apprentice, Lab Assistant research, ambiguous/missing records, timer rollover text, HTML rendering and browser smoke. Android visual verification remains pending.

## Free Home builder import-triggered upgrade suggestion — v15 candidate (Oct 19, 2026)

1. Download full planner backup before any test. Preserve newer phone data; never use GitHub Load as an app-update step.
2. On main player #QVLP9RVV with the Oct 19 11:46 AM snapshot, Overview should show a builder-available banner: **at least one Home builder**, because five Builder Huts are in the JSON but only four Home building/hero/trap jobs have timers. Top recommendation should be **Spell Factory 6 → 7**; other eligible choices may be Army Camps and Inferno Towers.
3. From Clash of Clans export a **newer** in-game village JSON (not the full planner backup), import it using either Upload/Import or Paste. If a builder is confirmed free and an eligible roadmap item exists, a real **modal pop-up** immediately recommends the next upgrade, with estimated cost, saved-resource caveat and button **View upgrade details**. No manual browser refresh or GitHub Save required to display the prompt.
4. If all five known builder slots have active construction/trap/hero timers in the JSON, expect **no free-builder popup**. Do not treat expired estimated timers as a free builder until the next JSON confirms the job no longer has an active timer. If huts are absent/unknown, do not claim an available builder.
5. The in-game action remains entirely manual: **View upgrade details** must not spend resources or mark an upgrade active. Actual in-game cost and resource balances supersede roadmap estimates, since current Gold/Elixir are NOT supplied by the village export.
6. Dismiss with **Not now** (or Android Back) and verify no repeated modal for the same snapshot, even if you import the identical JSON again. Import a **newer** JSON while a builder is still available: expect a fresh prompt and recomputed recommendation.
7. Verify **no retroactive upgrades** are recommended: completed Queen 47→48 and already-running Pet House, Army Camp, Clan Castle, and Inferno Tower tasks must not appear as next options. Duplicate catalog labels for Home Army Camp vs Builder Base Army Camp must match the Home building's actual game ID and level.
8. Ensure switching profiles, page reload, resources, Magic Items, seasonal rewards and the roadmap remain intact. If the banner or prompt is wrong, export **Test & diagnostics**, record snapshot time/active builder count, and share a screenshot (never your GitHub token). Automated CI browser tests do not replace physical Android acceptance.

## v16 — Home/Star Lab idle research popups (Oct 19, 2026)

1. First download a full phone-local planner backup. Keep existing resources, Magic Items, event claims and roadmap. Do not use **Load from GitHub** just to get code updates.
2. Your latest GitHub village snapshot (2026-10-19 11:46 AM Pacific) shows **Laboratory Lv12**, Freeze Spell Lv4, no active Home Laboratory research in units/spells/siege machines; **Star Laboratory Lv9** with no active units2 timer; Pet House Lv3 is upgrading, so Pet House research availability must remain unknown until game reconfirmation.
3. On the **Village overview**, verify separate research recommendation panels. Home Laboratory → **Freeze Spell 4→5**, an eligible planned Level-4 research upgrade; Star Laboratory → **Hog Glider 15→16** (specific Lv15 troop mapped to existing Builder Base roadmap goal B-05, cost unknown); do not recommend stale active Freeze 3→4 or a locked Unicorn.
4. Import a fresh, later-dated *game village JSON*. If Home builder is free plus Laboratory and Star Laboratory idle, expect ONE combined immediate modal with three distinct categories and recommended upgrades; recommendations must not start upgrades, spend resources, or change roadmap automatically.
5. Test with all Home builders actively upgrading but no Laboratory research. Expect a **research-only** modal, still recommending valid Home/Star Lab projects.
6. If a Home Laboratory spell or troop has a timer, suppress its *idle* recommendation regardless of whether the old estimated finish time already elapsed (until a fresh JSON confirms it stopped). Same rule for Star Lab units2 and Pet House pets. If the Laboratory building is itself upgrading or required arrays are missing, display **unknown** rather than claiming it is idle.
7. Lab Assistant and Builder's Apprentice are **time-saving helpers, not extra research/build queues**. Available Lab Assistant does not mean the Laboratory is idle, and vice versa.
8. Dismiss with **Not now**; importing the same snapshot again must not reopen the dialog. A newer snapshot can prompt again when any researched queue is observed idle. No automatic in-game synchronization occurs. Reopen the site and confirm local data survives.
9. Open **Test & diagnostics** and export a report if the actual Android presentation differs; include screenshot and export time but never share GitHub tokens.

All automated tests and browser CI are distinct from physical user confirmation on Android. App code is candidate until user accepts.
