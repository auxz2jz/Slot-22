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
