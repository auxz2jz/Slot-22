// Actionable, read-only game snapshot analysis. No game actions or hidden data.
import {labelFor} from './catalog.mjs';
const pairs=[['buildings','Home buildings'],['traps','Home traps'],['heroes','Home heroes'],['units','Home troops'],['spells','Spells'],['pets','Pets'],['equipment','Hero equipment'],['siege_machines','Siege machines'],['buildings2','Builder buildings'],['traps2','Builder traps'],['units2','Builder troops'],['heroes2','Builder heroes']];
const count=r=>Number.isInteger(r?.cnt)&&r.cnt>0?r.cnt:1;
const arr=(x,key)=>Array.isArray(x?.[key])?x[key]:[];
export function levelGroups(x,key,id){
 const map=new Map();
 for(const row of arr(x,key).filter(r=>r?.data===id)){
  const lvl=Number(row.lvl);if(Number.isFinite(lvl))map.set(lvl,(map.get(lvl)||0)+count(row));
 }
 return [...map].sort((a,b)=>a[0]-b[0]).map(([level,quantity])=>({level,quantity}));
}
export function villageProgress(x){
 if(!x)return null;
 const homeWalls=levelGroups(x,'buildings',1000010),builderWalls=levelGroups(x,'buildings2',1000033);
 const heroRows=arr(x,'heroes').concat(arr(x,'heroes2'));
 const heroes=heroRows.map(r=>({name:labelFor(r.data),id:r.data,level:r.lvl,upgrading:Number.isFinite(r.timer)}));
 const areas=pairs.map(([key,name])=>{
  const rows=arr(x,key);
  const countAll=rows.reduce((a,r)=>a+count(r),0);
  const active=rows.filter(r=>Number.isFinite(r.timer)).map(r=>({id:r.data,name:labelFor(r.data),level:r.lvl,seconds:r.timer,finishesAt:Number.isFinite(x.timestamp)?(x.timestamp+r.timer)*1000:null}));
  return {key,name,records:rows.length,count:countAll,active};
 });
 const equipment=arr(x,'equipment').map(r=>({id:r.data,name:labelFor(r.data),level:r.lvl}));
 const spell=arr(x,'spells').map(r=>({name:labelFor(r.data),level:r.lvl,timer:r.timer??null}));
 const troop=arr(x,'units2').map(r=>({name:labelFor(r.data),level:r.lvl}));
 const cosmetics=['skins','skins2','sceneries','sceneries2','house_parts','decos','decos2','obstacles','obstacles2'].map(key=>({key,records:arr(x,key).length,items:arr(x,key).reduce((a,r)=>a+count(r),0),values:arr(x,key).map(r=>({id:typeof r==='number'?r:r?.data,quantity:count(r)}))}));
 const boosts=x.boosts&&typeof x.boosts==='object'&&!Array.isArray(x.boosts)?Object.entries(x.boosts).map(([name,seconds])=>({name,seconds:Number.isFinite(seconds)?seconds:null,at:Number.isFinite(seconds)&&Number.isFinite(x.timestamp)?(x.timestamp+seconds)*1000:null})):[];
 return {homeWalls,builderWalls,heroes,areas,equipment,spell,troop,cosmetics,boosts,sectionNames:Object.keys(x),timestamp:x.timestamp};
}
function distribution(x,key){
 const ids=new Map();
 for(const row of arr(x,key)){
  if(!Number.isInteger(row?.data)||!Number.isInteger(row.lvl))continue;
  let stat=ids.get(row.data);
  if(!stat){stat={id:row.data,label:labelFor(row.data),count:0,levelPoints:0};ids.set(row.data,stat);}
  stat.count+=count(row);stat.levelPoints+=row.lvl*count(row);
 }
 return ids;
}
/** Changes in aggregate levels are only called inferred upgrades when quantity is unchanged.
 * Otherwise describe counts/level-points, never pretend identical records are individually traceable.
 */
export function compareSnapshots(before,after){
 if(!before||!after||before.tag!==after.tag)return null;
 const changes=[];
 for(const [key] of pairs){
  const a=distribution(before,key),b=distribution(after,key);
  for(const id of new Set([...a.keys(),...b.keys()])){
   const previous=a.get(id)||{count:0,levelPoints:0},latest=b.get(id)||{count:0,levelPoints:0};
   if(previous.count===latest.count&&previous.levelPoints===latest.levelPoints)continue;
   const sameAmount=previous.count===latest.count;
   changes.push({key,id,name:labelFor(id),beforeCount:previous.count,afterCount:latest.count,
    beforeLevelPoints:previous.levelPoints,afterLevelPoints:latest.levelPoints,
    inferredLevels:sameAmount?latest.levelPoints-previous.levelPoints:null,quantityChange:latest.count-previous.count});
  }
 }
 const other=[];
 for(const key of ['helpers','obstacles','obstacles2','decos','decos2','house_parts','skins','skins2','sceneries','sceneries2','boosts']){
  const prev=JSON.stringify(before[key]??null),next=JSON.stringify(after[key]??null);
  if(prev!==next)other.push(key);
 }
 return {tag:after.tag,beforeTimestamp:before.timestamp,afterTimestamp:after.timestamp,changes:changes.slice(0,200),other,recordedAt:new Date().toISOString()};
}
export function inferActionHints(x){
 const p=villageProgress(x);if(!p)return [];
 const statements=[];
 const walls=p.homeWalls.reduce((a,r)=>a+r.quantity,0);
 if(walls)statements.push('Home walls: '+walls+' total; '+p.homeWalls.map(w=>'level '+w.level+': '+w.quantity).join(', ')+'.');
 const builderWallCount=p.builderWalls.reduce((a,r)=>a+r.quantity,0);
 if(builderWallCount)statements.push('Builder walls: '+builderWallCount+' total, '+p.builderWalls.map(w=>'level '+w.level+': '+w.quantity).join(', ')+'.');
 const inFlight=p.areas.flatMap(a=>a.active.map(v=>a.name+': '+v.name+' level '+v.level));
 if(inFlight.length)statements.push(inFlight.length+' upgrade timers appear in this snapshot; re-import to verify current progress.');
 if(p.equipment.length)statements.push(p.equipment.length+' equipment entries, including '+p.equipment.filter(e=>e.level<=1).length+' at level 1. This alone does not indicate which equipment is equipped.');
 if(p.boosts.length)statements.push('Boost/cooldown data: '+p.boosts.map(v=>v.name).join(', ')+'.');
 return statements;
}
