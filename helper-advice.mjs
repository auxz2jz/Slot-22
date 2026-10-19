// Read-only helper action recommendations from a dated Clash village export.
// Every helper shares a 23h workday reset, but each can work once within it.
// A helper listed without usage/cooldown fields is NOT confirmed available.
// Resources and ore are user-entered, possibly stale: no speculative transfers.
import {labelFor} from './catalog.mjs';
import {helperSummary} from './snapshot-insights.mjs';
const HELPER_IDS={builder:93000000,lab:93000001,alchemist:93000002,prospector:93000003};
const homeJobs=x=>[...(x?.buildings||[]),...(x?.heroes||[]),...(x?.traps||[])]
 .filter(r=>Number.isFinite(r.timer)&&r.timer>0&&Number.isFinite(r.data))
 .sort((a,b)=>b.timer-a.timer);
const homeResearch=x=>[...(x?.units||[]),...(x?.spells||[]),...(x?.siege_machines||[])]
 .filter(r=>Number.isFinite(r.timer)&&r.timer>0&&Number.isFinite(r.data))
 .sort((a,b)=>b.timer-a.timer);
export function helperActionRecommendations(profile){
 const x=profile?.export;
 if(!x||!Number.isFinite(x.timestamp))return [];
 const seen=helperSummary(x);
 const shared=seen.find(h=>Number.isFinite(h.cooldownSeconds));
 const resetAt=shared?.snapshotEnd??null;
 const workdayNote=resetAt===null?'Shared 23-hour workday reset not included in JSON.':
  'Shared 23-hour workday reset estimated from snapshot. Verify in Helper Hut; another helper may still be unused.';
 const jobs=homeJobs(x),labs=homeResearch(x);
 return seen.map(h=>{
  const common={id:h.id,name:h.name,level:h.level,cooldownEnd:h.snapshotEnd,
   resetAt,workdayNote,assignment:h.assignment,
   availability:'verify',action:'Check Helper Hut',location:'Home Village → Helper Hut',
   note:'This JSON does not show whether this helper has already worked during the current day.'};
  if(h.id===HELPER_IDS.builder){
   const best=jobs[0];
   const onCooldown=Number.isFinite(h.cooldownSeconds)&&h.cooldownSeconds>0;
   return {...common,availability:onCooldown?'cooldown-recorded':'verify',
    target:best?labelFor(best.data)+' (Lv '+best.lvl+')':'No active Home Village upgrade in snapshot',
    action:best?(onCooldown?'When next available, assign Builder’s Apprentice to '+labelFor(best.data):
      'If unused this workday, assign Builder’s Apprentice to '+labelFor(best.data)):
      'Wait until a Home Village building or hero upgrade starts',
    note:onCooldown?'This helper has a recorded cooldown. Do not assign it again until the game allows; confirm in Helper Hut.':
      'No personal cooldown is reported. Check availability in game before assigning.',
    detail:best?{kind:'construction',id:best.data,level:best.lvl,seconds:best.timer}:null};
  }
  if(h.id===HELPER_IDS.lab){
   const best=labs[0];
   return {...common,
    target:best?labelFor(best.data)+' (Lv '+best.lvl+')':'No active Home Laboratory research in snapshot',
    action:best?'If unused today, assign Lab Assistant to '+labelFor(best.data):
      'Start Home Laboratory research before assigning Lab Assistant',
    note:'This assistant works on Home Laboratory research only, not Star Laboratory or pets. Individual usage is not included in the snapshot.',
    detail:best?{kind:'research',id:best.data,level:best.lvl,seconds:best.timer}:null};
  }
  if(h.id===HELPER_IDS.alchemist){
   return {...common,name:'Alchemist (verify in game)',target:'Gold, Elixir or Dark Elixir conversion',
    action:'If unused, compare current storage and upgrade costs; convert only genuinely surplus resources.',
    note:'Check in-game balances, exchange rate and destination storage. The village JSON has no current resource balances. No automatic conversion.'};
  }
  if(h.id===HELPER_IDS.prospector){
   const ore=profile.resources||{};
   const amounts=['shiny','glowy','starry'].every(k=>Number.isFinite(ore[k]))?
    ' Saved planner ore (may be stale): '+ore.shiny+' Shiny, '+ore.glowy+' Glowy, '+ore.starry+' Starry.':'';
   return {...common,name:'Prospector (verify Gold Pass unlock)',target:'Equipment ore conversion',
    action:'If unlocked and unused, convert ore only for a specific Hero Equipment upgrade shortage.',
    note:'Gold Pass Prospector unlock/use must be checked in-game; never automatically trade scarce Starry Ore.'+amounts};
  }
  return {...common,target:'Unknown helper type',action:'Verify this helper’s identity and availability in the game'};
 });
}
