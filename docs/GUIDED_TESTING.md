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
