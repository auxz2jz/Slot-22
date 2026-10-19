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
