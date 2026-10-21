// Independently authored catalog of a few community base SHARE LINKS.
// No third-party images or articles are copied into the planner.
// URL values were followed to Supercell's official layout-link host (Oct 2026).
// These are suggestions, NOT measured best-performing bases or a live game sync.
const EN='https://link.clashofclans.com/en?action=OpenLayout&id=';
const ITEMS=[
 {id:'th14-hybrid',village:'home',hall:14,goal:'hybrid',title:'TH14 Hybrid — loot & trophies',
  explanation:'Balanced daily Home Village layout. A reasonable starting point while upgrading.',
  type:'HV',token:'AAAADAAAAAKPZ3vEnahaOQI0bs2lMndS',
  source:'https://clashbuilder.com/town-hall-bases/th14/hybrid',credit:'ClashBuilder'},
 {id:'th14-farming',village:'home',hall:14,goal:'farming',title:'TH14 Farming — protect storages',
  explanation:'Focuses on resources and storage protection rather than maximizing trophies.',
  type:'HV',token:'AAAADAAAAAKPZk9DP33FVFNGqKnvfDPZ',
  source:'https://clashbuilder.com/town-hall-bases/th14/farming',credit:'ClashBuilder'},
 {id:'th14-trophy',village:'home',hall:14,goal:'trophy',title:'TH14 Trophy / ranked defense',
  explanation:'Ranked-defense layout. The share link is designated as a War Base; choose an eligible layout slot in game.',
  type:'WB',token:'AAAAKQAAAAJm_BFcjBSDBuMt2FczGHW0',
  source:'https://clashbuilder.com/town-hall-bases/th14/trophy',credit:'ClashBuilder'},
 {id:'th14-war',village:'home',hall:14,goal:'war',title:'TH14 War — anti-two-star',
  explanation:'War layout with defensive compartments. Requires an eligible War Base slot.',
  type:'WB',token:'AAAALgAAAAKguClxhnADdO40ci-mHD2T',
  source:'https://clashbaselink.com/th14-base-layout/',credit:'ClashBaseLink'},
 {id:'bh9-anti3',village:'builder',hall:9,goal:'defense',title:'BH9 Anti-three-star defense',
  explanation:'Defensive Builder Base layout. Check both stages and your available buildings after importing.',
  type:'BB2',token:'AAAAGgAAAAI46ha7uB8Wxjtqik6-3Q4d',
  source:'https://clashbuilder.com/builder-hall-bases/bh9',credit:'ClashBuilder'},
 {id:'bh9-trophy',village:'builder',hall:9,goal:'trophy',title:'BH9 Trophy push',
  explanation:'Builder Base design emphasizing defense across both stages.',
  type:'BB2',token:'AAAASQAAAAHBzHeveDlJToad6kW8MrG2',
  source:'https://clashbuilder.com/builder-hall-bases/bh9',credit:'ClashBuilder'},
 {id:'bh9-night',village:'builder',hall:9,goal:'defense',title:'BH9 Night Village',
  explanation:'Alternative Builder Base defensive layout for comparison.',
  type:'BB2',token:'AAAAWgAAAAGCc-YeTP5YW626hyN9OqgJ',
  source:'https://clashbuilder.com/builder-hall-bases/bh9',credit:'ClashBuilder'},
 {id:'th4-hybrid',village:'home',hall:4,goal:'hybrid',title:'TH4 Hybrid — everyday defense',
  explanation:'Balanced early Town Hall layout to protect defenses and storages.',
  type:'HV',token:'AAAAMAAAAAHwZdMyEYkI4PLGtDZcvzvp',
  source:'https://clashbuilder.com/town-hall-bases/th4',credit:'ClashBuilder'},
 {id:'th4-farming',village:'home',hall:4,goal:'farming',title:'TH4 Farming — protect loot',
  explanation:'Early Town Hall layout focused on resource protection.',
  type:'HV',token:'AAAAMAAAAAHwZKBKjnUnkSF7D3mu-v2J',
  source:'https://clashbuilder.com/town-hall-bases/th4',credit:'ClashBuilder'},
 {id:'th4-war',village:'home',hall:4,goal:'war',title:'TH4 War defense',
  explanation:'Early war layout for an eligible War Base slot.',
  type:'WB',token:'AAAAMAAAAAHwTeoRpxcUwEIFQ8jJ51qo',
  source:'https://clashbuilder.com/town-hall-bases/th4',credit:'ClashBuilder'}
];
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const LAYOUT_CATALOG=Object.freeze(ITEMS.map(item=>Object.freeze({
 ...item,
 url:EN+encodeURIComponent('TH'+item.hall+':'+item.type+':'+item.token)
})));
export function validateLayoutLink(url,village=null,hall=null){
 try{
  const u=new URL(url);
  if(u.protocol!=='https:'||u.hostname!=='link.clashofclans.com'||!/^\/en\/?$/.test(u.pathname)||
     u.searchParams.get('action')!=='OpenLayout')return false;
  const id=u.searchParams.get('id')||'';
  const m=/^TH(\d{1,2}):(HV|WB|BB2):([A-Za-z0-9_-]{32})$/.exec(id);
  if(!m)return false;
  const level=Number(m[1]),builder=m[2]==='BB2';
  if(!Number.isInteger(level)||level<1||level>18)return false;
  if(village&&((village==='builder')!==builder||!['home','builder'].includes(village)))return false;
  if(hall!==null&&hall!==undefined&&level!==hall)return false;
  return true;
 }catch{return false;}
}
export function profileHalls(profile){
 const e=profile?.export;
 const level=(key,id)=>{
  if(!Array.isArray(e?.[key]))return null;
  const v=e[key].find(b=>b?.data===id)?.lvl;
  return Number.isInteger(v)&&v>=1&&v<=18?v:null;
 };
 return {home:level('buildings',1000001),builder:level('buildings2',1000034)};
}
export function layoutsForProfile(profile){
 const hall=profileHalls(profile);
 return {halls:hall,
  home:hall.home===null?[]:LAYOUT_CATALOG.filter(b=>b.village==='home'&&b.hall===hall.home&&validateLayoutLink(b.url,'home',hall.home)),
  builder:hall.builder===null?[]:LAYOUT_CATALOG.filter(b=>b.village==='builder'&&b.hall===hall.builder&&validateLayoutLink(b.url,'builder',hall.builder))
 };
}
export function chosenLayout(profile,id){
 const found=layoutsForProfile(profile);
 return [...found.home,...found.builder].find(r=>r.id===id)||null;
}
export function directoryLink(village,hall){
 if(!Number.isInteger(hall))return null;
 if(village==='home'&&hall>=4&&hall<=18)
  return 'https://clashbuilder.com/town-hall-bases/th'+hall;
 if(village==='builder'&&hall>=4&&hall<=10)
  return 'https://clashbuilder.com/builder-hall-bases/bh'+hall;
 return null;
}
function section(name,icon,hall,items,village){
 const tag=village==='home'?'TH':'BH';
 const level=Number.isInteger(hall)?tag+hall:'Unknown level';
 const collection=directoryLink(village,hall);
 const cards=items.map(item=>
  '<article class="layout-choice"><div class="layout-choice-top"><span class="layout-goal">'+escapeHtml(item.goal)+'</span>'+
  '<span class="layout-kind">'+(item.type==='WB'?'War slot':item.type==='HV'?'Home slot':'Builder Base')+'</span></div>'+
  '<h3>'+escapeHtml(item.title)+'</h3><p>'+escapeHtml(item.explanation)+'</p>'+
  '<div class="layout-buttons"><a class="btn" href="'+escapeHtml(item.url)+'" target="_self" rel="noopener noreferrer" '+
  'aria-label="Open '+escapeHtml(item.title)+' in Clash of Clans">Open in Clash of Clans ↗</a>'+
  '<button type="button" class="btn secondary" data-layout-copy="'+escapeHtml(item.id)+'">Copy layout link</button></div>'+
  '<small>Layout source: <a href="'+escapeHtml(item.source)+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(item.credit)+' · preview and more layouts ↗</a></small>'+
  '</article>').join('');
 return '<section class="card layout-village"><div class="layout-section-title"><span class="kicker">'+icon+' '+name+'</span><h2>'+escapeHtml(level)+' layouts</h2></div>'+
  (hall===null?'<p class="smallmuted">Import a current village JSON for this account to identify the correct Hall level.</p>':
   cards?'<div class="layout-card-grid">'+cards+'</div>':
   '<p class="smallmuted">No individually checked one-tap layouts are stored for '+escapeHtml(level)+' yet. Browse the matching hall level, then use the source\'s game copy link.</p>')+
  (collection?'<p class="layout-more"><a href="'+escapeHtml(collection)+'" target="_blank" rel="noopener noreferrer">Browse more '+escapeHtml(level)+' designs at ClashBuilder ↗</a></p>':'')+
  (village==='builder'&&hall!==null&&hall<4?'<p class="smallmuted">Builder Base layouts are generally shared for later Builder Halls. Do not import a BH9 design into BH'+hall+'.</p>':'')+'</section>';
}
export function renderBaseLayouts(profile){
 const selected=layoutsForProfile(profile);
 return '<div class="layout-library"><section class="card"><span class="kicker">ONE-TAP BASE LAYOUTS</span><h2>Layouts for your selected account</h2>'+
  '<p>Recommended examples for different goals, not a proven single best base. Based on the Town Hall and Builder Hall in your latest imported game JSON; building levels, Hero Equipment and crafted defenses may differ.</p>'+
  '<p class="smallmuted">Tap Open in Clash of Clans on the device where you play, select a compatible layout slot and confirm in-game. '+
  'Back up an existing layout before replacing its slot. These links cannot move buildings or change your game automatically. No sign-in, purchases or planner balance changes.</p>'+
  '<p class="smallmuted">Account: <strong>'+escapeHtml(profile?.displayName||profile?.playerTag||'Unknown')+'</strong></p></section>'+
  section('Home Village','🏰',selected.halls.home,selected.home,'home')+
  section('Builder Base','🔨',selected.halls.builder,selected.builder,'builder')+'</div>';
}
