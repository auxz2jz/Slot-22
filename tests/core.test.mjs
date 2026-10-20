import test from 'node:test';
import assert from 'node:assert/strict';
import {seedState,validateExport,importVillage,importIntoBundle,rowsFromExport,ongoingFromExport,setTaskStatus,budget,validateState,integer} from '../core.mjs';
import {readFileSync} from 'node:fs';

const snapshot={tag:'#QVLP9RVV',timestamp:1000000,buildings:[{data:1000000,lvl:10,cnt:3},{data:1000068,lvl:3,timer:3600}],buildings2:[{data:1000044,lvl:7,timer:60}],heroes:[{data:28000001,lvl:47,timer:200}]};
test('game import preserves currency and Magic Items',()=>{
 const before=seedState();before.resources.elixir=1234567;before.items['Book of Building']=2;
 const after=importVillage(before,snapshot);
 assert.equal(after.resources.elixir,1234567);
 assert.equal(after.items['Book of Building'],2);
 assert.equal(after.export.tag,'#QVLP9RVV');
 assert.equal(before.export,null);
});
test('rejects unrelated accounts or malformed exports',()=>{
 assert.throws(()=>validateExport({tag:'nope',buildings:[],buildings2:[]}));
 assert.throws(()=>validateExport({tag:'#QVLP9RVV',buildings:[],buildings2:[{data:12,lvl:'x'}]}));
 assert.throws(()=>importVillage(seedState(),{...snapshot,tag:'#OTHER'}),/mismatch/);
});
test('correctly counts buildings and keeps timer snapshots',()=>{
 const rows=rowsFromExport(snapshot,'buildings');
 assert.equal(rows.find(x=>x.id===1000000).count,3);
 const t=ongoingFromExport(snapshot);
 assert.equal(t.length,3);
 assert.equal(t.find(x=>x.id===1000068).finishesAt,1003600000);
});
test('roadmap state changes are immutable and budget keeps Loot Cart separate',()=>{
 const a=seedState(),b=setTaskStatus(a,'H-06','active');
 assert.equal(a.roadmap.find(x=>x.id==='H-06').status,'planned');
 assert.equal(b.roadmap.find(x=>x.id==='H-06').status,'active');
 const sums=budget(a);
 assert.equal(sums.homeGold,a.resources.gold+a.resources.cartGold);
});
test('validation rejects backups with incompatible schema',()=>{
 assert.doesNotThrow(()=>validateState(seedState()));
 assert.throws(()=>validateState({schemaVersion:999,resources:{},items:{},roadmap:[]}));
});
test('numbers normalize nonnegative inputs',()=>{
 assert.equal(integer('12,345'),12345);
 assert.equal(integer('-7'),0);
 assert.equal(integer('no number',42),42);
});

test('fresh JSON import preserves progress anchor for the same active upgrade',()=>{
 const first=importVillage(seedState(),snapshot,'2026-10-19T01:00:00Z');
 assert.equal(first.upgradeTracking.length,3);
 const old=first.upgradeTracking.find(t=>t.category==='buildings'&&t.id===1000068);
 assert.equal(old.firstSeenAt,1000000000);
 const newer={...snapshot,timestamp:1000900,buildings:[{data:1000000,lvl:10,cnt:3},{data:1000068,lvl:3,timer:2700}]};
 const after=importVillage(first,newer,'2026-10-19T01:15:00Z');
 const ongoing=after.upgradeTracking.find(t=>t.category==='buildings'&&t.id===1000068);
 assert.equal(ongoing.firstSeenAt,old.firstSeenAt);
 assert.equal(ongoing.endAt,old.endAt);
 assert.equal(after.resources.gold,first.resources.gold);
 assert.deepEqual(after.items,first.items);
 assert.deepEqual(after.roadmap,first.roadmap);
});

test('new upgrade starts a new anchor and duplicate entities are tracked individually',()=>{
 const old={tag:'#QVLP9RVV',timestamp:1000,buildings:[{data:1000000,lvl:10,timer:3600},{data:1000000,lvl:10,timer:7200}],buildings2:[]};
 const before=importVillage(seedState(),old);
 const fresh={...old,timestamp:1900,buildings:[{data:1000000,lvl:10,timer:6300},{data:1000000,lvl:10,timer:2700}]};
 const after=importVillage(before,fresh);
 assert.deepEqual(after.upgradeTracking.map(t=>t.firstSeenAt),[1000000,1000000]);
 const completed={...old,timestamp:11000,buildings:[{data:1000000,lvl:10,timer:3600}]};
 const replacement=importVillage(after,completed);
 assert.equal(replacement.upgradeTracking.length,1);
 assert.equal(replacement.upgradeTracking[0].firstSeenAt,11000000);
});

test('a refreshed game snapshot changes expected finish without resetting a continuing upgrade',()=>{
 const initial={tag:'#QVLP9RVV',timestamp:1000,buildings:[{data:1000068,lvl:3,timer:7200}],buildings2:[]};
 const first=importVillage(seedState(),initial);
 const shifted={...initial,timestamp:1600,buildings:[{data:1000068,lvl:3,timer:9000}]};
 const later=importVillage(first,shifted);
 assert.equal(later.export.timestamp,1600);
 assert.equal(later.upgradeTracking[0].firstSeenAt,1000000);
 assert.equal(later.upgradeTracking[0].endAt,10600000);
 assert.deepEqual(later.resources,first.resources);
 assert.deepEqual(later.items,first.items);
 assert.deepEqual(later.roadmap,first.roadmap);
});

