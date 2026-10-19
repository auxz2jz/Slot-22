import {names} from './catalog.mjs';
// Pure display and planning calculations. These never start upgrades in Clash of Clans.
export const VERSION = '0.3.0';
export const RESOURCE_LABELS={gold:'Gold',elixir:'Elixir',dark:'Dark Elixir',builderGold:'Builder Gold',builderElixir:'Builder Elixir'};
export const RESOURCE_KIND=['gold','elixir','dark','builderGold','builderElixir'];
export function whole(x){const n=Number(String(x??0).replace(/,/g,''));return Number.isFinite(n)?Math.max(0,Math.floor(n)):0;}
export function gauge(balance,capacity){
  const amount=whole(balance), cap=whole(capacity);
  return {amount,capacity:cap,known:cap>0,percent:cap>0?Math.max(0,Math.min(100,100*amount/cap)):0,overflow:cap>0&&amount>cap};
}
export function remainingTime(finishesAt,now=Date.now()){
  if(!Number.isFinite(finishesAt))return {expired:false,text:'Unknown'};
  const left=Math.max(0,Math.ceil((finishesAt-now)/1000));
  if(left===0)return {expired:true,text:'Timer expired · refresh JSON'};
  const d=Math.floor(left/86400),h=Math.floor((left%86400)/3600),m=Math.floor((left%3600)/60);
  return {expired:false,text:d?d+'d '+h+'h left':h?h+'h '+m+'m left':m+'m left'};
}
// Actual construction start is not present in village exports. The optional
// trackedFirstSeenAt survives subsequent imports of the same observed upgrade.
export function snapshotCountdown(ex,record,now=Date.now(),trackedFirstSeenAt=null){
  const snapshotStart=Number(ex?.timestamp)*1000,remaining=Number(record?.timer);
  if(!Number.isFinite(snapshotStart)||!Number.isFinite(remaining)||remaining<0)return null;
  const seen=Number(trackedFirstSeenAt);
  const start=trackedFirstSeenAt!==null&&Number.isFinite(seen)&&seen>0&&seen<=snapshotStart?seen:snapshotStart;
  const end=snapshotStart+remaining*1000;
  const total=Math.max(1,end-start);
  const percent=Math.max(0,Math.min(100,((now-start)/total)*100));
  return {start,end,percent,remaining:remainingTime(end,now),basis:start<snapshotStart?'Since first tracked':'Since last game export'};
}
export function classifyQueue(category){
  if(category==='buildings'||category==='heroes')return 'Home builders';
  if(category==='buildings2'||category==='heroes2')return 'Builder Base builders';
  if(category==='units'||category==='spells'||category==='siege_machines')return 'Laboratory';
  if(category==='units2')return 'Star Laboratory';
  if(category==='pets')return 'Pets';
  return 'Other';
}
export function queueGroups(rows){
  const groups={'Home builders':[],'Builder Base builders':[],Laboratory:[], 'Star Laboratory':[],Pets:[],Other:[]};
  for(const r of rows)groups[classifyQueue(r.categoryId||r.category)]?.push(r);
  return groups;
}
export function planPreview(task,resources){
  if(!task)throw Error('Missing task');
  const key=task.costType;
  const amount=whole(resources?.[key]);
  const cost=whole(task.cost);
  const valid=cost>0&&Object.prototype.hasOwnProperty.call(resources||{},key);
  return {key,cost,amount,valid,affordable:valid&&amount>=cost,remaining:valid?amount-cost:null};
}
export function progressSummary(tasks){
  const total=tasks.length,done=tasks.filter(t=>t.status==='done').length,active=tasks.filter(t=>t.status==='active').length;
  return {total,done,active,percent:total?100*done/total:0};
}
export function getTaskForRecord(tasks,record){
  const name=(record?.name||'').toLowerCase();
  return tasks.find(t=>t.status!=='skipped'&&t.title.toLowerCase().includes(name)&&t.title.includes(String(record?.level)+' →'))||null;
}

