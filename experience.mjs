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


// Separate research queues: the regular Laboratory researches Home troops/spells,
// the Star Laboratory researches Builder Base troops, and Pet House levels pets.
// Helper cooldowns are distinct: an available Lab Assistant does not create a
// second Laboratory slot. An absent timer means no research in the dated export,
// never proof that the live game remains idle.
const RESEARCH_DEFINITIONS=[
 {key:'laboratory',name:'Home Laboratory',village:'Home',queue:'Laboratory',buildingId:1000007,buildingSection:'buildings',
  timerSections:['units','spells','siege_machines'],recordSections:['units','spells','siege_machines']},
 {key:'starLaboratory',name:'Star Laboratory',village:'Builder',queue:'Star Laboratory',buildingId:1000034,buildingSection:'buildings2',
  timerSections:['units2'],recordSections:['units2']},
 {key:'petHouse',name:'Pet House research',village:'Home',queue:'Pet House',buildingId:1000068,buildingSection:'buildings',
  timerSections:['pets'],recordSections:['pets']}
];
const parseUpgradeTitle=title=>String(title||'').match(/^(?:(?:First|Second|Third|Fourth|Fifth)\s+)?(.+?)\s+(\d+)\s*→\s*(\d+)\s*$/i);
const nextResearchTasks=(profile,def)=>{
 const ex=profile.export;
 const result=(profile.roadmap||[]).flatMap((t,index)=>{
  if(t.status!=='planned'||t.village!==def.village||t.queue!==def.queue)return [];
  const matched=parseUpgradeTitle(t.title);
  if(!matched)return [];
  const [,name,levelText,nextText]=matched;
  const ids=buildIds.get(normalizedName(name))||[];
  const level=Number(levelText),next=Number(nextText);
  if(next!==level+1)return [];
  const eligible=def.recordSections.some(section=>(ex[section]||[]).some(r=>
   ids.includes(r.data)&&r.lvl===level&&!Number.isFinite(r.timer)));
  if(!eligible)return [];
  const cost=Number(t.cost),balance=profile.resources?.[t.costType];
  return [{taskId:t.id,title:t.title,note:t.note||'',currency:t.costType,
   cost:Number.isFinite(cost)&&cost>0?cost:null,
   affordableFromSaved:Number.isFinite(cost)&&cost>0&&Number.isFinite(balance)&&balance>=cost,
   sourceIndex:index}];
 });
 // The Builder Base roadmap contains a goal rather than a specific next level.
 // Resolve only the verified level-15 candidate into a single concrete next step.
 if(def.key==='starLaboratory' && !result.length){
  const goal=(profile.roadmap||[]).find(t=>t.id==='B-05'&&t.status==='planned'&&t.village==='Builder'&&t.queue==='Star Laboratory');
  const candidate=(ex.units2||[]).filter(r=>Number.isInteger(r.lvl)&&r.lvl>=1&&r.lvl<18&&!Number.isFinite(r.timer))
   .sort((a,b)=>b.lvl-a.lvl)[0];
  if(goal&&candidate&&names[candidate.data]){
   result.push({taskId:goal.id,title:names[candidate.data]+' '+candidate.lvl+' → '+(candidate.lvl+1),
    note:'Suggested Builder Base research toward the roadmap goal of level 18. Confirm availability and cost in game.',
    currency:'builderElixir',cost:null,affordableFromSaved:false,sourceIndex:999,derivedFrom:'Builder troop roadmap goal'});
  }
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
  const structureUnderConstruction=!!structure&&Number.isFinite(structure.timer);
  const known=!!structure&&completeSections&&!structureUnderConstruction;
  const active=known&&def.timerSections.some(k=>ex[k].some(r=>Number.isFinite(r.timer)));
  const status=!known?'unknown':active?'busy':'idle';
  const recommendations=status==='idle'?nextResearchTasks(profile,def):[];
  return {key:def.key,name:def.name,status,snapshotAt:ex.timestamp*1000,
   recommendations,source:'In-game JSON research timers (not Lab Assistant availability)'};
 });
}
