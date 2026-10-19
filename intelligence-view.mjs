import {villageProgress,inferActionHints} from './snapshot-intelligence.mjs';
const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const fmt=n=>Number(n||0).toLocaleString('en-US');
const dt=t=>Number.isFinite(t)?new Date(t).toLocaleString():'Unknown';
function wallPanel(label,list){
 const n=list.reduce((a,r)=>a+r.quantity,0);
 return '<div class="snapshot-panel"><h3>'+e(label)+' · '+fmt(n)+'</h3>'+(n?'<div class="insight-levels">'+list.map(v=>'<span class="tag">L'+v.level+': '+fmt(v.quantity)+'</span>').join('')+'</div>':'<p>No wall levels provided.</p>')+'</div>';
}
function sectionPanel(title,items,columns){
 return '<details class="snapshot-details"><summary>'+e(title)+' ('+items.length+')</summary>'+
 (items.length?'<div class="scroll-table"><table><thead><tr>'+columns.map(c=>'<th>'+e(c.heading)+'</th>').join('')+'</tr></thead><tbody>'+items.map(row=>'<tr>'+columns.map(c=>'<td>'+e(row[c.key]??'—')+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>':'<p>No records provided by the export.</p>')+'</details>';
}
export function renderVillageIntelligence(profile){
 const p=villageProgress(profile?.export);if(!p)return '';
 const hints=inferActionHints(profile.export);
 const allActive=p.areas.flatMap(a=>a.active.map(v=>({...v,area:a.name})));
 const former=Array.isArray(profile.snapshotChanges)?profile.snapshotChanges:[];
 const latest=former.at(-1);
 const b=latest?.changes||[];
 const more=latest?.other||[];
 const extras=p.cosmetics;
 return '<section class="card"><span class="kicker">AUTOMATIC JSON ANALYSIS</span><h2>Village progress from your actual game export</h2>'+
 '<p class="subtext">Every number below is calculated from your imported snapshot—not a live connection. The game does not export your current Gold, Elixir, Magic Items, or unclaimed pass prizes.</p>'+
 '<div class="grid two">'+wallPanel('Home Village walls',p.homeWalls)+wallPanel('Builder Base walls',p.builderWalls)+'</div>'+
 '<div class="grid three space"><div class="stat"><strong>'+fmt(p.heroes.length)+'</strong><small>Heroes imported</small></div><div class="stat"><strong>'+fmt(p.equipment.length)+'</strong><small>Equipment entries</small></div><div class="stat"><strong>'+fmt(allActive.length)+'</strong><small>Timers recorded in snapshot</small></div></div>'+
 sectionPanel('Hero levels & upgrade status',p.heroes.map(r=>({...r,level:'L'+r.level,upgrading:r.upgrading?'Upgrade in snapshot':'No timer in snapshot'})),[{key:'name',heading:'Hero'},{key:'level',heading:'Level'},{key:'upgrading',heading:'Snapshot'}])+
 sectionPanel('Equipment inventory and levels',p.equipment.map(r=>({...r,level:'L'+r.level})),[{key:'name',heading:'Equipment (unmapped IDs shown)'},{key:'level',heading:'Level'},{key:'id',heading:'Game ID'}])+
 sectionPanel('Builder Base troops & B.O.B. research',p.troop.map(r=>({...r,level:'L'+r.level})),[{key:'name',heading:'Troop'},{key:'level',heading:'Level'}])+
 sectionPanel('Spell research levels',p.spell.map(r=>({...r,level:'L'+r.level,timer:r.timer===null?'—':Math.ceil(r.timer/3600)+'h at snapshot'})),[{key:'name',heading:'Spell'},{key:'level',heading:'Level'},{key:'timer',heading:'Upgrade timer'}])+
 sectionPanel('Active upgrades at last export',allActive.map(r=>({name:r.name,area:r.area,level:'L'+r.level,end:dt(r.finishesAt)})),[{key:'area',heading:'Where'},{key:'name',heading:'Upgrading'},{key:'level',heading:'Level recorded'},{key:'end',heading:'Estimated snapshot finish'}])+
 '<h3>All game collections</h3><div class="scroll-table"><table><thead><tr><th>Village collection</th><th>Grouped records</th><th>Individual objects</th><th>Timers</th></tr></thead><tbody>'+
 p.areas.map(r=>'<tr><td>'+e(r.name)+'</td><td>'+fmt(r.records)+'</td><td>'+fmt(r.count)+'</td><td>'+fmt(r.active.length)+'</td></tr>').join('')+'</tbody></table></div>'+
 sectionPanel('Cosmetics, scenery, house parts, and obstacles',extras.map(r=>({name:r.key,records:r.records,items:r.items,ids:r.values.map(v=>v.id+(v.quantity>1?' × '+v.quantity:'')).join(', ')})),[{key:'name',heading:'Game section'},{key:'records',heading:'Grouped entries'},{key:'items',heading:'Total'},{key:'ids',heading:'Export IDs'}])+
 (p.boosts.length?'<h3>Recorded boosts and cooldowns</h3><div class="stack">'+p.boosts.map(v=>'<div class="note">'+e(v.name)+': '+(v.seconds===null?'Value is not a duration':Math.ceil(v.seconds/3600)+' hours remaining at export; estimated end '+dt(v.at))+'</div>').join('')+'</div>':'')+
 '<div class="note space">'+hints.map(e).join(' ')+'</div></section>'+
 '<section class="card space"><h2>Changes between your last two imports</h2>'+
 (!latest?'<p class="subtext">Import an updated village JSON for this account again to see precisely which counts and recorded levels changed. Existing snapshots stay available in your backup as a short change summary.</p>':
 '<p class="subtext">Compared snapshots from '+dt((latest.beforeTimestamp||0)*1000)+' to '+dt((latest.afterTimestamp||0)*1000)+'. Building groups can contain multiple copies; level increases are inferred only when their counts match.</p>'+
 (b.length?'<div class="scroll-table"><table><thead><tr><th>Section</th><th>Item</th><th>Change</th></tr></thead><tbody>'+b.map(r=>'<tr><td>'+e(r.key)+'</td><td>'+e(r.name)+'</td><td>'+e(r.inferredLevels!==null?'Level total '+(r.inferredLevels>0?'+':'')+r.inferredLevels:'Count '+r.beforeCount+' → '+r.afterCount+', level total '+r.beforeLevelPoints+' → '+r.afterLevelPoints)+'</td></tr>').join('')+'</tbody></table></div>':'<p>No changes in tracked unit or building levels/counts.</p>')+
 (more.length?'<p class="smallmuted">Additional categories changed: '+e(more.join(', '))+'</p>':'') )+
 '<p class="smallmuted">These summaries never change your recorded upgrades, resources, or Magic Items automatically. They help you verify progress before updating your plans.</p></section>';
}
