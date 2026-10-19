import test from 'node:test';
import assert from 'node:assert/strict';
import {villageProgress,levelGroups,compareSnapshots,inferActionHints} from '../snapshot-intelligence.mjs';
import {importVillage,seedState} from '../core.mjs';
const original={tag:'#QVLP9RVV',timestamp:10000,buildings:[{data:1000001,lvl:14},{data:1000010,lvl:10,cnt:144},{data:1000010,lvl:11,cnt:175},{data:1000010,lvl:12,cnt:6},{data:1000000,lvl:10,cnt:4}],buildings2:[{data:1000034,lvl:9},{data:1000033,lvl:3,cnt:148},{data:1000033,lvl:4,cnt:32}],heroes:[{data:28000001,lvl:47,timer:120}],spells:[{data:26000005,lvl:3,timer:70}],equipment:[{data:90000004,lvl:8},{data:90000005,lvl:7}],units2:[{data:4000070,lvl:15}],heroes2:[{data:28000003,lvl:15},{data:28000005,lvl:15}],traps:[],traps2:[],units:[],siege_machines:[],pets:[],helpers:[{data:93000000,lvl:7}],boosts:{clocktower_cooldown:30845},skins:[52000020],house_parts:[82000000],obstacles:[{data:800001,cnt:2}]};
test('wall and army data are grouped using quantities, never array-row counts',()=>{
 const p=villageProgress(original);
 assert.equal(p.homeWalls.reduce((a,x)=>a+x.quantity,0),325);
 assert.equal(p.builderWalls.reduce((a,x)=>a+x.quantity,0),180);
 assert.equal(p.areas.find(a=>a.key==='buildings').count,330);
 assert.equal(p.areas.find(a=>a.key==='spells').active.length,1);
 assert.equal(p.heroes[0].upgrading,true);
 assert.equal(p.equipment.length,2);
 assert.equal(p.boosts[0].at,(10000+30845)*1000);
 assert.equal(p.cosmetics.find(v=>v.key==='skins').items,1);
 assert.match(inferActionHints(original)[0],/325/);
});
test('snapshot comparison only calls an upgrade when object counts are unchanged',()=>{
 const newer=structuredClone(original);
 newer.timestamp+=1000;
 newer.buildings[1].lvl=11;
 const a=compareSnapshots(original,newer);
 const wall=a.changes.find(v=>v.name==='Wall');
 assert.equal(wall.inferredLevels,144);
 newer.buildings.push({data:1000010,lvl:11});
 const b=compareSnapshots(original,newer);
 assert.equal(b.changes.find(v=>v.name==='Wall').inferredLevels,null);
});
test('separate account JSON imports preserve existing inventories and store only concise change summaries',()=>{
 const player=seedState();const initial=importVillage(player,original);
 const later=structuredClone(original);later.timestamp+=2000;later.heroes[0].lvl=48;later.skins.push(52000021);
 const done=importVillage(initial,later);
 assert.equal(done.items['Rune of Gold'],player.items['Rune of Gold']);
 assert.equal(done.resources.gold,player.resources.gold);
 assert.equal(done.snapshotChanges.length,1);
 assert.ok(done.snapshotChanges[0].changes.some(x=>x.name==='Archer Queen'));
 assert.ok(done.snapshotChanges[0].other.includes('skins'));
 assert.equal(importVillage(done,later).snapshotChanges.length,1);
});
test('unknown IDs and absent sections remain safe and clearly visible',()=>{
 const small={...original,equipment:[{data:90099999,lvl:1}],house_parts:undefined,boosts:undefined};
 assert.match(villageProgress(small).equipment[0].name,/Unknown ID/);
 assert.deepEqual(levelGroups(small,'nonexistent',1000010),[]);
 assert.equal(compareSnapshots(null,small),null);
 assert.equal(villageProgress(null),null);
});
