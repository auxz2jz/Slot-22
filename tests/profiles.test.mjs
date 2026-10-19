import test from 'node:test';
import assert from 'node:assert/strict';
import {seedState,emptyProfile,normalizeBundle,importIntoBundle,selectProfile,validateExport} from '../core.mjs';
const main='#QVLP9RVV',alt='#ALTERNATE1';
const snapshot=tag=>({tag,timestamp:1792373123,buildings:[{data:1000001,lvl:12}],buildings2:[{data:1000034,lvl:8}],heroes:[]});

test('migrates old single account without losing items, amounts, roadmap or export',()=>{
 const original=seedState();
 original.resources.gold=23456789;
 original.items['Book of Heroes']=3;
 original.roadmap[0].status='done';
 original.export=snapshot(main);
 const bundle=normalizeBundle(original);
 assert.equal(bundle.schemaVersion,2);
 assert.equal(bundle.activeProfileId,main);
 assert.equal(bundle.profiles[main].resources.gold,23456789);
 assert.equal(bundle.profiles[main].items['Book of Heroes'],3);
 assert.equal(bundle.profiles[main].roadmap[0].status,'done');
 assert.equal(bundle.profiles[main].export.tag,main);
});
test('second player starts with independent empty inventory rather than copying items',()=>{
 const original=seedState();
 original.items['Book of Heroes']=1;
 original.resources.gold=19000000;
 const start=normalizeBundle(original);
 const after=importIntoBundle(start,snapshot(alt));
 assert.deepEqual(Object.keys(after.profiles).sort(),[alt,main].sort());
 assert.equal(after.activeProfileId,alt);
 assert.equal(after.profiles[alt].resources.gold,0);
 assert.equal(after.profiles[alt].items['Book of Heroes'],undefined);
 assert.equal(after.profiles[alt].roadmap.length,0);
 assert.equal(after.profiles[main].resources.gold,19000000);
 assert.equal(after.profiles[main].items['Book of Heroes'],1);
 assert.equal(start.activeProfileId,main);
});
test('re-importing existing player does not modify any account balances or roadmaps',()=>{
 let b=importIntoBundle(normalizeBundle(seedState()),snapshot(alt));
 b.profiles[alt].resources.elixir=5678;
 b.profiles[alt].items['Builder Potion']=9;
 b.profiles[alt].roadmap.push({id:'X',title:'Builder Hall',status:'planned'});
 b=importIntoBundle(b,{...snapshot(main),timestamp:1792373999});
 assert.equal(b.profiles[alt].resources.elixir,5678);
 assert.equal(b.profiles[alt].items['Builder Potion'],9);
 assert.equal(b.profiles[alt].roadmap.length,1);
 assert.equal(b.profiles[main].resources.elixir,12608735);
 assert.equal(b.profiles[main].importedAt!==null,true);
});
test('switching profiles and exporting the bundle roundtrip retains all accounts',()=>{
 let b=importIntoBundle(normalizeBundle(seedState()),snapshot(alt));
 b=selectProfile(b,main);
 b.profiles[main].displayName='Main Village';
 const restored=normalizeBundle(JSON.stringify(b));
 assert.equal(restored.activeProfileId,main);
 assert.equal(restored.profiles[alt].playerTag,alt);
 assert.equal(restored.profiles[main].displayName,'Main Village');
 assert.throws(()=>selectProfile(restored,'#NOTPRESENT'));
});
test('rejects corrupted cross-account import without changing stored profiles',()=>{
 const b=importIntoBundle(normalizeBundle(seedState()),snapshot(alt));
 const bad=structuredClone(b);bad.profiles[alt].export.tag=main;
 assert.throws(()=>normalizeBundle(bad),/another player/);
 assert.throws(()=>importIntoBundle(b,{tag:'bad',buildings:[],buildings2:[]}),/Not a Clash/);
});
