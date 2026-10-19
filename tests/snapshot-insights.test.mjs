import test from 'node:test';
import assert from 'node:assert/strict';
import {helperSummary,bobSummary,snapshotCoverage} from '../snapshot-insights.mjs';
import {renderHelperStrip,helperCountdown} from '../insights-view.mjs';
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

test('Builder Apprentice assignment is read from Archer Queen rather than helper row',()=>{
 const timestamp=1792401610;
 const x={timestamp,
  helpers:[{data:93000000,lvl:7,helper_cooldown:82787},{data:93000001,lvl:8}],
  heroes:[{data:28000001,lvl:47,timer:48152,helper_timer:3587,helper_recurrent:true}],
  buildings:[{data:1000014,lvl:9,timer:50000}]
 };
 const [builder,lab]=helperSummary(x);
 assert.equal(builder.assignmentCount,1);
 assert.equal(builder.assignment?.name,'Archer Queen');
 assert.equal(builder.assignment?.category,'heroes');
 assert.equal(builder.assignment?.level,47);
 assert.equal(builder.assignment?.workSeconds,3587);
 assert.equal(builder.assignment?.workEndsAt,(timestamp+3587)*1000);
 assert.equal(builder.assignment?.recurrent,true);
 assert.equal(builder.cooldownSeconds,82787);
 assert.equal(builder.snapshotEnd,(timestamp+82787)*1000);
 assert.equal(lab.assignment,null);
 assert.equal(lab.assignmentCount,0);
});
test('Lab Assistant can be linked to research, but recurring assignment alone is not a live working session',()=>{
 const x={timestamp:2000,helpers:[{data:93000000,lvl:7},{data:93000001,lvl:8}],
  heroes:[{data:28000001,lvl:47,helper_recurrent:true}],
  units:[{data:4000000,lvl:12,helper_timer:0,helper_recurrent:false}]
 };
 const [builder,lab]=helperSummary(x);
 assert.equal(builder.assignment?.name,'Archer Queen');
 assert.equal(builder.assignment?.workSeconds,null);
 assert.equal(builder.assignment?.recurrent,true);
 assert.equal(lab.assignment?.category,'units');
 assert.equal(lab.assignment?.workEndsAt,2000000);
 assert.equal(lab.assignment?.recurrent,false);
});
test('ambiguous helper targets and unrelated timers are never assigned to a guessed helper',()=>{
 const x={timestamp:100,helpers:[{data:93000000,lvl:7},{data:93000001,lvl:8},{data:93000002,lvl:3}],
 heroes:[{data:28000001,lvl:45,helper_timer:1200}],
 buildings:[{data:1000000,lvl:10,helper_timer:600}],
 units2:[{data:4000000,lvl:3,helper_timer:1000}],
 units:[{data:4000001,lvl:8,timer:500}]
 };
 const [builder,lab,third]=helperSummary(x);
 assert.equal(builder.assignment,null);
 assert.equal(builder.assignmentCount,2);
 assert.equal(lab.assignment,null);
 assert.equal(lab.assignmentCount,0);
 assert.equal(third.assignment,null);
});

test('Helper Hut renders confirmed assignment and dated work/cooldown timers',()=>{
 const x={timestamp:1792401610,helpers:[{data:93000000,lvl:7,helper_cooldown:82787}],
  heroes:[{data:28000001,lvl:47,timer:48152,helper_timer:3587,helper_recurrent:true}]};
 const html=renderHelperStrip({export:x});
 assert.match(html,/Assigned in snapshot: <strong>Archer Queen<\/strong>/);
 assert.match(html,/Repeat assignment: On/);
 assert.match(html,/data-helper-session-end="1792405197000"/);
 assert.match(html,/data-helper-cooldown-end="1792484397000"/);
 assert.match(html,/Work session:/);
 assert.match(html,/Cooldown:/);
 assert.equal(helperCountdown(120000,'work',60000),'1m 0s left');
 assert.equal(helperCountdown(120000,'work',120000),'Session estimate elapsed · refresh JSON');
 assert.equal(helperCountdown(120000,'cooldown',120000),'Cooldown estimate elapsed · verify in game');
});
test('unknown helper assignment is labeled unknown rather than inactive',()=>{
 const x={timestamp:1000,helpers:[{data:93000000,lvl:7}]};
 const html=renderHelperStrip({export:x});
 assert.match(html,/Assignment not reported in this JSON/);
 assert.match(html,/Cooldown not included in JSON/);
 assert.doesNotMatch(html,/Archer Queen/);
});
