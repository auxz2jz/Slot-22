import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {EXTENDED_REFERENCE_CATALOG,EXTENDED_REFERENCE_META} from '../extended-reference.mjs';
import {fullReferenceFor,inventoryUpgradeRows,renderUpgradeDirectory} from '../upgrade-directory.mjs';
import {renderStrategyGuides,strategyNotes,GUIDE_LINKS} from '../strategy-guides.mjs';
const state=JSON.parse(readFileSync(new URL('../data/player-state.json',import.meta.url),'utf8'));
const p=()=>structuredClone(state.profiles['#QVLP9RVV']);

test('licensed catalog covers nearly all owned upgrade types without guessing unknown equipment',()=>{
 assert.ok(EXTENDED_REFERENCE_META.entryCount>=200);
 const profile=p(),groups=['buildings','buildings2','traps','traps2','heroes','heroes2','units','units2','spells','siege_machines','pets','equipment'];
 const seen=new Set(groups.flatMap(g=>(profile.export[g]||[]).map(v=>g+':'+v.data)));
 const supported=[...seen].filter(k=>!!EXTENDED_REFERENCE_CATALOG[k]);
 assert.equal(seen.size,175);
 assert.ok(supported.length>=174);
 assert.equal(fullReferenceFor('equipment',90000061),null);
 assert.ok(fullReferenceFor('units',4000000).levels.length>5);
 assert.ok(fullReferenceFor('traps',12000000)?.levels);
 assert.ok(fullReferenceFor('buildings2',1000046)?.levels);
});
test('directory shows owned current levels, statuses, costs, locks and pictures read-only',()=>{
 const profile=p(),before=JSON.stringify(profile);
 const rows=inventoryUpgradeRows(profile),html=renderUpgradeDirectory(profile);
 assert.ok(rows.length>=175);
 assert.ok(rows.some(r=>r.name==='Freeze Spell'&&r.status==='working'));
 assert.ok(rows.some(r=>r.name==='Cannon'&&r.photo?.includes('cannon')));
 assert.ok(rows.some(r=>r.status==='locked'&&r.blocked.length>0));
 assert.match(html,/data-upgrade-search/);
 assert.match(html,/data-upgrade-group/);
 assert.match(html,/data-upgrade-status/);
 assert.match(html,/MIT-licensed game data/);
 assert.match(html,/No licensed data for this ID/);
 assert.equal(JSON.stringify(profile),before);
});
test('discount applies once to reference base cost, but equipment remains ore-based',()=>{
 const profile=p();
 profile.upgradePreferences={builderBoost:20,researchBoost:15,returningBoost:50};
 profile.boostEnd=null;
 const data=inventoryUpgradeRows(profile);
 const item=data.find(r=>r.group==='buildings'&&r.name==='Laboratory');
 const standard=fullReferenceFor('buildings',1000007)?.levels?.find(x=>x.l===item.target);
 assert.ok(standard.c>0);
 assert.ok(item.priceText.startsWith(Math.ceil(standard.c*.5).toLocaleString('en-US')));
 const equipment=data.find(r=>r.group==='equipment'&&r.id===90000004);
 assert.ok(equipment.priceText.includes('Shiny'));
 assert.equal(equipment.boosted,false);
});
test('guide library links external originals and selects useful TH14/BH9 reading',()=>{
 const profile=p(),notes=strategyNotes(profile),html=renderStrategyGuides(profile);
 assert.ok(GUIDE_LINKS.length>=12);
 assert.ok(GUIDE_LINKS.every(g=>g.url.startsWith('https://www.clash.ninja/')||g.url.startsWith('https://support.supercell.com/')));
 assert.ok(notes.some(t=>t.label.includes('B.O.B')));
 assert.ok(notes.some(t=>t.label.includes('ore')));
 assert.match(html,/Read original guide/);
 assert.match(html,/no copied articles or images/);
 assert.match(html,/clash.ninja\/guides\/what-is-hero-equipment/);
});
