// Compiles permitted, factual upgrade statistics from a separately licensed
// open-source Clash of Clans dataset. Never downloads from Clash Ninja.
// Source: https://github.com/chiefpansancolt/clash-of-clans-data (MIT).
// This script only reads external JSON and writes a static JS module.
// In-game numbers always take precedence over published reference estimates.
import {readdir,readFile,writeFile} from 'node:fs/promises';
import {join,relative,sep} from 'node:path';
import {pathToFileURL} from 'node:url';

const GROUPS={
 home:{
  'town-hall':'buildings','army-buildings':'buildings','defenses':'buildings',
  'resource-buildings':'buildings','walls':'buildings','other':'buildings',
  'traps':'traps','heroes':'heroes','troops':'units',
  'spells':'spells','pets':'pets','hero-equipment':'equipment',
  'siege-machines':'siege_machines'
 },
 builder:{
  'builder-hall':'buildings2','army-buildings':'buildings2',
  'defenses':'buildings2','resource-buildings':'buildings2',
  'other':'buildings2','walls':'buildings2','traps':'traps2',
  'troops':'units2','heroes':'heroes2'
 }
};
const MONEY={
 Gold:'gold',Elixir:'elixir','Dark Elixir':'dark',
 'Builder Gold':'builderGold','Builder Elixir':'builderElixir',
 Gems:'gems'
};
const num=v=>typeof v==='number'&&Number.isFinite(v)?v:null;
const seconds=t=>{
 if(t===null||typeof t!=='object')return null;
 const fields=['days','hours','minutes','seconds'];
 if(!fields.every(k=>num(t[k])!==null))return null;
 return t.days*86400+t.hours*3600+t.minutes*60+t.seconds;
};
const required=(v,name)=>num(v?.[name])??null;
export function compileUpgradeRecord(raw,path=''){
 const bits=path.replaceAll('\\','/').split('/');
 const i=bits.indexOf('data');
 const root=bits[i+1],kind=bits[i+2],group=GROUPS[root]?.[kind];
 if(!group||!Number.isInteger(raw?.dataId)||raw.dataId<0||
  !Array.isArray(raw.levels)||raw.levels.length<1||raw.levels.length>200)return null;
 const rows=raw.levels.map(v=>{
  const level=num(v?.level),price=num(v.buildCost??v.upgradeCost??v.researchCost);
  if(!Number.isInteger(level)||level<1||level>200)return null;
  const resource=v.buildCostResource??v.upgradeCostResource??v.researchCostResource;
  const rawTime=v.buildTime??v.upgradeTime??v.researchTime;
  const ore=[num(v.upgradeShinyOre),num(v.upgradeGlowingOre),num(v.upgradeStarryOre)];
  return {l:level,c:price,r:MONEY[resource]??null,s:seconds(rawTime),
   th:required(v,'townHallRequired'),bh:required(v,'builderHallRequired'),
   lab:required(v,'laboratoryRequired'),sl:required(v,'starLabRequired'),
   hh:required(v,'heroHallLevelRequired'),ph:required(v,'petHouseLevelRequired'),
   bs:required(v,'blacksmithLevelRequired'),
   ore:ore.some(n=>n!==null)?ore.map(n=>n??0):null};
 }).filter(Boolean).sort((a,b)=>a.l-b.l);
 if(!rows.length)return null;
 const records=new Set(rows.map(x=>x.l));if(records.size!==rows.length)return null;
 const availability=(root==='home'?raw.availablePerTownHall:
   raw.availablePerBuilderHall);
 const maxCount=Array.isArray(availability)?availability.map(row=>[
  row.townHallLevel??row.builderHallLevel,
  row.count
 ]).filter(pair=>Number.isInteger(pair[0])&&Number.isInteger(pair[1])):null;
 return {key:group+':'+raw.dataId,id:raw.dataId,
  name:String(raw.name||'Unknown').slice(0,120),group,levels:rows,
  maxCount:maxCount?.length?maxCount:null};
}
async function jsonFiles(folder){
 let output=[];
 for(const item of await readdir(folder,{withFileTypes:true})){
  const full=join(folder,item.name);
  if(item.isDirectory())output.push(...await jsonFiles(full));
  else if(item.isFile()&&item.name.endsWith('.json'))output.push(full);
 }
 return output;
}
export async function buildCatalog(source,version){
 const files=await jsonFiles(join(source,'data'));
 const catalog={};
 let skipped=0,invalid=0;
 for(const file of files){
  const path=relative(source,file).split(sep).join('/');
  let item;
  try{item=compileUpgradeRecord(JSON.parse(await readFile(file,'utf8')),path)}
  catch{invalid++;continue}
  if(!item){skipped++;continue}
  if(catalog[item.key])throw Error('Duplicated game data ID '+item.key+
   ' in '+path+' vs '+catalog[item.key].sourcePath);
  item.sourcePath=path;
  catalog[item.key]=item;
 }
 const count=Object.keys(catalog).length;
 if(count<120)throw Error('Catalog unexpectedly small ('+count+') — refuse to overwrite released data');
 const record=Object.fromEntries(Object.entries(catalog).sort(([a],[b])=>a.localeCompare(b)));
 const head='// AUTO-GENERATED. Do not hand edit. License: MIT, Christopher Pezza, 2026.\\n'+
  '// Numerical game reference from chiefpansancolt/clash-of-clans-data.\\n'+
  '// NOT copied from clash.ninja; verify all values inside Clash of Clans.\\n';
 const module=head+
  'export const EXTENDED_REFERENCE_CATALOG='+JSON.stringify(record)+';\\n'+
  'export const EXTENDED_REFERENCE_META='+JSON.stringify({
   license:'MIT',source:'chiefpansancolt/clash-of-clans-data',
   sourceRevision:version,entryCount:count,skipped,invalid
  })+';\\n';
 return {module,meta:{count,skipped,invalid,version,groups:
  Object.values(record).reduce((m,r)=>{m[r.group]=(m[r.group]||0)+1;return m},{})}};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const [, ,source,target,revision='unspecified']=process.argv;
 if(!source||!target)throw Error('Usage: node generate-upgrade-reference.mjs source-dir output-file source-commit');
 const {module,meta}=await buildCatalog(source,revision);
 await writeFile(target,module,'utf8');
 console.log('Generated licensed full upgrade reference:',JSON.stringify(meta));
}
