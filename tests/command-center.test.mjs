import test from 'node:test';
import assert from 'node:assert/strict';
import {renderCommandCenter,renderCommandDetail,commandOverview,upgradeKey,rankCandidates} from '../command-center.mjs';
const ex=()=>({tag:'#TEST',timestamp:1792441915,helpers:[{data:93000000,lvl:7,helper_cooldown:42583},{data:93000001,lvl:8,helper_cooldown:42583},{data:93000002,lvl:3},{data:93000003,lvl:1}],
 buildings:[{data:1000001,lvl:14},{data:1000015,lvl:2,cnt:5},{data:1000020,lvl:6,timer:236082},
 {data:1000014,lvl:9,timer:180649},{data:1000000,lvl:10,timer:94275},
 {data:1000027,lvl:7,timer:137490},{data:1000068,lvl:3,timer:29412},
 {data:1000029,lvl:6},{data:1000007,lvl:12},{data:1000071,lvl:7},{data:1000070,lvl:6}],
 heroes:[{data:28000002,lvl:28},{data:28000001,lvl:48}],traps:[],
 spells:[{data:26000005,lvl:4,timer:63683,helper_timer:1248,helper_recurrent:true},
 {data:26000035,lvl:2},{data:26000009,lvl:5}],units:[{data:4000007,lvl:5}],
 siege_machines:[{data:4000087,lvl:1}],
 buildings2:[{data:1000034,lvl:9},{data:1000046,lvl:7,timer:123490},{data:1000044,lvl:7,timer:123895}],
 heroes2:[{data:28000003,lvl:15},{data:28000005,lvl:15}],traps2:[],
 units2:[{data:4000031,lvl:13},{data:4000070,lvl:15}],
 pets:[{data:73000002,lvl:2,timer:68802},{data:73000000,lvl:3},{data:73000001,lvl:1}],
 equipment:[{data:90000004,lvl:8},{data:90000001,lvl:5}],boosts:{}});
const p=()=>({export:ex(),resources:{gold:19000000,elixir:17504427,dark:408530,builderGold:3055184,
 builderElixir:1352108,shiny:940,glowy:222,starry:11},roadmap:[
 {title:'Spell Factory 6 → 7',cost:4500000,costType:'elixir',status:'active'},
 {title:'Freeze Spell 5 → 6',cost:3000000,costType:'elixir',status:'planned'}],
 seasonalPlan:{goldPassPurchased:true},boostEnd:null});
test('compact interface shows seven queues and current balances',()=>{
 const profile=p(),html=renderCommandCenter(profile),plan=commandOverview(profile);
 assert.equal(plan.queueStates.length,7);
 assert.equal(plan.queueStates.find(q=>q.id==='pets').status,'busy');
 assert.equal(plan.queueStates.find(q=>q.id==='homeLab').status,'busy');
 assert.equal(plan.queueStates.find(q=>q.id==='assistants').inProgress,'2 recorded cooldowns');
 for(const q of ['homeBuilders','homeLab','pets','builderBuilders','starLab','equipment','assistants'])
   assert.match(html,new RegExp('data-command-lane="'+q+'"'));
 assert.match(html,/17,504,427/);
 assert.match(html,/Not confirmed/);
 assert.match(html,/data-command-boost="builderBoost"/);
 assert.match(html,/data-command-boost="researchBoost"/);
 assert.match(html,/data-command-structure="buildings:1000020"/);
 assert.match(html,/data-command-structure="spells:26000005"/);
 assert.match(html,/data-command-structure="equipment:90000004"/);
});
test('Spell Factory detail includes its own timer and linked Laboratory research',()=>{
 const profile=p();
 const d=renderCommandDetail(profile,'structure:buildings:1000020');
 assert.match(d,/Spell Factory/);
 assert.match(d,/In progress/);
 assert.match(d,/Freeze Spell/);
 assert.match(d,/following upgrades|Then work on/);
 assert.match(d,/data-quote-key="buildings:1000020:7"/);
 assert.match(d,/game-data reference/);
});
test('Hero Hall details explain builder and show next Hero',()=>{
 const d=renderCommandDetail(p(),'structure:buildings:1000071');
 assert.match(d,/Hero Hall/);
 assert.match(d,/separate Hero-upgrade builder/);
 assert.match(d,/Grand Warden 28 → 29/);
});
test('Pet queue reflects active Owl and recommends next after it',()=>{
 const d=renderCommandDetail(p(),'lane:pets');
 assert.match(d,/Electro Owl/);
 assert.match(d,/L\.A\.S\.S\.I 3 → 4/);
 assert.doesNotMatch(d,/No timed work reported in this queue/);
});
test('verified undiscouted quote applies only confirmed boost once',()=>{
 const profile=p();
 profile.upgradePreferences={builderBoost:20,researchBoost:15};
 profile.upgradeQuotes={
 [upgradeKey('buildings',1000020,7)]:{price:5000000,hours:100,currency:'elixir',beforeBoost:true},
 [upgradeKey('spells',26000005,5)]:{price:3000000,hours:40,currency:'elixir',beforeBoost:false}
 };
 const building=renderCommandDetail(profile,'structure:buildings:1000020');
 const spell=renderCommandDetail(profile,'structure:spells:26000005');
 assert.match(building,/4,000,000 Elixir/);
 assert.match(building,/80\.0h/);
 assert.match(spell,/3,000,000 Elixir/);
 assert.doesNotMatch(spell,/2,550,000/);
 assert.match(spell,/data-quote-key="spells:26000005:5"/);
});
test('uncovered upgrade levels remain unknown rather than guessed',()=>{
 const d=renderCommandDetail(p(),'structure:buildings:1000007');
 assert.match(d,/MIT-licensed game-data reference/);
 assert.match(renderCommandCenter({export:{}}),/Import a dated game JSON/);
});

