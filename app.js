import {names,categories,moneyKeys,itemGroups,labelFor} from './catalog.mjs';
import {artworkUrl,artForResource} from './artwork.mjs';
import {coverFor,gaugeDeck,builderBoard,questTrail,gallery,detailContent} from './dashboard.mjs';
import {planPreview,snapshotCountdown,remainingTime,nextHomeBuilderRecommendations,availableResearchQueues,armyFacilityAudit} from './experience.mjs';
import {renderPassRewards,updatePassState,saveRewardDefinition,removeCustomReward} from './pass-rewards.mjs';
import {renderInsights,renderHelperStrip,helperCountdown} from './insights-view.mjs';
import {ensureHelperRoadmap} from './helper-plan.mjs';
import {helperActionRecommendations} from './helper-advice.mjs';
import {renderFullVillagePlan} from './full-plan-view.mjs';
import {helperSummary} from './snapshot-insights.mjs';
import {REPO,STATE_PATH,seedState,validateExport,normalizeBundle,importIntoBundle,selectProfile,rowsFromExport,ongoingFromExport,setTaskStatus,format,integer,budget,makeTask} from './core.mjs';

const STORAGE='clash-slot22-state-v2',LEGACY_STORAGE='clash-slot22-state-v1',TESTS='clash-slot22-tests-v1';
const el=id=>document.getElementById(id);
const enc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let bundle=normalizeBundle(seedState()),state=bundle.profiles[bundle.activeProfileId],view='overview',filter='all',invGroup='buildings',ghSha=null;
let inventoryMode='gallery',activeDialog=null,passFilter='unclaimed',editingRewardId=null;
let diagnostics=[],manualTests={},queuedBuilderPrompt=null,builderDialogProfile=null,builderDialogSnapshot=null;
const testSteps=[
 'Overview lists current resource values.',
 'Changing a Gold balance survives a page reload.',
 'Importing a new game JSON updates inventory and preserves manual resources.',
 'A roadmap task can be marked complete and remains complete after reload.',
 'Magic Item quantity edits survive reload.',
 'Backup JSON downloads and can be restored.',
 'GitHub Load/Save works with a restricted token (optional; never record token).',
 'Export diagnostics produces a redacted report.',
 'Season Pass tab lists 30 Silver and 19 Gold reward positions, including 22 either-or choices.',
 'Choose a Builder Gold alternative and mark it claimed; balances and Magic Items remain unchanged until separately edited.',
 'Changing to another account does not copy the October Season Pass reward checklist.'
];
const moneyLabels=Object.fromEntries(moneyKeys);
function log(type,outcome='OK',detail='') {
  const safe=String(detail).slice(0,120).replace(/gh[pousr]_[a-zA-Z0-9_]+/g,'[REDACTED]');
  diagnostics.push({time:new Date().toISOString(),type,outcome,detail:safe});
  diagnostics=diagnostics.slice(-100);
  try{localStorage.setItem('clash-slot22-diagnostics',JSON.stringify(diagnostics));}catch{}
}
function saveLocal(type='edit') {
  state.revision=(state.revision||0)+1;
  state.savedAt=new Date().toISOString();
  bundle.profiles[bundle.activeProfileId]=state;
  bundle.revision=(bundle.revision||0)+1;
  bundle.savedAt=state.savedAt;
  try{localStorage.setItem(STORAGE,JSON.stringify(bundle));log(type,'OK');}
  catch(e){notify('Storage unavailable. Export a backup now.','error');log(type,'FAILED','Local storage failed');}
}
function notify(message,kind='ok') {
  const target=el('notice'); target.className='notice'+(kind==='error'?' error':kind==='warn'?' warn':'');target.textContent=message;
}
function useBundle(next) {
  bundle=normalizeBundle(next);
  state=bundle.profiles[bundle.activeProfileId];
}
function readSaved() {
  try{
    diagnostics=JSON.parse(localStorage.getItem('clash-slot22-diagnostics')||'[]');
    manualTests=JSON.parse(localStorage.getItem(TESTS)||'{}');
    const v=localStorage.getItem(STORAGE);
    if(v){useBundle(v);return true;}
    const old=localStorage.getItem(LEGACY_STORAGE);
    if(old){useBundle(old);localStorage.setItem(STORAGE,JSON.stringify(bundle));log('migration','OK','Preserved original local profile');return true;}
  }catch(e){notify('Local data could not be loaded. Restore a backup if needed.','error');log('startup','ERROR',e.message);}
  return false;
}
async function initialize(){
  const local=readSaved();
  if(!local) {
    try{
      const response=await fetch('./data/player-state.json',{cache:'no-store'});
      if(response.ok)useBundle(await response.json());
    }catch(e){log('baseline-load','FAILED','Could not fetch default profile');}
    try{localStorage.setItem(STORAGE,JSON.stringify(bundle));}catch{}
  }
  const account=bundle.profiles[bundle.activeProfileId];
  const improved=ensureHelperRoadmap(account);
  if(improved.added){state=improved.profile;saveLocal('helper-routine-additive-migration');}
  for(const nav of document.querySelectorAll('[data-tab]')) nav.addEventListener('click',()=>{view=nav.dataset.tab;render();});
  el('download-backup').addEventListener('click',()=>download('clash-all-profiles-backup.json',bundle));
  el('game-file').addEventListener('change', async e=>readFile(e,'game'));
  el('backup-file').addEventListener('change',async e=>readFile(e,'backup'));
  el('profile-select').addEventListener('change',e=>{try{bundle.profiles[bundle.activeProfileId]=state;useBundle(selectProfile(bundle,e.target.value));const next=ensureHelperRoadmap(state);if(next.added)state=next.profile;saveLocal('profile-switch');render();}catch(err){notify(err.message,'error');render();}});
  document.addEventListener('click',clickAction);
  setInterval(updateVisualTimers,10000);
  el('item-dialog').addEventListener('click',e=>{if(e.target===el('item-dialog'))el('item-dialog').close();});
  el('builder-dialog').addEventListener('click',e=>{if(e.target===el('builder-dialog'))el('builder-dialog').close();});
  el('builder-dialog').addEventListener('close',()=>{
    if(state.playerTag===builderDialogProfile && state.export?.timestamp===builderDialogSnapshot){
      state.builderPromptDismissedAt=builderDialogSnapshot;
      saveLocal('builder-prompt-ack');render();
      log('builder-recommendation','OK','Acknowledged snapshot '+builderDialogSnapshot);
    }
    builderDialogProfile=null;builderDialogSnapshot=null;
  });
  document.addEventListener('input',commaInput);
  document.addEventListener('change',changeAction);
  document.addEventListener('submit',submitAction);
  document.addEventListener('error',event=>{if(event.target instanceof HTMLImageElement && event.target.classList.contains('item-art'))event.target.closest('.art-badge')?.classList.add('broken');},true);
  render();
  if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
}
function download(name,data){
  const content=typeof data==='string'?data:JSON.stringify(data,null,2);
  const blob=new Blob([content],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2500);
  log('download','OK',name);
}
function applyGameExport(raw){
 const x=validateExport(raw);
 const oldSnapshot=bundle.profiles[x.tag]?.export?.timestamp??0;
 if(!bundle.profiles[x.tag]&&!confirm('Add a new village profile for '+x.tag+'? Its currencies, Magic Items and roadmap will start empty.'))return false;
 bundle.profiles[bundle.activeProfileId]=state;
 useBundle(importIntoBundle(bundle,x));
 const improved=ensureHelperRoadmap(state);
 if(improved.added){state=improved.profile;bundle.profiles[bundle.activeProfileId]=state;}
 const advice=nextHomeBuilderRecommendations(state);
 const research=availableResearchQueues(state).filter(q=>q.status==='idle'&&q.recommendations.length);
 const hasBuilder=advice.availability?.availableAtLeast>0&&advice.recommendations.length>0;
 const assistants=helperActionRecommendations(state);
 const hasAssistantTasks=assistants.some(h=>h.detail||h.id===93000002||h.id===93000003);
 const shouldPrompt=Number.isFinite(x.timestamp)&&x.timestamp>oldSnapshot&&
   (hasBuilder||research.length>0||hasAssistantTasks)&&state.builderPromptLastShownAt!==x.timestamp;
 if(shouldPrompt){
   state.builderPromptLastShownAt=x.timestamp;
   queuedBuilderPrompt=state.playerTag;
   log('open-upgrade-slots','OK','Home builder: '+(hasBuilder?'yes':'no')+'; idle research: '+research.map(q=>q.key).join(','));
 }
 const snapshotTime=Number.isFinite(x.timestamp)?new Date(x.timestamp*1000).toLocaleString():'unknown';
 notify('Imported '+x.tag+' (game snapshot: '+snapshotTime+'). Countdown and estimated finish times refreshed. Resources, Magic Items and roadmap preserved.');
 log('game-timer-refresh','OK','Refreshed estimate from village JSON timestamp');
 log('helper-snapshot','OK','Target assignments in village JSON: '+helperSummary(x).filter(h=>h.assignment).length);
 return true;
}
async function readFile(e,kind){
  const f=e.target.files?.[0];if(!f)return;
  try {
    if(f.size>(kind==='game'?1200000:9000000))throw Error('File exceeds import size limit.');
    const raw=await f.text();
    if(kind==='game'){
      if(!applyGameExport(raw))return;
    }else{
      const restored=normalizeBundle(raw);
      if(!confirm('Restore all profiles from this backup? This replaces local profiles, currency and roadmaps. Download a backup first if needed.'))return;
      useBundle(restored);notify('Planner backup restored ('+Object.keys(bundle.profiles).length+' profiles).');
    }
    saveLocal(kind+'-import');render();
    if(kind==='game')showQueuedBuilderPrompt();
  }catch(err){notify(err.message||'Import failed','error');log(kind+'-import','FAILED',err.message);}
  finally{e.target.value='';}
}
function resourcePanel(){
  const keys=['gold','elixir','dark','gems','builderGold','builderElixir','cartGold','cartElixir','cartDark'];
  const labels={gold:'Gold · Home',elixir:'Elixir · Home',dark:'Dark Elixir',gems:'Gems · protected',builderGold:'Builder Gold',builderElixir:'Builder Elixir',cartGold:'Loot Cart Gold',cartElixir:'Loot Cart Elixir',cartDark:'Loot Cart Dark'};
  return '<div class="resource-grid">'+keys.map(k=>'<div class="field"><label for="money-'+k+'" class="label-with-art">'+resImage(k)+enc(labels[k])+'</label><input id="money-'+k+'" data-money="'+k+'" type="text" inputmode="numeric" autocomplete="off" value="'+format(state.resources[k])+'"></div>').join('')+'</div>';
}
function itemImage(category,name,level,compact=false){
 const url=artworkUrl(category,name,level);
 const abbreviation=String(name||'?').trim().slice(0,1).toUpperCase()||'?';
 return '<span class="art-badge '+(compact?'compact':'')+(url?'':' broken')+'">'+(url?'<img class="item-art" src="'+enc(url)+'" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">':'')+'<span class="art-fallback" aria-hidden="true">'+enc(abbreviation)+'</span></span>';
}
function resImage(key){return itemImage('resource',({gold:'Gold',elixir:'Elixir',dark:'Dark Elixir',gems:'Gems',builderGold:'Builder Gold',builderElixir:'Builder Elixir',cartGold:'Gold',cartElixir:'Elixir',cartDark:'Dark Elixir',shiny:'Shiny Ore',glowy:'Glowy Ore',starry:'Starry Ore'})[key]);}
const idCategory={heroes:'heroes',heroes2:'heroes2',pets:'pets',spells:'spells',units:'units',units2:'units2',equipment:'equipment',siege_machines:'siege_machines',buildings:'buildings',buildings2:'buildings2'};
function roadmapImage(task){
 // Match longest confirmed label, never derive an illustration from an unknown ID.
 const namesSorted=[...new Set(Object.values(names))].sort((a,b)=>b.length-a.length);
 const item=namesSorted.find(n=>task.title.toLowerCase().includes(n.toLowerCase()));
 if(!item)return itemImage('missing',task.title,1,true);
 let category='buildings';
 if(['Barbarian King','Archer Queen','Grand Warden','Royal Champion','Minion Prince','Battle Machine','Battle Copter'].includes(item))category='heroes';
 else if(['L.A.S.S.I','Electro Owl','Mighty Yak','Unicorn'].includes(item))category='pets';
 else if(task.queue==='Blacksmith')category='equipment';
 else if(task.queue==='Laboratory')category=item.endsWith('Spell')?'spells':'units';
 else if(task.queue==='Star Laboratory')category='units2';
 else if(task.village==='Builder')category='buildings2';
 const levelMatch=task.title.match(/(\d+)\s*→/);
 return itemImage(category,item,levelMatch?Number(levelMatch[1]):1,true);
}
function card(label,value,cls='',tip=''){
 return '<div class="card tint"><div class="label">'+enc(label)+'</div><div class="metric '+cls+'">'+enc(value)+'</div><div class="smallmuted">'+enc(tip)+'</div></div>';
}
function renderBuilderRecommendationCard(t){
 const money=moneyLabels[t.currency]||t.currency||'resources';
 const price=t.cost?format(t.cost)+' '+money+' (roadmap estimate; verify in game)':'Cost unknown; check in game';
 return '<div class="builder-choice"><strong>'+enc(t.title)+'</strong>'+
 '<span>'+enc(price)+'</span>'+
 '<small>'+enc(t.affordableFromSaved?'Saved balance appears sufficient; verify current game amount.':'Current affordability not confirmed. Confirm price and resources in game.')+'</small>'+
 (t.note?'<small>'+enc(t.note)+'</small>':'')+
 (t.taskId?'<button class="btn small" data-action="builder-view-task" data-task-id="'+encodeURIComponent(t.taskId)+'">View upgrade details</button>':
 '<button class="btn small" data-action="view-pets">View your pets</button>')+'</div>';
}
function renderBuilderNudge(profile){
 const result=nextHomeBuilderRecommendations(profile);
 if(!result.availability||result.availability.availableAtLeast<1)return '';
 if(profile.builderPromptDismissedAt===profile.export.timestamp)return '';
 const n=result.availability.availableAtLeast;
 return '<section class="card builder-nudge" role="status" aria-label="Builder available">'+
 '<span class="kicker">AVAILABLE BUILDER · FROM LAST GAME JSON</span>'+
 '<h2>'+n+' Home builder'+(n===1?'':'s')+' available at snapshot</h2>'+
 (result.recommendations.length?'<p>Recommended next: <strong>'+enc(result.recommendations[0].title)+'</strong>. Check in Clash before starting.</p>'+
 '<div class="row wrap"><button class="btn" data-action="builder-view-task" data-task-id="'+encodeURIComponent(result.recommendations[0].taskId)+'">See next upgrade</button>'+
 '<button class="btn secondary" data-action="goto-roadmap">Full roadmap</button></div>':
 '<p>No verified next upgrade in your current roadmap. Review the roadmap and in-game availability.</p>')+
 '<p class="smallmuted">Estimate counts your Builder Huts and active Home building, hero and trap timers. The JSON does not report actual builder assignments, and current resources are manually recorded.</p></section>';
}
function renderResearchNudges(profile){
 const idle=availableResearchQueues(profile).filter(q=>q.status==='idle');
 if(!idle.length||profile.builderPromptDismissedAt===profile.export?.timestamp)return '';
 return '<section class="card builder-nudge research-nudge" aria-label="Research queue recommendations">'+
 '<span class="kicker">RESEARCH AVAILABLE · FROM LAST GAME JSON</span>'+
 '<h2>'+idle.length+' research queue'+(idle.length===1?'':'s')+' idle at snapshot</h2>'+
 idle.map(q=>'<div class="research-nudge-row"><strong>'+enc(q.name)+'</strong> · '+
  (q.recommendations.length?'<span>Recommended: '+enc(q.recommendations[0].title)+'</span>'+
   (q.recommendations[0].taskId?'<button class="btn secondary small" data-action="builder-view-task" data-task-id="'+encodeURIComponent(q.recommendations[0].taskId)+'">Review</button>':
    '<button class="btn secondary small" data-action="view-pets">View pets</button>'):
   '<span>No verified next upgrade in the saved roadmap</span>')+'</div>').join('')+
 '<p class="smallmuted">Laboratory, Star Laboratory, and Pet House research run independently from construction builders. Idle status is based on the dated game JSON, not live syncing.</p></section>';
}
function renderFacilityAudit(profile){
 const facilities=armyFacilityAudit(profile);
 if(!facilities.length)return '';
 const available=facilities.filter(f=>f.nextLevel!==null&&!f.buildingUpgradeActive).length;
 return '<section class="card factory-audit" aria-label="All factories and army buildings">'+
 '<span class="kicker">FACTORY & ARMY BUILDING AUDIT</span>'+
 '<h2>Building upgrades and independent work</h2>'+
 '<p class="subtext">'+available+' structure upgrades could be considered when a builder is available. '+
 'Production buildings do not need to keep a worker busy: Home troops, spells and siege machines share the Home Laboratory for research; pets and Builder troops use their own research queues.</p>'+
 '<div class="factory-grid">'+facilities.map(f=>{
  const status=f.buildingUpgradeActive?'Building upgrade underway':
   f.nextLevel!==null?'Next structure level: '+f.level+' → '+f.nextLevel+' (requires builder)':
   f.atKnownHallCap?'At your current Hall cap':'Next structure upgrade: verify in game';
  return '<div class="factory-row">'+
   '<strong>'+enc(f.name)+' <span>Lv '+Number(f.level)+'</span></strong>'+
   '<small>'+enc(f.village)+' · '+enc(status)+'</small>'+
   '<small>'+enc(f.usage)+'</small></div>';
 }).join('')+'</div>'+
 '<p class="smallmuted">Building level caps here are checked for TH14/BH9. Resources and exact in-game upgrade prices must be confirmed manually. The JSON cannot prove a production factory is actively brewing spells or making troops.</p></section>';
}
function showQueuedBuilderPrompt(){
 const tag=queuedBuilderPrompt;queuedBuilderPrompt=null;
 if(tag!==state.playerTag)return;
 const rec=nextHomeBuilderRecommendations(state);
 const hasBuilder=rec.availability?.availableAtLeast>0&&rec.recommendations.length>0;
 const research=availableResearchQueues(state).filter(q=>q.status==='idle'&&q.recommendations.length);
 const assistantActions=helperActionRecommendations(state);
 if(!hasBuilder&&!research.length&&!assistantActions.length)return;
 const dialog=el('builder-dialog');
 builderDialogProfile=state.playerTag;builderDialogSnapshot=state.export.timestamp;
 const n=rec.availability?.availableAtLeast||0;
 const builderHtml=hasBuilder?'<section class="builder-popup-queue" data-alert-queue="home-builders">'+
  '<h3>Home Village builders · at least '+n+' free</h3>'+
  '<p class="subtext">Priority construction upgrades:</p>'+
  '<div class="builder-choice-list">'+rec.recommendations.map(renderBuilderRecommendationCard).join('')+'</div></section>':'';
 const researchHtml=research.map(q=>'<section class="builder-popup-queue" data-alert-queue="'+enc(q.key)+'">'+
  '<h3>'+enc(q.name)+' · idle in JSON</h3>'+
  '<p class="subtext">Recommended research, independent of construction builders:</p>'+
  '<div class="builder-choice-list">'+q.recommendations.map(renderBuilderRecommendationCard).join('')+'</div></section>').join('');
 const helperHtml=assistantActions.length?'<section class="builder-popup-queue" data-alert-queue="helpers">'+
 '<h3>Helper Hut · what each assistant should do next</h3>'+
 '<p class="subtext">One use per assistant per shared 23-hour workday. Confirm availability in the game.</p>'+
 '<div class="builder-choice-list">'+assistantActions.map(h=>
 '<div class="builder-choice helper-popup-item"><strong>'+enc(h.name)+' · Lv '+Number(h.level)+'</strong>'+
 '<span>'+enc(h.action)+'</span>'+
 '<small>'+enc(h.availability==='cooldown-recorded'?'Cooldown reported for this helper in the JSON.':
  'This assistant’s use today is not confirmed; check Helper Hut.')+'</small></div>').join('')+
 '</div></section>':'';
 el('builder-dialog-body').innerHTML='<div class="kicker">NEW GAME JSON · UPGRADE SLOTS AND HELPERS</div>'+
  '<h2 id="builder-dialog-title">Your next upgrades are ready to review</h2>'+
  '<p>Based on the '+enc(new Date(state.export.timestamp*1000).toLocaleString())+' village snapshot:</p>'+
  builderHtml+researchHtml+helperHtml+
  '<p class="smallmuted">Verify that each queue is still idle, and check actual costs and balances in Clash. A Lab Assistant speeds research but does not create a second research slot. No game actions or deductions happen automatically.</p>'+
  '<button class="btn secondary" data-action="builder-dismiss">Not now</button>';
 log('upgrade-recommendation','OK','Displayed builder '+(hasBuilder?'yes':'no')+' research '+research.map(q=>q.key).join(','));
 if(!dialog.open)dialog.showModal();
}
function renderOverview(){
 const th=state.export?.buildings?.find(b=>b.data===1000001)?.lvl||'—';
 const bh=state.export?.buildings2?.find(b=>b.data===1000034)?.lvl||'—';
 return coverFor(state)+gaugeDeck(state)+renderHelperStrip(state)+renderFullVillagePlan(state)+renderBuilderNudge(state)+renderResearchNudges(state)+renderFacilityAudit(state)+
 '<div class="command-grid"><div>'+builderBoard(state)+'</div><div class="command-side">'+
 '<section class="card"><div class="panel-heading"><div><span class="kicker">NEXT MOVES</span><h2>Upgrade quest path</h2></div><button class="btn secondary small" data-action="goto-roadmap">Full roadmap ›</button></div>'+
 '<p class="subtext">Tap a quest to inspect its cost and change its status. These are suggested steps, not automatic game actions.</p>'+
 questTrail(state.roadmap)+'</section>'+
 '<section class="card"><div class="panel-heading"><div><span class="kicker">RESOURCE CONTROL</span><h2>Adjust balances</h2></div></div>'+
 '<p class="subtext">These amounts are entered manually. Gold and Elixir in the Loot Cart are tracked separately.</p>'+resourcePanel()+'</section></div></div>'+
 '<div class="grid two space"><section class="card"><h2>Account status</h2><div class="grid two">'+
 card('Home base','TH '+th,'','Imported snapshot')+card('Builder base','BH '+bh,'','Imported snapshot')+'</div>'+
 '<p class="smallmuted">Player: '+enc(state.playerTag)+'<br>Latest import: '+enc(state.importedAt?new Date(state.importedAt).toLocaleString():'Not imported yet')+'</p>'+
 '<div class="row wrap"><button class="btn" data-action="paste-shortcut">Import fresh JSON</button>'+
 '<button class="btn secondary" data-action="goto-roadmap">Plan next upgrades</button></div></section>'+
 '<section class="card"><h2>How progress works</h2><p class="note">Upgrade timer bars track from the earliest observed snapshot for a continuing job, not necessarily the entire build. Remaining time and estimated completion use the latest dated game JSON. Known helper assignments and countdowns also come from each imported JSON.</p>'+
 '<p class="subtext space">Storage gauges infer maximum capacity from your imported buildings. In-game balances still require manual entry, and no game resources are spent automatically.</p></section></div>';
}
function recommendations(){
 const targets=state.roadmap.filter(x=>x.status==='planned').slice(0,5);
 return '<div class="stack">'+targets.map((t,i)=>'<div class="row"><span class="tag">'+(i+1)+'</span>'+roadmapImage(t)+'<div class="grow"><strong>'+enc(t.title)+'</strong><div class="smallmuted">'+enc(t.queue+' · '+t.note)+'</div></div></div>').join('')+'</div><div class="note space">Keep Laboratory and pet research busy independently of your builders. Verify costs in Clash of Clans before starting each job.</div>';
}
function renderRoadmap(){
 const data=state.roadmap.filter(x=>filter==='all'||x.village===filter||x.status===filter);
 const progress=state.roadmap.filter(t=>t.status==='done').length;
 return renderHelperStrip(state)+'<section class="card quest-panel"><div class="panel-heading"><div><span class="kicker">YOUR UPGRADE PATH</span><h2>Quest progression</h2></div></div>'+questTrail(state.roadmap,filter==='Home'||filter==='Builder'?filter:'all')+'</section><div class="grid three">'+card('Completed',progress+' / '+state.roadmap.length,'green','Manually recorded')+
 card('Active',state.roadmap.filter(t=>t.status==='active').length,'gold','Review when timers finish')+
 card('Remaining boost',state.boostEnd?timeLeft(state.boostEnd):'Set end date','','50% returning boost; dates are manual')+'</div>'+
 '<div class="grid two space"><section class="card"><h2>Your upgrade timeline</h2><div class="filters">'+
 ['all','Home','Builder','active','planned','done'].map(x=>'<button class="chip '+(filter===x?'selected':'')+'" data-filter="'+x+'">'+enc(x[0].toUpperCase()+x.slice(1))+'</button>').join('')+'</div>'+
 '<div>'+data.map(t=>'<div class="task"><div class="item-identity">'+roadmapImage(t)+'<div><button class="task-launch" data-open-task="'+encodeURIComponent(t.id)+'">'+enc(t.title)+' ↗</button><div class="micro">'+enc(t.village)+' · '+enc(t.queue)+' · '+enc(t.cost?format(t.cost)+' '+(moneyLabels[t.costType]||t.costType):'Check in-game cost')+'</div><p>'+enc(t.note)+'</p></div></div><aside><span class="pill '+enc(t.status)+'">'+enc(t.status)+'</span><select aria-label="Status of '+enc(t.title)+'" data-task="'+enc(t.id)+'">'+['planned','active','done','skipped'].map(s=>'<option value="'+s+'" '+(t.status===s?'selected':'')+'>'+s+'</option>').join('')+'</select></aside></div>').join('')+'</div></section>'+
 '<section class="stack"><div class="card"><h2>Boost deadline</h2><p class="smallmuted">A 50% building/research boost was observed. Set its expiry from your game screen; do not assume the countdown lasts forever.</p><div class="field"><label>Returning boost expires (device local time)</label><input type="datetime-local" data-boost-end value="'+enc(state.boostEnd||'')+'"></div><p class="smallmuted">Suggested order: finish Army Camps, unlock Unicorn and Recall Spell, raise Freeze Spell, then tackle B.O.B. milestones. Keep all queues working.</p></div>'+
 '<div class="card"><h2>Add a custom upgrade</h2><form id="task-form" class="stack"><div class="field"><label>Upgrade title</label><input name="title" maxlength="100" required placeholder="Example: Grand Warden 28 → 29"></div><div class="grid two"><div class="field"><label>Village</label><select name="village"><option>Home</option><option>Builder</option></select></div><div class="field"><label>Queue</label><select name="queue"><option>Builder</option><option>Laboratory</option><option>Star Laboratory</option><option>Pet House</option><option>Blacksmith</option></select></div></div><div class="grid two"><div class="field"><label>Cost resource</label><select name="costType">'+moneyKeys.map(([key,label])=>'<option value="'+key+'">'+enc(label)+'</option>').join('')+'</select></div><div class="field"><label>Cost (0 if unknown)</label><input name="cost" type="number" min="0" value="0"></div></div><div class="field"><label>Notes</label><textarea name="note" maxlength="350" placeholder="Why and when to build this"></textarea></div><button class="btn" type="submit">Add roadmap step</button></form></div>'+
 '<div class="card"><h2>Planner notes</h2><div class="field"><label>Editable instructions</label><textarea data-state-note>'+enc(state.notes||'')+'</textarea></div></div></section></div>';
}
function timeLeft(s){const secs=Math.ceil((new Date(s).getTime()-Date.now())/1000);if(!Number.isFinite(secs))return'Unknown';if(secs<=0)return'Expired';return Math.floor(secs/86400)+'d '+Math.floor(secs%86400/3600)+'h';}
function renderInventory(){
 const rows=rowsFromExport(state.export,invGroup);
 return '<section class="card"><div class="panel-heading"><div><span class="kicker">YOUR COLLECTION</span><h2>Village inventory</h2></div>'+
 '<button class="btn" data-action="choose-file">↑ Update game JSON</button></div>'+
 '<p class="subtext">Tap any card for its level, snapshot timer and matching upgrade plan.</p>'+
 '<div class="filters">'+categories.map(([id,title])=>'<button class="chip '+(invGroup===id?'selected':'')+'" data-category="'+id+'">'+enc(title)+'</button>').join('')+'</div>'+
 '<div class="collection-toolbar"><span class="smallmuted">'+(state.export?'Snapshot: '+new Date(state.export.timestamp*1000).toLocaleString():'No snapshot')+'</span>'+
 '<div class="row"><button class="btn small '+(inventoryMode==='gallery'?'':'secondary')+'" data-inventory-mode="gallery">▦ Cards</button>'+
 '<button class="btn small '+(inventoryMode==='table'?'':'secondary')+'" data-inventory-mode="table">≡ Table</button></div></div>'+
 (!state.export?'<div class="empty">Import a village JSON export to see this collection.</div>':
 inventoryMode==='gallery'?gallery(state,invGroup):
 '<div class="scroll-table"><table class="inventory-table"><thead><tr><th>Item</th><th class="num">Level</th><th class="num">Count</th><th>Upgrade timer</th></tr></thead><tbody>'+
 rows.map((r,i)=>'<tr><td><button class="inventory-link" data-open-inventory="'+i+'"><span class="item-identity">'+itemImage(invGroup,r.name,r.level,true)+'<span>'+enc(r.name)+'</span></span></button></td>'+
 '<td class="num">'+r.level+'</td><td class="num">'+r.count+'</td><td>'+(r.timer!==null?(r.finishesAt?enc(new Date(r.finishesAt).toLocaleString()):'Pending'):'—')+'</td></tr>').join('')+
 '</tbody></table></div>')+'</section>';
}
function renderItems(){
 const known=new Set(itemGroups.flatMap(([_,keys])=>keys));
 const additions=Object.keys(state.items||{}).filter(k=>!known.has(k)).sort();
 const group=(title,keys)=>'<section class="card"><h2>'+enc(title)+'</h2><div class="grid items">'+keys.map(key=>
  '<div class="item-field"><label class="label-with-art">'+itemImage('magicItem',key,1,true)+enc(key)+'</label>'+
  '<input type="text" inputmode="numeric" autocomplete="off" aria-label="Actual quantity of '+enc(key)+'" data-item="'+enc(key)+'" value="'+format(state.items[key])+'"></div>').join('')+'</div></section>';
 const groups=itemGroups.map(([label,keys])=>group(label,keys)).join('')+(additions.length?group('Additional inventory items',additions):'');
 const ores=['shiny','glowy','starry'];
 return '<section class="card magic-lead"><span class="kicker">ACTUAL INVENTORY</span><h2>Books, Runes, Potions & Magic Items</h2>'+
 '<p><strong>Enter what you currently OWN</strong>, not what is still unclaimed in the event. There is no 5/5 limit in this tracker: enter 6, 8, 12 or any real amount shown by your game.</p>'+
 '<div class="row wrap"><button class="btn secondary" data-action="go-pass">◈ Open Season Pass claim list</button><button class="btn secondary" data-action="go-sync">↓ Back up your inventory</button></div>'+
 '<p class="smallmuted">This app cannot read Magic Item quantities from the village JSON. Changes are saved locally on this phone until you choose Save to GitHub.</p></section>'+
 '<div class="grid two space">'+groups+'</div>'+
 '<section class="card space"><h2>Have another item that isn’t listed?</h2>'+
 '<form id="extra-item-form" class="row wrap"><div class="field grow"><label for="extra-item-name">Item name</label><input id="extra-item-name" name="name" maxlength="70" placeholder="e.g. Limited event item" required></div>'+
 '<div class="field"><label for="extra-item-count">Actual quantity</label><input id="extra-item-count" name="quantity" type="text" inputmode="numeric" placeholder="0" value="0"></div>'+
 '<button class="btn" type="submit">Add to inventory</button></form></section>'+
 '<section class="card space"><h2>Hero equipment ores</h2><div class="resource-grid">'+ores.map(k=>
 '<div class="field"><label class="label-with-art">'+resImage(k)+enc(moneyLabels[k])+'</label>'+
 '<input type="text" inputmode="numeric" autocomplete="off" data-money="'+k+'" value="'+format(state.resources[k])+'"></div>').join('')+'</div>'+
 '<p class="smallmuted">Equipment levels are saved separately in your imported village snapshot.</p></section>';
}
function renderSync(){
 return '<div class="grid two"><section class="card"><h2>Import & export</h2><p class="smallmuted">Import an unfamiliar player tag to add another profile. An existing tag updates only that account. Full backups contain ALL profiles, currencies, Magic Items and roadmaps.</p><div class="stack"><button class="btn" data-action="choose-file">↑ Import Clash of Clans JSON</button><button class="btn secondary" data-action="download">↓ Download full planner backup</button><button class="btn secondary" data-action="restore">↑ Restore planner backup</button></div><div class="divider"></div><div class="field"><label for="paste-export">Or paste the JSON copied from Clash of Clans</label><textarea id="paste-export" rows="5" spellcheck="false" autocomplete="off" placeholder="{&quot;tag&quot;:&quot;#YOURTAG&quot;, ...}"></textarea></div><button class="btn space" data-action="import-pasted">Import pasted game JSON</button><div class="divider"></div><div class="field"><label>Latest imported game snapshot</label><div class="note">'+enc(state.importedAt||'No game export imported yet')+'</div></div></section>'+
 '<section class="card"><h2>GitHub sync</h2><p class="smallmuted">Repository: <a href="https://github.com/'+REPO+'" target="_blank" rel="noopener">'+REPO+'</a>. The code is public. Sync writes ALL saved profiles to a PUBLIC GitHub file. Anyone can view player tags, resource balances and inventories.</p>'+
 '<div class="note">Use a <strong>fine-grained GitHub personal access token</strong> with Contents read/write restricted to <strong>Slot-22 only</strong>. This is NOT the in-game Clash Settings API Token or the separate Clash developer API key. Never paste a token into chat. It is not saved and clears on refresh.</div>'+
 '<div class="field space"><label>Fine-grained GitHub token (not saved)</label><input id="github-token" type="password" autocomplete="off" spellcheck="false" placeholder="Paste GitHub token here"></div>'+
 '<div class="row wrap space"><button class="btn secondary" data-action="gh-load">↓ Load from GitHub</button><button class="btn" data-action="gh-save">↑ Save to GitHub</button></div><p class="smallmuted">GitHub save and load are manual; game data will not automatically update itself. If another device edited the remote file, a conflict will stop an overwrite.</p></section></div>';
}
function renderTesting(){
 return '<div class="grid two"><section class="card"><h2>Test this version</h2><p class="smallmuted">Complete each step physically on your phone or browser. No test is marked passed automatically based only on a click.</p>'+
 testSteps.map((t,i)=>'<label class="testcase"><input type="checkbox" data-test="'+i+'" '+(manualTests[i]?'checked':'')+'><span>'+enc(t)+'</span></label>').join('')+
 '<div class="row wrap space"><button class="btn" data-action="test-report">Export test report</button><button class="btn secondary" data-action="clear-tests">Clear test checks</button></div></section>'+
 '<section class="card"><h2>Diagnostics</h2><p class="smallmuted">Action results are logged locally without tokens or raw imported account content. Export the report if you encounter a problem.</p><button class="btn secondary" data-action="diagnostics">Export diagnostics</button><div class="divider"></div>'+
 diagnostics.slice(-18).reverse().map(x=>'<div class="task"><div><strong>'+enc(x.type)+'</strong><p>'+enc(x.time)+' · '+enc(x.detail)+'</p></div><aside><span class="pill '+(x.outcome==='OK'?'done':'skipped')+'">'+enc(x.outcome)+'</span></aside></div>').join('')+'</section></div>';
}

