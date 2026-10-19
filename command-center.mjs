// One-screen planner. Detailed views are invoked only when the user opens a lane or structure.
// Source: latest dated game JSON + optional manually entered/confirmed quotes and boosts.
// This module never changes the village, resources, or existing roadmap.
import {fullVillagePlan} from './full-plan.mjs';
import {labelFor} from './catalog.mjs';
import {REFERENCE_CATALOG} from './upgrade-reference.mjs';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number(n).toLocaleString('en-US');
const categories=[
 ['homeBuilders','Home Builders','Home Village · buildings + Heroes'],
 ['homeLab','Laboratory','Home Village · spells, troops, siege'],
 ['pets','Pet House','Home Village · independent pet upgrades'],
 ['builderBuilders','Builder Base Builders','Builder Base · buildings + Heroes'],
 ['starLab','Star Laboratory','Builder Base · troop research'],
 ['equipment','Blacksmith','Home Village · Hero Equipment ores'],
 ['assistants','Helper Hut','Home Village · daily assistants']
];
const currencyNames={gold:'Gold',elixir:'Elixir',dark:'Dark Elixir',builderGold:'Builder Gold',builderElixir:'Builder Elixir',
 shiny:'Shiny Ore',glowy:'Glowy Ore',starry:'Starry Ore'};
