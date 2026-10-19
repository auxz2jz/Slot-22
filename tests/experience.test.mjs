import test from 'node:test';
import assert from 'node:assert/strict';
import {gauge,remainingTime,snapshotCountdown,classifyQueue,queueGroups,planPreview,progressSummary,homeBuilderAvailability,nextHomeBuilderRecommendations,availableResearchQueues} from '../experience.mjs';

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

test('snapshot counts five huts and four active Home Village jobs: builder available',()=>{
 const ex={timestamp:1000,
 buildings:[{data:1000015,lvl:2,cnt:5},{data:1000014,lvl:9,timer:9999},{data:1000000,lvl:10,timer:9999},
 {data:1000027,lvl:7,timer:9999},{data:1000068,lvl:3,timer:9999},{data:1000020,lvl:6}],
 heroes:[{data:28000001,lvl:48}],traps:[]};
 assert.equal(homeBuilderAvailability(ex).buildersAtLeast,5);
 assert.equal(homeBuilderAvailability(ex).occupiedFromSnapshot,4);
 assert.equal(homeBuilderAvailability(ex).availableAtLeast,1);
 const profile={export:ex,resources:{elixir:5000000},roadmap:[
 {id:'H-05',title:'Archer Queen 47 → 48',status:'active',village:'Home',queue:'Builder',costType:'dark',cost:39500},
 {id:'H-06',title:'Spell Factory 6 → 7',status:'planned',village:'Home',queue:'Builder',costType:'elixir',cost:4500000},
 {id:'H-07',title:'Second Army Camp 10 → 11',status:'planned',village:'Home',queue:'Builder',costType:'elixir',cost:3750000}]};
 const result=nextHomeBuilderRecommendations(profile);
 assert.deepEqual(result.recommendations.map(r=>r.taskId),['H-06']);
 assert.equal(result.recommendations[0].affordableFromSaved,true);
});
test('never infer a freed builder merely from expired upgrade timers',()=>{
 const ex={timestamp:1000,buildings:[{data:1000015,lvl:2,cnt:5},
 ...Array.from({length:5},(_,i)=>({data:1000000+i,lvl:10,timer:60}))]};
 assert.equal(homeBuilderAvailability(ex).availableAtLeast,0);
 assert.equal(homeBuilderAvailability(ex).occupiedFromSnapshot,5);
 assert.equal(homeBuilderAvailability({...ex,buildings:[...ex.buildings,{data:1000008,lvl:8,timer:80}]}).availableAtLeast,0);
});
test('no recommendation for non-building jobs, missing hut count, or already upgraded construction',()=>{
 const candidate={id:'H-06',title:'Spell Factory 6 → 7',status:'planned',village:'Home',queue:'Builder',costType:'elixir',cost:4500000};
 const noHuts={timestamp:1000,buildings:[{data:1000020,lvl:6}],heroes:[]};
 assert.equal(homeBuilderAvailability(noHuts),null);
 const upgraded={timestamp:1000,buildings:[{data:1000015,lvl:2,cnt:5},{data:1000020,lvl:7}],heroes:[]};
 assert.equal(nextHomeBuilderRecommendations({export:upgraded,roadmap:[candidate]}).recommendations.length,0);
 const running={...upgraded,buildings:[{data:1000015,lvl:2,cnt:5},{data:1000020,lvl:6,timer:1000}]};
 assert.equal(nextHomeBuilderRecommendations({export:running,roadmap:[candidate]}).recommendations.length,0);
});
test('trap construction consumes a Home builder, but Lab research does not',()=>{
 const ex={timestamp:1000,buildings:[{data:1000015,lvl:2,cnt:5},{data:1000014,lvl:9,timer:8000},
 {data:1000020,lvl:6}],traps:[{data:12000000,lvl:9,timer:300}],units:[{data:4000000,lvl:5,timer:300}]};
 assert.equal(homeBuilderAvailability(ex).occupiedFromSnapshot,2);
 assert.equal(homeBuilderAvailability(ex).availableAtLeast,3);
});
test('candidate ordering prefers affordable from SAVED manual balance while warning actual balance unknown',()=>{
 const ex={timestamp:1000,buildings:[{data:1000015,lvl:2,cnt:5},{data:1000020,lvl:6},
 {data:1000000,lvl:10,cnt:3}]};
 const profile={export:ex,resources:{elixir:4000000},roadmap:[
 {id:'H-06',title:'Spell Factory 6 → 7',status:'planned',village:'Home',queue:'Builder',costType:'elixir',cost:4500000},
 {id:'H-07',title:'Second Army Camp 10 → 11',status:'planned',village:'Home',queue:'Builder',costType:'elixir',cost:3750000}]};
 const rec=nextHomeBuilderRecommendations(profile).recommendations;
 assert.equal(rec[0].taskId,'H-07');
 assert.equal(rec[1].taskId,'H-06');
});

