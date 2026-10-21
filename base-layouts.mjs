// Independently authored catalog of a few community base SHARE LINKS.
// No third-party images or articles are copied into the planner.
// URL values were followed to Supercell's official layout-link host (Oct 2026).
// These are suggestions, NOT measured best-performing bases or a live game sync.
import {PREVIEW_LAYOUTS} from './base-layout-preview-catalog.mjs';
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
// Keep existing favorite IDs stable; upgrade only thumbnails where the exact
// original share token matches. Never show one base picture for another token.
const ALL_ITEMS=[...ITEMS,...PREVIEW_LAYOUTS];
const used=new Set();
export const LAYOUT_CATALOG=Object.freeze(ALL_ITEMS.filter(item=>{
 const code='TH'+item.hall+':'+item.type+':'+item.token;
 if(used.has(code))return false;
 used.add(code);return true;
}).map(item=>{
 const match=PREVIEW_LAYOUTS.find(p=>p.token===item.token&&p.hall===item.hall&&p.type===item.type);
 return Object.freeze({...item,image:item.image||match?.image||null,
  url:EN+encodeURIComponent('TH'+item.hall+':'+item.type+':'+item.token)});
}));
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
export function availableLayouts(village,hall){
 if(!['home','builder'].includes(village)||!Number.isInteger(hall))return [];
 return LAYOUT_CATALOG.filter(b=>b.village===village&&b.hall===hall&&
  validateLayoutLink(b.url,village,hall));
}
export function chosenLayout(profile,id,browsing={}){
 const levels=profileHalls(profile);
 const chosen=LAYOUT_CATALOG.find(item=>item.id===id);
 if(!chosen)return null;
 const viewed=browsing?.[chosen.village]??levels[chosen.village];
 return viewed===chosen.hall&&validateLayoutLink(chosen.url,chosen.village,chosen.hall)?chosen:null;
}
export function directoryLink(village,hall){
 if(!Number.isInteger(hall))return null;
 if(village==='home'&&hall>=4&&hall<=18)
  return 'https://clashbuilder.com/town-hall-bases/th'+hall;
 if(village==='builder'&&hall>=4&&hall<=10)
  return 'https://clashbuilder.com/builder-hall-bases/bh'+hall;
 // The TH3/BH3 galleries are hosted by other community publishers; no fake
 // ClashBuilder URL for an unsupported level is generated.
 if((village==='home'||village==='builder')&&hall===3)
  return 'https://basecoc.com/';
 return null;
}
export const HALL_MAX=Object.freeze({home:18,builder:10});
export function browseHalls(profile,overrides={}){
 const current=profileHalls(profile),levels={};
 for(const village of ['home','builder']){
  const override=overrides?.[village];
  levels[village]=Number.isInteger(override)&&override>=1&&override<=HALL_MAX[village]?
   override:current[village];
 }
 return levels;
}
function selectHall(village,personal,browsing){
 const prefix=village==='home'?'TH':'BH';
 const option=(n)=>'<option value="'+n+'"'+(n===browsing&&browsing!==personal?' selected':'')+'>'+prefix+n+'</option>';
 return '<label class="layout-picker">Browse '+(village==='home'?'Town Hall':'Builder Hall')+
  '<select data-layout-hall="'+village+'" aria-label="Browse '+village+' hall layouts">'+
  '<option value="mine"'+(personal===browsing?' selected':'')+'>My account level'+
   (personal!==null?' ('+prefix+personal+')':'')+'</option>'+
  Array.from({length:HALL_MAX[village]},(_,i)=>option(i+1)).join('')+
  '</select></label>';
}
function section(name,icon,hall,items,village,personal){
 const tag=village==='home'?'TH':'BH';
 const level=Number.isInteger(hall)?tag+hall:'Unknown level';
 const collection=directoryLink(village,hall);
 const cards=items.map(item=>
  '<article class="layout-choice">'+
  (item.image?'<a class="layout-preview-link" href="'+escapeHtml(item.source)+'" target="_blank" rel="noopener noreferrer" aria-label="Open full preview at publisher for '+escapeHtml(item.title)+'">'+
   '<img class="layout-preview" loading="lazy" decoding="async" src="'+escapeHtml(item.image)+'" alt="Exact '+escapeHtml(item.title)+' base layout preview, hosted by '+escapeHtml(item.credit)+'"></a>':
   '<p class="layout-preview-missing">Preview is available at the original layout source.</p>')+
  '<div class="layout-choice-top"><span class="layout-goal">'+escapeHtml(item.goal)+'</span>'+
  '<span class="layout-kind">'+(item.type==='WB'?'War slot':item.type==='HV'?'Home slot':'Builder Base')+'</span></div>'+
  '<h3>'+escapeHtml(item.title)+'</h3><p>'+escapeHtml(item.explanation)+'</p>'+
  '<div class="layout-buttons"><a class="btn" href="'+escapeHtml(item.url)+'" target="_self" rel="noopener noreferrer" '+
  'aria-label="Open '+escapeHtml(item.title)+' in Clash of Clans">Open in Clash of Clans ↗</a>'+
  '<button type="button" class="btn secondary" data-layout-copy="'+escapeHtml(item.id)+'">Copy layout link</button></div>'+
  '<small>Layout source: <a href="'+escapeHtml(item.source)+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(item.credit)+' · preview and more layouts ↗</a></small>'+
  '</article>').join('');
 return '<section class="card layout-village"><div class="layout-section-title"><span class="kicker">'+icon+' '+name+'</span><h2>'+escapeHtml(level)+' layouts</h2></div>'+
  '<div class="layout-picker-row">'+selectHall(village,personal,hall)+
  (Number.isInteger(personal)&&personal!==hall?'<span class="smallmuted">Browsing other players’ '+tag+' level; your account remains '+tag+personal+'. Clash may reject these links for your own village.</span>':'')+'</div>'+
  (hall===null?'<p class="smallmuted">Import a current village JSON or use the hall selector above to explore other players’ designs.</p>':
   hall<=2?'<p class="smallmuted">Beginner '+escapeHtml(level)+': the layout editor and normal copy-link workflow are not yet available. Keep storages and defenses close to the Hall and upgrade until layout editing unlocks around level 3.</p>':
   cards?'<div class="layout-card-grid">'+cards+'</div>':
   '<p class="smallmuted">No individually confirmed one-tap layout is stored for '+escapeHtml(level)+' yet. Use the source gallery to preview designs at this level; do not copy a different Hall level.</p>')+
  (collection?'<p class="layout-more"><a href="'+escapeHtml(collection)+'" target="_blank" rel="noopener noreferrer">Browse more '+escapeHtml(level)+' designs at '+(hall===3?'BaseCoC':'ClashBuilder')+' ↗</a></p>':'')+
  (village==='builder'&&hall!==null&&hall<4?'<p class="smallmuted">Builder Base layouts are generally shared for later Builder Halls. Do not import a BH9 design into BH'+hall+'.</p>':'')+'</section>';
}
export function renderBaseLayouts(profile,overrides={}){
 const personal=profileHalls(profile),levels=browseHalls(profile,overrides);
 const selected={halls:levels,
  home:levels.home===null?[]:availableLayouts('home',levels.home),
  builder:levels.builder===null?[]:availableLayouts('builder',levels.builder)};
 return '<div class="layout-library"><section class="card"><span class="kicker">ONE-TAP BASE LAYOUTS</span><h2>Layouts for your selected account</h2>'+
  '<p>Recommended examples for different goals, not a proven single best base. Based on the Town Hall and Builder Hall in your latest imported game JSON; building levels, Hero Equipment and crafted defenses may differ.</p>'+
  '<p class="smallmuted">Tap Open in Clash of Clans on the device where you play, select a compatible layout slot and confirm in-game. '+
  'Back up an existing layout before replacing its slot. These links cannot move buildings or change your game automatically. No sign-in, purchases or planner balance changes.</p>'+
  '<p class="smallmuted">Account: <strong>'+escapeHtml(profile?.displayName||profile?.playerTag||'Unknown')+
  '</strong>. Choose another Hall below to browse without changing this account. Preview images load from the credited publisher while online.</p>'+
  '<p class="smallmuted">Layout imports are special game links. There is no verified public link to jump straight to an individual Barracks upgrade; inside Clash use Build → Building and Heroes to locate the upgrade. Nothing here upgrades or spends resources.</p></section>'+
  section('Home Village','🏰',selected.halls.home,selected.home,'home',personal.home)+
  section('Builder Base','🔨',selected.halls.builder,selected.builder,'builder',personal.builder)+'</div>';
}