// Conservative Home Village builder detection from a DATED game export.
// Builder huts are a verified baseline. An optional 6th builder might exist
// but is intentionally not inferred from town hall or B.O.B. milestones.
// Expired timer estimates never prove that a builder slot was freed.
export function homeBuilderAvailability(exported){
 if(!exported || !Number.isFinite(exported.timestamp) || !Array.isArray(exported.buildings))return null;
 const huts=exported.buildings.filter(r=>r.data===1000015).reduce((n,r)=>n+(Number.isInteger(r.cnt)?Math.max(0,r.cnt):1),0);
 if(huts<1||huts>5)return null; // no trustworthy capacity estimate
 const active=[...exported.buildings,...(exported.heroes||[]),...(exported.traps||[])]
   .filter(r=>Number.isFinite(r.timer)&&r.timer>=0).length;
 const available=Math.max(0,huts-active);
 return {buildersAtLeast:huts,occupiedFromSnapshot:active,availableAtLeast:available,
   snapshotAt:exported.timestamp*1000,source:'Builder Huts and active Home Village building/hero/trap timers'};
}
const normalizedName=name=>String(name).trim().toLowerCase().replace(/[’']/g,"'");
const buildIds=new Map();
for(const [id,name] of Object.entries(names)){
 const key=normalizedName(name);
 buildIds.set(key,[...(buildIds.get(key)||[]),Number(id)]);
}
// A recommendation must match an actual unstarted level in the village JSON.
// Roadmap priority is its existing order, but known affordability improves rank.
// Currency is user-entered, NOT exported by Clash; confirm in the game.
export function nextHomeBuilderRecommendations(profile){
 const ex=profile?.export;
 const availability=homeBuilderAvailability(ex);
 if(!availability)return {availability:null,recommendations:[]};
 const candidates=(profile?.roadmap||[]).flatMap((task,index)=>{
  if(task.status!=='planned'||task.village!=='Home'||task.queue!=='Builder')return [];
  const matched=String(task.title||'').match(/^(?:(?:First|Second|Third|Fourth|Fifth)\s+)?(.+?)\s+(\d+)\s*→\s*(\d+)\s*$/i);
  if(!matched)return []; // skip unclear hero cycles or prerequisites
  const ids=buildIds.get(normalizedName(matched[1]))||[];
  const startLevel=Number(matched[2]),nextLevel=Number(matched[3]);
  if(!ids.length||nextLevel!==startLevel+1)return [];
  // The catalog contains repeated names (e.g., Army Camp in both villages).
  // Match the actual ID in this Home Village export, not the last catalog ID.
  const spare=ids.some(id=>{
   const category=String(id).startsWith('28')?'heroes':'buildings';
   return (Array.isArray(ex[category])?ex[category]:[]).some(r=>
    r.data===id&&r.lvl===startLevel&&!Number.isFinite(r.timer)&&(!Number.isInteger(r.cnt)||r.cnt>0));
  });
  if(!spare)return [];
  const currency=task.costType,estimate=Number(task.cost);
  const savedBalance=profile?.resources?.[currency];
  const affordableFromSaved=Number.isFinite(estimate)&&estimate>0&&Number.isFinite(savedBalance)&&savedBalance>=estimate;
  return [{taskId:task.id,title:task.title,note:task.note||'',currency,
    cost:Number.isFinite(estimate)&&estimate>0?estimate:null,
    affordableFromSaved,sourceIndex:index}];
 });
 candidates.sort((a,b)=>Number(b.affordableFromSaved)-Number(a.affordableFromSaved)||a.sourceIndex-b.sourceIndex);
 return {availability,recommendations:candidates.slice(0,3)};
}


// Home and Builder Base research are independent of construction builder count.
// Spell and Dark Spell Factories produce spells, but DO NOT each have a research queue.
const RESEARCH_DEFINITIONS=[
 {key:'laboratory',name:'Home Laboratory',village:'Home',queue:'Laboratory',buildingId:1000007,buildingSection:'buildings',
  timerSections:['units','spells','siege_machines'],recordSections:['units','spells','siege_machines']},
 {key:'starLaboratory',name:'Star Laboratory',village:'Builder',queue:'Star Laboratory',buildingId:1000046,buildingSection:'buildings2',
  timerSections:['units2'],recordSections:['units2']},
 {key:'petHouse',name:'Pet House research',village:'Home',queue:'Pet House',buildingId:1000068,buildingSection:'buildings',
  timerSections:['pets'],recordSections:['pets']}
];
const parseUpgradeTitle=title=>String(title||'').match(/^(?:(?:First|Second|Third|Fourth|Fifth)\s+)?(.+?)\s+(\d+)\s*→\s*(\d+)\s*$/i);
// Conservative Builder Base troop research caps from known Star Laboratory unlocks.
// A level-15 Hog Glider exists in the player JSON at Builder Barracks 11, but
// cannot research 15->16 until the STAR LABORATORY itself reaches level 9.
const EARLY_BUILDER_TROOPS=new Set([4000031,4000032,4000033,4000034,4000035,4000037,4000038,4000041,4000042]);
export function builderTroopResearchCap(id,starLevel){
 if(!Number.isInteger(starLevel)||starLevel<7||starLevel>10)return null;
 if(id===4000070)return starLevel>=9?(starLevel===9?18:20):15;
 if(id===4000036)return starLevel>=8?({8:16,9:18,10:20})[starLevel]:13;
 if(!EARLY_BUILDER_TROOPS.has(id))return null;
 return ({7:14,8:16,9:18,10:20})[starLevel];
}
const researchCandidate=(profile,t,index)=>{
 const amount=Number(t.cost),balance=profile.resources?.[t.costType];
 return {taskId:t.id,title:t.title,note:t.note||'',currency:t.costType,
  cost:Number.isFinite(amount)&&amount>0?amount:null,
  affordableFromSaved:Number.isFinite(amount)&&amount>0&&Number.isFinite(balance)&&balance>=amount,sourceIndex:index};
};
const nextResearchTasks=(profile,def,structure)=>{
 const ex=profile.export;
 const result=(profile.roadmap||[]).flatMap((t,index)=>{
  if(t.status!=='planned'||t.village!==def.village||t.queue!==def.queue)return [];
  const matched=parseUpgradeTitle(t.title);
  if(!matched)return [];
  const [,name,levelText,nextText]=matched,ids=buildIds.get(normalizedName(name))||[];
  const level=Number(levelText),next=Number(nextText);
  if(next!==level+1)return [];
  const eligible=def.recordSections.some(section=>(ex[section]||[]).some(r=>
   ids.includes(r.data)&&r.lvl===level&&!Number.isFinite(r.timer)&&
   (def.key!=='starLaboratory'||builderTroopResearchCap(r.data,structure.lvl)>=next)));
  return eligible?[researchCandidate(profile,t,index)]:[];
 });
 if(def.key==='starLaboratory' && !result.length){
  const goal=(profile.roadmap||[]).find(t=>t.id==='B-05'&&t.status==='planned'&&t.village==='Builder'&&t.queue==='Star Laboratory');
  if(goal){
   const eligible=(ex.units2||[]).filter(r=>Number.isInteger(r.lvl)&&r.lvl>=1&&r.lvl<18&&!Number.isFinite(r.timer)
      &&builderTroopResearchCap(r.data,structure.lvl)>r.lvl&&names[r.data])
    .sort((a,b)=>b.lvl-a.lvl);
   for(const [i,r] of eligible.slice(0,3).entries())result.push({
    taskId:goal.id,title:names[r.data]+' '+r.lvl+' → '+(r.lvl+1),note:
      'Specific Builder Base troop step toward roadmap goal level 18. Current Star Laboratory Lv '+structure.lvl+
      '; verify research access and actual Builder Elixir price in game.',
    currency:'builderElixir',cost:null,affordableFromSaved:false,sourceIndex:999+i,
    derivedFrom:'Builder troop roadmap goal'});
  }
 }
 if(def.key==='petHouse'&&!result.length){
  // The roadmap's Unicorn 1->2 goal is blocked until House Lv4 unlocks.
  // Existing pets CAN be upgraded while the Pet House building is upgrading.
  const available=new Map([[73000002,2],[73000000,1],[73000001,3],[73000003,4]]);
  const pets=(ex.pets||[]).filter(r=>available.has(r.data)&&available.get(r.data)<=structure.lvl
   &&Number.isInteger(r.lvl)&&r.lvl>=1&&r.lvl<10&&!Number.isFinite(r.timer)&&names[r.data]);
  pets.sort((a,b)=>(a.data===73000002?-1:a.data===73000000?0:1)-
                   (b.data===73000002?-1:b.data===73000000?0:1));
  for(const [i,p]of pets.slice(0,3).entries())result.push({taskId:null,
   title:names[p.data]+' '+p.lvl+' → '+(p.lvl+1),
   note:'Pet research is separate from building construction and can start while Pet House upgrades. Verify Dark Elixir price.',
   currency:'dark',cost:null,affordableFromSaved:false,sourceIndex:1000+i,derivedFrom:'Owned pet'});
 }
 result.sort((a,b)=>Number(b.affordableFromSaved)-Number(a.affordableFromSaved)||a.sourceIndex-b.sourceIndex);
 return result.slice(0,3);
};
export function availableResearchQueues(profile){
 const ex=profile?.export;
 if(!ex||!Number.isFinite(ex.timestamp))return [];
 return RESEARCH_DEFINITIONS.map(def=>{
  const buildings=ex[def.buildingSection];
  const structure=Array.isArray(buildings)&&buildings.find(r=>r.data===def.buildingId);
  const completeSections=def.timerSections.every(k=>Array.isArray(ex[k]));
  const known=!!structure&&completeSections;
  const active=known&&def.timerSections.some(k=>ex[k].some(r=>Number.isFinite(r.timer)));
  const status=!known?'unknown':active?'busy':'idle';
  const recommendations=status==='idle'?nextResearchTasks(profile,def,structure):[];
  return {key:def.key,name:def.name,status,snapshotAt:ex.timestamp*1000,
   structureLevel:structure?.lvl??null,structureUpgrading:!!structure&&Number.isFinite(structure.timer),
   recommendations,source:'In-game research timer and correct structure ID; independent of helpers and builder construction'};
 });
}
// These building upgrade opportunities are NOT separate research jobs.
// Only display exact TH14/BH9 caps verified for the user's current hall levels.
const ARMY_FACILITIES=[
 {name:'Barracks',id:1000006,kind:'Home',max14:16,usage:'Troop unlocking/army; no separate research queue'},
 {name:'Dark Barracks',id:1000026,kind:'Home',max14:11,usage:'Dark troop unlocking; no separate research queue'},
 {name:'Spell Factory',id:1000020,kind:'Home',max14:7,usage:'Normal spell production; spell levels use Home Laboratory'},
 {name:'Dark Spell Factory',id:1000029,kind:'Home',max14:7,usage:'Dark spell production; dark spell levels use Home Laboratory'},
 {name:'Workshop',id:1000059,kind:'Home',max14:6,usage:'Siege machines; research uses Home Laboratory'},
 {name:'Laboratory',id:1000007,kind:'Home',max14:12,usage:'One shared troop/spell/siege research queue'},
 {name:'Pet House',id:1000068,kind:'Home',max14:4,usage:'One independent pet upgrade queue'},
 {name:'Blacksmith',id:1000070,kind:'Home',max14:7,usage:'Equipment levels use ores; not timed laboratory research'},
 {name:'Hero Hall',id:1000071,kind:'Home',max14:8,usage:'Hero progression uses Home builders; not a laboratory queue'},
 {name:'Builder Barracks',id:1000040,kind:'Builder',max9:11,usage:'Unlocks Builder troops; upgrades researched in Star Laboratory'},
 {name:'Star Laboratory',id:1000046,kind:'Builder',max9:9,usage:'One independent Builder Base troop research queue'}
];
export function armyFacilityAudit(profile){
 const ex=profile?.export;if(!ex)return [];
 const th=ex.buildings?.find(r=>r.data===1000001)?.lvl;
 const bh=ex.buildings2?.find(r=>r.data===1000034)?.lvl;
 return ARMY_FACILITIES.map(def=>{
  const rows=def.kind==='Home'?ex.buildings:ex.buildings2;
  const row=Array.isArray(rows)&&rows.find(r=>r.data===def.id);
  if(!row)return null;
  const cap=def.kind==='Home'&&th===14?def.max14:def.kind==='Builder'&&bh===9?def.max9:null;
  const upgrading=Number.isFinite(row.timer);
  const canUpgrade=cap!==null&&Number.isInteger(row.lvl)&&row.lvl<cap;
  return {id:def.id,name:def.name,village:def.kind,level:row.lvl,
   buildingUpgradeActive:upgrading,nextLevel:canUpgrade?row.lvl+1:null,
   atKnownHallCap:cap!==null&&row.lvl>=cap,
   usage:def.usage};
 }).filter(Boolean);
}
