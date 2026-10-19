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

## Version 2 profile format
The GitHub snapshot `data/player-state.json` is now **one v2 bundle** with fields `schemaVersion:2`, `activeProfileId`, and `profiles` keyed by each user's Clash player tag. Each nested profile remains `schemaVersion:1` with independent `resources`, `items`, `roadmap`, `export`, `history`, and `displayName`. The previous local v1 key and v1 JSON backups migrate through `normalizeBundle`, without overwriting manual amounts. Maintain compatibility and never silently overwrite/remove another profile when ChatGPT edits the upgrade plan. For account-specific requests, update only the matching `profiles['#TAG']` object; never reset `activeProfileId` or other accounts unless explicitly asked. GitHub sync publishes the complete bundle publicly, so warn if user adds accounts.

## Interactive Command Center (v0.3)
Experience calculations reside in experience.mjs; dashboard HTML in dashboard.mjs. Existing app.js controls state and confirmed actions. Upgrade progress bars represent time since last snapshot, not total build completion. Resource capacity must be user-provided; keep unknown rather than guessing. Never automatically spend player resources or Gems. Only a planned affordable known-cost non-Gem task may be marked active and deducted after explicit user confirmation. Preserve profile bundle, manual GitHub sync, sources, data, and all diagnostics and guided test instructions. New UI is not user-verified until Android visual test.

## October reward notebook update
The per-player event editor now lives in pass-rewards.mjs. User-reported original 49 main-profile prize positions are fixed defaults but may be corrected with seasonalPlan.rewardOverrides. New Event/Silver/Gold positions belong only to seasonalPlan.customRewards for the selected profile, and claims remain seasonalPlan.claims. Each choose-one position requires selecting exactly ONE reward before marking claimed. Edits or toggling claims must NEVER change resource balances or real Magic Item holdings. The Magic Items tab permits numbers larger than ordinary storage capacity; they are manually reported actual amounts, not unclaimed rewards. Keep mobile localStorage edits intact; remote GitHub load remains explicit and may overwrite unsynced changes.
