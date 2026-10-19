import test from 'node:test';
import assert from 'node:assert/strict';
import {gauge,remainingTime,snapshotCountdown,classifyQueue,queueGroups,planPreview,progressSummary,homeBuilderAvailability,nextHomeBuilderRecommendations,availableResearchQueues,builderTroopResearchCap,armyFacilityAudit} from '../experience.mjs';

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


test('new snapshot: Home Lab busy, Star Lab upgrading and idle, Pet House upgrading and pet idle',()=>{
 const ex={timestamp:1792438344,
 buildings:[{data:1000001,lvl:14},{data:1000007,lvl:12},{data:1000068,lvl:3,timer:32983},
 {data:1000020,lvl:6,timer:239653}],
 buildings2:[{data:1000034,lvl:9},{data:1000040,lvl:11},{data:1000046,lvl:7,timer:127061}],
 units:[{data:4000000,lvl:9}],spells:[{data:26000005,lvl:4,timer:86096}],
 siege_machines:[],units2:[{data:4000070,lvl:15},{data:4000031,lvl:13},{data:4000032,lvl:14}],
 pets:[{data:73000002,lvl:2},{data:73000000,lvl:3},{data:73000001,lvl:1}]};
 const profile={export:ex,resources:{elixir:17504427,builderElixir:1352108,dark:408530},
 roadmap:[
  {id:'L-02',title:'Freeze Spell 4 → 5',village:'Home',queue:'Laboratory',status:'planned',costType:'elixir',cost:2100000},
  {id:'B-05',title:'One Builder troop to level 18',village:'Builder',queue:'Star Laboratory',status:'planned',costType:'builderElixir',cost:0},
  {id:'P-02',title:'Unicorn 1 → 2',village:'Home',queue:'Pet House',status:'planned',costType:'dark',cost:50000}]};
 const result=availableResearchQueues(profile);
 assert.deepEqual(result.map(q=>q.status),['busy','idle','idle']);
 assert.equal(result[0].recommendations.length,0);
 assert.equal(result[1].structureUpgrading,true);
 assert.equal(result[1].structureLevel,7);
 assert.equal(result[1].recommendations[0].title,'Raged Barbarian 13 → 14');
 assert.equal(result[1].recommendations[0].taskId,'B-05');
 assert.equal(result[1].recommendations.some(x=>x.title.includes('Hog Glider')),false);
 assert.equal(result[2].structureUpgrading,true);
 assert.equal(result[2].recommendations[0].title,'Electro Owl 2 → 3');
 assert.equal(result[2].recommendations[0].taskId,null);
 assert.equal(result[2].recommendations.some(x=>x.title.includes('Unicorn')),false);
});
test('Hog Glider 15→16 requires level 9 Star Laboratory; Builder Hall 9 is not sufficient',()=>{
 assert.equal(builderTroopResearchCap(4000070,7),15);
 assert.equal(builderTroopResearchCap(4000070,8),15);
 assert.equal(builderTroopResearchCap(4000070,9),18);
 assert.equal(builderTroopResearchCap(4000031,7),14);
 assert.equal(builderTroopResearchCap(4000031,8),16);
 assert.equal(builderTroopResearchCap(4000036,7),13);
 assert.equal(builderTroopResearchCap(4000036,8),16);
 assert.equal(builderTroopResearchCap(99999999,7),null);
});
test('idle laboratory recognizes Spell Factory and Dark Spell Factory share ONE research queue',()=>{
 const ex={timestamp:1000,buildings:[{data:1000007,lvl:12},{data:1000020,lvl:6,timer:12345},{data:1000029,lvl:6}],
 buildings2:[{data:1000034,lvl:9},{data:1000046,lvl:8}],
 units:[],siege_machines:[],spells:[{data:26000005,lvl:4}],units2:[{data:4000070,lvl:15}],pets:[]};
 const p={export:ex,resources:{elixir:3000000},roadmap:[
 {id:'L-02',title:'Freeze Spell 4 → 5',village:'Home',queue:'Laboratory',status:'planned',cost:2100000,costType:'elixir'},
 {id:'B-05',title:'One Builder troop to level 18',village:'Builder',queue:'Star Laboratory',status:'planned'}]};
 const r=availableResearchQueues(p);
 assert.equal(r[0].status,'idle');
 assert.deepEqual(r[0].recommendations.map(t=>t.taskId),['L-02']);
 assert.equal(r[1].status,'idle');
 assert.equal(r[1].recommendations.length,0); // Hog Glider Lv15 cannot reach Lv16 at Star Lab8.
 assert.equal(r[2].status,'unknown');
});
test('busy research timer blocks prompts even if timer estimate has elapsed, separate from building upgrade',()=>{
 const ex={timestamp:1000,buildings:[{data:1000007,lvl:12,timer:500}],buildings2:[{data:1000046,lvl:8}],
 units:[],siege_machines:[],spells:[{data:26000005,lvl:4,timer:12}],units2:[{data:4000031,lvl:14}],pets:[]};
 const p={export:ex,roadmap:[{id:'L-02',title:'Freeze Spell 4 → 5',village:'Home',queue:'Laboratory',status:'planned',cost:2100000,costType:'elixir'},
 {id:'B-05',title:'One Builder troop to level 18',village:'Builder',queue:'Star Laboratory',status:'planned'}]};
 const r=availableResearchQueues(p);
 assert.equal(r[0].status,'busy');
 assert.equal(r[0].recommendations.length,0);
 assert.equal(r[1].status,'idle');
 assert.equal(r[1].recommendations[0].title,'Raged Barbarian 14 → 15');
});
test('missing labs or missing research arrays give unknown queue, not false idle',()=>{
 const profile={export:{timestamp:1000,buildings:[{data:1000007,lvl:12}],buildings2:[],units:[],spells:[],siege_machines:[]},roadmap:[]};
 const q=availableResearchQueues(profile);
 assert.equal(q[0].status,'idle');
 assert.equal(q[1].status,'unknown');
 assert.equal(q[2].status,'unknown');
 const p={export:{timestamp:1000,buildings:[{data:1000007,lvl:12}],buildings2:[],units:[],spells:[]},roadmap:[]};
 assert.equal(availableResearchQueues(p)[0].status,'unknown');
 assert.equal(availableResearchQueues({export:null}).length,0);
});
test('army facility audit distinguishes manufacturing, building upgrades, and Pet House',()=>{
 const ex={timestamp:1792438344,buildings:[{data:1000001,lvl:14},
 {data:1000020,lvl:6,timer:239653},{data:1000029,lvl:6},{data:1000007,lvl:12},
 {data:1000006,lvl:14},{data:1000026,lvl:9},{data:1000059,lvl:5},{data:1000070,lvl:6},
 {data:1000071,lvl:7},{data:1000068,lvl:3,timer:32983}],
 buildings2:[{data:1000034,lvl:9},{data:1000040,lvl:11},{data:1000046,lvl:7,timer:127061}]};
 const all=armyFacilityAudit({export:ex});
 assert.equal(all.find(a=>a.name==='Dark Spell Factory').nextLevel,7);
 assert.equal(all.find(a=>a.name==='Spell Factory').buildingUpgradeActive,true);
 assert.equal(all.find(a=>a.name==='Star Laboratory').buildingUpgradeActive,true);
 assert.equal(all.find(a=>a.name==='Laboratory').atKnownHallCap,true);
 assert.equal(all.find(a=>a.name==='Blacksmith').nextLevel,7);
 assert.equal(all.find(a=>a.name==='Workshop').nextLevel,6);
 assert.equal(all.find(a=>a.name==='Builder Barracks').atKnownHallCap,true);
 assert.equal(all.find(a=>a.name==='Pet House').buildingUpgradeActive,true);
});
