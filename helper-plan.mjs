// Additive, repeatable Helper Hut routines: never touch balances, items or game export.
// Uses only helpers present in the current village snapshot and confirmed Gold Pass purchase.
const task=(id,title,note)=>({id,title,village:'Home',queue:'Helper Hut',costType:'gold',cost:0,status:'planned',note,updatedAt:null,recurring:true});
export function routineTasks(profile){
 const ids=new Set((profile?.export?.helpers||[]).map(h=>h.data));
 const result=[];
 if(ids.has(93000000))result.push(task('HP-01',"Daily: Builder's Apprentice → priority Home upgrade",'Assign to an actively upgrading Home building/hero with enough remaining time to benefit. Choose a long priority job, and check the 23h helper work-day in Clash. Recurring; never spend Gems.'));
 if(ids.has(93000001))result.push(task('HP-02','Daily: Lab Assistant → Laboratory research','Assign to active Home Laboratory research, not Builder Base Star Laboratory or Pet House. Choose a job long enough to use the hour. Recurring; no Gems.'));
 if(ids.has(93000002))result.push(task('HP-03','Daily: verify third helper and convert excess resources','Snapshot helper ID 93000002 is likely Alchemist. Confirm identity in Helper Hut, then use a useful resource conversion with capacity room rather than wasting rewards. Recurring; no Gems.'));
 if(profile?.seasonalPlan?.goldPassPurchased||ids.has(93000003))result.push(task('HP-04','Gold Pass Prospector → check unlock, convert ore','Check Gold Pass perk and Helper Hut to verify Prospector unlocked; the snapshot alone does not confirm ownership. If available, convert unneeded ore toward an equipment bottleneck. Recurring, avoid Gem purchases.'));
 if(result.length)result.push(task('HP-05','Check Helper Hut shared daily cooldown','Visit Helper Hut when playing; check availability for all helpers and assign/use them when useful. Export cooldown may be absent; app never assumes helpers ready. Do not permanently complete a daily recurring task.'));
 return result;
}
export function ensureHelperRoadmap(profile){
 const items=routineTasks(profile);
 if(!items.length||!Array.isArray(profile?.roadmap))return {profile,added:0};
 const present=new Set(profile.roadmap.map(t=>t.id));
 const missing=items.filter(x=>!present.has(x.id));
 if(!missing.length)return {profile,added:0};
 const next=structuredClone(profile),index=next.roadmap.findIndex(t=>t.id.startsWith('H-'));
 next.roadmap.splice(index===-1?0:index,0,...missing);
 next.helperPlan={...(next.helperPlan||{}),gemsSpendAllowed:false,routineTaskIds:items.map(t=>t.id)};
 return {profile:next,added:missing.length};
}
