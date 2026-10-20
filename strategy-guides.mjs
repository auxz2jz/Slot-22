// Original short planning notes pointing to externally authored articles.
// Copyrighted Clash Ninja guide bodies and artwork are NOT reproduced here.
// Hyperlinks open their owners' websites; source text is not cached.
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const GUIDE_LINKS=[
 {title:'When to upgrade Town Hall',type:'Village progression',role:'home',
  url:'https://www.clash.ninja/guides/when-should-you-upgrade-your-town-hall',
  note:'Balance hero, pet and key army upgrades with the structures needed to unlock the next Town Hall.'},
 {title:'Pet choices for your Heroes',type:'Army strength',role:'home',
  url:'https://www.clash.ninja/guides/which-pet-should-you-pair-with-your-heroes',
  note:'Choose pets according to the role of each Hero and the army you are actually using.'},
 {title:'Hero Equipment and Ores',type:'Army strength',role:'home',
  url:'https://www.clash.ninja/guides/what-is-hero-equipment',
  note:'Consider frequently used Hero abilities before spreading limited Shiny, Glowy and Starry Ore across every item.'},
 {title:'Unlock the sixth Home Builder',type:'Builder Base / B.O.B',role:'builder',
  url:'https://www.clash.ninja/guides/unlocking-the-6th-builder-b.o.b',
  note:'Follow the B.O.B milestones: gear-ups, high-level defense and troop, and combined Builder Hero levels.'},
 {title:'Builder Base 2.0',type:'Builder Base / B.O.B',role:'builder',
  url:'https://www.clash.ninja/guides/what-is-builder-base-2.0',
  note:'Learn the two-stage Builder Base, the Star Laboratory, Builder Heroes and how B.O.B differs from O.T.T.O.'},
 {title:'Town Hall maximum levels',type:'Village progression',role:'home',
  url:'https://www.clash.ninja/guides/max-levels-for-each-th',
  note:'Check current maximum upgrade levels by Town Hall before choosing long-term targets.'},
 {title:'Supercharge levels',type:'Late-game upgrades',role:'home',
  url:'https://www.clash.ninja/guides/what-are-supercharge-levels',
  note:'Separate temporary Supercharge improvements from permanent standard levels in your plan.'},
 {title:'Queen Walk fundamentals',type:'Attacks',role:'home',
  url:'https://www.clash.ninja/guides/how-to-queen-walk-part-1-the-basics',
  note:'Plan your Queen’s approach, Healer protection and funneling around the main army’s objective.'},
 {title:'Season Challenges and Gold Pass',type:'Resources and events',role:'both',
  url:'https://www.clash.ninja/guides/what-are-season-challenges',
  note:'Consider Season Bank timing, Gold Pass builder/research discounts and reward claims; confirm the actual active percentage in-game.'},
 {title:'Clan Games and recurring events',type:'Resources and events',role:'both',
  url:'https://www.clash.ninja/guides/when-are-the-next-ingame-events',
  note:'Look up recurring CWL, Clan Games, season and event windows before using time-limited rewards.'},
 {title:'Recommended upgrade filters',type:'Planning tools',role:'both',
  url:'https://www.clash.ninja/blog/planner-upgrade-filtering',
  note:'Use eligibility, village area, resource type and search filters to narrow your own upgrade choices.'},
 {title:'Resource forecasting',type:'Planning tools',role:'both',
  url:'https://www.clash.ninja/blog/loot-planner-enters-early-access',
  note:'Compare upcoming upgrade costs with stored resources and expected income so workers have fewer unfunded gaps.'},
 {title:'Village JSON imports',type:'Planning tools',role:'both',
  url:'https://www.clash.ninja/blog/one-tap-village-updating-is-here',
  note:'Re-export your village after changes: timer and level data are dated snapshots, not a live game connection.'},
 {title:'Supercell pet unlocks',type:'Official game information',role:'home',
  url:'https://support.supercell.com/clash-of-clans/en/articles/about-heroes-pets-9.html',
  note:'Confirm which Hero Pets each Pet House level unlocks using Supercell’s own reference.'}
];
export function strategyNotes(profile){
 const x=profile?.export||{};
 const th=x.buildings?.find(v=>v.data===1000001)?.lvl||null;
 const bh=x.buildings2?.find(v=>v.data===1000034)?.lvl||null;
 const pet=x.buildings?.find(v=>v.data===1000068)?.lvl||null;
 const tips=[];
 if(th===14){
  if(pet!==null&&pet<4)tips.push({
   label:'Unlock Unicorn through Pet House level 4',
   detail:'Continue the Pet House upgrade path, then choose which pet to research when the existing pet job completes.',
   guide:'https://www.clash.ninja/guides/which-pet-should-you-pair-with-your-heroes'});
  tips.push({
   label:'Prioritize usable hero, pet and army strength',
   detail:'Review active Hero upgrades with Home builders and the separate Laboratory/Pet House queues; avoid waiting on routine defenses when offense is lagging.',
   guide:'https://www.clash.ninja/guides/when-should-you-upgrade-your-town-hall'});
 }
 if(bh===9)tips.push({
  label:'Aim at B.O.B rather than arbitrary Builder Base upgrades',
  detail:'Track the three gear-ups, a level-nine defense, a level-eighteen Builder troop and the combined Builder Hero target.',
  guide:'https://www.clash.ninja/guides/unlocking-the-6th-builder-b.o.b'});
 if(x.equipment?.length)tips.push({
  label:'Use ore where it strengthens your actual attack',
  detail:'Equipment is instant and independent of builders; check your saved ore before committing to a high-cost level.',
  guide:'https://www.clash.ninja/guides/what-is-hero-equipment'});
 return tips;
}
export function renderStrategyGuides(profile){
 const tips=strategyNotes(profile);
 const sections=[...new Set(GUIDE_LINKS.map(t=>t.type))];
 const tipHtml=tips.length?'<section class="card sg-spotlight"><h2>Suggested reading for your village</h2>'+
  '<div class="sg-priorities">'+tips.map((t,i)=>'<article><b>'+(i+1)+'. '+esc(t.label)+'</b>'+
   '<p>'+esc(t.detail)+'</p><a href="'+esc(t.guide)+'" target="_blank" rel="noopener noreferrer">Read source guide ↗</a></article>').join('')+'</div></section>':'';
 return '<section class="strategy-guides">'+
  '<div class="card sg-intro"><span class="kicker">STRATEGY REFERENCE LIBRARY</span>'+
  '<h2>Clash guides and learning</h2>'+
  '<p>Short original notes with direct links to Clash Ninja and Supercell. The full guides remain on their authors’ sites; no copied articles or images are hosted here.</p>'+
  '<p class="smallmuted">Guide suggestions use your last imported Town Hall and Builder Hall levels, not live game access.</p></div>'+
  tipHtml+sections.map(section=>'<section class="card sg-section"><h3>'+esc(section)+'</h3>'+
   '<div class="sg-grid">'+GUIDE_LINKS.filter(g=>g.type===section).map(g=>
    '<article class="sg-card"><h4>'+esc(g.title)+'</h4><p>'+esc(g.note)+'</p>'+
    '<a href="'+esc(g.url)+'" target="_blank" rel="noopener noreferrer" aria-label="Read '+esc(g.title)+' at source">Read original guide ↗</a></article>').join('')+'</div></section>').join('')+
  '</section>';
}
