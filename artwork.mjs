// Community-hosted visual references for this noncommercial Supercell fan guide.
// Source: https://github.com/ClashKingInc/ClashKingAssets
// Credit and Supercell fan-content disclaimer are displayed on the website.
// These IDs and names are not a replacement for the user's game export.
const BASE='https://assets.clashk.ing/';
const ALLOWED={
  home:new Set(`air_defense air_sweeper archer_tower army_camp barracks blacksmith bomb_tower builder's_hut cannon clan_castle dark_barracks dark_elixir_drill dark_elixir_storage dark_spell_factory eagle_artillery elixir_collector elixir_storage firespitter gold_mine gold_storage hero_hall hidden_tesla inferno_tower laboratory monolith mortar multi-archer_tower multi-gear_tower pet_house revenge_tower ricochet_cannon scattershot spell_factory spell_tower super_wizard_tower town_hall wall wizard_tower workshop x-bow`.split(' ')),
  homeTraps:new Set('air_bomb bomb giant_bomb giga_bomb seeking_air_mine skeleton_trap spring_trap tornado_trap'.split(' ')),
  builderTraps:new Set('mega_mine mine push_trap spring_trap'.split(' ')),
  builder:new Set(`air_bombs archer_tower bob_control builder_barracks builder_hall cannon clock_tower crusher double_cannon elixir_collector elixir_storage firecrackers gem_mine giant_cannon gold_mine gold_storage guard_post healing_hut hidden_tesla lava_launcher mega_tesla multi_mortar otto's_outpost roaster star_laboratory wall x-bow`.split(' ')),
  spells:new Set(`angry_spell bag_of_frostmites bat_spell birthday_boom clone_spell earthquake_spell freeze_spell haste_spell healing_spell ice_block_spell invisibility_spell jump_spell lightning_spell overgrowth_spell poison_spell rage_spell recall_spell revive_spell santa's_surprise skeleton_spell totem_spell yellow_card`.split(' ')),
  equipment:new Set(`action_figure archer_puppet barbarian_puppet dark_crown dark_orb earthquake_boots electro_boots electro_fangs eternal_tome fire_heart fireball flame_blower frost_flake frozen_arrow giant_arrow giant_gauntlet haste_vial healer_puppet healing_tome henchmen_puppet heroic_torch hog_rider_puppet invisibility_vial lavaloon_puppet life_gem magic_mirror metal_pants meteor_staff monolith_arrow noble_iron rage_gem rage_vial revenge_deck rocket_backpack rocket_spear royal_gem seeking_shield snake_bracelet spiky_ball stick_horse stun_blaster vampstache`.split(' ')),
  heroes:new Set(`archer_queen barbarian_king battle_copter battle_machine dragon_duke grand_warden minion_prince royal_champion`.split(' ')),
  pets:new Set(`angry_jelly diggy electro_owl frosty greedy_raven lassi mighty_yak phoenix poison_lizard sneezy spirit_fox unicorn`.split(' ')),
  troops:new Set(`apprentice_warden archer azure_dragon baby_dragon balloon barbarian barbarian_kicker barcher battle_blimp battle_drill battle_ram beta_minion bomber bowler boxer_giant broom_witch cannon_cart cookie debt_collector dragon dragon_rider drop_ship druid electro_dragon electro_titan electrofire_wizard elephant_rider firecracker flame_flinger furnace giant giant_giant giant_skeleton giant_thrower goblin golem headhunter healer hog_glider hog_rider hog_wizard ice_golem ice_hound ice_minion ice_wizard inferno_dragon kane lava_hound lavaloon log_launcher mecha meteor_golem miner minion night_witch party_wizard pekka power_pekka pumpkin_barbarian raged_barbarian ram_rider rocket_balloon root_rider royal_ghost ruin_witch siege_barracks skeleton_barrel sky_wagon snake_barrel sneaky_archer sneaky_goblin stone_slammer super_archer super_barbarian super_bowler super_dragon super_giant super_hog_rider super_miner super_minion super_valkyrie super_wall_breaker super_witch super_wizard super_yeti the_disarmer thrower troop_launcher valkyrie wall_breaker wall_wrecker witch witch_golem wizard yeeter yeti yeti_undertaker`.split(' ')),
  magic:new Set(`book_of_building book_of_everything book_of_fighting book_of_heroes book_of_spells builder_potion builder_star_jar clock_tower_potion hammer_of_building hammer_of_fighting hammer_of_heroes hammer_of_spells hero_potion pet_potion power_potion research_potion resource_potion rune_of_builder_elixir rune_of_builder_gold rune_of_dark_elixir rune_of_elixir rune_of_gold shovel_of_obstacles super_potion training_potion wall_ring`.split(' ')),
  resources:new Set(`builder_elixir builder_gold capital_gold dark_elixir elixir gems glowy_ore gold shiny_ore starry_ore`.split(' '))
};
const normal=name=>String(name||'').toLowerCase().replace(/\./g,'').replace(/[’]/g,"'").replace(/[^a-z0-9' -]+/g,'').trim().replace(/ +/g,'_');
// Do not show a wrong image just because a name resembles a different unit.
const SPECIAL={home:{"builder_hut":"builder's_hut","x_bow":"x-bow"},builder:{"builder_cannon":"cannon","builder_wall":"wall","builder_gold_storage":"gold_storage","builder_elixir_storage":"elixir_storage","bob_control":"bob_control","x_bow":"x-bow"},troops:{"pekka":"pekka"},pets:{"lassi":"lassi"}};
function slugFor(type,name){
  const slug=normal(name);
  return SPECIAL[type]?.[slug]||slug;
}
function validLevel(value){return Number.isInteger(Number(value))&&Number(value)>=1&&Number(value)<=30;}
/**
 * Returns a real community-hosted Clash of Clans image URL only when the
 * item is a known match. Unrecognized export IDs remain text/fallback.
 */
export function artworkUrl(category,name,level){
  let kind=null;
  if(category==='buildings')kind='home';
  else if(category==='buildings2')kind='builder';
  else if(category==='traps')kind='homeTraps';
  else if(category==='traps2')kind='builderTraps';
  else if(category==='heroes'||category==='heroes2')kind='heroes';
  else if(category==='pets')kind='pets';
  else if(category==='units'||category==='units2'||category==='siege_machines')kind='troops';
  else if(category==='spells')kind='spells';
  else if(category==='equipment')kind='equipment';
  else if(category==='magicItem')kind='magic';
  else if(category==='resource')kind='resources';
  if(!kind||String(name||'').startsWith('Unknown ID'))return null;
  const key=slugFor(kind,name);
  if(kind==='home'||kind==='builder'){
    if(!validLevel(level)||!ALLOWED[kind].has(key))return null;
    return BASE+'buildings/'+(kind==='home'?'home-village':'builder-base')+'/'+key+'/level_'+Number(level)+'.webp';
  }
  if(kind==='homeTraps'||kind==='builderTraps'){
    if(!validLevel(level)||!ALLOWED[kind].has(key))return null;
    return BASE+'traps/'+(kind==='homeTraps'?'home-village':'builder-base')+'/'+key+'/level_'+Number(level)+'.webp';
  }
  if(kind==='troops'||kind==='heroes'||kind==='pets'){
    if(!ALLOWED[kind].has(key))return null;
    return BASE+kind+'/'+key+'/icon.webp';
  }
  if(kind==='magic'||kind==='resources'||kind==='spells'||kind==='equipment'){
    if(!ALLOWED[kind].has(key))return null;
    return BASE+(kind==='magic'?'magic_items':kind)+'/'+key+'.webp';
  }
  return null;
}
export const artForResource = key => {
  const lookup={gold:'Gold',elixir:'Elixir',dark:'Dark Elixir',gems:'Gems',builderGold:'Builder Gold',builderElixir:'Builder Elixir',cartGold:'Gold',cartElixir:'Elixir',cartDark:'Dark Elixir',shiny:'Shiny Ore',glowy:'Glowy Ore',starry:'Starry Ore'};
  return artworkUrl('resource',lookup[key]);
};
export const imageCredit = 'Icons courtesy of ClashKing Assets; game imagery belongs to Supercell.';
