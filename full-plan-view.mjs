import {fullVillagePlan} from './full-plan.mjs';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const status={busy:'Working',idle:'Can start',blocked:'Blocked by construction',unknown:'Verify in game','on-demand':'Independent ore upgrades'};
function choices(l){return (l.next||[]).slice(0,6).map((t,i)=>'<li class="strategy-choice"><b>'+String(i+1)+'. '+esc(t.title)+'</b><p>'+esc(t.reason||t.note||'Verify in game')+'</p><small>Where: '+esc(t.location||l.location)+'</small></li>').join('');}
export function renderFullVillagePlan(profile){
 const p=fullVillagePlan(profile);if(!p)return '';
 const h=p.heroHall;
 return '<section class="card full-plan-panel"><span class="kicker">WHOLE VILLAGE PLAN</span><h2>Every upgrade queue · next and after that</h2>'+
 '<p>Recalculated from dated Clash JSON: '+esc(new Date(p.snapshotAt).toLocaleString())+'. No live game connection, no automatic purchases.</p>'+
 '<div class="full-plan-hero"><b>Hero Hall Lv '+esc(h.level)+' · '+(h.upgrading?'Building upgrading':'No building upgrade in progress')+'</b>'+
 '<p>'+h.heroCurrent.map(v=>esc(v.name)+' Lv'+v.level+(v.upgrading?' upgrading':'')).join(' · ')+'</p>'+
 '<p>Hero Hall manages Heroes; a free Home Village builder is still needed to upgrade one. Priority: '+esc(h.nextHeroes[0]?.title||'Check in game')+'</p></div>'+
 '<div class="full-plan-grid">'+p.queues.map(l=>'<article class="full-plan-lane" data-plan-lane="'+esc(l.id)+'">'+
 '<h3>'+esc(l.name)+'</h3><strong class="full-plan-status">'+esc(status[l.status]||l.status)+'</strong>'+
 '<small>Where: '+esc(l.location)+'</small>'+
 '<p>'+esc(l.note)+'</p>'+
 '<h4>Next priorities</h4>'+(l.next?.length?'<ol>'+choices(l)+'</ol>':'<p>Check in game; no verified candidate.</p>')+
 (l.alternatives?'<details><summary>Spell, troop and siege options</summary>'+Object.entries(l.alternatives).map(([kind,items])=>'<h4>'+esc(kind)+'</h4><ol>'+items.map((q,i)=>'<li>'+esc(q.title)+'</li>').join('')+'</ol>').join('')+'</details>':'')+
 (l.future?'<p><b>Unlock:</b> '+esc(l.future.title)+'</p>':'')+'</article>').join('')+'</div>'+
 '<details class="full-plan-audit"><summary>Review every Home and Builder Base building or trap</summary>'+
 p.inventory.map(g=>'<details><summary>'+esc(g.name)+' — '+g.total+' structures</summary>'+
 '<div class="scroll-table"><table><thead><tr><th>Building</th><th>Level</th><th>Count</th><th>Snapshot</th></tr></thead><tbody>'+
 g.entries.map(r=>'<tr><td>'+esc(r.name)+'</td><td>'+esc(r.level)+'</td><td>'+r.count+'</td><td>'+esc(r.ongoing?'Upgrading':'No timer · check in game')+'</td></tr>').join('')+
 '</tbody></table></div></details>').join('')+'</details>'+
 '<p class="smallmuted">No timer does not prove a building can be upgraded; passive collectors, defenses and storages do not have a worker queue. Confirm next unlocks and costs in Clash before choosing an upgrade.</p></section>';
}