test('old or dateless game JSON cannot replace newer countdown and user data',()=>{
 const newest={tag:'#QVLP9RVV',timestamp:2200,buildings:[{data:1000068,lvl:3,timer:7200}],buildings2:[]};
 const saved=importVillage(seedState(),newest);
 const previous={...newest,timestamp:2100,buildings:[{data:1000068,lvl:3,timer:7300}]};
 assert.throws(()=>importVillage(saved,previous),/older than the saved snapshot/);
 const missing={...newest};delete missing.timestamp;
 assert.throws(()=>importVillage(saved,missing),/older than the saved snapshot/);
 assert.equal(saved.export.timestamp,2200);
 assert.equal(saved.upgradeTracking[0].endAt,9400000);
});

test('reimporting an identical snapshot does not reset an existing first-seen anchor',()=>{
 const first={tag:'#QVLP9RVV',timestamp:1000,buildings:[{data:1000068,lvl:3,timer:7200}],buildings2:[]};
 const second={...first,timestamp:1300,buildings:[{data:1000068,lvl:3,timer:6900}]};
 const older=importVillage(seedState(),first);
 const current=importVillage(older,second);
 const repeated=importVillage(current,second);
 assert.deepEqual(current.upgradeTracking,repeated.upgradeTracking);
});

test('fresh October 19 game export supports level-less Crafted Defense types/modules, preserving them intact',()=>{
  const modules={
    data:1000097,
    types:[
      {data:103000011,modules:[{data:102000033,lvl:1},{data:102000034,lvl:1},{data:102000035,lvl:1}]},
      {data:103000012,modules:[{data:102000036,lvl:1},{data:102000037,lvl:1},{data:102000038,lvl:1}]},
      {data:103000013,modules:[{data:102000039,lvl:1},{data:102000040,lvl:1},{data:102000041,lvl:1}]}
    ]
  };
  const latest={
    ...snapshot, timestamp:1792477573,
    buildings:[{data:1000001,lvl:14},modules,{data:1000015,lvl:2,cnt:5},{data:1000068,lvl:4}],
    heroes:[{data:28000002,lvl:28,timer:51361}],
    pets:[{data:73000003,lvl:1},{data:73000002,lvl:3,timer:72544}],
    spells:[{data:26000005,lvl:4,timer:18043,helper_recurrent:true}],
    helpers:[{data:93000000,lvl:7,helper_cooldown:7005},{data:93000001,lvl:8,helper_cooldown:7005}]
  };
  const validated=validateExport(latest);
  assert.equal(validated.buildings[1],modules);
  const saved=JSON.parse(readFileSync(new URL('../data/player-state.json',import.meta.url),'utf8'));
  const before=structuredClone(saved);
  const next=importIntoBundle(saved,latest,'2026-10-19T23:27:00-07:00');
  assert.equal(next.profiles['#QVLP9RVV'].export.timestamp,1792477573);
  assert.deepEqual(next.profiles['#QVLP9RVV'].export.buildings[1],modules);
  assert.equal(next.profiles['#QVLP9RVV'].export.pets.find(x=>x.data===73000003).lvl,1);
  assert.equal(next.profiles['#QVLP9RVV'].export.buildings.find(x=>x.data===1000068).lvl,4);
  assert.equal(next.profiles['#QVLP9RVV'].export.heroes[0].timer,51361);
  assert.deepEqual(next.profiles['#QVLP9RVV'].resources,before.profiles['#QVLP9RVV'].resources);
  assert.deepEqual(next.profiles['#QVLP9RVV'].items,before.profiles['#QVLP9RVV'].items);
  assert.deepEqual(next.profiles['#QVLP9RVV'].roadmap,before.profiles['#QVLP9RVV'].roadmap);
  assert.deepEqual(next.profiles['#GVPCRLJQ8'],before.profiles['#GVPCRLJQ8']);
  assert.deepEqual(saved,before,'test does not mutate original stored bundle');
  assert.equal(rowsFromExport(latest,'buildings').some(r=>r.id===1000097),false);
  assert.equal(ongoingFromExport(latest).some(r=>r.id===1000097),false);
});
test('only known level-less modular Crafted Defense is allowed; ordinary malformed buildings are rejected',()=>{
  const base={...snapshot,buildings2:[]};
  assert.throws(()=>validateExport({...base,buildings:[{data:1000008,types:[]}]}),/Invalid entity/);
  assert.throws(()=>validateExport({...base,buildings:[{data:1000097}]}),/crafted defense/);
  assert.throws(()=>validateExport({...base,buildings:[{data:1000097,types:[{data:103000011,modules:[{data:102000033,lvl:'wrong'}]}]}]}),/crafted defense/);
  assert.throws(()=>validateExport({...base,buildings2:[{data:1000097,types:[{data:103000011,modules:[]}]}]}),/Invalid entity/);
});
