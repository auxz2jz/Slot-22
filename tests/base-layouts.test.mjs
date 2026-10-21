import test from 'node:test';
import assert from 'node:assert/strict';
import {LAYOUT_CATALOG,validateLayoutLink,profileHalls,layoutsForProfile,chosenLayout,directoryLink,renderBaseLayouts} from '../base-layouts.mjs';

const a={playerTag:'#MAIN1',displayName:'Main',export:{buildings:[{data:1000001,lvl:14}],buildings2:[{data:1000034,lvl:9}]}};
const b={playerTag:'#SECOND1',export:{buildings:[{data:1000001,lvl:4}],buildings2:[{data:1000034,lvl:1}]}};

test('only verified official layout links in selected Hall and village categories',()=>{
 assert.equal(LAYOUT_CATALOG.length,10);
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
 assert.deepEqual(x.home.map(e=>e.id),['th14-hybrid','th14-farming','th14-trophy','th14-war']);
 assert.equal(x.builder.length,3);
 assert.ok(x.builder.every(e=>new URL(e.url).searchParams.get('id').startsWith('TH9:BB2:')));
 const y=layoutsForProfile(b);
 assert.equal(y.home.length,3);
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
 const profile={playerTag:'#UNKNOWN',export:{buildings:[{data:1000001,lvl:6}],buildings2:[]}};
 const html=renderBaseLayouts(profile);
 assert.match(html,/No individually checked one-tap layouts/);
 assert.ok(!html.includes('Open in Clash of Clans ↗'));
 assert.match(html,/th6/);
});
test('layout page is read-only, includes visible slot warnings, and encodes profile labels',()=>{
 const before=JSON.stringify(a),html=renderBaseLayouts(a);
 assert.equal(JSON.stringify(a),before);
 assert.equal((html.match(/data-layout-copy/g)||[]).length,7);
 assert.ok(html.includes('War slot'));
 assert.ok(html.includes('Builder Base'));
 assert.ok(html.includes('Open in Clash of Clans'));
 assert.ok(html.includes('layout source')||html.includes('Layout source'));
 const malicious={...a,displayName:'<img src=x onerror=alert(1)>'};
 const other=renderBaseLayouts(malicious);
 assert.ok(!other.includes('<img src=x onerror='));
 assert.match(other,/&lt;img/);
});
