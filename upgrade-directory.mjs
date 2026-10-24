// Full, read-only owner inventory and next-level pricing. All numbers are
// from MIT licensed reference records or the player's verified manual quotes.
// Nothing here changes the saved village, starts work or spends currency.
import {EXTENDED_REFERENCE_CATALOG,EXTENDED_REFERENCE_META} from './extended-reference.mjs';
import {REFERENCE_CATALOG} from './upgrade-reference.mjs';
import {labelFor} from './catalog.mjs';
import {artworkUrl} from './artwork.mjs';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number(n).toLocaleString('en-US');
const groups=[
 ['buildings','Home buildings'],['traps','Home traps'],['heroes','Home Heroes'],
 ['units','Home troops'],['spells','Spells'],['siege_machines','Siege machines'],
 ['pets','Pets'],['equipment','Hero Equipment'],
 ['buildings2','Builder buildings'],['traps2','Builder traps'],['heroes2','Builder Heroes'],
 ['units2','Builder troops']
];
const currencies={gold:'Gold',elixir:'Elixir',dark:'Dark Elixir',builderGold:'Builder Gold',
 builderElixir:'Builder Elixir',shiny:'Shiny Ore',glowy:'Glowy Ore',starry:'Starry Ore'};
const requirementDefs=[
 ['th','Town Hall','buildings',1000001],['bh','Builder Hall','buildings2',1000034],
 ['lab','Laboratory','buildings',1000007],['sl','Star Laboratory','buildings2',1000046],
 ['hh','Hero Hall','buildings',1000071],['ph','Pet House','buildings',1000068],
 ['bs','Blacksmith','buildings',1000070]
];
const rowList=(x,k)=>Array.isArray(x?.[k])?x[k]:[];
const levelOf=(x,g,id)=>rowList(x,g).find(v=>v.data===id)?.lvl??null;
const finite=n=>Number.isFinite(n)&&n>=0;
const boostFor=(profile,group)=>{
 const prefs=profile.upgradePreferences||{};
 const normal=['units','spells','siege_machines','pets','units2'].includes(group)?
  prefs.researchBoost:prefs.builderBoost;
 const exp=profile.boostEnd?new Date(profile.boostEnd).getTime():null;
 const returning=prefs.returningBoost===50&&(!Number.isFinite(exp)||exp>Date.now())?50:null;
 if(returning!==null)return Math.max(returning,Number(normal)||0);
 return finite(Number(normal))&&normal!==''&&normal!==null&&normal!==undefined?
   Math.min(100,Number(normal)):null;
};
const timeString=s=>{
 if(!finite(s))return 'Unknown time';
 if(s===0)return 'Instant';
 const days=Math.floor(s/86400),hours=Math.floor((s%86400)/3600),mins=Math.round((s%3600)/60);
 return [days?days+'d':'',hours?hours+'h':'',mins?mins+'m':''].filter(Boolean).join(' ')||'<1m';
};
const firstLicense={source:'MIT',url:'https://github.com/chiefpansancolt/clash-of-clans-data'};
export const fullReferenceFor=(group,id)=>EXTENDED_REFERENCE_CATALOG[group+':'+id]||REFERENCE_CATALOG[group+':'+id]||null;
export function inventoryUpgradeRows(profile){
 const x=profile?.export;
 if(!x)return [];
 const result=[];
 for(const [group,groupLabel] of groups){
  for(const row of rowList(x,group)){
   if(!Number.isInteger(row?.data)||!Number.isInteger(row.lvl))continue;
   const ref=fullReferenceFor(group,row.data);
   const level=row.lvl,working=finite(row.timer);
   const target=level+1;
   const entry=ref?.levels.find(v=>v.l===target)||null;
   const blocked=entry?requirementDefs.filter(([key,n,g,id])=>
     finite(entry[key])&&entry[key]>0&&
     (levelOf(x,g,id)===null||levelOf(x,g,id)<entry[key]))
    .map(([key,name,g,id])=>name+' '+entry[key]+' required'): [];
   const manual=profile.upgradeQuotes?.[group+':'+row.data+':'+target];
   const originalPrice=finite(manual?.price)&&manual.price>0?manual.price:entry?.c??null;
   const rawCurrency=finite(manual?.price)&&manual.price>0?manual.currency:entry?.r;
   const beforeBoost=finite(manual?.price)&&manual.price>0?manual.beforeBoost===true:!!entry;
   const boost=group==='equipment'?null:boostFor(profile,group);
   const factor=beforeBoost&&finite(boost)?(100-boost)/100:1;
   const cost=finite(originalPrice)?Math.ceil(originalPrice*factor):null;
   const seconds=finite(manual?.hours)?manual.hours*3600:
      finite(entry?.s)?entry.s:null;
   const actualSeconds=finite(seconds)?seconds*factor:null;
   const ore=entry?.ore?.some(v=>v>0)?entry.ore:null;
   const oreKeys=['shiny','glowy','starry'];
   const knownCost=ore?ore.some(v=>v>0):finite(cost)&&cost>0&&!!rawCurrency;
   const knownBalance=ore?oreKeys.every(key=>finite(profile.resources?.[key])):
     !!rawCurrency&&finite(profile.resources?.[rawCurrency]);
   const affordability=!knownCost||!knownBalance?null:ore?
     ore.every((n,i)=>profile.resources[oreKeys[i]]>=n):
     profile.resources[rawCurrency]>=cost;
   const requiredResources=ore?Object.fromEntries(oreKeys.map((k,i)=>[k,ore[i]||0])):
     knownCost?{[rawCurrency]:cost}:{};
   const resourceShortage=!knownCost||!knownBalance?null:Object.fromEntries(
     Object.entries(requiredResources).filter(([key,amount])=>amount>profile.resources[key])
      .map(([key,amount])=>[key,amount-profile.resources[key]]));
   const status=working?'working':!ref?'unknown':!entry?'catalog-max':
    blocked.length?'locked':'ready';
   const name=labelFor(row.data);
   const priceText=ore?['Shiny','Glowy','Starry'].map((n,i)=>ore[i]>0?n+' '+fmt(ore[i]):null)
        .filter(Boolean).join(' · '):
     finite(cost)&&cost>0?fmt(cost)+' '+(currencies[rawCurrency]||rawCurrency||'resource'):
     'Cost unknown';
   const photo=artworkUrl(group,name,level);
   result.push({key:group+':'+row.data+':'+level,name,group,groupLabel,id:row.data,
    level,target,count:row.cnt||1,status,blocked,working,photo,
    totalSeconds:actualSeconds,estimatedFinish:working&&finite(x.timestamp)?
       (x.timestamp+row.timer)*1000:null,
    priceText,affordability,knownCost,knownBalance,requiredResources,
    resourceShortage,currency:rawCurrency,cost,oreCosts:ore,
    boosted:factor!==1,source:manual?.price>0?'game quote':entry?'MIT reference':'unavailable',
    supercharges:ref?.superchargeLevels?.length||0});
  }
 }
 const order={'ready':0,'working':1,'locked':2,'unknown':3,'catalog-max':4};
 return result.sort((a,b)=>order[a.status]-order[b.status]||
  a.groupLabel.localeCompare(b.groupLabel)||a.name.localeCompare(b.name)||a.level-b.level);
}
function summary(rows){
 const statuses=['ready','working','locked','unknown','catalog-max'];
 return statuses.map(id=>({key:id,value:rows.filter(x=>x.status===id).length}));
}
const thumb=row=>row.photo?'<img class="ul-icon" src="'+esc(row.photo)+'" loading="lazy" decoding="async" alt="">':
 '<span class="ul-icon ul-unknown" aria-hidden="true">◇</span>';
