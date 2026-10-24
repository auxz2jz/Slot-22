// S22-115: Honest, resource-aware upgrade recommendations.
// No resource deductions, no in-game actions, no speculative unlocks.
// All costs are licensed reference estimates or per-player verified quotes.
// A recommendation is not proof a worker is free or the game will allow the action.
import {inventoryUpgradeRows} from './upgrade-directory.mjs';
import {labelFor} from './catalog.mjs';

export const LANE_GROUPS=Object.freeze({
 homeBuilders:['heroes','buildings','traps'],
 builderBuilders:['heroes2','buildings2','traps2'],
 homeLab:['spells','units','siege_machines'],
 starLab:['units2'],
 pets:['pets'],
 equipment:['equipment']
});
export const RESOURCE_LABELS=Object.freeze({
 gold:'Gold',elixir:'Elixir',dark:'Dark Elixir',builderGold:'Builder Gold',
 builderElixir:'Builder Elixir',shiny:'Shiny Ore',glowy:'Glowy Ore',starry:'Starry Ore'
});
const fmt=value=>Number(value).toLocaleString('en-US');
const eligible=row=>row?.status==='ready'&&row.knownCost===true&&Object.keys(row.requiredResources||{}).length>0;
const groupScore=(group,name)=>{
 if(group==='heroes')return 96;
 if(group==='heroes2')return 89;
 if(group==='pets')return 91;
 if(group==='units'||group==='spells'||group==='siege_machines')return 83;
 if(group==='units2')return 83;
 if(group==='equipment')return 71;
 if(group==='traps'||group==='traps2')return 15;
 const title=String(name||'').toLowerCase();
 if(/army camp|laboratory|hero hall|pet house|spell factory|barracks|blacksmith|workshop|clan castle|star laboratory/.test(title))return 78;
 if(/builder hall|town hall|clock tower|bob/.test(title))return 65;
 if(/gold mine|elixir collector|storage|extractor/.test(title))return 32;
 if(/wall/.test(title))return 8;
 return 46;
};
const itemKey=row=>row.group+':'+row.id+':'+row.target;
const manualRank=(plan,group,id,next)=>{
 const index=plan.findIndex(t=>t.id===id&&t.targetLevel===next);
 if(index===-1)return null;
 const task=plan[index];
 return Number.isFinite(task.weight)?task.weight+150:145-index*5;
};
// Public names and user-friendly status text are derived from input, not guessed.
export function describeCost(row){
 if(!row)return 'Cost not available';
 return row.priceText+(row.source==='game quote'?' · in-game quote':' · reference estimate');
}
export function describeShortage(row,resources={}){
 if(!row?.knownCost)return 'Cost not verified';
 if(!row.knownBalance)return 'Saved balance unavailable';
 const parts=Object.entries(row.requiredResources).filter(([key,amount])=>
  amount>Number(resources[key])).map(([key,amount])=>
   fmt(amount-Number(resources[key]))+' '+(RESOURCE_LABELS[key]||key)+' short');
 return parts.length?parts.join(' · '):'Covered by saved balances';
}
export function canBudgetFund(row,budget){
 return eligible(row)&&Object.entries(row.requiredResources).every(([key,amount])=>
   Number.isFinite(budget?.[key])&&budget[key]>=amount);
}
// The pool deliberately omits started jobs, future-after-current jobs,
// locked upgrades, and upgrade levels not represented by a verified catalog.
export function upgradePool(profile,overview,lane){
 if(!LANE_GROUPS[lane]||!profile?.export)return [];
 const groups=new Set(LANE_GROUPS[lane]);
 const actual=(overview?.queues||[]).find(q=>q.id===lane)?.next||[];
 const result=new Map();
 for(const row of inventoryUpgradeRows(profile)){
  if(!groups.has(row.group)||!eligible(row))continue;
  // Distinct rows may share the same building ID and level (multiple camps).
  const key=itemKey(row);
  if(result.has(key))continue;
  const strategic=manualRank(actual,row.group,row.id,row.target);
  const priority=strategic??groupScore(row.group,row.name);
  result.set(key,{...row,priority,title:row.name+' '+row.level+' → '+row.target,
   location:row.group,fromPlan:strategic!==null});
 }
 return [...result.values()].sort((a,b)=>b.priority-a.priority||
   (a.totalSeconds??Infinity)-(b.totalSeconds??Infinity)||a.title.localeCompare(b.title));
}
export function budgetSelections(profile,overview,lane,count=1){
 if(!Number.isInteger(count)||count<1||count>12)throw Error('Invalid number of slots');
 const candidates=upgradePool(profile,overview,lane);
 const wallet={...(profile?.resources||{})};
 const ideal=candidates.slice(0,count);
 const allocated=[],used=new Set();
 for(let i=0;i<count;i++){
  const item=candidates.find(row=>!used.has(itemKey(row))&&canBudgetFund(row,wallet))||null;
  allocated.push(item);
  if(item){
   used.add(itemKey(item));
   for(const [key,amount] of Object.entries(item.requiredResources))wallet[key]-=amount;
  }
 }
 return {candidates,best:ideal[0]||null,affordable:allocated[0]||null,
  ideal,allocated,remaining:wallet};
}
export function laneResourceRecommendations(profile,overview){
 const output={};
 for(const id of Object.keys(LANE_GROUPS))
  output[id]=budgetSelections(profile,overview,id,id==='homeBuilders'?5:id==='builderBuilders'?2:1);
 return output;
}
export function facilityResourceRecommendations(profile,overview,facility){
 const pool=upgradePool(profile,overview,'homeBuilders');
 let focused=[];
 if(facility==='heroes')focused=pool.filter(r=>r.group==='heroes');
 if(facility==='spellFactory')focused=pool.filter(r=>r.group==='buildings'&&
   ['Spell Factory','Dark Spell Factory'].some(label=>r.name===label));
 const affordable=focused.find(row=>canBudgetFund(row,profile.resources))||null;
 return {best:focused[0]||null,affordable,candidates:focused};
}
// Reasons are intentionally explicit about shared Home builder and wallet pools.
export function summarizeResourceStatus(profile,overview,lane){
 const rec=budgetSelections(profile,overview,lane);
 const best=rec.best,affordable=rec.affordable;
 return {best:best?{title:best.title,cost:describeCost(best),
    shortage:describeShortage(best,profile?.resources)}:null,
   affordable:affordable?{title:affordable.title,cost:describeCost(affordable)}:null,
   count:rec.candidates.length};
}
// A helper's use is a separate system: assisting an existing project does NOT
// mean an independent new resource expenditure; conversion has unknown rates.
export function helperResourceAdvice(helper){
 const id=helper?.id;
 if(id===93000000||id===93000001)
  return 'Assists an already-running upgrade · no separate upgrade cost shown. Check cooldown and game availability.';
 if(id===93000002)return 'Gold/Elixir exchange rate and available storage are not in JSON. Confirm the conversion in game.';
 if(id===93000003)return 'Ore conversion rate and Gold Pass eligibility require in-game confirmation.';
 return 'No verified resource cost for this helper action.';
}
