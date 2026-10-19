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
export function getPassState(profile){
 const raw=profile?.seasonalPlan||{};
 const choices=raw.claims||{};
 const claims={};
 for(const s of passSlots){
  const c=choices[s.id]||{};
  claims[s.id]={claimed:c.claimed===true,selected:(s.kind==='choice'&&s.options.includes(c.selected))?c.selected:null};
 }
 return {season:'2026-10',claims};
}
export function updatePassState(profile,id,action,value){
 const slot=passSlots.find(s=>s.id===id);
 if(!slot)throw Error('Unknown reward slot');
 const next=structuredClone(profile);
 const current=getPassState(next);
 if(action==='choose'){
  if(slot.kind!=='choice'||!slot.options.includes(value))throw Error('Invalid choice');
  if(current.claims[id].claimed)throw Error('Undo claim first to change selection');
  current.claims[id].selected=value;
 }else if(action==='toggle'){
  if(!current.claims[id].claimed && slot.kind==='choice'&&!current.claims[id].selected)throw Error('Choose one of the two rewards before marking it claimed');
  current.claims[id].claimed=!current.claims[id].claimed;
 }else throw Error('Unknown reward action');
 next.seasonalPlan={...(next.seasonalPlan||{}),claims:current.claims,lastRecordedAt:new Date().toISOString()};
 return next;
}
export function passSummary(profile){
 const s=getPassState(profile),silver=passSlots.filter(r=>r.track==='Silver'),gold=passSlots.filter(r=>r.track==='Gold');
 return {total:passSlots.length,silver:silver.length,gold:gold.length,choice:passSlots.filter(r=>r.kind==='choice').length,claimed:passSlots.filter(r=>s.claims[r.id].claimed).length,pending:passSlots.filter(r=>!s.claims[r.id].claimed).length};
}
export function renderPassRewards(profile,filter='unclaimed'){
 if(profile.playerTag!=='#QVLP9RVV')return '<section class="card"><h2>October Pass rewards</h2><p>This checklist was transcribed specifically for #QVLP9RVV. Please provide the remaining rewards for this other account instead of assuming they are identical.</p></section>';
 const current=getPassState(profile),sum=passSummary(profile);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const slotView=s=>{
  const status=current.claims[s.id],ch=s.kind==='choice';
  return '<div class="pass-reward '+(status.claimed?'claimed':'')+'"><div class="pass-top"><span class="pass-code">'+s.id+'</span>'+
   '<div class="pass-item"><strong>'+esc(ch?s.options.join('  /  '):s.options[0])+'</strong><span class="smallmuted">'+(ch?'Choose ONE of these two rewards':'Single reward')+'</span></div>'+
   '<span class="pill '+(status.claimed?'done':s.priority==='safe'?'active':'planned')+'">'+(status.claimed?'Claimed':s.priority==='safe'?'Low urgency':'Make room first')+'</span></div>'+
   '<p class="pass-note">'+esc(s.note)+'</p>'+
   (ch?'<label class="field pass-choice"><span>My selected reward</span><select data-pass-choice="'+s.id+'" '+(status.claimed?'disabled':'')+'>'+
    '<option value="">Not chosen yet</option>'+s.options.map(o=>'<option value="'+esc(o)+'" '+(status.selected===o?'selected':'')+'>'+esc(o)+(s.options[s.recommend]===o?' ★ recommended':'')+'</option>').join('')+
    '</select></label>':'')+
   '<button class="btn '+(status.claimed?'secondary':'')+' small" data-pass-toggle="'+s.id+'">'+(status.claimed?'Undo claimed status':'Mark claimed in game')+'</button></div>';
 };
 const show=s=>filter==='all'||(filter==='choices'?s.kind==='choice'&&!current.claims[s.id].claimed:filter==='claimed'?current.claims[s.id].claimed:!current.claims[s.id].claimed);
 return '<section class="card pass-banner"><span class="kicker">OCTOBER 2026 · TH14</span><h2>Cosmic Curse Gold & Silver Pass</h2>'+
 '<p>All 49 remaining rewards were reported by you, not inferred from a different account. Track your claims here without altering Magic Item or resource balances automatically.</p>'+
 '<div class="pass-stats"><span><strong>'+sum.pending+'</strong> waiting</span><span><strong>'+sum.claimed+'</strong> recorded claimed</span><span><strong>'+sum.choice+'</strong> either/or positions</span></div>'+
 '<div class="royal-meter"><span data-fill="'+(sum.claimed/sum.total*100).toFixed(1)+'"></span></div>'+
 '<p class="smallmuted">Deadline: October 31. Chests remain available after season rollover; other rewards can convert to Gems if they cannot fit. Do not rely on the first choice being the one you want.</p></section>'+
 '<div class="filters pass-filters">'+['unclaimed','choices','claimed','all'].map(x=>'<button class="chip '+(filter===x?'selected':'')+'" data-pass-filter="'+x+'">'+({unclaimed:'Unclaimed',choices:'Choices only',claimed:'Claimed',all:'All rewards'}[x])+'</button>').join('')+'</div>'+
 ['Silver','Gold'].map(track=>{
 const rows=passSlots.filter(x=>x.track===track&&show(x));
 return '<section class="card pass-section"><h2>'+track+' Pass <span class="smallmuted">'+rows.length+' shown</span></h2>'+
 (rows.length?'<div class="pass-grid">'+rows.map(slotView).join('')+'</div>':'<div class="empty">Nothing in this filter.</div>')+'</section>';
 }).join('')+
 '<div class="note space">This is a tracking checklist only. When you choose a reward or mark it claimed here, the app does not collect it in Clash of Clans or modify the Gold, Elixir or Magic Item counts. Update those separately after each in-game claim. Saved on this phone until you explicitly sync to GitHub.</div>';
}
