// S22-098: compact, visual overview of builders, assistants, and independent upgrade lanes.
// Pure view logic based on the dated game export and the existing recommendation engine.
// Builder slot numbers are display positions, NEVER identities or assignments from the game.
import {artworkUrl} from './artwork.mjs';
import {labelFor} from './catalog.mjs';
import {helperSummary} from './snapshot-insights.mjs';
import {helperActionRecommendations} from './helper-advice.mjs';
import {inventoryUpgradeRows} from './upgrade-directory.mjs';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const timed=r=>Number.isFinite(r?.timer)&&r.timer>=0;
const rows=(x,key)=>Array.isArray(x?.[key])?x[key]:[];
const at=stamp=>Number.isFinite(stamp)?new Date(stamp).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}):'Not recorded';
const sourceTime=x=>Number.isFinite(x?.timestamp)?x.timestamp*1000:null;
const remaining=(end,now)=>!Number.isFinite(end)?'No timer':end<=now?'ETA passed · refresh JSON':Math.floor((end-now)/3600000)+'h '+Math.ceil(((end-now)%3600000)/60000)+'m left (estimate)';
const progress=(start,end,now)=>end>start?Math.min(100,Math.max(0,(now-start)/(end-start)*100)):0;
const img=(category,name,level,fallback='⚒')=>{
 const src=artworkUrl(category,name,level);
 return '<span class="vc-picture">'+(src?'<img src="'+esc(src)+'" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">':'<span aria-hidden="true">'+esc(fallback)+'</span>')+'</span>';
};
const liveBar=(start,end,now,label='Tracked progress')=>{
 if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start)return '<div class="vc-bar vc-bar-empty" role="img" aria-label="Progress unknown"><span></span></div>';
 const pct=progress(start,end,now);
 return '<div class="vc-bar" role="progressbar" aria-label="'+esc(label)+'" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+Math.round(pct)+'">'+
  '<span data-timer-progress="'+start+','+end+'" style="width:'+pct.toFixed(1)+'%"></span></div>';
};
const jobRow=(category,r)=>({...r,category,name:labelFor(r.data)});
function datedJob(profile,record,now){
 if(!record||!Number.isFinite(profile?.export?.timestamp))return null;
 const x=profile.export;
 const end=(x.timestamp+record.timer)*1000;
 const seen=(profile.upgradeTracking||[]).find(t=>t.category===record.category&&t.id===record.data&&t.level===record.lvl);
 const start=Number.isFinite(seen?.firstSeenAt)&&seen.firstSeenAt<=x.timestamp*1000?
    seen.firstSeenAt:x.timestamp*1000;
 return {...record,start,end,firstObserved:start,remaining:remaining(end,now),progress:progress(start,end,now)};
}
function currentJobs(profile,groups,now=Date.now()){
 const x=profile?.export;
 if(!x)return [];
 return groups.flatMap(group=>rows(x,group).filter(timed).map(r=>jobRow(group,r)))
  .map(r=>datedJob(profile,r,now))
  .sort((a,b)=>a.end-b.end||a.category.localeCompare(b.category)||a.data-b.data);
}
export function visualWorkforce(profile,overview,now=Date.now()){
 const x=profile?.export;
 if(!x||!Number.isFinite(x.timestamp))return null;
 const huts=rows(x,'buildings').filter(r=>r.data===1000015).reduce((n,r)=>n+(Number.isInteger(r.cnt)?r.cnt:1),0);
 // The game does not supply builder names; the five card numbers are positions in an ordered snapshot.
 const homeCount=huts>=1&&huts<=5?huts:0;
 const homeJobs=currentJobs(profile,['buildings','heroes','traps'],now);
 const builderJobs=currentJobs(profile,['buildings2','heroes2','traps2'],now);
 const ranked=id=>overview.queueStates.find(q=>q.id===id)?.next||[];
 const homeNext=ranked('homeBuilders'),builderNext=ranked('builderBuilders');
 const createSlots=(count,jobs,next,kind)=>Array.from({length:count},(_,i)=>({
  kind,slot:i+1,job:jobs[i]||null,next:next[i]||null
 }));
 const helpers=helperSummary(x),advice=helperActionRecommendations(profile);
 return {snapshotAt:x.timestamp*1000,
  home:createSlots(homeCount,homeJobs,homeNext,'home'),
  builder:createSlots(Math.max(2,Math.min(builderJobs.length,2)),builderJobs,builderNext,'builder'),
  homeExtra:homeJobs.slice(homeCount),builderExtra:builderJobs.slice(2),
  helpers:helpers.map(h=>({...h,advice:advice.find(a=>a.id===h.id)}))
 };
}
const jobTitle=job=>job?job.name+' '+job.lvl+' → '+(job.lvl+1):'No active job reported';
function jobCard(slot,now){
 const j=slot.job,base=slot.kind==='home'?'Builder':'Base slot';
 const pic=j?img(j.category,j.name,j.lvl):img(slot.kind==='home'?'buildings':'buildings2',
   slot.kind==='home'?"Builder’s Hut":'Builder Hall',slot.kind==='home'?2:9);
 return '<button class="vc-card vc-builder" type="button" data-command-worker="'+slot.kind+':'+(slot.slot-1)+'">'+
  '<span class="vc-card-top">'+pic+'<span><strong>'+base+' '+slot.slot+'</strong><small>'+esc(j?'Upgrade at last export':'Check last export')+'</small></span></span>'+
  '<span class="vc-job">'+esc(jobTitle(j))+'</span>'+
  (j?liveBar(j.start,j.end,now,'Tracked since first observed')+
    '<span class="vc-eta" data-timer-end="'+j.end+'">'+esc(j.remaining)+'</span>':
    '<span class="vc-eta">No timed construction at export</span>')+
  '<span class="vc-next"><b>Next:</b> '+esc(slot.next?.title||'Check available upgrades')+'</span>'+
  '</button>';
}
const helperIcons={93000000:'🛠️',93000001:'🧪',93000002:'⚖️',93000003:'💎'};
function assistantCard(h,now,snapshotAt){
 const hasCooldown=Number.isFinite(h.snapshotEnd);
 const activeAssignment=h.assignment?.name||null;
 const assignment=activeAssignment?(h.assignment.workEndsAt?'Recorded target: ':'Repeat target: ')+activeAssignment:
  'Current task not reported';
 const suggested=h.advice?.target||'Check Helper Hut';
 const state=hasCooldown?'Cooldown at export':'Use today unconfirmed';
 const pctStart=hasCooldown?snapshotAt:null;
 return '<button class="vc-card vc-assistant" type="button" data-command-worker="helper:'+h.id+'">'+
 '<span class="vc-card-top"><span class="vc-picture vc-helper-icon" aria-hidden="true">'+(helperIcons[h.id]||'🛠️')+'</span>'+
 '<span><strong>'+esc(h.name)+'</strong><small>Level '+h.level+' · '+esc(state)+'</small></span></span>'+
 '<span class="vc-job">'+esc(assignment)+'</span>'+
 (hasCooldown?liveBar(pctStart,h.snapshotEnd,now,'Recorded helper cooldown')+
   '<span class="vc-eta" data-helper-cooldown-end="'+h.snapshotEnd+'">'+esc(remaining(h.snapshotEnd,now))+'</span>':
   '<span class="vc-eta">Check Helper Hut for availability</span>')+
 '<span class="vc-next"><b>Next:</b> '+esc(suggested)+'</span></button>';
}
const laneIcons={
 homeLab:['buildings','Laboratory',12,'⚗️'],
 starLab:['buildings2','Star Laboratory',7,'🔬'],
 pets:['buildings','Pet House',3,'🐾'],
 equipment:['buildings','Blacksmith',6,'⚒']
};
function researchCard(profile,q,now){
 const x=profile.export;
 const job=currentJobs(profile,q.id==='homeLab'?['spells','units','siege_machines']:
  q.id==='starLab'?['units2']:q.id==='pets'?['pets']:[],now)[0]||null;
 const art=laneIcons[q.id],facilityRow=(q.id==='starLab'?rows(x,'buildings2'):rows(x,'buildings'))
   .find(r=>labelFor(r.data)===art[1]);
 const name=q.id==='homeLab'?'Laboratory · Troops & Spells':q.label;
 return '<button class="vc-card vc-station" type="button" data-command-lane="'+q.id+'">'+
 '<span class="vc-card-top">'+img(art[0],art[1],facilityRow?.lvl||art[2],art[3])+
 '<span><strong>'+esc(name)+'</strong><small>'+esc(q.id==='equipment'?'Ore upgrades · no worker':q.status==='busy'?'Working at export':q.status==='idle'?'Queue open at export':'Check game')+'</small></span></span>'+
 '<span class="vc-job">'+esc(jobTitle(job)||'')+'</span>'+
 (job?liveBar(job.start,job.end,now,'Tracked since first observed')+
 '<span class="vc-eta" data-timer-end="'+job.end+'">'+esc(job.remaining)+'</span>':
 '<span class="vc-eta">'+(q.id==='equipment'?'Instant when upgraded':'No timed research in last export')+'</span>')+
 '<span class="vc-next"><b>Next:</b> '+esc(q.nextTitle)+'</span></button>';
}
const section=(name,id,content,subtitle='')=>
 '<section class="vc-section"'+(id==='assistants'?' id="vc-assistants" tabindex="-1"':'')+'><header><div><h3>'+esc(name)+'</h3>'+
 (subtitle?'<small>'+esc(subtitle)+'</small>':'')+'</div>'+
 (id?'<button type="button" class="vc-section-link" data-command-lane="'+id+'">All options →</button>':'')+'</header>'+content+'</section>';
