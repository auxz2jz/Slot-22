import test from 'node:test';
import assert from 'node:assert/strict';
import {gauge,remainingTime,snapshotCountdown,classifyQueue,queueGroups,planPreview,progressSummary} from '../experience.mjs';

test('resource gauges require explicit storage capacity and handle overflow',()=>{
 assert.deepEqual(gauge(50000,0),{amount:50000,capacity:0,known:false,percent:0,overflow:false});
 assert.equal(gauge(1500000,3000000).percent,50);
 assert.equal(gauge(4500000,3000000).percent,100);
 assert.equal(gauge(4500000,3000000).overflow,true);
});
test('snapshot progress counts down but never claims entire build completion',()=>{
 const ex={timestamp:1000},row={timer:3600};
 const p=snapshotCountdown(ex,row,1000*1000+900*1000);
 assert.equal(p.percent,25);
 assert.equal(p.remaining.text,'45m left');
 assert.equal(p.basis,'Since last game export');
 assert.equal(snapshotCountdown(ex,row,1000*1000+4200*1000).remaining.expired,true);
});
test('queue grouping separates independent home, builder, laboratory, and pet slots',()=>{
 assert.equal(classifyQueue('buildings'),'Home builders');
 assert.equal(classifyQueue('heroes2'),'Builder Base builders');
 assert.equal(classifyQueue('spells'),'Laboratory');
 assert.equal(classifyQueue('pets'),'Pets');
 const q=queueGroups([{categoryId:'buildings'},{categoryId:'buildings2'},{categoryId:'spells'}]);
 assert.equal(q['Home builders'].length,1);
 assert.equal(q['Builder Base builders'].length,1);
 assert.equal(q.Laboratory.length,1);
});
test('upgrade preview never mutates resources or guesses unknown costs',()=>{
 const money={gold:5000000,elixir:2000000};
 const p=planPreview({costType:'gold',cost:3000000},money);
 assert.equal(p.affordable,true);
 assert.equal(p.remaining,2000000);
 assert.equal(money.gold,5000000);
 assert.equal(planPreview({costType:'elixir',cost:0},money).valid,false);
 assert.equal(planPreview({costType:'elixir',cost:3000000},money).affordable,false);
});
test('roadmap status percentages are honest on empty and mixed accounts',()=>{
 assert.deepEqual(progressSummary([]),{total:0,done:0,active:0,percent:0});
 const p=progressSummary([{status:'done'},{status:'active'},{status:'planned'},{status:'done'}]);
 assert.equal(p.percent,50);
});

test('progress bar continues from first observation after a newer JSON',()=>{
 const first=snapshotCountdown({timestamp:1000},{timer:3600},1000*1000+900*1000,1000000);
 const updated=snapshotCountdown({timestamp:1900},{timer:2700},1900*1000+100*1000,1000000);
 assert.equal(first.percent,25);
 assert.ok(updated.percent>first.percent);
 assert.equal(updated.basis,'Since first tracked');
 assert.equal(updated.end,first.end);
 const different=snapshotCountdown({timestamp:1900},{timer:2700},1900*1000,1900000);
 assert.equal(different.percent,0);
});

test('JSON timestamp plus 17h 5m produces the same finish regardless of import time',()=>{
 const timestamp=1000000, timer=17*3600+5*60;
 const hourLater=(timestamp+3600)*1000;
 const first=snapshotCountdown({timestamp},{timer},hourLater,timestamp*1000);
 const refreshed=snapshotCountdown({timestamp:timestamp+3600},{timer:timer-3600},hourLater,timestamp*1000);
 assert.equal(first.end,(timestamp+timer)*1000);
 assert.equal(first.remaining.text,'16h 5m left');
 assert.equal(first.end,refreshed.end);
 assert.equal(first.percent,refreshed.percent);
 assert.ok(first.percent>0 && first.percent<100);
 assert.equal(snapshotCountdown({timestamp},{timer},first.end+1000).remaining.expired,true);
});