function openDetail({taskId=null,recordIndex=null,category=null,fromQueue=false}={}){
 try{
  const task=taskId?state.roadmap.find(t=>t.id===taskId):null;
  let record=null,kind=category;
  if(recordIndex!==null && Number.isInteger(recordIndex) && recordIndex>=0){
   if(fromQueue){
    const records=ongoingFromExport(state.export);
    record=records[recordIndex]||null;
    kind=categories.find(c=>c[1]===record?.category)?.[0]||null;
   }else{
    record=rowsFromExport(state.export,category)[recordIndex]||null;
   }
  }
  if(!task&&!record)throw Error('Upgrade details could not be found. Refresh the page and try again.');
  const dialog=el('item-dialog');
  el('item-dialog-body').innerHTML=detailContent({profile:state,record,category:kind,task});
  if(!dialog.open)dialog.showModal();
  log('open-upgrade','OK',(task?.id||record?.name||'unknown').slice(0,55));
 }catch(err){notify(err.message,'error');log('open-upgrade','FAILED',err.message);}
}
function updateVisualTimers(){
 const now=Date.now();
 document.querySelectorAll('[data-fill]').forEach(node=>{const pct=Number(node.dataset.fill);if(Number.isFinite(pct))node.style.width=Math.max(0,Math.min(100,pct))+'%';});
 document.querySelectorAll('[data-timer-end]').forEach(node=>{
   const end=Number(node.dataset.timerEnd);
   node.textContent=end?remainingTime(end,now).text:'Timer unavailable';
 });
 document.querySelectorAll('[data-helper-session-end],[data-helper-cooldown-end]').forEach(node=>{
   const session=node.dataset.helperSessionEnd!==undefined;
   const end=Number(session?node.dataset.helperSessionEnd:node.dataset.helperCooldownEnd);
   node.textContent=helperCountdown(end,session?'work':'cooldown',now);
 });
 for(const node of document.querySelectorAll('[data-timer-progress],[data-timer-percent]')){
   const raw=node.dataset.timerProgress||node.dataset.timerPercent;
   const [start,end]=raw.split(',').map(Number);
   if(end>start && Number.isFinite(start)&&Number.isFinite(end)){
     const pct=Math.max(0,Math.min(100,100*(now-start)/(end-start)));
     if(node.dataset.timerPercent!==undefined)node.textContent=String(Math.round(pct));
     else node.style.width=pct.toFixed(1)+'%';
   }
 }
}
function trackUpgradeAction(action,encodedId){
 try{
  const id=decodeURIComponent(encodedId||'');
  const task=state.roadmap.find(t=>t.id===id);
  if(!task)throw Error('This roadmap task no longer exists.');
  if(action==='mark-task'){
   state=setTaskStatus(state,id,'active');
   saveLocal('task-mark-active');notify('Task marked active in planner. No game action performed.');
  }else{
   if(task.status!=='planned')throw Error('This task was already started, finished or skipped. No resources changed.');
   const preview=planPreview(task,state.resources);
   if(!preview.valid||!preview.affordable||preview.key==='gems')throw Error('Unknown cost or insufficient resources. No balance changed.');
   if(!confirm('Record '+task.title+' as started and subtract '+format(preview.cost)+' '+(moneyLabels[preview.key]||preview.key)+' from the selected profile? This does not start the upgrade in Clash of Clans.'))return;
   state.resources[preview.key]=preview.remaining;
   state=setTaskStatus(state,id,'active');
   state.history=(state.history||[]).concat({at:new Date().toISOString(),kind:'manual-upgrade-spend',note:task.title+' · '+format(preview.cost)+' '+preview.key}).slice(-120);
   saveLocal('resource-spent-in-tracker');
   notify('Upgrade recorded in planner; '+format(preview.cost)+' '+(moneyLabels[preview.key]||preview.key)+' deducted locally.');
  }
  el('item-dialog')?.close();
  render();
 }catch(err){notify(err.message,'error');log('upgrade-action','FAILED',err.message);}
}

