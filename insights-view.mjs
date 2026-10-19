import {format} from './core.mjs';
import {renderVillageIntelligence} from './intelligence-view.mjs';
import {helperSummary,snapshotCoverage,bobSummary,recordSummary} from './snapshot-insights.mjs';
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const helperDescription={93000000:'Speeds up one Home Village building or hero upgrade when assigned.',
93000001:'Speeds up one Laboratory research upgrade when assigned.',
93000002:'Check Helper Hut to confirm its identity. A level-3 resource converter is likely the Alchemist.',
93000003:'Gold Pass ore-conversion helper if your latest export confirms ownership.'};
function helperTile(h){
 const date=h.snapshotEnd;
 const seconds=date?Math.ceil((date-Date.now())/1000):null;
 const cooldown=seconds===null?'Cooldown not included in export':seconds<=0?'Snapshot cooldown elapsed · verify in game':Math.ceil(seconds/3600)+'h remaining based on snapshot';
 return '<div class="helper-tile"><strong>'+safe(h.name)+'</strong><span>Level '+Number(h.level)+'</span>'+
 '<small>'+safe(helperDescription[h.id]||'Check this helper in your village.')+'</small>'+
 '<small>'+safe(cooldown)+'</small></div>';
}
export function renderHelperStrip(profile){
 const list=helperSummary(profile.export);
 if(!profile.export)return '';
 return '<section class="card helper-panel"><div class="panel-heading"><div><span class="kicker">HELPER HUT</span><h2>Your helpers</h2></div>'+
 '<button class="btn secondary small" data-action="go-insights">View all export data</button></div>'+
 (list.length?'<div class="helper-grid">'+list.map(helperTile).join('')+'</div>':'<p class="subtext">No helpers appear in this snapshot.</p>')+
 '<p class="smallmuted">Builder Apprentice → long Home Village upgrade; Lab Assistant → Laboratory research. Availability and assignments require confirmation inside Clash of Clans. Use no Gems.</p></section>';
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