const timed=v=>Number.isFinite(v?.timer)&&v.timer>=0;
const rows=(e,k)=>Array.isArray(e?.[k])?e[k]:[];
const idsInGroup=(e,group)=>rows(e,group).flatMap(r=>{
 const count=Number.isInteger(r.cnt)?r.cnt:1;
 return [{...r,count,group,name:labelFor(r.data)}];
});
export const upgradeKey=(group,id,next)=>group+':'+id+':'+next;
const quoteInfo=(p,group,id,next)=>{
 const key=upgradeKey(group,id,next),data=p.upgradeQuotes?.[key];
 const roadmap=(p.roadmap||[]).find(t=>new RegExp('(^|\\s)'+String(next-1)+'\\s*→\\s*'+String(next)+'(\\s|$)').test(t.title||'')&&
  (t.title||'').toLowerCase().includes((labelFor(id)||'UNKNOWN').toLowerCase()));
 if(data?.price>0)return {price:data.price,hours:data.hours??null,currency:data.currency,
  beforeBoost:data.beforeBoost===true,source:'user-verified game quote',key};
 const source=REFERENCE_CATALOG[group+':'+id];
 const actual=source?.levels.find(x=>x.l===next);
 if(actual&&actual.c!==null&&actual.c>0)return {price:actual.c,hours:actual.s?actual.s/3600:null,
  currency:actual.r,beforeBoost:true,source:'Oct 17 game-data reference; verify in Clash',key,
  requirement:actual,ore:actual.ore};
 if(actual?.ore?.some(n=>n>0))return {price:null,hours:null,currency:null,beforeBoost:false,
  source:'Oct 17 ore data; verify in Clash',key,ore:actual.ore,requirement:actual};
 if(roadmap?.cost>0)return {price:roadmap.cost,hours:null,currency:roadmap.costType,
  beforeBoost:false,source:'saved roadmap estimate (discount status unknown)',key};
 return {price:null,hours:null,currency:null,beforeBoost:false,source:'not recorded',key};
};
const discountFor=(p,group)=>{
 const prefs=p.upgradePreferences||{};
 const ordinary=group==='spells'||group==='units'||group==='siege_machines'||group==='pets'||group==='units2'?
  prefs.researchBoost:prefs.builderBoost;
 // The separate returning-player discount is NOT automatically stacked with Gold Pass.
 // Treat 50% as a confirmed effective boost only when manually selected and not expired.
 const expires=p.boostEnd?new Date(p.boostEnd).getTime():null;
 const returning=prefs.returningBoost===50&&(!Number.isFinite(expires)||expires>Date.now())?50:null;
 return returning!==null?Math.max(returning,ordinary??0):ordinary;
};
const costDisplay=(profile,group,id,next)=>{
 const q=quoteInfo(profile,group,id,next);
 if(q.ore?.some(n=>n>0)&&(!Number.isFinite(q.price)||q.price<=0))
  return {line:'Equipment ore cost: '+['Shiny','Glowy','Starry'].map((n,i)=>n+' '+fmt(q.ore[i]||0)).join(' · ')+
    ' · '+q.source,detail:q};
 if(!Number.isFinite(q.price)||q.price<=0)return {line:'Price and total duration not recorded — check in Clash',detail:q};
 const pct=discountFor(profile,group),discounted=q.beforeBoost&&Number.isFinite(pct)&&pct>=0?Math.ceil(q.price*(100-pct)/100):null;
 const shown=discounted??q.price;
 const name=currencyNames[q.currency]||q.currency||'resources';
 const quoteDuration=Number.isFinite(q.hours)&&q.hours>0?
  ' · '+(q.beforeBoost&&Number.isFinite(pct)?(q.hours*(100-pct)/100).toFixed(1):q.hours)+'h estimated':' · time not recorded';
 return {line:fmt(shown)+' '+name+quoteDuration+' · '+q.source+
  (discounted!==null?' · '+pct+'% confirmed boost applied to base quote':' · no extra discount calculated'),
  detail:q};
};
export function rankCandidates(profile,candidates){
 const snap=profile?.export||{},r=profile?.resources||{},prefs=profile?.upgradePreferences||{};
 const current=(g,id)=>rows(snap,g).some(x=>x.data===id);
 return (candidates||[]).map((t,i)=>{
  const group=['heroes','buildings','heroes2','buildings2','spells','units','pets','equipment','units2','siege_machines'].find(g=>current(g,t.id));
  const ref=group&&REFERENCE_CATALOG[group+':'+t.id]?.levels.find(x=>x.l===t.targetLevel);
  const lab=rows(snap,'buildings').find(x=>x.data===1000007)?.lvl;
  const star=rows(snap,'buildings2').find(x=>x.data===1000046)?.lvl;
  const hero=rows(snap,'buildings').find(x=>x.data===1000071)?.lvl;
  const th=rows(snap,'buildings').find(x=>x.data===1000001)?.lvl;
  const bh=rows(snap,'buildings2').find(x=>x.data===1000034)?.lvl;
  const requirements=[['TH',ref?.th,th],['BH',ref?.bh,bh],['Lab',ref?.lab,lab],
    ['Star Lab',ref?.sl,star],['Hero Hall',ref?.hh,hero]];
  const unmet=requirements.find(([name,needed,have])=>Number.isFinite(needed)&&needed>0&&Number.isFinite(have)&&have<needed);
  if(unmet)return null;
  const quote=group&&t.targetLevel?quoteInfo(profile,group,t.id,t.targetLevel):null;
  const boost=group?discountFor(profile,group):null;
  const factor=quote?.beforeBoost&&Number.isFinite(boost)?(100-boost)/100:1;
  const cost=Number.isFinite(quote?.price)?Math.ceil(quote.price*factor):null;
  const funded=Number.isFinite(cost)&&Number.isFinite(r[quote?.currency])?r[quote.currency]>=cost:null;
  const hours=quote?.hours?quote.hours*factor:null;
  const priority=(t.weight??(80-i*2))+(funded===true?5:funded===false?-10:0)+
    (hours?Math.max(-3,3-Math.log2(1+hours)):0);
  return {...t,priority,recordedAffordable:funded,
   eligibilityNote:ref?'Reference level requirements checked; game confirmation required':'Prerequisites not verified in catalog'};
 }).filter(Boolean).sort((a,b)=>b.priority-a.priority);
}
const snapshotFinish=(x,r)=>{
 if(!timed(r)||!Number.isFinite(x?.timestamp))return 'Not upgrading in JSON';
 const end=(x.timestamp+r.timer)*1000;
 const f=new Date(end).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
 return 'In progress · '+Math.floor(r.timer/3600)+'h '+Math.floor(r.timer%3600/60)+'m at export · estimated finish '+f;
};
export function commandOverview(profile){
 const plan=fullVillagePlan(profile);if(!plan)return null;
 const ex=profile.export, queue=id=>plan.queues.find(q=>q.id===id);
 const activeLab=[...rows(ex,'spells'),...rows(ex,'units'),...rows(ex,'siege_machines')].filter(timed);
 const activeBaseLab=rows(ex,'units2').filter(timed);
 const activePets=rows(ex,'pets').filter(timed);
 const queueStates=[
 {id:'homeBuilders',active:plan.homeActive,next:queue('homeBuilders')?.next||[],status:queue('homeBuilders')?.status},
 {id:'homeLab',active:activeLab,next:queue('homeLab')?.next||[],status:queue('homeLab')?.status},
 {id:'pets',active:activePets,next:queue('pets')?.next||[],status:queue('pets')?.status},
 {id:'builderBuilders',active:plan.builderActive,next:queue('builderBuilders')?.next||[],status:queue('builderBuilders')?.status},
 {id:'starLab',active:activeBaseLab,next:queue('starLab')?.next||[],status:queue('starLab')?.status},
 {id:'equipment',active:[],next:queue('equipment')?.next||[],status:'on-demand'},
 {id:'assistants',active:[],next:[],status:'verify'}
 ];
 const assistants=plan.helperActions||[];
 return {...plan,queueStates:queueStates.map(q=>{
   const row=categories.find(c=>c[0]===q.id);
   const first=q.active.length===1?q.active[0]:null;
   const top=q.id==='assistants'?(assistants.find(h=>h.id===93000001)?.action||'Check all four assistants'):q.next[0]?.title||'Review in game';
   return {...q,label:row[1],location:row[2],inProgress:q.active.length>1?q.active.length+' active upgrades':
      first?labelFor(first.data)+' '+first.lvl+' → '+(first.lvl+1):q.id==='assistants'?
       assistants.filter(h=>h.cooldownEnd!==null).length+' recorded cooldowns':
       q.id==='equipment'?'Instant ore upgrades (no timer)':'No upgrade timer at export',
    nextTitle:top};
 })};
}
const resources=(p)=>{
 const r=p.resources||{}, list=[
 ['gold','Gold'],['elixir','Elixir'],['dark','Dark'],
 ['builderGold','Builder Gold'],['builderElixir','Builder Elixir'],
 ['shiny','Shiny Ore'],['glowy','Glowy Ore'],['starry','Starry Ore']
 ];
 return '<div class="command-resource-grid">'+list.map(([k,n])=>'<div><small>'+n+'</small><b>'+fmt(r[k]??0)+'</b></div>').join('')+'</div>';
};
const optionPct=(current)=>
 [['','Not confirmed'],['0','0%'],['10','10%'],['15','15%'],['20','20%']].map(([v,n])=>
 '<option value="'+v+'" '+(String(current??'')===v?'selected':'')+'>'+n+'</option>').join('');
