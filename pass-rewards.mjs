// User-reported unclaimed October 2026 Season Pass rewards, #QVLP9RVV.
// These are REWARD POSITIONS, not claims or existing Magic Item inventory.
// For choices, exactly ONE of the two alternatives can be collected.
// No rewards are marked claimed until the player explicitly confirms.
const fixed=(id,track,name,note,priority='hold')=>({id,track,kind:'fixed',options:[name],recommend:0,note,priority});
const choice=(id,track,a,b,recommend,note,priority='hold')=>({id,track,kind:'choice',options:[a,b],recommend,note,priority});
export const passSlots=[
  fixed('S01','Silver','Chest','May remain unclaimed until season-end; open when ready.','safe'),
  fixed('S02','Silver','450,000 Gold','Create Gold storage room first.'),
  fixed('S03','Silver','450,000 Elixir','Create Elixir storage room first.'),
  choice('S04','Silver','Resource Potion','Chest',1,'Prefer the Chest; Resource Potions were already above normal capacity.','safe'),
  fixed('S05','Silver','7,500 Dark Elixir','Use Dark Elixir on Heroes/Pets to make room.'),
  choice('S06','Silver','Pet Potion','Research Potion',0,'Pet Potion fits the previously reported inventory better; revise if live stock changed.'),
  choice('S07','Silver','Chest','Resource Potion',0,'Prefer the Chest over another surplus Resource Potion.','safe'),
  choice('S08','Silver','1,000 Capital Gold','1,000,000 Builder Gold',1,'Builder Gold toward Cannon 8→9 and sixth-builder objective. Only claim when storage fits.'),
  choice('S09','Silver','1,000 Capital Gold','1,000,000 Builder Elixir',1,'Builder Elixir toward Star Laboratory/Builder Heroes. Only claim with room.'),
  fixed('S10','Silver','Chest','Keep or open carefully depending on current inventory.','safe'),
  fixed('S11','Silver','450,000 Gold','Make storage room before claiming.'),
  fixed('S12','Silver','450,000 Elixir','Make storage room before claiming.'),
  fixed('S13','Silver','Chest','Unopened chest can remain until end of season.','safe'),
  fixed('S14','Silver','7,500 Dark Elixir','Make room with a Hero/Pet upgrade.'),
  choice('S15','Silver','1,000,000 Builder Gold','1,000 Capital Gold',0,'Prefer Builder Gold for B.O.B.; make capacity first.'),
  fixed('S16','Silver','Chest','No need to open before Magic Items have space.','safe'),
  fixed('S17','Silver','7,500 Dark Elixir','Make storage room first.'),
  choice('S18','Silver','1,000,000 Builder Elixir','1,000 Capital Gold',0,'Prefer Builder Elixir for B.O.B.; make capacity first.'),
  fixed('S19','Silver','Chest','Safe to leave for now.','safe'),
  fixed('S20','Silver','450,000 Gold','Walls can create space when a builder is available.'),
  fixed('S21','Silver','450,000 Elixir','Walls or Army upgrades can create space.'),
  fixed('S22','Silver','Chest','Safe to leave for now.','safe'),
  choice('S23','Silver','750,000 Elixir','750,000 Gold',0,'Tentatively prefer Elixir for your Army Camps and research; choose only when room exists.'),
  fixed('S24','Silver','Chest','Safe to leave for now.','safe'),
  fixed('S25','Silver','450,000 Gold','Make storage room before claiming.'),
  fixed('S26','Silver','450,000 Elixir','Make storage room before claiming.'),
  fixed('S27','Silver','7,500 Dark Elixir','Make storage room first.'),
  fixed('S28','Silver','Chest','Safe to leave for now.','safe'),
  fixed('S29','Silver','Chest','Safe to leave for now.','safe'),
  fixed('S30','Silver','Book of Heroes','Use existing Book and queue a Hero upgrade first; do not convert to Gems.'),
  choice('G01','Gold','Hero Potion','Power Potion',0,'Both previously full/overfull. Prefer Hero Potion if you first use one, otherwise reevaluate.'),
  choice('G02','Gold','Builder Potion','2 Wall Rings',0,'Builder Potion is strong with all builders busy. Choose Wall Rings if unable to use/fit it by deadline.'),
  choice('G03','Gold','1,000 Capital Gold','Research Potion',1,'Prefer Research Potion after using surplus potions while Laboratory runs.'),
  choice('G04','Gold','Rune of Gold','Rune of Elixir',1,'Elixir is useful for TH14 army buildings; use existing Rune and spend stored Elixir first.'),
  choice('G05','Gold','Builder Potion','2 Wall Rings',0,'Second Builder Potion if capacity can be made; otherwise take Wall Rings.'),
  choice('G06','Gold','1,000 Capital Gold','Research Potion',1,'Prefer Research Potion when Laboratory busy; use old stock to create space.'),
  choice('G07','Gold','Research Potion','Pet Potion',1,'Pet Potion fits old inventory better; confirm current pet queue.'),
  choice('G08','Gold','Research Potion','1,000 Capital Gold',0,'Prefer Research Potion if it can be used without overflow.'),
  choice('G09','Gold','Rune of Gold','Rune of Elixir',0,'A Gold Rune complements the Elixir Rune and can refill storage after wall spending. May switch if needed.'),
  choice('G10','Gold','Book of Fighting','Book of Spells',1,'Potential Book of Spells for Freeze research; only claim after using existing Book.'),
  fixed('G11','Gold','Book of Heroes','Use existing Hero Book first; one more Book exists on Silver track.'),
  fixed('G12','Gold','1,000 Capital Gold','Collect if Clan Capital storage has room.','safe'),
  choice('G13','Gold','Rune of Builder Gold','Shovel of Obstacles',0,'Rune of Builder Gold strongly helps the B.O.B. Cannon milestone; use stored Rune first.'),
  choice('G14','Gold','Power Potion','Hero Potion',1,'Hero Potion if you have room after using existing stock.'),
  choice('G15','Gold','Book of Fighting','Book of Spells',0,'Book of Fighting for a high-level troop; can swap to Spells if Freeze bottleneck is longer.'),
  fixed('G16','Gold','1,000 Capital Gold','Collect if Clan Capital storage has room.','safe'),
  choice('G17','Gold','Shovel of Obstacles','Rune of Builder Elixir',1,'Rune of Builder Elixir is valuable for B.O.B. research and hero levels; spend stored Rune first.'),
  fixed('G18','Gold','Rune of Dark Elixir','Use existing Dark Elixir Rune after spending Dark Elixir; collect this replacement after creating space.'),
  fixed('G19','Gold','Book of Building','Use existing Book on a long high-value upgrade before claiming replacement.')
];

