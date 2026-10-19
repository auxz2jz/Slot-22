# Clash Village Planner — Slot-22

A mobile-first, installable static web app to track your Clash of Clans **Town Hall 14** and **Builder Hall 9** villages, building/hero/pet/troop/spell upgrades, Magic Items, currencies, Loot Cart, and a personalized upgrade roadmap.

**Repository:** https://github.com/auxz2jz/Slot-22

**Website (after enabling GitHub Pages):** https://auxz2jz.github.io/Slot-22/

> Status: v0.1.0 **candidate**. Automated syntax and unit tests pass. GitHub Pages deployment and real Android visual testing have not yet been confirmed. The app is independent fan software and does not directly connect to Supercell servers.

## First setup: enable the website
1. Open [Slot-22 on GitHub](https://github.com/auxz2jz/Slot-22).
2. Go to **Settings → Pages**.
3. Under **Build and deployment → Source**, select **Deploy from a branch**.
4. Choose **main** and **/(root)**; press **Save**.
5. Wait for GitHub's published-site notice, then open **https://auxz2jz.github.io/Slot-22/** in Chrome on Android.
6. Optionally choose Chrome **Add to Home screen** to install it like an app.

The site works locally after initial loading; the service worker caches only static app files, never account data. GitHub sync requires internet.

## How to use
1. The initial baseline comes from the player's exported game JSON, October 18 2026. Review all balances before relying on them: user-reported currency and item counts can change between exports.
2. On the **Overview** tab, edit Home Gold/Elixir/Dark Elixir, Gems, Builder Gold/Elixir, and Loot Cart reserves. Changes save locally on this browser.
3. Under **Magic Items & ores**, edit Books, Runes, Wall Rings, Potions, Shovels, and Shiny/Glowy/Starry Ore.
4. Under **Upgrade roadmap**, mark a step **planned**, **active**, **done**, or **skipped**; add your own upgrades and notes.
5. Use **Import JSON** to select a new game export from Clash of Clans. The app updates the Home and Builder Base inventory, hero/troop/pet/spell/equipment levels and dated timers, while leaving manually tracked currency/items untouched.
6. Use **↓ Backup** regularly. A planner backup is a separate JSON that includes everything (unlike the in-game village export).

## Optional sync: save your planner in GitHub
This repository is **PUBLIC** and the app's saved data file is public at [data/player-state.json](data/player-state.json), including the player's tag, balances, Magic Item quantities and roadmap. **Do not publish any information you want kept private.**

The web app cannot borrow ChatGPT's GitHub connector or silently sign into GitHub. To save from the phone:
1. In GitHub settings, create a **fine-grained personal access token** limited to **auxz2jz/Slot-22** with **Contents: Read and write** permission. Do not grant broader repo access.
2. Open the app's **GitHub & backups** screen and paste the token in the password field.
3. Press **Save to GitHub** and accept the public publishing notice. The app writes one JSON file on the main branch using GitHub's REST Contents API. It checks for remote edits before saving.
4. On another device, open the same app, enter the token, and choose **Load from GitHub**. This replaces local planner state only after confirmation.
5. The app does not persist the token to localStorage, source, or export files. You may need to enter it again when navigating away or reopening.
6. If there is a conflict, download a local backup, load current GitHub state, then reconcile changes; **never force overwrite unreviewed changes**.

**Alternative:** You can ask ChatGPT to update the roadmap or state file through your connected GitHub app. The planner and ChatGPT do not continuously auto-synchronize, so use **Load from GitHub** afterward if a change was made externally.

## Automated verification
GitHub Actions workflow: [Verify static web app](.github/workflows/verify.yml). It executes Node JavaScript syntax checks, `node --test tests/*.test.mjs`, and verifies game-data schema. Additional manual browser testing is defined in [Guided testing](docs/GUIDED_TESTING.md) and [Diagnostics](docs/DIAGNOSTICS.md).

## Future development
See [ROADMAP.md](ROADMAP.md), [AGENTS.md](AGENTS.md), [Handoff](docs/CODEX_HANDOFF.md). Required shared rules are in [master-instruction-library](https://github.com/auxz2jz/master-instruction-library). Next priority: enable GitHub Pages and user-test on Android.

## Important limitations
- There is **no automatic game synchronization**; re-import the current JSON when the game changes.
- The export does **not** contain Gold/Elixir/Dark Elixir balances, Magic Items, ore totals, event rewards, or precise layout coordinates; enter those manually.
- Upgrade costs shown in the roadmap are provisional, subject to in-game event discounts and game patches.
- GitHub Pages is public and not a private account database.
- The app never spends Gems or in-game items or starts an actual game upgrade; it is a tracker and guide.

## Multiple Clash accounts (v0.2.0)

You can track up to 20 separate Clash of Clans profiles in the **same web app**. At the top of the screen, choose an account from the **Account** selector. Tap **Rename** to give it a friendly label (Main, Mini, etc.).

To add another account:
1. Open that account in Clash of Clans and export/copy its village JSON.
2. In the planner, select **+ Import / Add account**, and choose the JSON file.
3. Confirm the new player tag. A separate profile is created and selected.
4. The new profile starts with **zero manually recorded resources/Magic Items and an empty roadmap**, because those values are not available in the game export. Enter its actual amounts and create roadmap entries for it.
5. To update an existing profile, import a newer JSON containing its **same player tag**. Its manual balances, Magic Items, and roadmap are preserved.

**Switching profiles does not mix resource balances or upgrades.** The old v1 saved account and v1 backup files migrate automatically into the v2 multi-profile format without deleting the original local storage backup key. The GitHub saved file `data/player-state.json` now stores all account profiles together, including the original #QVLP9RVV snapshot.

Editable numerical balances (including resources, ores and Magic Items) use grouped commas, for example **17,000,000**, and are saved as numbers after an edit. Labels in the upgrade timeline now separate upgrade level from category.

**Privacy:** GitHub sync publishes **every account** in the saved bundle together to your PUBLIC Slot-22 repository. Local changes on each browser remain local until you explicitly choose **Save to GitHub**. **Load from GitHub** replaces the full set of local profiles only after confirmation; download a local all-profiles backup first if you have unpublished changes.

**Verification:** GitHub Actions browser startup smoke run 39190994116 verified entering 1,200,000, creating a second account, zero starting balances, original-account balance preservation, switching back, and no JavaScript errors. Android user confirmation is still needed.
