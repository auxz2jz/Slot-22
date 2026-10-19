# Slot-22 project instructions

Canonical standards: https://github.com/auxz2jz/master-instruction-library

Before coding read INSTRUCTION_INDEX.md, CORE_DEVELOPMENT_RECOVERY_RULES.md, DIAGNOSTICS_STANDARD.md, GUIDED_TESTING_STANDARD.md, CODEX_USAGE_EFFICIENCY_STANDARD.md and the relevant cross-platform standard if adding native clients.

Read ROADMAP.md and docs/CODEX_HANDOFF.md to recover last state. Keep atomic independent tasks (2–5 minutes when reasonable), verify each with targeted tests, and checkpoint. Preserve the known-good source and report user-verified vs CI-verified separately. Usage telemetry unavailable must not be guessed.

## User state & security
Repository Slot-22 is PUBLIC. Never commit GitHub access tokens, credentials or unrelated private information. The optional GitHub sync writes public game status using a fine-grained user token restricted to this repository; tokens stay only in a transient password input and may disappear on tab navigation.

The in-game export includes building/troop/spell data, but NOT currency, Magic Items, event rewards, or the exact base layout. New exports update only the village snapshot; NEVER overwrite manually tracked currencies and items.

The canonical remote state for user-confirmed updates is data/player-state.json. Respect newer remote changes; don't overwrite other-device edits. For any proposed roadmap changes, fetch latest state, make minimal updates and preserve statuses, inventories, and history.

Never imply automatic Supercell account syncing. Timers are dated snapshots, and cost/timer estimates are not guaranteed. In-game prices take precedence. Preserve Gems by default.

Code map: index.html app shell; app.js UI and GitHub sync; core.mjs pure helpers; catalog.mjs named IDs; styles.css responsive theme; data/player-state.json starting baseline. Tests: node --test tests/*.test.mjs. Diagnostics in docs/DIAGNOSTICS.md and guided testing in docs/GUIDED_TESTING.md.

Do not claim GitHub Pages deployed until actually verified. Owner may need Settings > Pages > Deploy from a branch > main / (root).