/** Merge the user's own reward positions and edits with the original reported 49.
 * Unclaimed prizes are independent from actual holdings in profile.items/resources.
 */
const STANDARD_PLAYER='#QVLP9RVV';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const TRACKS=['Silver','Gold','Event'];
export function rewardSlots(profile) {
 const plan=profile?.seasonalPlan||{};
 const defaults=profile?.playerTag===STANDARD_PLAYER?passSlots:[];
 const overrides=plan.rewardOverrides||{};
 const custom=Array.isArray(plan.customRewards)?plan.customRewards:[];
 return [...defaults.map(slot=>{
  const o=overrides[slot.id];
  return o?{...slot,track:o.track,kind:o.kind,options:[...o.options],note:o.note,recommend:0,priority:'hold'}:slot;
 }),...custom.map(s=>({...s,options:[...s.options]}))];
}
export function getPassState(profile){
 const raw=profile?.seasonalPlan||{};
 const choices=raw.claims||{},claims={};
 for(const s of rewardSlots(profile)){
  const c=choices[s.id]||{};
  claims[s.id]={claimed:c.claimed===true,selected:(s.kind==='choice'&&s.options.includes(c.selected))?c.selected:null};
 }
 return {season:'2026-10',claims};
}
export function updatePassState(profile,id,action,value){
 const slot=rewardSlots(profile).find(s=>s.id===id);
 if(!slot)throw Error('Unknown reward slot');
 const next=structuredClone(profile);
 const current=getPassState(next);
 if(action==='choose'){
  if(slot.kind!=='choice'||!slot.options.includes(value))throw Error('Invalid choice');
  if(current.claims[id].claimed)throw Error('Undo claim first to change selection');
  current.claims[id].selected=value;
 }else if(action==='toggle'){
  if(!current.claims[id].claimed && slot.kind==='choice'&&!current.claims[id].selected)throw Error('Choose one reward before marking it claimed');
  current.claims[id].claimed=!current.claims[id].claimed;
 }else throw Error('Unknown reward action');
 next.seasonalPlan={...(next.seasonalPlan||{}),claims:{...(next.seasonalPlan?.claims||{}),...current.claims},lastRecordedAt:new Date().toISOString()};
 return next;
}
function validateRewardFields(raw){
 const track=String(raw.track||'Silver');
 if(!TRACKS.includes(track))throw Error('Select a valid reward track');
 const kind=String(raw.kind||'fixed');
 if(!['fixed','choice'].includes(kind))throw Error('Choose single reward or either/or');
 const options=[String(raw.optionA||'').trim(),String(raw.optionB||'').trim()].slice(0,kind==='choice'?2:1);
 if(options.some(x=>!x||x.length>100)||kind==='choice'&&options[0]===options[1])throw Error('Provide one or two distinct reward names, up to 100 characters each');
 const note=String(raw.note||'').trim();
 if(note.length>380)throw Error('Notes must be 380 characters or fewer');
 return {track,kind,options,note};
}
export function saveRewardDefinition(profile,input){
 const next=structuredClone(profile),parsed=validateRewardFields(input),id=String(input.id||'').trim();
 next.seasonalPlan={...(next.seasonalPlan||{})};
 const list=rewardSlots(next);
 if(id){
  const original=list.find(r=>r.id===id);
  if(!original)throw Error('Reward to edit not found');
  const state=getPassState(next).claims[id];
  if(state.claimed && original.kind==='choice' && !parsed.options.includes(state.selected))throw Error('Undo the current claim before replacing its selected prize');
  if(state.claimed && parsed.kind==='choice'&&!parsed.options.includes(state.selected))throw Error('Undo the claim before changing it to a different either/or reward');
  if(passSlots.some(r=>r.id===id)){
   next.seasonalPlan.rewardOverrides={...(next.seasonalPlan.rewardOverrides||{}),[id]:parsed};
  }else{
   next.seasonalPlan.customRewards=(next.seasonalPlan.customRewards||[]).map(r=>r.id===id?{...r,...parsed}:r);
  }
  return next;
 }
 if((next.seasonalPlan.customRewards||[]).length>=200)throw Error('Maximum 200 additional event rewards per account');
 const used=new Set(list.map(r=>r.id));
 let serial=Math.max(1,Number(next.seasonalPlan.nextRewardId)||1),newId;
 do{newId='CUSTOM-'+serial++;}while(used.has(newId));
 next.seasonalPlan.nextRewardId=serial;
 next.seasonalPlan.customRewards=[...(next.seasonalPlan.customRewards||[]),{id:newId,...parsed,priority:'hold',recommend:0}];
 return next;
}
export function removeCustomReward(profile,id){
 const next=structuredClone(profile);
 const existing=next.seasonalPlan?.customRewards||[];
 if(!existing.some(x=>x.id===id))throw Error('Only extra rewards can be removed. Edit or mark original rewards claimed instead.');
 next.seasonalPlan.customRewards=existing.filter(x=>x.id!==id);
 const claims={...(next.seasonalPlan.claims||{})};
 delete claims[id];next.seasonalPlan.claims=claims;
 return next;
}
export function passSummary(profile){
 const slots=rewardSlots(profile),s=getPassState(profile);
 return {total:slots.length,
  silver:slots.filter(r=>r.track==='Silver').length,
  gold:slots.filter(r=>r.track==='Gold').length,
  choice:slots.filter(r=>r.kind==='choice').length,
  claimed:slots.filter(r=>s.claims[r.id].claimed).length,
  pending:slots.filter(r=>!s.claims[r.id].claimed).length};
}
export function renderPassRewards(profile,filter='unclaimed',editingId=null){
 const slots=rewardSlots(profile),current=getPassState(profile),sum=passSummary(profile);
 const edit=slots.find(s=>s.id===editingId)||null;
 const form=(value=null)=>{
  const v=value||{id:'',track:'Silver',kind:'fixed',options:['',''],note:''};
  return '<section class="card pass-editor"><h2>'+(value?'Edit reward '+esc(v.id):'Add another event reward')+'</h2>'+
  '<p class="subtext">You can enter a new prize or correct any listed reward. If its image alternates between two prizes, choose Either/or and enter both; it counts as one reward.</p>'+
  '<form id="pass-reward-form" class="stack"><input type="hidden" name="id" value="'+esc(v.id)+'">'+
  '<div class="grid two"><div class="field"><label for="event-track">Reward track</label><select name="track" id="event-track">'+
   TRACKS.map(t=>'<option '+(v.track===t?'selected':'')+'>'+t+'</option>').join('')+'</select></div>'+
   '<div class="field"><label for="event-kind">Reward type</label><select name="kind" id="event-kind"><option value="fixed" '+(v.kind==='fixed'?'selected':'')+'>One fixed reward</option><option value="choice" '+(v.kind==='choice'?'selected':'')+'>Either/or – choose one</option></select></div></div>'+
   '<div class="grid two"><div class="field"><label for="event-option-a">Prize A / single prize</label><input name="optionA" id="event-option-a" maxlength="100" required placeholder="e.g. Book of Heroes" value="'+esc(v.options[0]||'')+'"></div>'+
   '<div class="field" data-choice-field><label for="event-option-b">Prize B (either/or only)</label><input name="optionB" id="event-option-b" maxlength="100" placeholder="e.g. Book of Spells" value="'+esc(v.options[1]||'')+'"></div></div>'+
   '<div class="field"><label for="event-notes">Notes (optional)</label><textarea name="note" id="event-notes" maxlength="380" rows="2" placeholder="How many? What should I use it on?">'+esc(v.note||'')+'</textarea></div>'+
   '<div class="row wrap"><button class="btn" type="submit">'+(value?'Save reward changes':'Add reward')+'</button>'+
   (value?'<button class="btn secondary" type="button" data-action="reward-cancel">Cancel edit</button>':'')+
   (value&&!passSlots.some(x=>x.id===v.id)?'<button class="btn danger" type="button" data-action="reward-delete" data-reward-id="'+esc(v.id)+'">Delete this extra reward</button>':'')+
   '</div></form></section>';
 };
 const show=s=>filter==='all'||(filter==='choices'?s.kind==='choice'&&!current.claims[s.id].claimed:filter==='claimed'?current.claims[s.id].claimed:!current.claims[s.id].claimed);
 const slotView=s=>{
  const status=current.claims[s.id],ch=s.kind==='choice',isBase=passSlots.some(r=>r.id===s.id);
  return '<div class="pass-reward '+(status.claimed?'claimed':'')+'"><div class="pass-top"><span class="pass-code">'+esc(s.id)+'</span>'+
   '<div class="pass-item"><strong>'+esc(ch?s.options.join(' / '):s.options[0])+'</strong><span class="smallmuted">'+(ch?'TWO OPTIONS – collect only one':'Single reward')+'</span></div>'+
   '<span class="pill '+(status.claimed?'done':s.priority==='safe'?'active':'planned')+'">'+(status.claimed?'Claimed':s.priority==='safe'?'Low urgency':'Unclaimed')+'</span></div>'+
   '<p class="pass-note">'+esc(s.note||'')+'</p>'+
   (ch?'<label class="field pass-choice"><span>Which prize did you choose?</span><select data-pass-choice="'+esc(s.id)+'" '+(status.claimed?'disabled':'')+'>'+
     '<option value="">Not chosen yet</option>'+s.options.map(o=>'<option value="'+esc(o)+'" '+(status.selected===o?'selected':'')+'>'+esc(o)+(s.options[s.recommend]===o&&isBase?' ★ suggestion':'')+'</option>').join('')+'</select></label>':'')+
   '<div class="row wrap"><button class="btn '+(status.claimed?'secondary':'')+' small" data-pass-toggle="'+esc(s.id)+'">'+(status.claimed?'Undo claim':'Mark claimed in game')+'</button>'+
   '<button class="btn secondary small" data-edit-reward="'+esc(s.id)+'">Edit</button></div></div>';
 };
 return '<section class="card pass-banner"><span class="kicker">SEASON REWARD NOTEBOOK</span><h2>Gold, Silver & event prizes</h2>'+
 '<p>Everything in this checklist is editable. Track actual collected prizes and add any new items from the event screen. Alternating icons mean an either/or choice, never two separate rewards.</p>'+
 '<div class="pass-stats"><span><strong>'+sum.pending+'</strong> waiting</span><span><strong>'+sum.claimed+'</strong> claimed in tracker</span><span><strong>'+sum.choice+'</strong> either/or positions</span></div>'+
 '<div class="royal-meter"><span data-fill="'+(sum.total?sum.claimed/sum.total*100:0).toFixed(1)+'"></span></div>'+
 '<div class="row wrap space"><button class="btn secondary small" data-action="go-items">◇ Enter actual Books, Runes & Potions</button>'+
 '<button class="btn secondary small" data-action="go-sync">⇅ Back up all profiles</button></div>'+
 '<p class="smallmuted">The starter list was transcribed from your 49 remaining October rewards. It is not live game data. Do a final in-game check before season end.</p></section>'+
 '<div class="filters pass-filters">'+['unclaimed','choices','claimed','all'].map(x=>'<button class="chip '+(filter===x?'selected':'')+'" data-pass-filter="'+x+'">'+({unclaimed:'Unclaimed',choices:'Either/or only',claimed:'Claimed',all:'All rewards'}[x])+'</button>').join('')+'</div>'+
 form(edit)+
 ['Silver','Gold','Event'].map(track=>{
  const rows=slots.filter(x=>x.track===track&&show(x));
  if(track==='Event'&&!slots.some(s=>s.track==='Event'))return '';
  return '<section class="card pass-section"><h2>'+esc(track)+(track==='Event'?' / other event':' Pass')+' <span class="smallmuted">'+rows.length+' shown</span></h2>'+
   (rows.length?'<div class="pass-grid">'+rows.map(slotView).join('')+'</div>':'<div class="empty">Nothing in this filter.</div>')+'</section>';
 }).join('')+
 '<div class="note space">This checklist only records what you tell it. No reward is collected automatically and resource or Magic Item quantities are never increased automatically. Enter your ACTUAL holdings in Magic Items & ores after collection; your values may exceed normal capacity if the game already allows them.</div>';
}
