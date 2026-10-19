// Read-only analysis of user-imported village snapshots. No game or inventory changes.
import {labelFor} from './catalog.mjs';
export const HELPER_LABELS={93000000:"Builder's Apprentice",93000001:"Lab Assistant",93000002:"Third helper (likely Alchemist)",93000003:"Prospector (verify in game)"};
export function helperSummary(exported){
 const rows=Array.isArray(exported?.helpers)?exported.helpers:[];
 return rows.map(r=>({id:r.data,name:HELPER_LABELS[r.data]||'Unidentified helper '+r.data,level:r.lvl,
 cooldownSeconds:Number.isFinite(r.helper_cooldown)?Math.max(0,r.helper_cooldown):null,
 snapshotEnd:Number.isFinite(r.helper_cooldown)&&Number.isFinite(exported.timestamp)?(exported.timestamp+r.helper_cooldown)*1000:null,
 recurrent:!!r.helper_recurrent}));
}
export function snapshotCoverage(x){
 if(!x)return [];
 return Object.keys(x).filter(k=>!['tag','timestamp'].includes(k)).map(k=>{
 const v=x[k],items=Array.isArray(v)?v.length:typeof v==='object'?Object.keys(v||{}).length:1;
 const quantity=Array.isArray(v)?v.reduce((total,r)=>total+(r&&typeof r==='object'&&Number.isInteger(r.cnt)?r.cnt:1),0):items;
 return {key:k,entries:items,quantity};
 });
}
export function bobSummary(x){
 if(!x)return null;
 const buildings=x.buildings||[],builder=x.buildings2||[],troops=x.units2||[],heroes=x.heroes2||[];
 const gearups=[1000008,1000009,1000013].map(id=>buildings.some(r=>r.data===id&&r.gear_up===1));
 const defenses=[1000044,1000041,1000048,1000043,1000055,1000057,1000045,1000056,1000052,1000050,1000054,1000063,1000081];
 const highestDefense=Math.max(0,...builder.filter(r=>defenses.includes(r.data)).map(r=>r.lvl));
 const highestTroop=Math.max(0,...troops.map(r=>r.lvl));
 const heroLevels=heroes.filter(r=>[28000003,28000005].includes(r.data)).reduce((v,r)=>v+r.lvl,0);
 return {gearups:gearups.filter(Boolean).length,gearupsComplete:gearups.every(Boolean),
  highestDefense,defenseComplete:highestDefense>=9,highestTroop,troopComplete:highestTroop>=18,
  heroLevels,heroesComplete:heroLevels>=45};
}
export function recordSummary(x){
 if(!x)return [];
 const collections=['buildings','buildings2','traps','traps2','heroes','heroes2','units','units2','spells','pets','equipment','siege_machines'];
 return collections.flatMap(key=>(x[key]||[]).map(r=>({key,data:r.data,label:labelFor(r.data),level:r.lvl,count:r.cnt||1,
 active:Number.isFinite(r.timer),geared:r.gear_up===1,helperAssigned:r.helper_recurrent===true})));
}
