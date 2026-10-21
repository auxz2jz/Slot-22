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


## v17 — factories, current Star Laboratory prerequisites and pet research (2026-10-19)

1. Before opening the new app code on Samsung Android, download a local planner backup and do NOT load the older GitHub copy if there are newer unsynced edits.
2. Open Village overview → Factory & army building audit. In latest 2026-10-19 **12:32 PM Pacific** dated game JSON, verify **Spell Factory Lv6 → 7 building upgrade active**, **Dark Spell Factory Lv6, next building Lv7**, **Dark Barracks Lv9, next Lv10**, **Barracks Lv14, next Lv15**, **Workshop Lv5, next Lv6**, **Blacksmith Lv6, next Lv7**, **Hero Hall Lv7, next Lv8**, **Home Laboratory Lv12 at TH14 cap**, **Pet House Lv3 →4 building upgrade active**; **Builder Barracks Lv11 at BH9 cap**, and **Star Laboratory Lv7 →8 construction active**. Game price and unlocked-building status outrank chart estimates.
3. Confirm five Home builder construction timers (Clan Castle, Army Camp, Spell Factory, Inferno Tower, Pet House) and two Builder Base construction timers (Builder Cannon, STAR Laboratory). A dated JSON with these five Home jobs does not prove a free Home builder.
4. Confirm Home Laboratory **Freeze Spell Lv4 →5 researching**. Spell Factory and Dark Spell Factory are NOT separate spell research queues. They can brew/produce spells even if building is upgraded; spell upgrades use the one shared Home Laboratory.
5. Confirm STAR Laboratory ID 1000046 is at **Lv7 upgrading to Lv8** and has no Builder Base troop research timer. Hog Glider in units2 at Level15 requires actual **STAR Laboratory level9** before Hog Glider 15→16 is a valid upgrade. The app must NEVER recommend Hog Glider 15→16 while true Star Lab Lv7 or Lv8. Instead suggest a level-compatible current troop (e.g., Raged Barbarian Lv13→14, which fits Lv7), and say verify that research is selectable during the building upgrade.
6. Confirm Pet House Lv3 is currently under construction to Lv4 but pet research is independently idle. Eligible existing pet upgrades include **Electro Owl 2→3**, **L.A.S.S.I 3→4** and **Mighty Yak 1→2** (prices unknown). Unicorn is not yet unlocked in the 12:32 snapshot and must not be recommended merely due the outdated planned roadmap. For a derived pet suggestion tap View your pets to see the existing game snapshot inventory.
7. Import a NEWER in-game JSON. If one or more research slots are idle, a combined popup should include the accurate Star Laboratory suggestion AND pet recommendation while omitting any busy Home Laboratory or full Home builder. If one construction builder frees and Home Laboratory research also completes, popup may include all four categories. Confirm no repeat pop-up on identical JSON, and no changes to balances, Magic Items, season rewards or roadmap statuses.
8. Do not expect live syncing, automatic farming/brewing, or updates until a fresh JSON import. After research starts in the game, import a newer JSON and confirm its timer appears in the correct independent queue. This test is not complete until confirmed on Android.

## v18 helper recommendations — Android acceptance
1. Download complete planner backup on phone; opening new v18 does not require GitHub Load.
2. On Overview → Helper Hut, verify exactly four assistant recommendations: Builder's Apprentice Lv7 with dated cooldown/long Home upgrade, Lab Assistant Lv8 with Freeze Spell research, Alchemist Lv3 conversion only if real normal resources are surplus, and Gold Pass Prospector Lv1 ore conversion only for an equipment target.
3. Only Builder has personal cooldown in the October 19 12:32 PM export; do not show Lab/Alchemist/Prospector as positively available or used. All share one 23h reset but each can be used once during the workday.
4. Import a newer game JSON: confirm assistant recommendations appear alongside free building/laboratory/pet tasks in a single modal, even if all construction builders are busy. Dismiss and reimport identical snapshot: no repeated modal.
5. Verify actual Assistant statuses in Helper Hut in Clash; the planner cannot assign them or spend resources. No Magic Item/reward/resource/profile changes from import. Android acceptance remains pending.

