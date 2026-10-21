import test from 'node:test';
import assert from 'node:assert/strict';
import {LAYOUT_CATALOG,validateLayoutLink,profileHalls,layoutsForProfile,chosenLayout,directoryLink,renderBaseLayouts,availableLayouts,browseHalls,HALL_MAX} from '../base-layouts.mjs';

const a={playerTag:'#MAIN1',displayName:'Main',export:{buildings:[{data:1000001,lvl:14}],buildings2:[{data:1000034,lvl:9}]}};
const b={playerTag:'#SECOND1',export:{buildings:[{data:1000001,lvl:4}],buildings2:[{data:1000034,lvl:1}]}};

test('only verified official layout links in selected Hall and village categories',()=>{
 assert.equal(LAYOUT_CATALOG.length,31);
 for(const entry of LAYOUT_CATALOG){
  assert.ok(validateLayoutLink(entry.url,entry.village,entry.hall),entry.id);
  assert.ok(!validateLayoutLink(entry.url,entry.village,entry.hall+1));
  assert.equal(entry.source.startsWith('https://'),true);
  assert.ok(!/token|access_key/i.test(entry.url));
 }
 assert.ok(!validateLayoutLink('https://evil.example/en?action=OpenLayout&id=TH14:HV:ABC','home',14));
 assert.ok(!validateLayoutLink('javascript:alert(1)'));
 assert.ok(!validateLayoutLink('https://link.clashofclans.com/en?action=Another&id=TH14:HV:'+LAYOUT_CATALOG[0].token));
 assert.ok(!validateLayoutLink(LAYOUT_CATALOG[0].url,'builder',14));
});
test('match latest imported per-account Hall levels and correct Builder Base BB2 link type',()=>{
 assert.deepEqual(profileHalls(a),{home:14,builder:9});
 assert.deepEqual(profileHalls(b),{home:4,builder:1});
 assert.deepEqual(profileHalls({}),{home:null,builder:null});
 const x=layoutsForProfile(a);
 assert.deepEqual(x.home.map(e=>e.id),['th14-hybrid','th14-farming','th14-trophy','th14-war','th14-gallery']);
 assert.equal(x.builder.length,3);
 assert.ok(x.builder.every(e=>new URL(e.url).searchParams.get('id').startsWith('TH9:BB2:')));
 const y=layoutsForProfile(b);
 assert.equal(y.home.length,4);
 assert.equal(y.builder.length,0);
 assert.equal(chosenLayout(a,'th4-hybrid'),null);
 assert.equal(chosenLayout(b,'th14-hybrid'),null);
 assert.equal(chosenLayout(a,'bh9-trophy')?.hall,9);
});
test('unrecognized hall does not show wrong-level layout, but can browse verified catalog URL',()=>{
 assert.equal(directoryLink('home',6),'https://clashbuilder.com/town-hall-bases/th6');
 assert.equal(directoryLink('builder',9),'https://clashbuilder.com/builder-hall-bases/bh9');
 assert.equal(directoryLink('builder',1),null);
 assert.equal(directoryLink('home',1),null);
 const profile={playerTag:'#UNKNOWN',export:{buildings:[{data:1000001,lvl:3}],buildings2:[]}};
 const html=renderBaseLayouts(profile);
 assert.match(html,/No individually checked one-tap layouts/);
 assert.ok(!html.includes('Open in Clash of Clans ↗'));
 assert.match(html,/basecoc\.com/);
});
test('layout page is read-only, includes visible slot warnings, and encodes profile labels',()=>{
 const before=JSON.stringify(a),html=renderBaseLayouts(a);
 assert.equal(JSON.stringify(a),before);
 assert.equal((html.match(/data-layout-copy/g)||[]).length,8);
 assert.ok(html.includes('War slot'));
 assert.ok(html.includes('Builder Base'));
 assert.ok(html.includes('Open in Clash of Clans'));
 assert.ok(html.includes('layout source')||html.includes('Layout source'));
 const malicious={...a,displayName:'<img src=x onerror=alert(1)>'};
 const other=renderBaseLayouts(malicious);
 assert.ok(!other.includes('<img src=x onerror='));
 assert.match(other,/&lt;img/);
});

test('browse every Town Hall and Builder Hall without mutating selected account',()=>{
 const before=JSON.stringify(a),max=HALL_MAX;
 assert.deepEqual(max,{home:18,builder:10});
 for(let level=1;level<=18;level++){
  const items=availableLayouts('home',level);
  if(level>=4)assert.ok(items.some(x=>x.image),'TH'+level);
  else assert.equal(items.length,0);
  assert.ok(items.every(x=>x.hall===level&&validateLayoutLink(x.url,'home',level)));
 }
 for(let level=1;level<=10;level++){
  const items=availableLayouts('builder',level);
  if(level>=4)assert.ok(items.some(x=>x.image),'BH'+level);
  else assert.equal(items.length,0);
  assert.ok(items.every(x=>x.hall===level&&validateLayoutLink(x.url,'builder',level)));
 }
 const halls=browseHalls(a,{home:18,builder:10});
 assert.deepEqual(halls,{home:18,builder:10});
 assert.ok(renderBaseLayouts(a,{home:18,builder:10}).includes('TH18 layouts'));
 assert.ok(chosenLayout(a,'th18-gallery',{home:18,builder:10}));
 assert.equal(chosenLayout(a,'th18-gallery'),null);
 assert.equal(chosenLayout(a,'th14-hybrid',{home:18}),null);
 assert.equal(JSON.stringify(a),before);
});
test('each embedded publisher thumbnail is bound only to its own share token',()=>{
 const withPreview=LAYOUT_CATALOG.filter(x=>x.image);
 assert.equal(withPreview.length,22);
 for(const x of withPreview){
  assert.ok(x.image.startsWith('https://clashbuilder.com/storage/'),x.id);
  assert.ok(x.source.startsWith('https://clashbuilder.com/'),x.id);
  assert.equal(x.token.length,32);
 }
 assert.equal(new Set(LAYOUT_CATALOG.map(x=>x.url)).size,LAYOUT_CATALOG.length);
 const html=renderBaseLayouts(a);
 assert.match(html,/class="layout-preview"/);
 assert.match(html,/data-layout-hall="home"/);
 assert.match(html,/data-layout-hall="builder"/);
});
test('intro-level Halls show guidance instead of fake deep links',()=>{
 const p={export:{buildings:[{data:1000001,lvl:2}],buildings2:[{data:1000034,lvl:1}]}};
 const h=renderBaseLayouts(p);
 assert.match(h,/Beginner TH2/);
 assert.match(h,/Beginner BH1/);
 assert.ok(!h.includes('Open in Clash of Clans ↗'));
});
