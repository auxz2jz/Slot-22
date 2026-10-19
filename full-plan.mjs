// Global, read-only village upgrade planner. Dated JSON -> prioritized queues.
// No guessed currency balances, no invented active work, no automatic game actions.
// Suggested levels are tentative unless the game/export confirms prerequisites.
import {labelFor} from './catalog.mjs';
import {homeBuilderAvailability,availableResearchQueues} from './experience.mjs';
import {helperActionRecommendations} from './helper-advice.mjs';

const homeBuilderPriority=[
 [1000000,'Army Camp','More army capacity benefits every attack.',95],
 [1000071,'Hero Hall','Raises the level ceilings for Heroes; unlocks hero progression.',86],
 [1000070,'Blacksmith','Unlocks additional Hero Equipment features.',81],
 [1000029,'Dark Spell Factory','Unlocks or improves access to dark spells; research remains in Laboratory.',77],
 [1000059,'Workshop','Siege machine access for your attacks.',74],
 [1000026,'Dark Barracks','Unlocks troops, not a separate Laboratory worker.',70],
 [1000006,'Barracks','Unlocks troops, not a separate Laboratory worker.',67],
 [1000020,'Spell Factory','Unlocks spells; spell levels use Laboratory.',64],
 [1000068,'Pet House','Unlocks more pets; pet research has its own queue.',63],
 [1000014,'Clan Castle','Clan Castle offense and defensive support.',62],
 [1000015,'Builder’s Hut','Adds defensive builder value when eligible.',48],
 [1000027,'Inferno Tower','Core defense after offensive capacity and upgrades.',45]
];
const homeHeroPriorities=[28000002,28000001,28000004,28000000,28000006]; // Warden, Queen, Royal, King, Prince
const heroReasons={
 28000002:'Grand Warden support powers every army; prioritize if you have a free builder.',
 28000001:'Archer Queen is a major offensive asset; keep levels progressing.',
 28000004:'Royal Champion improves precision attacks against defenses.',
 28000000:'Barbarian King provides tanking and damage.',
 28000006:'Minion Prince is an alternative attacking/defending Hero.'
};
const topSpellIds=[26000005,26000035,26000002,26000009,26000000,26000001,26000010];
const topTroopIds=[4000007,4000008,4000059,4000011,4000058,4000017,4000022,4000005];
const topSiegeIds=[4000087,4000052,4000075,4000051];
const petRanks=[73000002,73000000,73000001,73000003];
const equipmentRanks=[90000004,90000003,90000005,90000007,90000006,90000001,90000008];
const rowLabel=r=>labelFor(r.data);
const timed=r=>Number.isFinite(r?.timer)&&r.timer>=0;
const rows=(x,key)=>Array.isArray(x?.[key])?x[key]:[];
const task=(r,reason,location)=>({
 id:r.data,name:rowLabel(r),level:r.lvl,targetLevel:r.lvl+1,
 title:rowLabel(r)+' '+r.lvl+' → '+(r.lvl+1),reason,location,
 verify:true
});
const inSnapshot=x=>x?.timestamp&&Number.isFinite(x.timestamp);
function bestHomeConstruction(x){
 const current=rows(x,'buildings');
 const picks=homeBuilderPriority.flatMap(([id,name,reason,weight])=>{
   const found=current.filter(r=>r.data===id&&!timed(r)&&Number.isInteger(r.lvl));
   const first=found[0];if(!first)return [];
   // A level isn't proof the next level exists at current Town Hall.
   return [{...task(first,reason,'Home Village → Build → Building and Heroes'),weight}];
 });
 return picks;
}
function heroes(x){
 return homeHeroPriorities.flatMap((id,i)=>{
  const h=rows(x,'heroes').find(r=>r.data===id&&!timed(r)&&Number.isInteger(r.lvl));
  return h?[{...task(h,heroReasons[id],'Home Village → Build → Building and Heroes → Heroes'),
   weight:100-i*3}]:[];
 });
}
function builderBasePicks(x){
 const arr=rows(x,'buildings2'),heroes=rows(x,'heroes2');
 const picks=[];
 const star=arr.find(r=>r.data===1000046);
 if(star&&Number.isInteger(star.lvl)&&!timed(star))
  picks.push({...task(star,'Prioritize Star Laboratory progression toward level 9 for better troop research options.',
   'Builder Base → Star Laboratory'),weight:99});
 if(star?.lvl===7&&timed(star))
  picks.push({id:star.data,name:'Star Laboratory',level:8,targetLevel:9,
   title:'Star Laboratory 8 → 9 (after current upgrade)',
   reason:'Unlock higher Builder Base troop levels, including Hog Glider 15 → 16. Requires another Builder Base construction slot.',
   location:'Builder Base → Star Laboratory',verify:true,weight:99});
 // B.O.B progress: base Hero totals are 30 from this snapshot, need 45, so hero levels matter.
 for(const [i,id] of [28000003,28000005].entries()){
  const row=heroes.find(r=>r.data===id&&!timed(r));
  if(row)picks.push({...task(row,'Advance combined Builder Base Hero levels toward the B.O.B requirement of 45.',
   'Builder Base → Build → Heroes'),weight:96-i});
 }
 const priority=[1000044,1000041,1000048,1000045,1000040];
 for(const [i,id]of priority.entries()){
  const row=arr.find(r=>r.data===id&&!timed(r)&&Number.isInteger(r.lvl));
  if(row)picks.push({...task(row,'Upgrade Builder Base defenses and unlock B.O.B prerequisites where applicable.',
   'Builder Base → Build → Building'),weight:70-i});
 }
 return picks.sort((a,b)=>b.weight-a.weight).slice(0,8);
}
function researchQueue(x){
 const items=[];
 const active=[...rows(x,'units'),...rows(x,'spells'),...rows(x,'siege_machines')].find(timed);
 if(active){
  items.push({...task(active,'Continue the current troop/spell/siege research. It occupies the one shared Laboratory slot.',
   'Home Village → Build → Army Upgrades'),state:'running'});
  items.push({id:active.data,name:rowLabel(active),title:rowLabel(active)+' '+(active.lvl+1)+' → '+(active.lvl+2)+' (after current)',
   reason:'A follow-on upgrade if its next level is available at your Town Hall; confirm in game.',
   location:'Home Village → Build → Army Upgrades',verify:true,state:'follow-on'});
 }
 const ranked=(key,priority)=>priority.flatMap(id=>{
  const r=rows(x,key).find(v=>v.data===id&&!timed(v)&&Number.isInteger(v.lvl));
  return r?[{...task(r,'Prioritize army and supporting spells for your main attack strategy. Confirm upgrade availability and cost.',
   'Home Village → Build → Army Upgrades'),state:'candidate'}]:[];
 });
 return {active:active?{name:rowLabel(active),level:active.lvl,seconds:active.timer}:null,
   next:items.slice(1).concat(ranked('spells',topSpellIds),ranked('units',topTroopIds),ranked('siege_machines',topSiegeIds))
   .filter((v,i,a)=>a.findIndex(q=>q.id===v.id&&q.title===v.title)===i).slice(0,8),
   spell:ranked('spells',topSpellIds).slice(0,4),troop:ranked('units',topTroopIds).slice(0,4),
   siege:ranked('siege_machines',topSiegeIds).slice(0,3)};
}
function petRecommendations(x){
 const active=rows(x,'pets').find(timed);
 const petHouse=rows(x,'buildings').find(r=>r.data===1000068);
 const ids=petHouse?.lvl>=4?[73000003,...petRanks.filter(id=>id!==73000003)]:petRanks;
 const rank=ids.flatMap(id=>{
  const r=rows(x,'pets').find(t=>t.data===id&&Number.isInteger(t.lvl)&&!timed(t));
  return r?[{...task(r,'Pet upgrades run independently of Home builders and Laboratory research. Electro Owl is a versatile current investment.',
   'Home Village → Build → Hero Pets'),state:'candidate'}]:[];
 });
 const hasUnicorn=rows(x,'pets').some(r=>r.data===73000003);
 const whenUnlocked=petHouse&&petHouse.lvl<4?{
  title:'Unicorn unlocks at Pet House Level 4',
  reason:'After Pet House 3 → 4 completes, consider Unicorn upgrades for Archer Queen support.',
  location:'Home Village → Build → Hero Pets',state:'locked'}:
  petHouse?.lvl>=4&&!hasUnicorn?{
   title:'Check newly unlocked Unicorn in Pet House',
   reason:'Pet House is Level 4, but this JSON did not show Unicorn. Confirm unlocking it in the game.',
   location:'Home Village → Build → Hero Pets',state:'verify'}:null;
 return {active:active?{name:rowLabel(active),level:active.lvl,seconds:active.timer}:null,
  next:rank.slice(0,5),future:whenUnlocked};
}
function equipmentRecommendations(x){
 const rank=equipmentRanks.flatMap(id=>{
  const r=rows(x,'equipment').find(t=>t.data===id&&Number.isInteger(t.lvl));
  return r?[{...task(r,'Equipment upgrades use Shiny/Glowy/Starry Ore, not a builder or Laboratory worker.',
   'Home Village → Build → Hero Equipment'),state:'check-ore'}]:[];
 });
 return rank.slice(0,7);
}
function inventoryAudit(x){
 const groups=[['Home buildings','buildings'],['Home traps','traps'],['Builder Base buildings','buildings2'],
  ['Builder Base traps','traps2']];
 return groups.map(([name,key])=>{
  const entries=rows(x,key).map(r=>{
   const count=Number.isInteger(r.cnt)?r.cnt:1;
   return {id:r.data,name:rowLabel(r),level:r.lvl,count,
    ongoing:timed(r),timerSeconds:timed(r)?r.timer:null,
    status:timed(r)?'Upgrading at snapshot':'No active building timer; next level must be checked in game'};
  });
  return {name,key,total:entries.reduce((n,r)=>n+r.count,0),entries};
 });
}
export function fullVillagePlan(profile){
 const x=profile?.export;
 if(!inSnapshot(x))return null;
 const homeAvail=homeBuilderAvailability(x);
 const homeActive=[...rows(x,'buildings'),...rows(x,'heroes'),...rows(x,'traps')].filter(timed);
 const builderActive=[...rows(x,'buildings2'),...rows(x,'heroes2'),...rows(x,'traps2')].filter(timed);
 const homeHero=heroes(x),homeBuildings=bestHomeConstruction(x);
 const queue=availableResearchQueues(profile);
 const lab=researchQueue(x),pets=petRecommendations(x);
 const equipment=equipmentRecommendations(x);
 const hStats={id:'homeBuilders',name:'Home builders',location:'Home Village → Build → Building and Heroes',
  status:homeAvail?.availableAtLeast>0?'idle':'busy',activeCount:homeActive.length,
  reportedCapacity:homeAvail?.buildersAtLeast??null,
  next:[...homeHero,...homeBuildings].sort((a,b)=>b.weight-a.weight).slice(0,10),
  note:'Choose a Hero or high-impact offense building as each builder frees. An old timer reaching zero never proves completion.'};
 const bStats={id:'builderBuilders',name:'Builder Base builders',location:'Builder Base → Build → Building and Heroes',
  status:builderActive.length?'busy':'unknown',activeCount:builderActive.length,reportedCapacity:null,
  next:builderBasePicks(x),
  note:'Builder Base capacity (including any purchased extra Builder) is not reliably encoded in this export. Confirm free slots in game.'};
 const labQueue=queue.find(v=>v.key==='laboratory'),starQueue=queue.find(v=>v.key==='starLaboratory'),petQueue=queue.find(v=>v.key==='petHouse');
 const other=[
 {id:'homeLab',name:'Home Laboratory — spells, troops, siege',location:'Home Village → Build → Army Upgrades',
  status:labQueue?.status??'unknown',activeCount:lab.active?1:0,next:lab.next,
  alternatives:{spells:lab.spell,troops:lab.troop,siege:lab.siege},
  note:'One shared research slot; choose the next spell OR troop OR siege upgrade, not one of each at the same time.'},
 {id:'starLab',name:'Star Laboratory — Builder troops',location:'Builder Base → Star Laboratory',
  status:starQueue?.status??'unknown',activeCount:rows(x,'units2').filter(timed).length,
  next:starQueue?.recommendations?.length?starQueue.recommendations.map(t=>({...t,location:'Builder Base → Star Laboratory'})):
  builderBasePicks(x).filter(t=>t.id===1000046).slice(0,1),
  note:starQueue?.status==='blocked'?'Star Laboratory structure upgrade underway. The user reported research unavailable until completion. Recheck in-game after that build finishes.':
  'Builder troop research has one slot; unlock prerequisites first.'},
 {id:'pets',name:'Hero Pets',location:'Home Village → Build → Hero Pets',status:petQueue?.status??'unknown',
  activeCount:pets.active?1:0,next:pets.next,
  future:pets.future,note:'Can start one pet upgrade while Pet House construction continues. Confirm Dark Elixir costs.'},
 {id:'equipment',name:'Hero Equipment / Blacksmith',location:'Home Village → Build → Hero Equipment',
  status:'on-demand',activeCount:0,next:equipment,
  note:'Ore-based equipment upgrades are not timed research; check whether enough ore is available before spending. No need to keep a worker occupied.'}
 ];
 return {
  snapshotAt:x.timestamp*1000,playerTag:x.tag,homeActive, builderActive,
  queues:[hStats,bStats,...other],heroHall:{
   level:rows(x,'buildings').find(r=>r.data===1000071)?.lvl??null,
   upgrading:rows(x,'buildings').some(r=>r.data===1000071&&timed(r)),
   heroCurrent:rows(x,'heroes').map(r=>({id:r.data,name:rowLabel(r),level:r.lvl,upgrading:timed(r)})),
   nextHeroes:homeHero.slice(0,5)
  },inventory:inventoryAudit(x),helperActions:helperActionRecommendations(profile),
  recurringRule:'After importing a newer snapshot, re-rank every lane and remove completed or blocked choices. Before the next import, estimates remain observations, not live game state.'
 };
}