export function renderVisualCommand(profile,overview,now=Date.now()){
 const v=visualWorkforce(profile,overview,now);
 if(!v)return '';
 const queue=id=>overview.queueStates.find(q=>q.id===id);
 const home=section('Home builders · Heroes use builders','homeBuilders',
  '<div class="vc-worker-grid">'+v.home.map(s=>jobCard(s,now)).join('')+'</div>',
  v.home.length+' tracked builder huts · slot numbers are not game identities');
 const builder=section('Builder Base construction','builderBuilders',
  '<div class="vc-worker-grid">'+v.builder.map(s=>jobCard(s,now)).join('')+'</div>',
  'Builder slot numbers are display positions');
 const helpers=section('Helper Hut · four assistants','assistants',
  '<div class="vc-worker-grid">'+v.helpers.map(h=>assistantCard(h,now,v.snapshotAt)).join('')+'</div>',
  'Individual availability must be confirmed in game');
 const research=section('Independent upgrades',null,
  '<div class="vc-worker-grid">'+['homeLab','starLab','pets','equipment'].map(id=>researchCard(profile,queue(id),now)).join('')+'</div>',
  'No construction builder needed · Heroes use the Home builders above');
 const next=['homeBuilders','builderBuilders','homeLab','starLab','pets','equipment'].map(id=>queue(id))
  .filter(Boolean).map(q=>'<button class="vc-next-item" type="button" data-command-next="'+q.id+'">'+
   '<span>'+esc(q.label)+'</span><b>'+esc(q.nextTitle||'Check in game')+'</b><span aria-hidden="true">›</span></button>').join('');
 return '<div class="visual-command" aria-label="Visual worker assignments and upgrade queues">'+
   home+helpers+builder+research+
   '<section class="vc-section"><header><div><h3>Next-up queue</h3><small>Suggested options, not scheduled jobs</small></div></header>'+
   '<div class="vc-next-grid">'+next+'</div></section>'+
   '<p class="vc-note">Timers are estimates from the dated JSON; progress starts when an upgrade was first observed, NOT when construction actually began. An expired ETA does not prove a builder is free. Import fresh JSON to confirm.</p>'+
 '</div>';
}
export function renderVisualWorkerDetail(profile,selection,overview,now=Date.now()){
 const v=visualWorkforce(profile,overview,now);
 if(!v)return '<h2>Import a village JSON first</h2>';
 const [,kind,id]=selection.split(':');
 if(kind==='helper'){
  const h=v.helpers.find(item=>String(item.id)===id);
  if(!h)return '<h2>Assistant not found in latest JSON</h2>';
  const a=h.advice||{};
  return '<div class="command-detail vc-worker-detail"><h2>'+esc(h.name)+' · Lv '+h.level+'</h2>'+
   '<h3>Recorded activity</h3><p>'+esc(h.assignment?.name||'No specific work assignment reported')+'</p>'+
   (h.assignment?.recurrent?'<p>Repeat assignment is enabled in the last export.</p>':'')+
   '<p>Cooldown: '+esc(Number.isFinite(h.snapshotEnd)?remaining(h.snapshotEnd,now):'Not reported · check Helper Hut')+'</p>'+
   (Number.isFinite(h.snapshotEnd)?'<p>Estimated cooldown end: '+esc(at(h.snapshotEnd))+'</p>':'')+
   '<h3>Recommended next use</h3><p>'+esc(a.action||'Check in game')+'</p>'+
   '<p>'+esc(a.note||'Each assistant has an independent use; confirm in game.')+'</p>'+
   '<p class="smallmuted">Imported snapshot: '+esc(at(v.snapshotAt))+'. This planner does not control assistants.</p></div>';
 }
 const slots=kind==='home'?v.home:kind==='builder'?v.builder:null;
 const slot=slots?.[Number(id)];
 if(!slot||String(Number(id))!==id)return '<h2>Builder slot unavailable</h2>';
 const job=slot.job,qid=kind==='home'?'homeBuilders':'builderBuilders';
 const label=kind==='home'?'Home builder':'Builder Base slot';
 const estimate=Number.isFinite(slot.next?.id)&&Number.isInteger(slot.next?.targetLevel)?
  inventoryUpgradeRows(profile).find(row=>row.id===slot.next.id&&row.target===slot.next.targetLevel&&
   (kind==='home'?['buildings','heroes','traps'].includes(row.group):
    ['buildings2','heroes2','traps2'].includes(row.group))):null;
 const price=estimate?estimate.priceText+(Number.isFinite(estimate.totalSeconds)?
  ' · '+Math.round(estimate.totalSeconds/3600)+'h estimated (verify in Clash)':' · duration unknown'):
  'Confirm price and available level in game';
 return '<div class="command-detail vc-worker-detail" data-focus="'+esc(selection)+'">'+
  '<h2>'+label+' '+slot.slot+'</h2>'+
  '<p class="smallmuted">Display slot assigned by the planner, not an identified in-game builder.</p>'+
  '<h3>Working at last game export</h3>'+
  (job?'<p><b>'+esc(jobTitle(job))+'</b></p>'+
   '<p>First observed: '+esc(at(job.firstObserved))+' · actual start not supplied by Clash JSON.</p>'+
   '<p>Estimated completion: '+esc(at(job.end))+'</p>'+
   '<p>'+esc(job.remaining)+'</p>'+liveBar(job.start,job.end,now,'Progress since first observed'):
   '<p>No timed job recorded for this slot in the saved export.</p>')+
  '<h3>What to upgrade next</h3>'+
  '<p><b>'+esc(slot.next?.title||'Verify available upgrades in game')+'</b></p>'+
  '<p>'+esc(price)+'</p>'+
  '<p>'+esc(slot.next?.reason||'Recommended order may change when new JSON is imported.')+'</p>'+
  '<button type="button" class="btn secondary small" data-command-lane="'+qid+'">See other ranked upgrades</button>'+
  '<p class="smallmuted">Snapshot from '+esc(at(v.snapshotAt))+'. Jobs and progress are not live. No automatic resource spending.</p></div>';
}