test('reference game costs and durations apply only confirmed discounts',()=>{
 const profile=p();
 profile.upgradePreferences={builderBoost:20,researchBoost:15};
 const camp=renderCommandDetail(profile,'structure:buildings:1000020');
 const spell=renderCommandDetail(profile,'structure:spells:26000005');
 const tome=renderCommandDetail(profile,'structure:equipment:90000004');
 assert.match(camp,/7,200,000 Elixir/);
 assert.match(spell,/MIT-licensed game-data reference/);
 assert.match(spell,/51\.0h/); // Freeze 4->5 = 60h base, research 15% set by user
 assert.match(tome,/Shiny 1,800/);
 assert.match(tome,/Glowy 200/);
});

test('separate reported 50% returning boost does not stack on Gold Pass twice',()=>{
 const profile=p();
 profile.upgradePreferences={builderBoost:20,researchBoost:15,returningBoost:50};
 const camp=renderCommandDetail(profile,'structure:buildings:1000020');
 const spell=renderCommandDetail(profile,'structure:spells:26000005');
 assert.match(camp,/4,500,000 Elixir/);
 assert.match(spell,/2,100,000 Elixir/);
 assert.doesNotMatch(camp,/3,600,000 Elixir/);
});

test('current Shiny Ore shortage makes affordable Rage Vial better immediate spend than Eternal Tome',()=>{
 const profile=p();
 const overview=commandOverview(profile);
 const equipment=overview.queueStates.find(q=>q.id==='equipment');
 assert.equal(equipment.next[0].title,'Rage Vial 5 → 6');
 assert.equal(equipment.next[0].recordedAffordable,true);
 const tome=equipment.next.find(t=>t.title==='Eternal Tome 8 → 9');
 assert.equal(tome.recordedAffordable,false);
 assert.ok(equipment.next[0].priority>tome.priority);
});

test('previously uncovered structures and troops now carry licensed costs and gating',()=>{
 const profile=p();
 profile.export.buildings.push({data:1000008,lvl:10});
 profile.export.units.push({data:4000000,lvl:7});
 const cannon=renderCommandDetail(profile,'structure:buildings:1000008');
 const troop=renderCommandDetail(profile,'structure:units:4000000');
 assert.match(cannon,/Cannon/);
 assert.match(cannon,/MIT-licensed game-data reference/);
 assert.match(troop,/Barbarian/);
 assert.match(troop,/MIT-licensed game-data reference/);
});

test('unknown future identifiers do not gain invented prices',()=>{
 const profile=p();
 profile.export.buildings.push({data:123456789,lvl:2});
 assert.match(renderCommandDetail(profile,'structure:buildings:123456789'),/Price and total duration not recorded/);
});