const titles={overview:'Village overview',roadmap:'Upgrade roadmap',inventory:'Village inventory',items:'Magic Items & ores',pass:'Season Pass prizes',insights:'JSON insights & helpers',sync:'GitHub & backups',testing:'Testing & diagnostics'};
function render() {
 for(const b of document.querySelectorAll('[data-tab]'))b.classList.toggle('active',b.dataset.tab===view);
 el('section-title').textContent=titles[view];el('player-tag').textContent=state.playerTag;
 el('profile-select').innerHTML=Object.entries(bundle.profiles).map(([tag,p])=>'<option value="'+enc(tag)+'" '+(tag===bundle.activeProfileId?'selected':'')+'>'+enc(p.displayName||tag)+' ('+enc(tag)+')</option>').join('');
 const th=state.export?.buildings?.find(b=>b.data===1000001)?.lvl||'—';
 const bh=state.export?.buildings2?.find(b=>b.data===1000034)?.lvl||'—';
 el('village-subtitle').textContent='TOWN HALL '+th+' · BUILDER HALL '+bh;
 el('main').innerHTML=({overview:renderOverview,roadmap:renderRoadmap,inventory:renderInventory,items:renderItems,pass:()=>renderPassRewards(state,passFilter,editingRewardId),insights:()=>renderInsights(state),sync:renderSync,testing:renderTesting}[view])();
 updateVisualTimers();
}
function commaInput(e){
 const field=e.target;
 if(!field.matches?.('[data-money],[data-item],[data-cap]'))return;
 const original=field.value;
 const start=field.selectionStart??original.length;
 const digitPosition=original.slice(0,start).replace(/\D/g,'').length;
 const digits=original.replace(/\D/g,'');
 const result=digits?format(digits):'';
 field.value=result;
 if(!result){field.setSelectionRange(0,0);return;}
 let seen=0,position=result.length;
 if(digitPosition===0)position=0;
 else for(let i=0;i<result.length;i++){if(/\d/.test(result[i]))seen++;if(seen===digitPosition){position=i+1;break;}}
 field.setSelectionRange(position,position);
}
function changeAction(e){
 const t=e.target;
 if(t.dataset.passChoice){try{state=updatePassState(state,t.dataset.passChoice,'choose',t.value);saveLocal('pass-choice-selection');render();}catch(err){notify(err.message,'error');render();}return;}
 if(t.dataset.cap){state.storageCaps??={};state.storageCaps[t.dataset.cap]=integer(t.value);saveLocal('capacity-edit');render();return;}
 if(t.dataset.money){state.resources[t.dataset.money]=integer(t.value);t.value=format(state.resources[t.dataset.money]);saveLocal('resource-edit');return;}
 if(t.dataset.item){state.items[t.dataset.item]=integer(t.value);t.value=format(state.items[t.dataset.item]);saveLocal('item-edit');return;}
 if(t.dataset.task){try{state=setTaskStatus(state,t.dataset.task,t.value);saveLocal('roadmap-status');render();}catch(err){notify(err.message,'error');}return;}
 if(t.dataset.boostEnd!==undefined){state.boostEnd=t.value||null;saveLocal('boost-edit');return;}
 if(t.dataset.stateNote!==undefined){state.notes=t.value.slice(0,3000);saveLocal('notes-edit');return;}
 if(t.dataset.test!==undefined){manualTests[t.dataset.test]=t.checked;localStorage.setItem(TESTS,JSON.stringify(manualTests));log('guided-test','MANUAL',t.dataset.test+' '+(t.checked?'checked':'unchecked'));}
}
function clickAction(e){
 const target=e.target.closest('[data-action],[data-filter],[data-category],[data-open-task],[data-open-record],[data-open-inventory],[data-inventory-mode],[data-pass-filter],[data-pass-toggle],[data-edit-reward]');
 if(!target)return;
 if(target.dataset.editReward){editingRewardId=target.dataset.editReward;view='pass';render();el('pass-reward-form')?.scrollIntoView({block:'center',behavior:'smooth'});return;}
 if(target.dataset.passFilter){passFilter=target.dataset.passFilter;render();return;}
 if(target.dataset.passToggle){try{state=updatePassState(state,target.dataset.passToggle,'toggle');saveLocal('pass-claim-status');render();notify('Pass reward recorded in tracker only. Update actual balances and Magic Items after claiming in-game.');}catch(err){notify(err.message,'error');}return;}
 if(target.dataset.filter){filter=target.dataset.filter;render();return;}
 if(target.dataset.category){invGroup=target.dataset.category;render();return;}
 if(target.dataset.inventoryMode){inventoryMode=target.dataset.inventoryMode;render();return;}
 if(target.dataset.openTask){openDetail({taskId:decodeURIComponent(target.dataset.openTask)});return;}
 if(target.dataset.openRecord!==undefined){openDetail({recordIndex:Number(target.dataset.openRecord),fromQueue:true});return;}
 if(target.dataset.openInventory!==undefined){openDetail({recordIndex:Number(target.dataset.openInventory),category:invGroup});return;}
 const action=target.dataset.action;
 if(action==='builder-dismiss'){el('builder-dialog')?.close();return;}
 if(action==='view-pets'){el('builder-dialog')?.close();view='inventory';invGroup='pets';render();return;}
 if(action==='builder-view-task'){
   const id=decodeURIComponent(target.dataset.taskId||'');
   el('builder-dialog')?.close();
   if(!state.roadmap.some(t=>t.id===id)){notify('This recommendation is no longer available; import a newer JSON.','warn');return;}
   openDetail({taskId:id});return;
 }
 if(action==='go-items'){view='items';render();return;}
 if(action==='go-insights'){view='insights';render();return;}
 if(action==='go-pass'){view='pass';render();return;}
 if(action==='go-sync'){view='sync';render();return;}
 if(action==='reward-cancel'){editingRewardId=null;render();return;}
 if(action==='reward-delete'){if(confirm('Remove this extra reward from your tracker? This only changes the planner, not the game.')){try{state=removeCustomReward(state,target.dataset.rewardId);editingRewardId=null;saveLocal('reward-delete');render();notify('Extra reward removed from tracker.');}catch(err){notify(err.message,'error');}}return;}
 if(action==='goto-roadmap'){view='roadmap';render();}
 if(action==='close-detail'){el('item-dialog')?.close();return;}
 if(action==='mark-task'||action==='record-upgrade'){trackUpgradeAction(action,target.dataset.taskId);return;}
 if(action==='choose-file')el('game-file').click();
 if(action==='paste-shortcut'){view='sync';render();el('paste-export')?.focus();}
 if(action==='import-pasted'){
  try{
   const raw=el('paste-export')?.value?.trim();
   if(!raw)throw Error('Paste the Clash of Clans JSON from the game first.');
   if(applyGameExport(raw)){saveLocal('paste-import');view='overview';render();showQueuedBuilderPrompt();}
  }catch(err){notify(err.message||'Paste failed','error');log('paste-import','FAILED',err.message);}
 }
 if(action==='restore')el('backup-file').click();
 if(action==='download')download('clash-all-profiles-backup.json',bundle);
 if(action==='diagnostics')download('clash-diagnostics.json',{generatedAt:new Date().toISOString(),version:1,logs:diagnostics});
 if(action==='test-report')download('clash-guided-test-report.json',{generatedAt:new Date().toISOString(),manual:true,results:testSteps.map((name,i)=>({name,confirmed:!!manualTests[i]})),logs:diagnostics});
 if(action==='clear-tests'){manualTests={};localStorage.setItem(TESTS,'{}');render();}
 if(action==='rename-profile'){const name=prompt('Name for '+state.playerTag+' (e.g. Main or Mini):',state.displayName||state.playerTag);if(name!==null){const val=name.trim().slice(0,45);if(val){state.displayName=val;saveLocal('profile-rename');render();}}}
 if(action==='gh-load')void gitLoad();
 if(action==='gh-save')void gitSave();
}
function submitAction(e){
 if(e.target.id==='pass-reward-form'){
  e.preventDefault();
  const f=new FormData(e.target);
  try{
   state=saveRewardDefinition(state,{id:f.get('rewardId'),track:f.get('track'),kind:f.get('kind'),optionA:f.get('optionA'),optionB:f.get('optionB'),note:f.get('note')});
   editingRewardId=null;saveLocal('reward-definition');render();notify('Reward saved in the selected account’s checklist. No game item was collected.');
  }catch(err){notify(err.message,'error');log('reward-definition','FAILED',err.message);}
  return;
 }
 if(e.target.id==='extra-item-form'){
  e.preventDefault();const f=new FormData(e.target);
  const name=String(f.get('name')||'').trim().slice(0,70);
  if(!name||name==='__proto__'||name==='constructor'||name==='prototype'){notify('Enter a valid Magic Item name.','error');return;}
  if(Object.keys(state.items||{}).length>=150 && !(name in (state.items||{}))){notify('Item limit reached.','error');return;}
  if(name in (state.items||{})){notify('Item already exists. Update its quantity above instead.','error');return;}
  state.items??={};state.items[name]=integer(f.get('quantity'));
  saveLocal('inventory-new-item');render();notify('Added '+name+' to your actual Magic Item inventory (not Season Pass rewards).');return;
 }
 if(e.target.id!=='task-form')return;
 e.preventDefault();const f=new FormData(e.target);
 const title=String(f.get('title')||'').trim();if(!title)return;
 const id='CUSTOM-'+Date.now();
 state.roadmap.push(makeTask(id,title,String(f.get('village')),String(f.get('queue')),String(f.get('costType')),integer(f.get('cost')),String(f.get('note')||'').slice(0,350)));
 saveLocal('task-add');notify('Custom roadmap step added.');render();
}
function base64ToText(b64){
 const binary=atob(b64.replace(/\s/g,''));const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));return new TextDecoder().decode(bytes);
}
function textToBase64(s){
 const bytes=new TextEncoder().encode(s);let result='';
 for(let i=0;i<bytes.length;i+=8192)result+=String.fromCharCode(...bytes.subarray(i,i+8192));
 return btoa(result);
}
function token(){return el('github-token')?.value.trim()||'';}
function apiUrl(){return 'https://api.github.com/repos/'+REPO+'/contents/'+STATE_PATH;}
async function api(url,opts={}){
 const t=token();if(!t)throw Error('Enter a fine-grained GitHub token with Contents permission for Slot-22.');
 const headers={'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Authorization':'Bearer '+t,'Content-Type':'application/json'};
 const response=await fetch(url,{...opts,headers});
 if(response.status===404)return {missing:true};
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw Error('GitHub HTTP '+response.status+': '+String(data.message||'request failed').slice(0,130));
 return data;
}
async function gitLoad(){
 try{
  const x=await api(apiUrl()+'?ref=main');if(x.missing)throw Error('Remote planner file does not exist yet.');
  const incoming=normalizeBundle(base64ToText(x.content));
  if(!confirm('Replace the local planner with the copy stored on GitHub? Download a local backup first if needed.'))return;
  useBundle(incoming);ghSha=x.sha;saveLocal('github-load');notify('Loaded '+Object.keys(bundle.profiles).length+' profile(s) from GitHub.');render();
 }catch(e){notify(e.message,'error');log('github-load','FAILED',e.message);}
}
async function gitSave(){
 try{
  if(!confirm('Save ALL '+Object.keys(bundle.profiles).length+' Clash profile(s), inventories, balances and roadmaps to a PUBLIC GitHub file? Everyone can view them.'))return;
  const current=await api(apiUrl()+'?ref=main');
  if(!current.missing && ghSha && current.sha!==ghSha)throw Error('Conflict: the GitHub copy changed on another device. Load it and reconcile before saving.');
  if(!current.missing && !ghSha && !confirm('You have not loaded the current GitHub copy in this tab. Overwrite it with the current local planner?'))return;
  bundle.profiles[bundle.activeProfileId]=state;
  const body={message:'data: update clash village profiles snapshot',content:textToBase64(JSON.stringify(bundle,null,2)),branch:'main'};
  if(!current.missing)body.sha=current.sha;
  const saved=await api(apiUrl(),{method:'PUT',body:JSON.stringify(body)});
  ghSha=saved.content?.sha||null;
  notify('Saved to GitHub. Your public planner JSON is now updated.');log('github-save','OK','Saved revision '+state.revision);
 }catch(e){notify(e.message,'error');log('github-save','FAILED',e.message);}
}
initialize().catch(e=>{log('startup','FAILED',e.message);notify('Startup failed: '+e.message,'error');});
