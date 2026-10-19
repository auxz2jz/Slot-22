import {names,categories,moneyKeys,itemGroups,labelFor} from './catalog.mjs';
import {REPO,STATE_PATH,seedState,validateState,importVillage,rowsFromExport,ongoingFromExport,setTaskStatus,format,integer,budget,makeTask} from './core.mjs';

const STORAGE='clash-slot22-state-v1',TESTS='clash-slot22-tests-v1';
const el=id=>document.getElementById(id);
const enc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state=seedState(),view='overview',filter='all',invGroup='buildings',ghSha=null;
let diagnostics=[],manualTests={};
const testSteps=[
 'Overview lists current resource values.',
 'Changing a Gold balance survives a page reload.',
 'Importing a new game JSON updates inventory and preserves manual resources.',
 'A roadmap task can be marked complete and remains complete after reload.',
 'Magic Item quantity edits survive reload.',
 'Backup JSON downloads and can be restored.',
 'GitHub Load/Save works with a restricted token (optional; never record token).',
 'Export diagnostics produces a redacted report.'
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
  try{localStorage.setItem(STORAGE,JSON.stringify(state));log(type,'OK');}catch(e){notify('Storage unavailable. Export a backup now.','error');log(type,'FAILED','Local storage failed');}
}
function notify(message,kind='ok') {
  const target=el('notice'); target.className='notice'+(kind==='error'?' error':kind==='warn'?' warn':'');target.textContent=message;
}
function readSaved() {
  try{
    diagnostics=JSON.parse(localStorage.getItem('clash-slot22-diagnostics')||'[]');
    manualTests=JSON.parse(localStorage.getItem(TESTS)||'{}');
    const v=localStorage.getItem(STORAGE);if(v){state=validateState(v);return true;}
  }catch(e){notify('Saved local data could not be loaded. Default profile shown.','error');log('startup','ERROR',e.message);}
  return false;
}
async function initialize(){
  const local=readSaved();
  if(!local) {
    try{
      const response=await fetch('./data/player-state.json',{cache:'no-store'});
      if(response.ok) state=validateState(await response.json());
    }catch{}
    try{localStorage.setItem(STORAGE,JSON.stringify(state));}catch{}
  }
  for(const nav of document.querySelectorAll('[data-tab]')) nav.addEventListener('click',()=>{view=nav.dataset.tab;render();});
  el('download-backup').addEventListener('click',()=>download('clash-village-backup.json',state));
  el('game-file').addEventListener('change', async e=>readFile(e,'game'));
  el('backup-file').addEventListener('change',async e=>readFile(e,'backup'));
  document.addEventListener('click',clickAction);
  document.addEventListener('change',changeAction);
  document.addEventListener('submit',submitAction);
  render();
  if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
}
function download(name,data){
  const content=typeof data==='string'?data:JSON.stringify(data,null,2);
  const blob=new Blob([content],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2500);
  log('download','OK',name);
}
async function readFile(e,kind){
  const f=e.target.files?.[0];if(!f)return;
  try {
    if(f.size>1200000)throw Error('File larger than 1.2 MB.');
    const text=await f.text();
    if(kind==='game'){state=importVillage(state,text);notify('Game export imported. Resource and Magic Item balances preserved.');}
    else {const restored=validateState(text);if(!confirm('Restore all planner data? This replaces the local planner state.'))return;state=restored;notify('Planner backup restored.');}
    saveLocal(kind+'-import');render();
  }catch(err){notify(err.message||'Import failed','error');log(kind+'-import','FAILED',err.message);}
  finally{e.target.value='';}
}
function resourcePanel(){
  const keys=['gold','elixir','dark','gems','builderGold','builderElixir','cartGold','cartElixir','cartDark'];
  const labels={gold:'Gold · Home',elixir:'Elixir · Home',dark:'Dark Elixir',gems:'Gems · protected',builderGold:'Builder Gold',builderElixir:'Builder Elixir',cartGold:'Loot Cart Gold',cartElixir:'Loot Cart Elixir',cartDark:'Loot Cart Dark'};
  return '<div class="resource-grid">'+keys.map(k=>'<div class="field"><label for="money-'+k+'">'+labels[k]+'</label><input id="money-'+k+'" data-money="'+k+'" type="number" min="0" step="1" value="'+integer(state.resources[k])+'"></div>').join('')+'</div>';
}
function card(label,value,cls='',tip=''){
 return '<div class="card tint"><div class="label">'+enc(label)+'</div><div class="metric '+cls+'">'+enc(value)+'</div><div class="smallmuted">'+enc(tip)+'</div></div>';
}
function renderOverview(){
 const r=state.resources,pending=state.roadmap.filter(x=>x.status==='active');
 let next=ongoingFromExport(state.export);
 let now=Date.now();
 return '<div class="grid kpis">'+card('Gold in storage',format(r.gold),'gold','Loot Cart: '+format(r.cartGold))+card('Elixir in storage',format(r.elixir),'elixir','Loot Cart: '+format(r.cartElixir))+card('Dark Elixir',format(r.dark),'dark','Loot Cart: '+format(r.cartDark))+card('Gems saved',format(r.gems),'green','No Gems scheduled for use')+'</div>'+
 '<div class="grid two"><section class="card"><div class="row between wrap"><h2>Current upgrade queues</h2><span class="pill active">'+pending.length+' marked active</span></div><div class="timeline">'+
 (next.length ? next.slice(0,12).map(t=>'<div class="rowcard"><div><strong>'+enc(t.name)+' · Lv '+t.level+' → '+(t.level+1)+'</strong><small>'+enc(t.category)+'</small></div><span class="pill '+(t.finishesAt && t.finishesAt<now?'planned':'active')+'">'+(t.finishesAt&&t.finishesAt<now?'Refresh export':t.finishesAt?new Date(t.finishesAt).toLocaleString():'Timer unknown')+'</span></div>').join(''):
 pending.slice(0,8).map(t=>'<div class="rowcard"><div><strong>'+enc(t.title)+'</strong><small>'+enc(t.queue+' · '+t.village)+'</small></div><span class="pill active">Self-reported active</span></div>').join(''))+
 '</div><p class="smallmuted">Timers come from the most recent JSON snapshot, not from a live connection to Supercell. Expired timers need a fresh import.</p></section>'+
 '<section class="card"><h2>Resources & loot reserve</h2><p class="smallmuted">Editable balances are separate from imported game data. Loot Cart is reserved and cannot be spent until collected.</p>'+resourcePanel()+
 '<p class="alertline">Your Loot Cart and Runes should be used only when storage has enough room. The app never collects anything in-game.</p></section></div>'+
 '<div class="grid two space"><section class="card"><h2>Recommended next actions</h2>'+recommendations()+'</section>'+
 '<section class="card"><h2>Account & progress</h2><div class="grid two">'+
 card('Home base','TH 14','','Five builders active')+card('Builder base','BH 9','','Two builders active')+'</div>'+
 '<p class="smallmuted">Player: '+enc(state.playerTag)+'<br>Last import: '+enc(state.importedAt?new Date(state.importedAt).toLocaleString():'Not yet imported')+'<br>Export timestamp: '+enc(state.export?.timestamp?new Date(state.export.timestamp*1000).toLocaleString():'None')+'</p>'+
 '<div class="row wrap"><button class="btn" data-action="choose-file">↑ Import game JSON</button><button class="btn secondary" data-action="goto-roadmap">View roadmap</button></div></section></div>';
}
function recommendations(){
 const targets=state.roadmap.filter(x=>x.status==='planned').slice(0,5);
 return '<div class="stack">'+targets.map((t,i)=>'<div class="row"><span class="tag">'+(i+1)+'</span><div class="grow"><strong>'+enc(t.title)+'</strong><div class="smallmuted">'+enc(t.queue+' · '+t.note)+'</div></div></div>').join('')+'</div><div class="note space">Keep Laboratory and pet research busy independently of your builders. Verify costs in Clash of Clans before starting each job.</div>';
}
function renderRoadmap(){
 const data=state.roadmap.filter(x=>filter==='all'||x.village===filter||x.status===filter);
 const progress=state.roadmap.filter(t=>t.status==='done').length;
 return '<div class="grid three">'+card('Completed',progress+' / '+state.roadmap.length,'green','Manually recorded')+
 card('Active',state.roadmap.filter(t=>t.status==='active').length,'gold','Review when timers finish')+
 card('Remaining boost',state.boostEnd?timeLeft(state.boostEnd):'Set end date','','50% returning boost; dates are manual')+'</div>'+
 '<div class="grid two space"><section class="card"><h2>Your upgrade timeline</h2><div class="filters">'+
 ['all','Home','Builder','active','planned','done'].map(x=>'<button class="chip '+(filter===x?'selected':'')+'" data-filter="'+x+'">'+enc(x[0].toUpperCase()+x.slice(1))+'</button>').join('')+'</div>'+
 '<div>'+data.map(t=>'<div class="task"><div><strong>'+enc(t.title)+'</strong><div class="micro">'+enc(t.village)+' · '+enc(t.queue)+' · '+enc(t.cost?format(t.cost)+' '+(moneyLabels[t.costType]||t.costType):'Check in-game cost')+'</div><p>'+enc(t.note)+'</p></div><aside><span class="pill '+enc(t.status)+'">'+enc(t.status)+'</span><select aria-label="Status of '+enc(t.title)+'" data-task="'+enc(t.id)+'">'+['planned','active','done','skipped'].map(s=>'<option value="'+s+'" '+(t.status===s?'selected':'')+'>'+s+'</option>').join('')+'</select></aside></div>').join('')+'</div></section>'+
 '<section class="stack"><div class="card"><h2>Boost deadline</h2><p class="smallmuted">A 50% building/research boost was observed. Set its expiry from your game screen; don't assume the countdown lasts forever.</p><div class="field"><label>Returning boost expires (device local time)</label><input type="datetime-local" data-boost-end value="'+enc(state.boostEnd||'')+'"></div><p class="smallmuted">Suggested order: finish Army Camps, unlock Unicorn and Recall Spell, raise Freeze Spell, then tackle B.O.B. milestones. Keep all queues working.</p></div>'+
 '<div class="card"><h2>Add a custom upgrade</h2><form id="task-form" class="stack"><div class="field"><label>Upgrade title</label><input name="title" maxlength="100" required placeholder="Example: Grand Warden 28 → 29"></div><div class="grid two"><div class="field"><label>Village</label><select name="village"><option>Home</option><option>Builder</option></select></div><div class="field"><label>Queue</label><select name="queue"><option>Builder</option><option>Laboratory</option><option>Star Laboratory</option><option>Pet House</option><option>Blacksmith</option></select></div></div><div class="grid two"><div class="field"><label>Cost resource</label><select name="costType">'+moneyKeys.map(([key,label])=>'<option value="'+key+'">'+enc(label)+'</option>').join('')+'</select></div><div class="field"><label>Cost (0 if unknown)</label><input name="cost" type="number" min="0" value="0"></div></div><div class="field"><label>Notes</label><textarea name="note" maxlength="350" placeholder="Why and when to build this"></textarea></div><button class="btn" type="submit">Add roadmap step</button></form></div>'+
 '<div class="card"><h2>Planner notes</h2><div class="field"><label>Editable instructions</label><textarea data-state-note>'+enc(state.notes||'')+'</textarea></div></div></section></div>';
}
function timeLeft(s){const secs=Math.ceil((new Date(s).getTime()-Date.now())/1000);if(!Number.isFinite(secs))return'Unknown';if(secs<=0)return'Expired';return Math.floor(secs/86400)+'d '+Math.floor(secs%86400/3600)+'h';}
function renderInventory(){
 let rows=rowsFromExport(state.export,invGroup);
 return '<section class="card"><div class="row between wrap"><div><h2>Game export inventory</h2><p class="smallmuted">Shows imported levels and upgrade timers. Counts reflect the selected snapshot.</p></div><button class="btn" data-action="choose-file">↑ Import JSON</button></div>'+
 '<div class="filters">'+categories.map(([id,title])=>'<button class="chip '+(invGroup===id?'selected':'')+'" data-category="'+id+'">'+enc(title)+'</button>').join('')+'</div>'+
 (!state.export?'<div class="empty">Import a village JSON export to see your full buildings, troops, spells, walls, pets and Builder Base. Your manual resources will not change.</div>':
 '<p class="smallmuted">Player '+enc(state.export.tag)+' · Snapshot: '+(state.export.timestamp?new Date(state.export.timestamp*1000).toLocaleString():'Unknown')+'</p>'+
 '<div class="scroll-table"><table class="inventory-table"><thead><tr><th>Name</th><th class="num">Level</th><th class="num">Count</th><th>Upgrading</th></tr></thead><tbody>'+rows.map(x=>'<tr><td>'+enc(x.name)+'</td><td class="num">'+x.level+'</td><td class="num">'+x.count+'</td><td>'+(x.timer!==null?(x.finishesAt ? enc(new Date(x.finishesAt).toLocaleString()) : enc(x.timer+'s')):'—')+'</td></tr>').join('')+'</tbody></table></div><div class="smallmuted">'+rows.reduce((a,x)=>a+x.count,0)+' objects in this category. Unknown game IDs stay visible for later catalog updates.</div>')+'</section>';
}
function renderItems(){
 let groups=itemGroups.map(([group,keys])=>'<section class="card"><h2>'+enc(group)+'</h2><div class="grid items">'+keys.map(key=>'<div class="item-field"><label>'+enc(key)+'</label><input type="number" min="0" step="1" data-item="'+enc(key)+'" value="'+integer(state.items[key])+'"></div>').join('')+'</div></section>').join('');
 const ores=['shiny','glowy','starry'];
 return '<div class="note">These balances are not in the Supercell JSON export. Update them manually after events, magic item use, chests, or Blacksmith upgrades. Changes are saved locally until you click “Save to GitHub”.</div>'+
 '<div class="grid two space">'+groups+'</div><section class="card space"><h2>Hero equipment ores</h2><div class="resource-grid">'+ores.map(k=>'<div class="field"><label>'+enc(moneyLabels[k])+'</label><input type="number" min="0" data-money="'+k+'" value="'+integer(state.resources[k])+'"></div>').join('')+'</div><p class="smallmuted">Eternal Tome is currently Lv 8 per your report. Save your Shiny and Glowy Ore for deliberate milestones.</p></section>';
}
function renderSync(){
 return '<div class="grid two"><section class="card"><h2>Import & export</h2><p class="smallmuted">Game export updates building/troop levels only. Planner backup includes balances, inventory, and roadmap.</p><div class="stack"><button class="btn" data-action="choose-file">↑ Import Clash of Clans JSON</button><button class="btn secondary" data-action="download">↓ Download full planner backup</button><button class="btn secondary" data-action="restore">↑ Restore planner backup</button></div><div class="divider"></div><div class="field"><label>Latest imported game snapshot</label><div class="note">'+enc(state.importedAt||'No game export imported yet')+'</div></div></section>'+
 '<section class="card"><h2>GitHub sync</h2><p class="smallmuted">Repository: <a href="https://github.com/'+REPO+'" target="_blank" rel="noopener">'+REPO+'</a>. The code is public. Sync writes the planner JSON to a PUBLIC file. Anyone can view that data.</p>'+
 '<div class="note">Use a <strong>fine-grained GitHub token</strong> with Contents read/write access restricted to <strong>Slot-22 only</strong>. Paste it below. The token stays in this tab memory, is never saved to GitHub or exported, and is cleared on refresh/close.</div>'+
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
const titles={overview:'Village overview',roadmap:'Upgrade roadmap',inventory:'Village inventory',items:'Magic Items & ores',sync:'GitHub & backups',testing:'Testing & diagnostics'};
function render() {
 for(const b of document.querySelectorAll('[data-tab]'))b.classList.toggle('active',b.dataset.tab===view);
 el('section-title').textContent=titles[view];el('player-tag').textContent=state.playerTag;
 el('main').innerHTML=({overview:renderOverview,roadmap:renderRoadmap,inventory:renderInventory,items:renderItems,sync:renderSync,testing:renderTesting}[view])();
}
function changeAction(e){
 const t=e.target;
 if(t.dataset.money){state.resources[t.dataset.money]=integer(t.value);saveLocal('resource-edit');return;}
 if(t.dataset.item){state.items[t.dataset.item]=integer(t.value);saveLocal('item-edit');return;}
 if(t.dataset.task){try{state=setTaskStatus(state,t.dataset.task,t.value);saveLocal('roadmap-status');render();}catch(err){notify(err.message,'error');}return;}
 if(t.dataset.boostEnd!==undefined){state.boostEnd=t.value||null;saveLocal('boost-edit');return;}
 if(t.dataset.stateNote!==undefined){state.notes=t.value.slice(0,3000);saveLocal('notes-edit');return;}
 if(t.dataset.test!==undefined){manualTests[t.dataset.test]=t.checked;localStorage.setItem(TESTS,JSON.stringify(manualTests));log('guided-test','MANUAL',t.dataset.test+' '+(t.checked?'checked':'unchecked'));}
}
function clickAction(e){
 const target=e.target.closest('[data-action],[data-filter],[data-category]');
 if(!target)return;
 if(target.dataset.filter){filter=target.dataset.filter;render();return;}
 if(target.dataset.category){invGroup=target.dataset.category;render();return;}
 const action=target.dataset.action;
 if(action==='goto-roadmap'){view='roadmap';render();}
 if(action==='choose-file')el('game-file').click();
 if(action==='restore')el('backup-file').click();
 if(action==='download')download('clash-village-backup.json',state);
 if(action==='diagnostics')download('clash-diagnostics.json',{generatedAt:new Date().toISOString(),version:1,logs:diagnostics});
 if(action==='test-report')download('clash-guided-test-report.json',{generatedAt:new Date().toISOString(),manual:true,results:testSteps.map((name,i)=>({name,confirmed:!!manualTests[i]})),logs:diagnostics});
 if(action==='clear-tests'){manualTests={};localStorage.setItem(TESTS,'{}');render();}
 if(action==='gh-load')void gitLoad();
 if(action==='gh-save')void gitSave();
}
function submitAction(e){
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
  const incoming=validateState(base64ToText(x.content));
  if(!confirm('Replace the local planner with the copy stored on GitHub? Download a local backup first if needed.'))return;
  state=incoming;ghSha=x.sha;saveLocal('github-load');notify('Loaded planner data from GitHub.');render();
 }catch(e){notify(e.message,'error');log('github-load','FAILED',e.message);}
}
async function gitSave(){
 try{
  if(!confirm('This will publish your game inventory, balances and roadmap to a PUBLIC GitHub file. Continue?'))return;
  const current=await api(apiUrl()+'?ref=main');
  if(!current.missing && ghSha && current.sha!==ghSha)throw Error('Conflict: the GitHub copy changed on another device. Load it and reconcile before saving.');
  if(!current.missing && !ghSha && !confirm('You have not loaded the current GitHub copy in this tab. Overwrite it with the current local planner?'))return;
  const body={message:'data: update clash village planner snapshot',content:textToBase64(JSON.stringify(state,null,2)),branch:'main'};
  if(!current.missing)body.sha=current.sha;
  const saved=await api(apiUrl(),{method:'PUT',body:JSON.stringify(body)});
  ghSha=saved.content?.sha||null;
  notify('Saved to GitHub. Your public planner JSON is now updated.');log('github-save','OK','Saved revision '+state.revision);
 }catch(e){notify(e.message,'error');log('github-save','FAILED',e.message);}
}
initialize().catch(e=>{log('startup','FAILED',e.message);notify('Startup failed: '+e.message,'error');});