## V19 — full village plan and never-idle upgrade pipeline
1. Back up the phone-local planner; new site code does NOT need Load from GitHub. Open version 19 and Overview → Village upgrade command plan.
2. Confirm six separate lanes: Home builders, Builder Base builders, Home Laboratory (one shared troop/spell/siege slot), Star Laboratory, Hero Pets, Hero Equipment. Confirm Hero Hall Level 7 with King44, Queen48, Warden28, Champion20, Prince50; NO Heroes upgrading in Oct19 12:52PM game JSON.
3. Pet House building Lv3→4 is active but ONE independent pet upgrade is not; suggest Electro Owl2→3 now (or confirm another better pet in game). After new JSON completes Owl next recommend Owl3→4, and when Pet House4 unlocks Unicorn prioritize it. Costs and actual current Dark Elixir are NOT in game JSON.
4. Home Laboratory researching Freeze Spell4→5; on later JSON with Level5 and no timer recommend Freeze5→6 if selectable, with alternative spells, troops and siege machines listed; NEVER claim one slot per spell factory.
5. Star Laboratory structure Lv7→8 active; per official December 2022 it may research an eligible troop at its CURRENT level while structure construction continues. Recommend a level-compatible Raged Barbarian13→14 if selectable; NEVER Hog Glider15→16 before real Lab Lv9. Ask for game UI screenshot if blocked.
6. All five Home construction slots active; after newer JSON confirms builder free, top priority Grand Warden28→29 / Queen48→49 / Army Camp10→11 subject to resources and Hall max. Keep Hero Hall as hub, not another upgrade worker. Builder Base jobs and B.O.B path separate.
7. Hero Equipment Eternal Tome8→9 may use ores independently (no timed worker); don't assume affordable from manually saved ore. Check full buildings and traps grouped under expandable audit, including passive structures that have no worker task.
8. On import of a NEWER JSON confirm all current lanes update and free-builder popup uses current prioritized Hero/building suggestions, not stale roadmap entries. Identical snapshot must not re-open. Ensure manual inventory, rewards, currencies and other profiles remain unchanged.
9. Verify the Build button tabs for Building and Heroes, Army Upgrades, Hero Equipment, Hero Pets. Save Android screenshots and redacted diagnostics if the game says unavailable despite suggestion. Automated GitHub browser CI does NOT constitute Android confirmation.

## V21 Android acceptance — compact command center
1. Open https://auxz2jz.github.io/Slot-22/?v=21 and download backup. Do not use GitHub Load to update the app. Overview should show manual saved resources and seven compact queue cards, not all the old expanded panels.
2. Tap Home Builders, Laboratory, Pet House, Builder Base Builders, Star Laboratory, Blacksmith and Helper Hut. Check each current timer and next suggestion; both builder and lab assistants have cooldowns. Pet queue shows active Electro Owl 2→3 and recommends subsequent pet, NOT restarting Owl.
3. Open Find any building: select Spell Factory6→7 (building upgrade active, linked to Home Laboratory Freeze Spell research), Hero Hall7 (Heroes use a builder), Pet House3→4 (pet research separate), Dark Spell Factory (also shares Home Lab), Blacksmith (ore upgrades), or a specific spell/troop/pet. Each opens detail in dialog with current status, next steps and optional price/time quote.
4. Record a test quote on one building and confirm resources do not change. Select confirmed 20% Builder/15% Research; source base quotes should discount once, already discounted game prices should NOT. Optionally select user-verified 50% returning-player effective boost and verify it is not stacked twice; its expiry is unknown unless user records it elsewhere.
5. Reference Oct17 game-data covers 21 owned/high-priority types but not every game item; missing prices/times must remain explicit. Verify actual prices and unlock requirements in Clash and report discrepancies with screenshots.
6. Import a newer game JSON and confirm changed active queues / priorities; the same imported snapshot should not repeatedly prompt. Check advanced panels stay collapsed and legacy roadmap/rewards/tools remain available. Mobile device acceptance is pending.


## V28 Samsung test — draw and resize screenshot resource box
1. Open Scan resources for the intended account, select a Home Village screenshot; expected: original image, gold adjustable rectangle and enlarged crop appear. Neither loading nor box movement changes saved balances.
2. Use a finger to draw a tight rectangle around all upper-right resources, move it by dragging inside, and resize via bottom-right handle. Expected: enlarged crop follows the final selection. Scroll the screenshot pane horizontally if needed.
3. Set Read which counter? to Only Gold, draw a tight box around the GOLD NUMBER (not max storage), tap Read Home Village screenshot. Expected: ONLY Gold gets a suggested value. If OCR finds multiple/zero numbers, it refuses to guess and you can edit the field manually.
4. Select other counters individually as needed. Switch to Builder Base and use its screenshot and counter names. Confirm saved balances remain unchanged throughout scanning.
5. Verify exact displayed digits; check only intended rows; tap Save checked balances. Expected: only those balances update locally in the active profile. Conflicting checked Gems must be rejected. Never tap GitHub Load just to refresh the UI.
6. Choose a new screenshot with same aspect ratio; box position should be recalled. Reset box to upper right should restore the default. Compare preview against selected numbers and report any touch/zoom/OCR mismatch. Automated tests cannot PASS this physical phone inspection.


