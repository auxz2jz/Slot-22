import {categories,labelFor} from './catalog.mjs';
export const VERSION = 1;
export const REPO = 'auxz2jz/Slot-22';
export const STATE_PATH = 'data/player-state.json';
export const STATUSES = ['planned','active','done','skipped'];
export function integer(value, fallback=0) {
  if (value === '' || value === null || value === undefined) return fallback;
  const n=Number(String(value).replaceAll(',',''));
  return Number.isFinite(n) ? Math.max(0,Math.min(1e12,Math.floor(n))) : fallback;
}
export function format(n) {return new Intl.NumberFormat('en-US').format(integer(n));}
export function validateExport(input) {
  const x=typeof input==='string'?JSON.parse(input):input;
  if(!x||typeof x!=='object'||Array.isArray(x)||!/^#[A-Z0-9]{4,15}$/.test(x.tag||'')) throw Error('Not a Clash of Clans village JSON export (missing player tag).');
  if(!Array.isArray(x.buildings)||!Array.isArray(x.buildings2)) throw Error('The export must include buildings and buildings2 arrays.');
  for(const [key] of categories) {
    const values=x[key];
    if(values !== undefined && (!Array.isArray(values)||values.length>3000)) throw Error('Invalid collection: '+key);
    for(const entry of values||[]) {
      if(!entry||!Number.isInteger(entry.data)||!Number.isInteger(entry.lvl)||entry.lvl<0||entry.lvl>1000) throw Error('Invalid entity in '+key);
    }
  }
  if (JSON.stringify(x).length>1200000) throw Error('Export is too large.');
  return x;
}
export function importVillage(state, input, now=new Date().toISOString()) {
  const x=validateExport(input);
  const copy=structuredClone(state);
  if(copy.playerTag && copy.playerTag!==x.tag) throw Error('Player tag mismatch. This planner belongs to '+copy.playerTag+'.');
  copy.playerTag=x.tag;
  copy.export=x;
  copy.importedAt=now;
  copy.history=(copy.history||[]).concat({at:now,kind:'import',note:'Imported village snapshot dated '+(x.timestamp||'unknown')}).slice(-120);
  return copy;
}
export function rowsFromExport(x,category) {
  if(!x||!Array.isArray(x[category]))return [];
  return x[category].map((e,i)=>({
    key:category+'-'+e.data+'-'+e.lvl+'-'+i,
    id:e.data,name:labelFor(e.data),level:e.lvl,count:integer(e.cnt,1)||1,
    timer:Number.isFinite(e.timer)?Math.max(0,e.timer):null,
    finishesAt: Number.isFinite(e.timer)&&Number.isFinite(x.timestamp)?(x.timestamp+e.timer)*1000:null
  })).sort((a,b)=>a.name.localeCompare(b.name)||a.level-b.level);
}
export function ongoingFromExport(x) {
  if (!x)return [];
  return categories.flatMap(([key,title])=>rowsFromExport(x,key).filter(r=>r.timer!==null).map(r=>({...r,category:title}))).sort((a,b)=>(a.finishesAt||0)-(b.finishesAt||0));
}
export function setTaskStatus(state,id,status,at=new Date().toISOString()) {
  if(!STATUSES.includes(status))throw Error('Unknown status');
  const clone=structuredClone(state);const task=clone.roadmap.find(t=>t.id===id);
  if(!task)throw Error('Task not found');
  task.status=status;task.updatedAt=at;
  clone.history=(clone.history||[]).concat({at,kind:'task',note:task.title+' → '+status}).slice(-120);
  return clone;
}
export function budget(state) {
  const r=state.resources||{};
  return {homeGold:integer(r.gold)+integer(r.cartGold),homeElixir:integer(r.elixir)+integer(r.cartElixir),homeDark:integer(r.dark)+integer(r.cartDark),builderGold:integer(r.builderGold),builderElixir:integer(r.builderElixir)};
}
export function validateState(input) {
  const s=typeof input==='string'?JSON.parse(input):input;
  if (!s||typeof s!=='object'||s.schemaVersion!==VERSION||!s.resources||!s.items||!Array.isArray(s.roadmap))throw Error('Unsupported planner backup format.');
  if (s.roadmap.length>300)throw Error('Roadmap too large');
  if(s.export)validateExport(s.export);
  return s;
}
export function makeTask(id, title, village, queue, costType, cost, note, status='planned') {
  return {id,title,village,queue,costType,cost,status,note,updatedAt:null};
}
export function starterRoadmap() {return [
  makeTask('H-01','Pet House 3 → 4','Home','Builder','elixir',3000000,'Unlock Unicorn. Confirmed started.','active'),
  makeTask('H-02','Clan Castle 9 → 10','Home','Builder','elixir',5000000,'More reinforcement capacity.','active'),
  makeTask('H-03','First Army Camp 10 → 11','Home','Builder','elixir',3750000,'Four camps total.','active'),
  makeTask('H-04','Inferno Tower 7 → 8','Home','Builder','gold',4750000,'Major defense.','active'),
  makeTask('H-05','Archer Queen 47 → 48','Home','Builder','dark',39500,'Continue queen when next builder frees.','active'),
  makeTask('L-01','Freeze Spell 3 → 4','Home','Laboratory','elixir',1500000,'Independent of builders.','active'),
  makeTask('P-01','Electro Owl 1 → 2','Home','Pet House','dark',30000,'Independent pet timer.','active'),
  makeTask('E-01','Eternal Tome 7 → 8','Home','Blacksmith','shiny',0,'Already raised to level 8; more ore needed for level 9.','done'),
  makeTask('B-01','Builder Cannon 7 → 8','Builder','Builder','builderGold',2500000,'B.O.B. defense milestone.','active'),
  makeTask('B-02','Star Laboratory 7 → 8','Builder','Builder','builderElixir',3000000,'B.O.B. troop milestone.','active'),
  makeTask('L-02','Freeze Spell 4 → 5','Home','Laboratory','elixir',2100000,'Next after first Freeze completes.'),
  makeTask('P-02','Unicorn 1 → 2','Home','Pet House','dark',50000,'After Pet House level 4 and pet queue available.'),
  makeTask('H-06','Spell Factory 6 → 7','Home','Builder','elixir',4500000,'Unlock Recall Spell.'),
  makeTask('H-07','Second Army Camp 10 → 11','Home','Builder','elixir',3750000,'Keep builders active.'),
  makeTask('H-08','Third Army Camp 10 → 11','Home','Builder','elixir',3750000,'Keep builders active.'),
  makeTask('H-09','Fourth Army Camp 10 → 11','Home','Builder','elixir',3750000,'Complete army capacity.'),
  makeTask('H-10','Second Inferno Tower 7 → 8','Home','Builder','gold',4750000,'If Gold available.'),
  makeTask('H-11','Third Inferno Tower 7 → 8','Home','Builder','gold',4750000,'If Gold available.'),
  makeTask('L-03','Freeze Spell 5 → 6','Home','Laboratory','elixir',3000000,'Confirm actual in-game price.'),
  makeTask('L-04','Freeze Spell 6 → 7','Home','Laboratory','elixir',3500000,'Finish Freeze, then choose favorite army troops.'),
  makeTask('B-03','Builder Cannon 8 → 9','Builder','Builder','builderGold',3300000,'B.O.B. defense requirement.'),
  makeTask('B-04','Star Laboratory 8 → 9','Builder','Builder','builderElixir',4000000,'Unlock research for troop level 18.'),
  makeTask('B-05','One Builder troop to level 18','Builder','Star Laboratory','builderElixir',0,'Choose level 15 troop, confirm cost.'),
  makeTask('B-06','Combined Builder hero levels to 45','Builder','Builder','builderElixir',0,'Current Battle Machine 15 + Battle Copter 15.'),
  makeTask('H-12','Grand Warden / Queen hero cycle','Home','Builder','elixir',0,'Select specific level and current cost after higher-priority army buildings.')
];}
export function seedState() {
  return {
    schemaVersion:1,playerTag:'#QVLP9RVV',revision:0,
    resources:{gold:19000000,elixir:12608735,dark:207783,gems:4023,builderGold:1605931,builderElixir:360800,cartGold:17000000,cartElixir:17000000,cartDark:170000,shiny:940,glowy:222,starry:11},
    resourceNotes:'Starting estimates from 2026-10-18 chat. Builder balances assume Cannon and Star Lab costs were paid; check in game. Loot Cart estimated unclaimed; correct after each collection.',
    items:{'Power Potion':8,'Resource Potion':6,'Builder Potion':4,'Clock Tower Potion':7,'Hero Potion':5,'Research Potion':6,'Super Potion':3,'Pet Potion':3,'Builder Star Jar':3,'Shovel of Obstacles':3,'Book of Fighting':1,'Book of Building':1,'Book of Spells':1,'Book of Heroes':1,'Rune of Gold':1,'Rune of Elixir':1,'Rune of Dark Elixir':1,'Rune of Builder Gold':1,'Rune of Builder Elixir':1,'Wall Ring':5},
    roadmap:starterRoadmap(),export:null,importedAt:null,history:[],notes:'Goal: efficient TH14 returner boost (~50% build/research), work toward B.O.B. sixth builder. Avoid gems and wasting Runes. Always verify in-game prices.',
    boostEnd:null
  };
}
