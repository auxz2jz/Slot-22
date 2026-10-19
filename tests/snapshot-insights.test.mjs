import test from 'node:test';
import assert from 'node:assert/strict';
import {helperSummary,bobSummary,snapshotCoverage} from '../snapshot-insights.mjs';
test('helper levels are imported, not inferred from TH level',()=>{
 const x={timestamp:1792373123,helpers:[{data:93000000,lvl:7},{data:93000001,lvl:8},{data:93000002,lvl:3}]};
 const h=helperSummary(x);assert.equal(h.length,3);assert.equal(h[0].level,7);
 assert.match(h[1].name,/Lab Assistant/);assert.equal(h[2].cooldownSeconds,null);
});
test('BOB requirements use exact gear ups, troop, building and summed hero levels',()=>{
 const x={buildings:[{data:1000008,gear_up:1},{data:1000009,gear_up:1},{data:1000013,gear_up:1}],
 buildings2:[{data:1000044,lvl:7}],units2:[{data:4000070,lvl:15}],
 heroes2:[{data:28000003,lvl:15},{data:28000005,lvl:15}]};
 const b=bobSummary(x);assert.equal(b.gearups,3);assert.equal(b.highestDefense,7);assert.equal(b.highestTroop,15);assert.equal(b.heroLevels,30);
});
test('all original export sections remain visible, including helper and cosmetics',()=>{
 const x={tag:'#QVLP9RVV',timestamp:1,helpers:[{data:93000000,lvl:7}],house_parts:[12,3],skins:[111],boosts:{clocktower_cooldown:300},obstacles2:[{data:88,cnt:5}]};
 const a=snapshotCoverage(x);assert.equal(a.find(v=>v.key==='obstacles2').quantity,5);
 assert.ok(a.some(v=>v.key==='boosts'));assert.ok(a.some(v=>v.key==='house_parts'));assert.ok(a.some(v=>v.key==='helpers'));
});