## V29 real Home HUD digit recognition (pending Samsung visual check)
1. On the Samsung phone open the newly released v29 app (not GitHub Load). Select the intended Clash player account and **Scan resources**.
2. Choose the full original Home Village screenshot showing all four top-right counters; tap **Auto-read the four Home counters**. Feature requires landscape game screenshot and may reject a cropped/rotated image.
3. Inspect the four newly shown independent Gold/Elixir/Dark/Gems number-only crop previews. For the supplied 1536×716 reference, displayed image numbers are 19,000,000 / 5,943,020 / 310,000 / 4,182. Do not assume a newer screenshot has the same balances.
4. Verify each proposed amount character by character. If one crop is wrong or blank, use existing draw-box plus an individual counter selection and optional **Bright white game digits** filter. Zero/multiple OCR candidates must stay unselected; never guess a missing number from its row order.
5. Confirm that scanning alone has not changed resources; only check correct rows and tap **Save checked balances** if desired. Check other profile, rewards, magic items unchanged. Never GitHub Load to obtain v29.
6. Repeat Builder Base using its separate screenshot and manual box until actual Builder HUD layout is supplied. Samsung touch/UI success and real OCR reading are MANUAL acceptance steps not established by CI.


## V30 Gold-specific OCR acceptance — real Samsung phone
1. Confirm intended player profile, open Scan resources on v30 and select the same full Home Village screenshot.
2. Tap Auto-read the four Home counters. Verify Elixir, Dark Elixir and Gems unchanged compared with v29 behavior. Gold now uses word-mode OCR twice and cross-checks enhanced versus original crop.
3. Expand Recognized text and numbers and inspect "Gold bright" and "Gold original". Both must report the same whole amount for Gold to be automatically checked. If they disagree, Gold must remain unchecked; manually correct Gold and check the desired row before saving.
4. Verify the previous user screenshot's Gold visibly reads 19,000,000, but do not assume newer screenshots have the same amount. No auto-save: confirmation still required. Check both profiles and Magic Items/rewards untouched before Save checked balances.
5. If automatic Gold still misreads or is rejected, report both Gold recognized strings and the crop screenshot. This is physical Android user acceptance, not established by passing CI.


## V31 Base Layouts on Samsung phone — manual acceptance
1. For the main account, open **Base layouts** from its navigation tab or the Overview shortcut. Confirm **TH14** Home and **BH9** Builder cards, and no guessed win-rate claims.
2. Choose one Home Farming/Hybrid link and tap **Open in Clash of Clans**. Android should hand off to the installed game, offering a compatible Home layout slot. **Use a spare slot**, not the active base, and review all buildings/traps. Return to planner without saving if it looks incomplete.
3. Choose **TH14 War** layout and confirm it is a **War Base** slot, not a Home slot. No game base may be overwritten without user approval in game.
4. Try a BH9 Builder layout and check the Builder Base stage placement and incompatible/missing structures; the code is a real `TH9:BB2` Builder Base share link despite the unusual prefix.
5. Test **Copy layout link** then paste into a browser/notes field; it should be the exact official https link. Verify no balance, roadmap, rewards, other profile, or phone-only state changed from browsing/copying.
6. Change the planner's selected account to the lower-level second account; correct TH4 options appear and incompatible TH14/BH9 links disappear. Early BH1 must not receive BH9 import links. If the phone account is more recently upgraded, imported hall levels override old seed ones.
7. If a layout fails, record the link/card title, the game's precise error, Android steps and its hall level. CI cannot verify that the installed Clash client imported or saved a layout.


## V32 Base Layouts — all level selectors, previews, and Android handoff
1. Open the app using current selected account. Base layouts should default to the account's imported TH/BH levels (the repository's older seed has Main TH14/BH9, second TH4/BH1, but phone local state may be newer).
2. Each card with a thumbnail must show the **same** layout as its credited publisher page and official OpenLayout link. If an image is missing, record its Hall and source URL; do not assume a generic picture identifies the base. Online connection required for thumbnail loading.
3. Use Home Hall selector to browse TH1 and TH2: beginner guidance only, no fake game import. TH3: source link only if no confirmed direct layout. Browse every level TH4–TH18: at least one actual preview plus a link for a compatible Home/War slot. Check the slot type, which can be Home even if the publisher describes its strategy as war.
4. Similarly browse Builder Hall BH1 and BH2 guidance, BH3 source link, and BH4–BH10 at least one preview/official BB2 link. Check BH10 opens Builder Base appropriate stage/slot.
5. Browse TH18/BH10 from a TH14/BH9 player profile, then return selectors to My account level. No balances, progression, saved account level, upgrade task, Magic Items, rewards, other profiles or GitHub data change.
6. On Samsung tap selected 'Open in Clash of Clans' card, review the layout in game, select an **unused** compatible slot and confirm only after checking buildings. Uninstalled game/unsupported level may block. Layout deep-link import is distinct from a building upgrade; no external link can guarantee opening Barracks' upgrade UI.
7. Review on normal narrow-screen Android and landscape display. CI checks code and browser rendering, not successful installed-Clash Android acceptance.
