# Game data, GitHub sync, API keys, and Helper Hut routine

## Three different keys and connections

1. **GitHub fine-grained personal access token**: for the browser planner's existing GitHub & backups -> Save to GitHub and Load from GitHub controls. Restrict the token to user-owned repo `auxz2jz/Slot-22`, repository permissions **Contents: Read and write**, short expiry, with no unrelated permissions. It is typed into a transient password field, **not stored** in game JSON, code, backups, localStorage, or GitHub. **Never paste a token into chat.** The repo is PUBLIC, so resources, item inventory, event claims, player tags, and full village export are publicly readable if synchronized. Do not overwrite newer remote data or unsynced local work: download local backup before choosing Load, then reconcile.
2. **Official Clash of Clans developer API key**: unrelated to GitHub. Created at https://developer.clashofclans.com/; only retrieves the developer API's permitted public player information. Must remain on a server/backend with secure outbound IP allowlisting; a static public GitHub Pages web app cannot safely include this key. No developer API integration is installed yet. No key obtained or requested from the user in chat.
3. **In-game Settings -> More Settings -> API Token -> Show**: player ownership **verification token**. It is neither a GitHub token nor the developer API key and is not required for importing exported village JSON. The user's Show control may be malfunctioning after the recent game UI change; defer, it does not block the manual workflow.

## What the Clash village JSON provides
A dated, local game snapshot with full lists of `helpers`, `buildings`, `traps`, `heroes`, `units`, `siege_machines`, `spells`, `pets`, `equipment`, `buildings2`, `traps2`, `units2`, `heroes2`, `obstacles`, `obstacles2`, `decos`, `decos2`, `boosts`, `house_parts`, `skins`, `sceneries`, `skins2`, and `sceneries2`, as available in a given version. Preserve entire original object, including unknown fields, in the selected account. Use known IDs for upgrades/timers, Helper Hut levels, walls, hero/equipment progression, trophy/boost hints when present, B.O.B. milestones, and capacity from storages+Halls. Don't invent labels for unknown IDs.

**Not supplied by the village JSON or current public developer API:** actual Gold/Elixir/Dark Elixir/Gems holdings, Magic Items, current Gold Pass reward claims, choice-node selections. These are manual in separate resource, inventory, and event tabs. Helpers can lack assignment/available-again/cooldown data even when levels appear; always verify in game.

## Recommended user workflow

1. In-game Clash Settings, create a fresh **Copy Village JSON / Full Village Export** as available. You do not need the in-game API Token Show button.
2. In Slot-22, choose **Import / Add account**, select the game JSON; existing account import preserves manual balances, items, reward claims, and roadmap. Recomputes capacity, reveals snapshot/changes, B.O.B. and helper levels.
3. Review **JSON insights & helpers** for complete dated snapshot and **Upgrade roadmap** for actionable next steps. Recurring Helper Hut routines are automatically added if absent, without spending Gems or altering existing work.
4. Update manually held resources, Book/Rune/Potion counts and actual claimed either/or prizes. Helpers are operated inside Clash, not by the app.
5. Download a **full planner backup** before synchronizing. Use **GitHub & backups** > restricted PAT > **Save to GitHub** only after reviewing public disclosure and remote conflicts. Never blind-load stale GitHub state over your newer phone edits.
6. On later visits, ask ChatGPT to review the current remote Slot-22 state and update the roadmap. If changes exist only on the phone, first GitHub Save or give the assistant the backup and explicitly authorize updates.

## Helper Hut routine (repeat after each available shared workday)

- Builder's Apprentice, present in original snapshot L7: assign to longest worthwhile Home builder upgrade while it is running.
- Lab Assistant, L8: assign to Home Village Laboratory research (never Star Laboratory or Pet House).
- Helper ID 93000002, L3, likely Alchemist: confirm identity in game; convert surplus resources only when storage can fit the output.
- Prospector: Gold Pass bought, but **not confirmed activated** by October 18 export. Check pass perk; if unlocked, convert unneeded ore toward equipment bottleneck. No Gem expenditure.
- All share a game-defined workday/cooldown; snapshot does not reliably contain their current availability. The tracker must not claim that a helper was automatically assigned or used. Repeat roadmap tasks rather than permanently finishing them.

## Planned developer API integration (not implemented)
Add only a secure read-only backend if the user requests setup and can provide the required developer account credentials through a secure connection. Fetch only authorized public player fields and report the date/source of each field. Merge API-derived and manually imported snapshots by source and timestamp, *never* replace buildings/timers, item inventory, reward choices, or roadmap status with incomplete API data. Add tests and manual recovery. Respect API key IP restrictions; GitHub Pages alone cannot protect a developer key.
