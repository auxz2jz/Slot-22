// Clash Village Planner - game data ID mapping.
// Add unknown IDs as new game content appears; display raw IDs rather than guessing.
export const names = {
  1000000:"Army Camp",1000001:"Town Hall",1000002:"Elixir Collector",1000003:"Elixir Storage",
  1000004:"Gold Mine",1000005:"Gold Storage",1000006:"Barracks",1000007:"Laboratory",
  1000008:"Cannon",1000009:"Archer Tower",1000010:"Wall",1000011:"Wizard Tower",
  1000012:"Air Defense",1000013:"Mortar",1000014:"Clan Castle",1000015:"Builder’s Hut",
  1000019:"Hidden Tesla",1000020:"Spell Factory",1000021:"X-Bow",1000023:"Dark Elixir Drill",
  1000024:"Dark Elixir Storage",1000026:"Dark Barracks",1000027:"Inferno Tower",1000028:"Air Sweeper",
  1000029:"Dark Spell Factory",1000031:"Eagle Artillery",1000032:"Bomb Tower",
  1000059:"Workshop",1000067:"Scattershot",1000068:"Pet House",1000070:"Blacksmith",
  1000071:"Hero Hall",1000093:"Helper Hut",1000097:"Crafted Defense",
  28000000:"Barbarian King",28000001:"Archer Queen",28000002:"Grand Warden",
  28000003:"Battle Machine",28000004:"Royal Champion",28000005:"Battle Copter",
  28000006:"Minion Prince",
  73000000:"L.A.S.S.I",73000001:"Mighty Yak",73000002:"Electro Owl",73000003:"Unicorn",
  4000000:"Barbarian",4000001:"Archer",4000002:"Goblin",4000003:"Giant",4000004:"Wall Breaker",
  4000005:"Balloon",4000006:"Wizard",4000007:"Healer",4000008:"Dragon",
  4000009:"P.E.K.K.A",4000010:"Minion",4000011:"Hog Rider",4000012:"Valkyrie",
  4000013:"Golem",4000015:"Witch",4000017:"Lava Hound",4000022:"Bowler",
  4000023:"Baby Dragon",4000024:"Miner",4000053:"Yeti",4000058:"Ice Golem",
  4000059:"Electro Dragon",4000082:"Headhunter",
  4000051:"Wall Wrecker",4000052:"Battle Blimp",4000062:"Stone Slammer",
  4000075:"Siege Barracks",4000087:"Log Launcher",
  26000000:"Lightning Spell",26000001:"Healing Spell",26000002:"Rage Spell",
  26000003:"Jump Spell",26000005:"Freeze Spell",26000009:"Poison Spell",
  26000010:"Earthquake Spell",26000011:"Haste Spell",26000016:"Clone Spell",
  26000017:"Skeleton Spell",26000028:"Bat Spell",26000035:"Invisibility Spell",
  26000070:"Overgrowth Spell",26000053:"Recall Spell",
  90000000:"Barbarian Puppet",90000001:"Rage Vial",90000002:"Archer Puppet",
  90000003:"Invisibility Vial",90000004:"Eternal Tome",90000005:"Rage Gem",
  90000006:"Royal Gem",90000007:"Seeking Shield",90000008:"Earthquake Boots",
  // ID-to-name mappings checked against the community game-export mapping (Oct 2026).
  1000033:"Builder Wall",1000034:"Builder Hall",1000035:"Elixir Collector",
  1000036:"Elixir Storage",1000037:"Gold Mine",1000038:"Gold Storage",
  1000039:"Clock Tower",1000040:"Builder Barracks",1000041:"Double Cannon",
  1000042:"Army Camp",1000043:"Hidden Tesla",1000044:"Builder Cannon",
  1000045:"Multi Mortar",1000046:"Star Laboratory",1000048:"Archer Tower",
  1000049:"Reinforcement Camp",1000050:"Firecrackers",1000051:"Guard Post",
  1000052:"Mega Tesla",1000053:"Battle Machine Altar",1000054:"Air Bombs",
  1000055:"Crusher",1000056:"Roaster",1000057:"Giant Cannon",
  1000058:"Gem Mine",1000063:"Lava Launcher",1000065:"B.O.B Control",
  1000078:"O.T.T.O's Outpost",1000080:"Battle Copter Altar",
  1000081:"X-Bow",1000082:"Healing Hut",
  // Home and Builder Base traps.
  12000000:"Bomb",12000001:"Spring Trap",12000002:"Giant Bomb",
  12000005:"Air Bomb",12000006:"Seeking Air Mine",12000008:"Skeleton Trap",
  12000016:"Tornado Trap",12000020:"Giga Bomb",
  12000010:"Spring Trap",12000011:"Push Trap",12000013:"Mine",12000014:"Mega Mine",
  // Builder Base troops.
  4000031:"Raged Barbarian",4000032:"Sneaky Archer",4000033:"Beta Minion",
  4000034:"Boxer Giant",4000035:"Bomber",4000036:"Power P.E.K.K.A",
  4000037:"Cannon Cart",4000038:"Drop Ship",4000041:"Baby Dragon",
  4000042:"Night Witch",4000070:"Hog Glider",4000106:"Electrofire Wizard"
};
export const categories = [
  ["buildings","Home buildings"],["traps","Home traps"],["heroes","Heroes"],
  ["units","Troops"],["spells","Spells"],["pets","Pets"],
  ["equipment","Hero equipment"],["siege_machines","Siege machines"],
  ["buildings2","Builder buildings"],["traps2","Builder traps"],
  ["heroes2","Builder heroes"],["units2","Builder troops"]
];
export const itemGroups = [
  ["Books",["Book of Building","Book of Fighting","Book of Spells","Book of Heroes","Book of Everything"]],
  ["Runes",["Rune of Gold","Rune of Elixir","Rune of Dark Elixir","Rune of Builder Gold","Rune of Builder Elixir"]],
  ["Potions",["Builder Potion","Research Potion","Resource Potion","Power Potion","Hero Potion","Pet Potion","Clock Tower Potion","Super Potion"]],
  ["Others",["Wall Ring","Shovel of Obstacles","Builder Star Jar","Hammer of Building","Hammer of Fighting","Hammer of Spells","Hammer of Heroes"]]
];
export const moneyKeys = [
  ["gold","Home Gold"],["elixir","Home Elixir"],["dark","Dark Elixir"],["gems","Gems"],
  ["builderGold","Builder Gold"],["builderElixir","Builder Elixir"],
  ["cartGold","Loot Cart Gold"],["cartElixir","Loot Cart Elixir"],["cartDark","Loot Cart Dark"],
  ["shiny","Shiny Ore"],["glowy","Glowy Ore"],["starry","Starry Ore"]
];
export const labelFor = id => names[id] || ("Unknown ID " + id);
