import {artworkUrl,artForResource} from './artwork.mjs';
import {rowsFromExport,ongoingFromExport,format} from './core.mjs';
import {gauge,snapshotCountdown,queueGroups,progressSummary,planPreview} from './experience.mjs';

export function esc(s){return String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[ch]));}
export function iconFor(category,name,level=1,large=false){
  const url=artworkUrl(category,name,level);
  const init=esc(String(name||'?').slice(0,1).toUpperCase());
  return '<span class="art-badge '+(large?'art-large':'compact')+(url?'':' broken')+'">'+
    (url?'<img class="item-art" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" src="'+esc(url)+'">':'')+
    '<span class="art-fallback" aria-hidden="true">'+init+'</span></span>';
}
export function coverFor(profile){
  const th=profile.export?.buildings?.find(x=>x.data===1000001)?.lvl;
  const bh=profile.export?.buildings2?.find(x=>x.data===1000034)?.lvl;
  const progress=progressSummary(profile.roadmap);
  return '<div class="royal-hero">'+
    '<div class="royal-glint" aria-hidden="true"></div><div class="royal-title">'+
    '<div class="royal-hall">'+(th?iconFor('buildings','Town Hall',th,true):'<span class="hall-placeholder">⚔</span>')+'</div>'+
    '<div class="royal-copy"><div class="kicker">YOUR COMMAND CENTER</div><h2>'+esc(profile.displayName||profile.playerTag)+'</h2>'+
    '<p>Town Hall '+(th||'—')+' <span aria-hidden="true">·</span> Builder Hall '+(bh||'—')+' <span aria-hidden="true">·</span> '+esc(profile.playerTag)+'</p></div></div>'+
    '<div class="royal-stats"><span><strong>'+progress.active+'</strong> active plans</span><span><strong>'+progress.done+'</strong> completed</span>'+
    '<span><strong>'+progress.total+'</strong> tracked upgrades</span></div>'+
    '<div class="royal-meter"><span style="width:'+progress.percent.toFixed(1)+'%"></span></div>'+
    '<div class="royal-caption">Roadmap milestones completed · '+Math.round(progress.percent)+'%</div></div>';
}
const gauges=[
  {key:'gold',label:'Gold',className:'gold'},
  {key:'elixir',label:'Elixir',className:'elixir'},
  {key:'dark',label:'Dark Elixir',className:'dark'},
  {key:'builderGold',label:'Builder Gold',className:'buildergold'},
  {key:'builderElixir',label:'Builder Elixir',className:'builderelixir'}
];
export function gaugeDeck(profile){
  return '<section class="card resource-deck"><div class="panel-heading"><div><span class="kicker">TREASURY</span><h2>Resource vaults</h2></div>'+
  '<span class="tag">Tap a capacity to edit</span></div>'+
  '<p class="subtext">Fill bars are accurate only after you enter your in-game storage capacity. No guessed capacities.</p>'+
  '<div class="vault-grid">'+gauges.map(({key,label,className})=>{
    const balance=profile.resources?.[key]||0;
    const cap=profile.storageCaps?.[key]||0;
    const g=gauge(balance,cap);
    const img=artForResource(key);
    return '<div class="vault '+className+'"><div class="vault-top"><span class="vault-label">'+
      (img?'<img src="'+esc(img)+'" alt="" loading="lazy" decoding="async">':'')+esc(label)+'</span>'+
    '<span class="vault-value">'+format(balance)+'</span></div>'+
    '<div class="vault-track '+(g.known?'':'unknown')+'" role="progressbar" aria-label="'+esc(label)+' capacity" aria-valuemin="0" '+(g.known?'aria-valuemax="100" aria-valuenow="'+Math.round(g.percent)+'"':'aria-valuetext="Capacity not set"')+'>'+
      '<span style="width:'+g.percent.toFixed(2)+'%"></span></div>'+
    '<div class="vault-foot"><span>'+ (g.known?Math.round(g.percent)+'% full':'Set storage capacity')+'</span>'+
      '<label>Max <input data-cap="'+esc(key)+'" aria-label="'+esc(label)+' storage capacity" inputmode="numeric" autocomplete="off" type="text" placeholder="Not set" value="'+(cap?format(cap):'')+'"></label></div></div>';
  }).join('')+'</div></section>';
}
export function builderBoard(profile,now=Date.now()){
  const ex=profile.export;
  if(!ex)return '<section class="card"><h2>Builder queues</h2><div class="empty">Import this account’s village JSON to see builder and research queues.</div></section>';
  const original=ongoingFromExport(ex);
  const mapped=original.map((r,i)=>({...r,index:i,categoryId:({
    'Home buildings':'buildings','Builder buildings':'buildings2','Heroes':'heroes','Builder heroes':'heroes2',
    'Troops':'units','Builder troops':'units2','Spells':'spells','Pets':'pets','Siege machines':'siege_machines'
  })[r.category]||r.category}));
  const groups=queueGroups(mapped);
  const keys=['Home builders','Builder Base builders','Laboratory','Star Laboratory','Pets','Other'];
  const queueLegend={ 'Home builders':'🏠','Builder Base builders':'🛠','Laboratory':'⚗','Star Laboratory':'🔬','Pets':'🐾',Other:'◇'};
  const content=keys.filter(k=>groups[k].length).map(k=>{
    const list=groups[k];
    return '<div class="queue-group"><div class="queue-title"><strong>'+queueLegend[k]+' '+esc(k)+'</strong><span>'+list.length+' in snapshot</span></div>'+
      '<div class="queue-tiles">'+list.map(r=>{
        const count=snapshotCountdown(ex,r,now);
        const expired=count?.remaining.expired;
        return '<button class="queue-tile" data-open-record="'+r.index+'" aria-label="Details for '+esc(r.name)+'">'+
          '<div class="queue-art">'+iconFor(r.categoryId,r.name,r.level)+'</div>'+
          '<div class="queue-data"><span class="queue-name">'+esc(r.name)+' <em>Lv '+r.level+' → '+(r.level+1)+'</em></span>'+
          '<span class="queue-time" data-timer-end="'+(count?.end||0)+'">'+(count?esc(count.remaining.text):'Timer unavailable')+'</span>'+
          '<div class="mini-track" title="Time elapsed since snapshot; not overall construction completion"><span data-timer-progress="'+(count?.start||0)+','+(count?.end||0)+'" style="width:'+(count?.percent||0).toFixed(1)+'%"></span></div>'+
          '<span class="queue-basis">'+(expired?'Snapshot is outdated':'Countdown since import')+'</span></div>'+
          '<span class="chevron" aria-hidden="true">›</span></button>';
      }).join('')+'</div></div>';
  }).join('');
  return '<section class="card queue-board"><div class="panel-heading"><div><span class="kicker">BUILD STATUS</span><h2>Live countdown board</h2></div>'+
    '<button class="btn secondary small" data-action="paste-shortcut">Update snapshot</button></div>'+
    '<p class="subtext">Timers count down using the most recent imported JSON. Bars represent time elapsed since that snapshot, not the full upgrade duration. Expired timers do not mark an upgrade complete.</p>'+
    (content||'<div class="empty">No upgrade timers in this snapshot. Import newer game data to refresh.</div>')+'</section>';
}
export function questTrail(tasks,mode='all'){
  const filtered=tasks.filter(t=>mode==='all'||t.village===mode).filter(t=>t.status!=='skipped');
  const next=filtered.filter(t=>t.status!=='done').slice(0,5);
  const completed=filtered.filter(t=>t.status==='done').slice(-2);
  const seq=[...completed,...next];
  if(!seq.length)return '<div class="empty">No upgrade steps yet. Add them below to build your path.</div>';
  return '<div class="quest-trail">'+seq.map((t,i)=>{
    const affordable=planPreview(t,{}); // affordability is shown in modal, not assumed here
    return '<button class="quest-node '+esc(t.status)+'" data-open-task="'+encodeURIComponent(t.id)+'" aria-label="Open upgrade '+esc(t.title)+'">'+
      '<span class="quest-order">'+(t.status==='done'?'✓':i+1)+'</span><span class="quest-copy"><strong>'+esc(t.title)+'</strong>'+
      '<small>'+esc(t.village)+' · '+esc(t.queue)+(t.cost?' · '+format(t.cost)+' '+esc(t.costType):' · Cost to confirm')+'</small></span>'+
      '<span class="quest-state">'+esc(t.status)+'</span></button>';
  }).join('')+'</div>';
}
export function gallery(profile,category){
  const rows=rowsFromExport(profile.export,category);
  if(!profile.export)return '<div class="empty">Import a game snapshot to see your collection.</div>';
  return '<div class="collection-grid">'+rows.map((r,i)=>{
    const live=r.timer!=null && r.finishesAt>Date.now();
    return '<button class="collection-card" data-open-inventory="'+i+'" aria-label="Open '+esc(r.name)+' level '+r.level+' details">'+
      iconFor(category,r.name,r.level,true)+'<span class="collection-name">'+esc(r.name)+'</span>'+
      '<span class="collection-meta">Level '+r.level+(r.count>1?' · ×'+format(r.count):'')+'</span>'+
      (live?'<span class="collection-active">Upgrading</span>':'')+'</button>';
  }).join('')+'</div>';
}
export function detailContent({profile,record,category,task}){
  const name=task?.title||record?.name||'Upgrade';
  const level=record?.level||Number(task?.title?.match(/(\d+)\s*→/)?.[1])||1;
  const iconCategory=category||((task?.village==='Builder')?'buildings2':'buildings');
  const pic=record?iconFor(iconCategory,record.name,level,true):'';
  const linked=task||(record?profile.roadmap.find(t=>t.title.toLowerCase().includes(record.name.toLowerCase())&&t.title.includes(String(record.level)+' →')):null);
  const p=linked?planPreview(linked,profile.resources):null;
  const costText=p?.valid?format(p.cost)+' '+esc(RESOURCE_NAMES[p.key]||p.key):'Cost not confirmed in roadmap';
  const preview=p?.valid?(p.affordable?'After recording spend: '+format(p.remaining):'Short by '+format(Math.abs(p.remaining))):'Add the cost to your roadmap before recording spending.';
  const timer=record?.finishesAt?'<div class="detail-timer">Snapshot timer: '+esc(new Date(record.finishesAt).toLocaleString())+'</div>':'';
  return '<div class="detail-header">'+pic+'<div><span class="kicker">UPGRADE DETAILS</span><h2 id="detail-title">'+esc(name)+'</h2>'+
    '<p class="subtext">'+esc(record?'Level '+record.level+' · Count '+record.count:(linked?.village||'Roadmap plan'))+'</p></div></div>'+
    timer+'<div class="detail-divider"></div>'+
    (linked?'<p class="detail-notes">'+esc(linked.note||'No notes')+'</p><div class="detail-info">'+
      '<span>Queue: <strong>'+esc(linked.queue)+'</strong></span><span>Current status: <strong>'+esc(linked.status)+'</strong></span>'+
      '<span>Estimated cost: <strong>'+costText+'</strong></span></div><p class="detail-budget">'+preview+'</p>'+
      '<p class="micro">Roadmap costs are estimates until confirmed in Clash of Clans. Recording a spend changes this planner only.</p>'+
      '<div class="detail-actions"><button class="btn secondary" data-action="mark-task" data-task-id="'+encodeURIComponent(linked.id)+'" '+(linked.status==='active'?'disabled':'')+'>Mark active</button>'+
      '<button class="btn" data-action="record-upgrade" data-task-id="'+encodeURIComponent(linked.id)+'" '+(!p?.valid||!p.affordable||linked.status!=='planned'||p.key==='gems'?'disabled':'')+'>Record upgrade & spend</button></div>':
      '<p class="note">This item is in your exported inventory, but it has no matching costed roadmap step. Add a roadmap entry to plan its next upgrade.</p>')+
    '<div class="detail-bottom"><button class="btn secondary small" data-action="close-detail">Close</button></div>';
}
const RESOURCE_NAMES={gold:'Gold',elixir:'Elixir',dark:'Dark Elixir',builderGold:'Builder Gold',builderElixir:'Builder Elixir',shiny:'Shiny Ore',glowy:'Glowy Ore',starry:'Starry Ore',gems:'Gems'};