const stateText=row=>({
 ready:'Reference eligible — confirm in game',
 working:'In progress at last JSON export',
 locked:row.blocked.join(' · '),
 unknown:'No licensed data for this ID',
 'catalog-max':'No higher standard level in the current catalog'
})[row.status];
const priceLabel=row=>row.status==='catalog-max'?'Highest listed standard level':
 row.status==='unknown'?'Price/time not available':row.priceText+
  ' · '+timeString(row.totalSeconds);
export function renderUpgradeDirectory(profile){
 if(!profile?.export)return '<section class="card"><h2>Upgrade database</h2>Import village JSON to view your owned upgrades.</section>';
 const rows=inventoryUpgradeRows(profile),totals=summary(rows);
 const label=key=>({'ready':'Ready to consider','working':'Upgrading in JSON','locked':'Locked by requirement',
  'unknown':'Reference missing','catalog-max':'At catalog maximum'})[key];
 const filters='<div class="ul-filters"><label>Find an upgrade <input type="search" data-upgrade-search placeholder="Cannon, Freeze Spell, Unicorn..." aria-label="Search upgrades"></label>'+
  '<label>Type <select data-upgrade-group><option value="">All types</option>'+
  groups.map(([id,name])=>'<option value="'+id+'">'+esc(name)+'</option>').join('')+'</select></label>'+
  '<label>Availability <select data-upgrade-status><option value="">All statuses</option>'+
  totals.map(t=>'<option value="'+t.key+'">'+label(t.key)+' ('+t.value+')</option>').join('')+
  '</select></label></div>';
 const cards=rows.map(row=>
  '<button class="ul-upgrade" data-command-structure="'+row.group+':'+row.id+'" '+
   'data-ul-group="'+row.group+'" data-ul-status="'+row.status+'" '+
   'data-ul-search="'+esc((row.name+' '+row.groupLabel).toLowerCase())+'">'+
   thumb(row)+'<span class="ul-description"><strong>'+esc(row.name)+
    (row.count>1?' ×'+row.count:'')+'</strong>'+
    '<small>Level '+row.level+
    (row.status==='catalog-max'||row.status==='unknown'?'':' → '+row.target)+'</small>'+
    '<small class="ul-status">'+esc(stateText(row))+'</small></span>'+
    '<span class="ul-price">'+esc(priceLabel(row))+
    (row.boosted?'<small>Confirmed discount applied once</small>':'')+
    (row.affordability===false?'<small>Saved balance may be insufficient</small>':'')+
    '</span><span aria-hidden="true">›</span></button>').join('');
 return '<section class="card upgrade-library">'+
  '<span class="kicker">OWNED STRUCTURES, TROOPS &amp; EQUIPMENT</span>'+
  '<h2>Complete upgrade database</h2>'+
  '<p class="smallmuted">Reference entries: '+EXTENDED_REFERENCE_META.entryCount+
  ' game types · This village: '+rows.length+
  ' tracked level groups. Tap any item for details and a quote.</p>'+
  '<div class="ul-summary">'+totals.map(t=>'<span><b>'+t.value+'</b> '+label(t.key)+'</span>').join('')+'</div>'+
  filters+'<p class="smallmuted">Costs and time are reference estimates, not live prices. '+
  'Only user-confirmed discounts are applied. "Ready" means known requirements match the export, not that an actual builder is free. '+
  'Upgrading items keep their status until a newer JSON is imported.</p>'+
  '<div class="ul-cards">'+cards+'</div>'+
  '<p class="ul-empty" hidden>No upgrades match your search.</p>'+
  '<p class="smallmuted">Source: <a href="'+firstLicense.url+
  '" rel="noopener noreferrer" target="_blank">MIT-licensed game data</a>. '+
  'Separate temporary Supercharge tiers are not automatically treated as ordinary building levels. '+
  'Always confirm inside Clash of Clans.</p></section>';
}
export function filterUpgradeDirectory(panel){
 if(!panel)return 0;
 const search=panel.querySelector('[data-upgrade-search]')?.value?.trim().toLowerCase()||'';
 const group=panel.querySelector('[data-upgrade-group]')?.value||'';
 const status=panel.querySelector('[data-upgrade-status]')?.value||'';
 let visible=0;
 for(const row of panel.querySelectorAll('[data-ul-search]')){
  const show=(!search||row.dataset.ulSearch.includes(search))&&
    (!group||row.dataset.ulGroup===group)&&(!status||row.dataset.ulStatus===status);
  row.hidden=!show;
  if(show)visible++;
 }
 const empty=panel.querySelector('.ul-empty');
 if(empty)empty.hidden=visible>0;
 return visible;
}
