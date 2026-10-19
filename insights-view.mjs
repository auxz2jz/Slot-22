import {format} from './core.mjs';
import {renderVillageIntelligence} from './intelligence-view.mjs';
import {helperSummary,snapshotCoverage,bobSummary,recordSummary} from './snapshot-insights.mjs';
import {helperActionRecommendations} from './helper-advice.mjs';
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const helperDescription={93000000:'Speeds up one Home Village building or hero upgrade when assigned.',
93000001:'Speeds up one Laboratory research upgrade when assigned.',
93000002:'Check Helper Hut to confirm its identity. A level-3 resource converter is likely the Alchemist.',
93000003:'Gold Pass ore-conversion helper if your latest export confirms ownership.'};
// All assignment and cooldown values come from the game's dated JSON snapshot.
// Expired estimates do NOT prove the helper is available or still assigned.
export function helperCountdown(end,kind,now=Date.now()){
 const left=Math.ceil((end-now)/1000);
 if(!Number.isFinite(left)||left<=0)return kind==='work'?'Session estimate elapsed · refresh JSON':'Cooldown estimate elapsed · verify in game';
 const d=Math.floor(left/86400),hours=Math.floor((left%86400)/3600),mins=Math.floor((left%3600)/60),secs=left%60;
 return (d?d+'d ':'')+(hours?hours+'h ':'')+(mins?mins+'m ':'')+(!d&&!hours?secs+'s ':'')+'left';
}
function helperTile(h){
 const a=h.assignment;
 const target=a?'<div class="helper-assignment">Assigned in snapshot: <strong>'+safe(a.name)+'</strong> (Lv '+Number(a.level)+')</div>':
  h.assignmentCount>1?'<small>Multiple possible assignments in JSON; target unclear. Check in game.</small>':
  '<small>Assignment not reported in this JSON.</small>';
 const work=a?.workEndsAt!==null&&Number.isFinite(a?.workEndsAt)?
  '<small>Work session: <span class="helper-countdown" data-helper-session-end="'+a.workEndsAt+'">'+safe(helperCountdown(a.workEndsAt,'work'))+'</span></small>':
  '<small>Work-session timer not included in JSON.</small>';
 const repeat=a?'<small>Repeat assignment: '+(a.recurrent===true?'On':a.recurrent===false?'Off':'Not specified')+' (at export)</small>':'';
 const cooldown=h.snapshotEnd!==null&&Number.isFinite(h.snapshotEnd)?
  '<small>Cooldown: <span class="helper-countdown" data-helper-cooldown-end="'+h.snapshotEnd+'">'+safe(helperCountdown(h.snapshotEnd,'cooldown'))+'</span></small>':
  '<small>Cooldown not included in JSON.</small>';
 return '<div class="helper-tile"><strong>'+safe(h.name)+'</strong><span>Level '+Number(h.level)+'</span>'+
 target+(a?work+repeat:'')+cooldown+
 '<small>'+safe(helperDescription[h.id]||'Check this helper in your village.')+'</small></div>';
}
export function renderHelperRecommendations(profile){
 const suggestions=helperActionRecommendations(profile);
 if(!suggestions.length)return '';
 return '<div class="helper-next-actions" aria-label="Helper action recommendations">'+
 '<h3>What your assistants should do next</h3>'+
 '<p class="subtext">All assistants share a 23-hour workday reset, but each may work once per workday. A cooldown on one does NOT prove the others are used.</p>'+
 '<div class="helper-recommend-grid">'+suggestions.map(h=>
  '<div class="helper-recommend" data-helper-advice="'+Number(h.id)+'">'+
   '<strong>'+safe(h.name)+' · Lv '+Number(h.level)+'</strong>'+
   (h.availability==='cooldown-recorded'?'<span class="helper-recommend-state">Personal cooldown recorded at export</span>':
    '<span class="helper-recommend-state">Today’s use not confirmed</span>')+
   '<small>Where: '+safe(h.location)+'</small>'+
   '<span>'+safe(h.action)+'</span>'+
   '<small>'+safe(h.note)+'</small>'+
   (h.availability==='cooldown-recorded'&&h.cooldownEnd!==null?
    '<small>Cooldown: <span class="helper-countdown" data-helper-cooldown-end="'+h.cooldownEnd+'">'+safe(helperCountdown(h.cooldownEnd,'cooldown'))+'</span></small>':'')+
   '</div>').join('')+'</div>'+
 '<p class="smallmuted">Recommendations use your most recently imported JSON, not live in-game helper assignments. Check each assistant’s own usage in the Helper Hut before acting. No Gems or resources are spent automatically.</p>'+
 '</div>';
}
export function renderHelperStrip(profile){
 const list=helperSummary(profile.export);
 if(!profile.export)return '';
 return '<section class="card helper-panel"><div class="panel-heading"><div><span class="kicker">HELPER HUT</span><h2>Your helpers</h2></div>'+
 '<button class="btn secondary small" data-action="go-insights">View all export data</button></div>'+
 (list.length?'<div class="helper-grid">'+list.map(helperTile).join('')+'</div>':'<p class="subtext">No helpers appear in this snapshot.</p>')+
 renderHelperRecommendations(profile)+
 '<p class="smallmuted">Helper assignments appear only when the game JSON reports a target. Work-session and cooldown estimates count down from the game snapshot date using your phone clock; once elapsed, refresh JSON to confirm actual status. Helpers are not controlled from this planner. No Gems spent.</p></section>';
}
function bobCard(b){
 if(!b)return '';
 const cards=[
 ['Gear-ups',b.gearups+'/3',b.gearupsComplete],
 ['Builder defense',b.highestDefense+'/9',b.defenseComplete],
 ['Builder troop',b.highestTroop+'/18',b.troopComplete],
 ['Builder heroes',b.heroLevels+'/45',b.heroesComplete]];
 return '<section class="card"><h2>B.O.B. sixth-builder checklist</h2><div class="bob-grid">'+cards.map(([name,value,complete])=>
 '<div class="bob-item"><span>'+safe(name)+'</span><strong>'+value+'</strong><small>'+(complete?'Requirement met in snapshot':'Still in progress')+'</small></div>').join('')+'</div>'+
 '<p class="subtext">The fourth requirement is combined Battle Machine + Battle Copter levels. These values reflect only the imported village snapshot.</p></section>';
}
export function renderInsights(profile){
 const x=profile.export;
 if(!x)return '<section class="card"><h2>Village JSON insights</h2><p>Import a Clash of Clans export to explore its data.</p></section>';
 const entries=snapshotCoverage(x),records=recordSummary(x),unknown=records.filter(v=>v.label.startsWith('Unknown ID'));
 const known=new Set(['buildings','buildings2','traps','traps2','heroes','heroes2','units','units2','spells','pets','equipment','siege_machines']);
 const other=entries.filter(e=>!known.has(e.key));
 const details=entries.map(k=>'<tr><td>'+safe(k.key)+'</td><td>'+format(k.entries)+'</td><td>'+format(k.quantity)+'</td></tr>').join('');
 const totalTimers=records.filter(r=>r.active).length,geared=records.filter(r=>r.geared).length;
 return '<section class="card"><span class="kicker">YOUR SAVED GAME EXPORT</span><h2>Everything recorded in your JSON</h2>'+
 '<p>Imported: '+safe(new Date(x.timestamp*1000).toLocaleString())+' · Player '+safe(x.tag)+'</p>'+
 '<div class="grid three">'+
 '<div class="stat"><strong>'+entries.length+'</strong><small>Data sections</small></div>'+
 '<div class="stat"><strong>'+totalTimers+'</strong><small>Upgrade timers in snapshot</small></div>'+
 '<div class="stat"><strong>'+unknown.length+'</strong><small>Unmapped game IDs</small></div></div>'+
 '<p class="subtext">The export includes exact levels, counts, timers, and extra flags; it does not contain current resource balances, Magic Items, reward claims, or village coordinates.</p></section>'+
 renderHelperStrip(profile)+bobCard(bobSummary(x))+renderVillageIntelligence(profile)+
 '<section class="card"><h2>Export fields, including previously unused data</h2><p class="subtext">Each category can contain several copies of a building or decoration. Counts below include repeated items.</p>'+
 '<div class="scroll-table"><table><thead><tr><th>JSON section</th><th>Records</th><th>Items</th></tr></thead><tbody>'+details+'</tbody></table></div>'+
 '<h3>Other categories we can use next</h3><p>'+other.map(a=>safe(a.key)+' ('+a.entries+')').join(' · ')+'</p>'+
 (unknown.length?'<details><summary>Unidentified game IDs ('+unknown.length+')</summary><p>'+unknown.slice(0,80).map(e=>safe(e.key)+' '+e.data+' Level '+e.level).join('; ')+'</p></details>':'<p>No unidentified IDs in the normal inventory sections.</p>')+
 '<details><summary>View original imported JSON (read-only)</summary><pre class="raw-json">'+safe(JSON.stringify(x,null,2))+'</pre></details>'+
 '<p class="smallmuted">This is read-only analysis. Game resources and events still require your manual input. Import a newer JSON to refresh the snapshot.</p></section>';
}