export function renderCommandCenter(profile){
 const data=commandOverview(profile);
 if(!data)return '<section class="card"><h2>Village Command Center</h2>Import a dated game JSON to get started.</section>';
 const prefs=profile.upgradePreferences||{};
 return '<section class="card command-center" aria-label="Village Command Center">'+
 '<div class="command-header"><div><span class="kicker">ONE PLACE FOR EVERYTHING</span><h2>Village Command Center</h2></div>'+
 '<div class="command-header-actions"><button class="btn small" data-action="choose-file">Import fresh game JSON</button>'+
 '<button class="btn secondary small" data-action="go-sync">Backup / GitHub</button></div></div>'+
 '<p class="smallmuted">Snapshot: '+esc(new Date(data.snapshotAt).toLocaleString())+
 '. Recommendations update when you import newer game data. Costs and balances are not live.</p>'+
 resources(profile)+
 '<details class="command-settings"><summary>Update balances or confirm Gold Pass boosts</summary>'+
 '<p class="smallmuted">Gold Pass is '+(profile.seasonalPlan?.goldPassPurchased?'recorded as purchased':'not confirmed')+
 ', but active discount levels are not in the exported JSON. Select what your game actually shows. Discounts apply only to quotes marked BEFORE boost.</p>'+
 '<div class="command-boost-controls"><label>Builder discount <select data-command-boost="builderBoost">'+optionPct(prefs.builderBoost)+'</select></label>'+
 '<label>Research discount <select data-command-boost="researchBoost">'+optionPct(prefs.researchBoost)+'</select></label>'+
 '<label>Separate returning boost <select data-command-boost="returningBoost">'+
 '<option value="" '+(prefs.returningBoost!==50?'selected':'')+'>Not confirmed</option>'+
 '<option value="50" '+(prefs.returningBoost===50?'selected':'')+'>50% reported</option></select></label></div>'+
 '<p class="smallmuted">Special returning-player boost expiry: '+
 esc(profile.boostEnd?new Date(profile.boostEnd).toLocaleString():'not recorded')+
 ' — if you confirm 50%, estimates use that single effective percentage, not an additional stacked discount. Confirm expiry in game.</p>'+
 '<button class="btn secondary small" data-action="command-edit-resources">Edit saved resource balances</button></details>'+
 '<div class="command-queue-grid">'+data.queueStates.map(q=>'<button class="command-queue" type="button" data-command-lane="'+q.id+'">'+
 '<span class="command-queue-title">'+esc(q.label)+'</span>'+
 '<span class="command-queue-status">'+esc(q.status==='idle'?'Open in last JSON':q.status==='busy'?'Working':
 q.status==='on-demand'?'Spend ore when worthwhile':q.status==='verify'?'Check helpers':'Check in game')+'</span>'+
 '<small>Now: '+esc(q.inProgress)+'</small>'+
 '<strong>Next: '+esc(q.nextTitle)+'</strong>'+
 '<span class="command-more">Open details and following upgrades →</span></button>').join('')+'</div>'+
 '<details class="command-structures"><summary>Find any building, Hero, trap or factory</summary>'+
 '<p class="smallmuted">Tap a structure to see its building upgrade and any separate research, pets, equipment or Helper Hut work it controls.</p>'+
 [['Home Village buildings','buildings'],['Home Heroes','heroes'],['Builder Base buildings','buildings2'],
 ['Builder Heroes','heroes2'],['Home traps','traps'],['Builder traps','traps2'],
 ['Home Laboratory spells','spells'],['Home Laboratory troops','units'],['Siege research','siege_machines'],
 ['Hero Pets','pets'],['Hero Equipment','equipment'],['Star Laboratory troops','units2']].map(([name,group])=>'<details><summary>'+name+'</summary><div class="command-structure-grid">'+
 idsInGroup(profile.export,group).sort((a,b)=>a.name.localeCompare(b.name)).map(r=>
 '<button type="button" data-command-structure="'+esc(group+':'+r.data)+'">'+esc(r.name)+' · Lv'+esc(r.lvl)+
 (timed(r)?' · upgrading':'')+(r.count>1?' ×'+r.count:'')+'</button>').join('')+'</div></details>').join('')+'</details>'+
 '<p class="smallmuted">This tracker recommends actions only. Building factories is different from researching their troops or spells; passive buildings require no continuous job.</p></section>';
}
const activeRows=(e,group)=>rows(e,group).filter(timed);
const workRows=(q,e)=>{
 switch(q){
 case 'homeBuilders':return [...activeRows(e,'buildings'),...activeRows(e,'heroes'),...activeRows(e,'traps')];
 case 'builderBuilders':return [...activeRows(e,'buildings2'),...activeRows(e,'heroes2'),...activeRows(e,'traps2')];
 case 'homeLab':return [...activeRows(e,'spells'),...activeRows(e,'units'),...activeRows(e,'siege_machines')];
 case 'starLab':return activeRows(e,'units2');
 case 'pets':return activeRows(e,'pets');
 default:return [];
 }
};
function quoteForm(profile,group,row){
 const next=row.lvl+1,q=quoteInfo(profile,group,row.data,next);
 const key=q.key;
 return '<details class="command-quote"><summary>Record exact in-game cost / time for '+esc(labelFor(row.data))+' → Level '+next+'</summary>'+
 '<p class="smallmuted">Enter the price and full duration shown in Clash. The JSON does not include those values. Quotes stay saved on this profile.</p>'+
 '<label>Resource <select data-quote-field="currency">'+Object.entries(currencyNames).map(([id,name])=>
 '<option value="'+id+'" '+(q.currency===id?'selected':'')+'>'+esc(name)+'</option>').join('')+'</select></label>'+
 '<label>Price <input data-quote-field="price" inputmode="numeric" type="number" min="0" value="'+esc(q.source==='user-verified game quote'?q.price:'')+'"></label>'+
 '<label>Full duration in hours <input data-quote-field="hours" inputmode="decimal" type="number" min="0" step=".1" value="'+esc(q.hours??'')+'"></label>'+
 '<label><input type="checkbox" data-quote-field="beforeBoost" '+(q.beforeBoost?'checked':'')+'> These are BASE values before Gold Pass boost</label>'+
 '<button class="btn small" data-action="command-save-quote" data-quote-key="'+esc(key)+'">Save this estimate</button></details>';
}
function candidateList(profile,list,max=7){
 if(!list?.length)return '<p class="smallmuted">No verified next upgrade from the current JSON. Check the game for available levels.</p>';
 return '<ol class="command-choices">'+list.slice(0,max).map(t=>{
  const group=['spells','units','siege_machines','pets','equipment','units2','buildings','heroes','buildings2','heroes2','traps','traps2']
    .find(group=>rows(profile.export,group).some(r=>r.data===t.id))||
    (t.location?.includes('Builder Base')?'buildings2':'buildings');
  const cost=Number.isFinite(t.id)&&Number.isInteger(t.targetLevel)?costDisplay(profile,group,t.id,t.targetLevel):null;
  return '<li><strong>'+esc(t.title)+'</strong><small>'+esc(t.reason||t.note||'Verify in game')+'</small>'+
  (cost?'<small>'+esc(cost.line)+'</small>':'')+'<small>Where: '+esc(t.location||'Check in game')+'</small>'+
  (Number.isFinite(t.id)&&Number.isInteger(t.targetLevel)?'<button class="btn secondary small" data-command-structure="'+group+':'+t.id+'">Details / quote</button>':'')+'</li>';
 }).join('')+'</ol>';
}
export function renderCommandDetail(profile,selection){
 const overview=commandOverview(profile);
 if(!overview)return '<h2>No snapshot yet</h2>';
 const e=profile.export;
 if(selection?.startsWith('structure:')){
  const [,group,idString]=selection.split(':');const id=Number(idString);
  const row=rows(e,group).find(r=>r.data===id);
  if(!row)return '<h2>Structure not in latest snapshot</h2>';
  const name=labelFor(id);
  const labGroup=['spells','units','siege_machines'].includes(group);
  const associatedLane=labGroup?'homeLab':group==='pets'?'pets':group==='equipment'?'equipment':
   group==='units2'?'starLab':group==='heroes'?'homeBuilders':group==='heroes2'?'builderBuilders':null;
  const relations={
   1000007:['homeLab','Laboratory research · one slot shared by troops, spells and siege machines'],
   1000020:['homeLab','Spell Factory creates normal spells. Spell level upgrades use Home Laboratory.'],
   1000029:['homeLab','Dark Spell Factory creates dark spells. Dark spell levels use Home Laboratory.'],
   1000006:['homeLab','Barracks trains troops. Troop level upgrades use Home Laboratory.'],
   1000026:['homeLab','Dark Barracks trains dark troops. Research uses Home Laboratory.'],
   1000059:['homeLab','Workshop produces siege machines. Their level upgrades use Home Laboratory.'],
   1000068:['pets','Pet House upgrades pets in a separate queue, even while its building upgrades.'],
   1000070:['equipment','Blacksmith improves Hero Equipment instantly with ores, not builders.'],
   1000071:['homeBuilders','Hero Hall manages Heroes, whose level upgrades need a Home builder.'],
   1000015:['assistants','Builder Huts provide builders. Helper Hut uses separate assistants.'],
   1000046:['starLab','Star Laboratory researches Builder Base troops using its current unlocked level.'],
   1000040:['starLab','Builder Barracks unlocks troops, their upgrades use Star Laboratory.']
  };
  const relation=relations[id]||(associatedLane?[associatedLane,
    'This unit, spell, pet, Hero or equipment has its own level but shares the associated upgrade queue.']:null);
  const mapped=relation?.[0];
  const sub=mapped?overview.queues.find(q=>q.id===mapped):null;
  const near=overview.queueStates.find(q=>q.id===(group==='buildings2'||group==='heroes2'?'builderBuilders':'homeBuilders'));
  const groupName=['buildings2','heroes2','traps2','units2'].includes(group)?'Builder Base':'Home Village';
  const nextLevel=row.lvl+1,quote=costDisplay(profile,group,id,nextLevel);
  const relatedActive=mapped?workRows(mapped,e):[];
  const filterRelated=t=>id===1000020?['Lightning Spell','Healing Spell','Rage Spell','Jump Spell','Freeze Spell','Clone Spell','Invisibility Spell','Overgrowth Spell'].some(n=>(t.title||'').startsWith(n)):
   id===1000029?['Poison Spell','Earthquake Spell','Haste Spell','Skeleton Spell','Bat Spell'].some(n=>(t.title||'').startsWith(n)):
   id===1000059?['Wall Wrecker','Battle Blimp','Stone Slammer','Siege Barracks','Log Launcher'].some(n=>(t.title||'').startsWith(n)):
   (id===1000006||id===1000026)?(t.location||'').includes('Army Upgrades')&&!/Spell/.test(t.title||''):
   true;
  const relatedNext=(sub?.next||[]).filter(filterRelated);
  const relatedPreview=relation&&sub?
   '<h4>Working in its linked queue</h4>'+
   (relatedActive.length?relatedActive.map(t=>'<p>'+esc(snapshotFinish(e,t))+' · '+esc(labelFor(t.data))+'</p>').join(''):
    '<p>No timed research recorded in last snapshot.</p>')+
   '<h4>Then work on</h4>'+
   (relatedNext.length?relatedNext.slice(0,3).map((t,i)=>'<p><b>'+String(i+1)+'. '+esc(t.title)+'</b></p>').join(''):
    '<p>No verified next candidate; check game unlocks.</p>'):'';
  const categoriesText=id===1000020?'The Spell Factory is not a second research worker.':
    id===1000071?'The Hero Hall is not a separate Hero-upgrade builder.':'';
  return '<div class="command-detail" data-focus="'+esc(selection)+'"><h2>'+esc(name)+'</h2>'+
   '<p><b>'+esc(groupName)+' · Level '+row.lvl+'</b> '+(row.cnt?'· '+row.cnt+' copies':'')+'</p>'+
   '<p>'+esc(snapshotFinish(e,row))+'</p>'+
   '<h3>Building itself · '+row.lvl+' → '+nextLevel+'</h3>'+
   '<p>'+esc(quote.line)+'</p>'+quoteForm(profile,group,row)+
   (relation?'<div class="command-related"><h3>What this structure does</h3><p>'+esc(relation[1])+'</p>'+
    relatedPreview+
    (sub?'<button class="btn small" data-command-lane="'+mapped+'">Open complete '+esc(sub.name)+' queue</button>':'')+
    '<p>'+esc(categoriesText)+'</p></div>':'<p>This structure can be upgraded if the game offers another level and a builder is available. It has no separate ongoing research queue.</p>')+
    (near?.status==='busy'?'<small>Builder pool was occupied at snapshot; queue this building for a later slot.</small>':'')+'</div>';
 }
 const id=selection?.replace('lane:','');
 const lane=overview.queues.find(q=>q.id===id);
 if(id==='assistants'){
  return '<div class="command-detail"><h2>Helper Hut · four assistants</h2>'+
  overview.helperActions.map(h=>'<article class="command-helper"><h3>'+esc(h.name)+' Lv'+h.level+'</h3>'+
   '<p>'+esc(h.action)+'</p><small>'+esc(h.note)+'</small>'+
   '<small>'+(h.availability==='cooldown-recorded'?'Cooldown recorded at export':'Use today unconfirmed')+'</small></article>').join('')+'</div>';
 }
 if(!lane)return '<h2>Choose a building or queue</h2>';
 const act=workRows(id,e);
 return '<div class="command-detail" data-focus="'+esc(selection)+'"><h2>'+esc(lane.name)+'</h2>'+
 '<p class="smallmuted">Where: '+esc(lane.location)+'</p>'+
 '<p>Status from latest snapshot: <b>'+esc(lane.status)+'</b>. '+esc(lane.note)+'</p>'+
 '<h3>Working now</h3>'+
 (act.length?act.map(r=>'<div class="command-active"><b>'+esc(labelFor(r.data))+' '+r.lvl+' → '+(r.lvl+1)+'</b>'+
 '<small>'+esc(snapshotFinish(e,r))+'</small></div>').join(''):
 '<p>No timed work reported in this queue at export.</p>')+
 '<h3>My recommended next jobs, in order</h3>'+
 candidateList(profile,lane.next)+
 (lane.alternatives?'<details><summary>See spells, troops and siege research separately</summary>'+
 Object.entries(lane.alternatives).map(([key,list])=>'<h4>'+esc(key)+'</h4>'+candidateList(profile,list,4)).join('')+'</details>':'')+
 (lane.future?'<p><b>Upcoming unlock:</b> '+esc(lane.future.title)+' — '+esc(lane.future.reason)+'</p>':'')+
 '<p class="smallmuted">Costs require an actual quoted level and discount, and resources must be confirmed in game. Nothing is started automatically.</p></div>';
}
