import test from 'node:test';
import assert from 'node:assert/strict';
import {seedState,validateExport,importVillage,rowsFromExport,ongoingFromExport,setTaskStatus,budget,validateState,integer} from '../core.mjs';

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