test('Oct 19 snapshot correctly identifies an idle Home Laboratory and Star Laboratory',()=>{
 const ex={timestamp:1792435596,buildings:[{data:1000007,lvl:12},{data:1000068,lvl:3,timer:35731}],
 buildings2:[{data:1000034,lvl:9}],units:[{data:4000000,lvl:9}],
 spells:[{data:26000005,lvl:4}],siege_machines:[],units2:[{data:4000070,lvl:15}],pets:[{data:73000002,lvl:2}]};
 const profile={export:ex,resources:{elixir:17504427,builderElixir:1352108},
 roadmap:[
  {id:'L-01',title:'Freeze Spell 3 → 4',village:'Home',queue:'Laboratory',status:'active',costType:'elixir',cost:1500000},
  {id:'L-02',title:'Freeze Spell 4 → 5',village:'Home',queue:'Laboratory',status:'planned',costType:'elixir',cost:2100000},
  {id:'B-05',title:'One Builder troop to level 18',village:'Builder',queue:'Star Laboratory',status:'planned',costType:'builderElixir',cost:0},
  {id:'P-02',title:'Unicorn 1 → 2',village:'Home',queue:'Pet House',status:'planned',costType:'dark',cost:50000}]};
 const result=availableResearchQueues(profile);
 assert.deepEqual(result.map(q=>q.status),['idle','idle','unknown']);
 assert.deepEqual(result[0].recommendations.map(q=>q.taskId),['L-02']);
 assert.equal(result[0].recommendations[0].affordableFromSaved,true);
 assert.equal(result[1].recommendations[0].title,'Hog Glider 15 → 16');
 assert.equal(result[1].recommendations[0].taskId,'B-05');
 assert.equal(result[1].recommendations[0].cost,null);
 assert.equal(result[2].recommendations.length,0);
});
test('busy Home Laboratory hides research recommendation even when the timer has expired since the export',()=>{
 const ex={timestamp:1000,buildings:[{data:1000007,lvl:12}],buildings2:[{data:1000034,lvl:9}],
 units:[],siege_machines:[],spells:[{data:26000005,lvl:4,timer:12}],units2:[{data:4000070,lvl:15}],pets:[]};
 const p={export:ex,roadmap:[{id:'L-02',title:'Freeze Spell 4 → 5',village:'Home',queue:'Laboratory',status:'planned',cost:2100000,costType:'elixir'}]};
 const r=availableResearchQueues(p);
 assert.equal(r[0].status,'busy');
 assert.equal(r[0].recommendations.length,0);
 assert.equal(r[1].status,'idle');
});
test('do not claim laboratory free when absent, upgrading, or no complete timer fields',()=>{
 const profile={export:{timestamp:1000,buildings:[{data:1000007,lvl:12,timer:500}],buildings2:[],units:[],spells:[],siege_machines:[]},roadmap:[]};
 const q=availableResearchQueues(profile);
 assert.equal(q[0].status,'unknown');
 assert.equal(q[1].status,'unknown');
 assert.equal(q[2].status,'unknown');
 assert.equal(availableResearchQueues({export:null}).length,0);
});
