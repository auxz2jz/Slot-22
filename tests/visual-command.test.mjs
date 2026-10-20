import test from 'node:test';
import assert from 'node:assert/strict';
import {renderCommandCenter,renderCommandDetail,commandOverview} from '../command-center.mjs';
import {visualWorkforce,renderVisualCommand,renderVisualWorkerDetail} from '../visual-command.mjs';

const snapshot=1792449321;
const makeProfile=()=>({
 export:{tag:'#VISUAL',timestamp:snapshot,
  buildings:[{data:1000001,lvl:14},{data:1000015,lvl:2,cnt:5},
   {data:1000014,lvl:9,timer:170000},{data:1000000,lvl:10,timer:80000},
   {data:1000020,lvl:6,timer:228000},{data:1000027,lvl:7,timer:128000},
   {data:1000068,lvl:3,timer:21000},{data:1000007,lvl:12},{data:1000071,lvl:7},
   {data:1000070,lvl:6},{data:1000029,lvl:6}],
  buildings2:[{data:1000034,lvl:9},{data:1000044,lvl:7,timer:113000},
   {data:1000046,lvl:7,timer:112000}],
  heroes:[{data:28000001,lvl:48},{data:28000002,lvl:28}],heroes2:[],
  traps:[],traps2:[],units:[{data:4000007,lvl:5}],units2:[{data:4000031,lvl:13}],
  spells:[{data:26000005,lvl:4,timer:45000,helper_recurrent:true}],
  siege_machines:[],pets:[{data:73000002,lvl:3,timer:100000},{data:73000000,lvl:3}],
  equipment:[{data:90000004,lvl:8},{data:90000001,lvl:5}],
  helpers:[{data:93000000,lvl:7,helper_cooldown:35000},
   {data:93000001,lvl:8,helper_cooldown:35000},
   {data:93000002,lvl:3},{data:93000003,lvl:1}],
  boosts:{}},
 resources:{gold:19000000,elixir:17504427,dark:408530,gems:4049,
   builderGold:3055184,builderElixir:1352108,shiny:940,glowy:222,starry:11},
 roadmap:[],upgradeTracking:[
 {category:'buildings',id:1000068,level:3,firstSeenAt:(snapshot-25000)*1000},
 {category:'spells',id:26000005,level:4,firstSeenAt:(snapshot-10000)*1000}
 ],seasonalPlan:{goldPassPurchased:true},boostEnd:null
});

test('picture-led front page has five builders, four assistants, two Base slots, four independent stations',()=>{
 const p=makeProfile();
 const html=renderCommandCenter(p);
 assert.equal((html.match(/data-command-worker="home:\d+"/g)||[]).length,5);
 assert.equal((html.match(/data-command-worker="builder:\d+"/g)||[]).length,2);
 assert.equal((html.match(/data-command-worker="helper:9300000\d"/g)||[]).length,4);
 assert.equal((html.match(/class="vc-card vc-station"/g)||[]).length,4);
 assert.equal((html.match(/data-command-lane="/g)||[]).length,7);
 assert.equal((html.match(/data-command-next="/g)||[]).length,6);
 assert.equal((html.match(/class="vc-resource-art"/g)||[]).length,9);
 assert.match(html,/data-command-worker="home:0"/);
 assert.match(html,/data-command-lane="equipment"/);
 assert.match(html,/Home builders · Heroes use builders/);
 assert.match(html,/Builder Base construction/);
 assert.match(html,/Next-up queue/);
 assert.doesNotMatch(html,/command-queue-grid/);
});

test('home builder slot IDs are display positions; job order is by estimated completion',()=>{
 const p=makeProfile(),overview=commandOverview(p);
 const v=visualWorkforce(p,overview,snapshot*1000);
 assert.equal(v.home.length,5);
 assert.equal(v.home[0].job.data,1000068); // Pet House completes first.
 assert.equal(v.home[1].job.data,1000000);
 assert.equal(v.home[0].job.firstObserved,(snapshot-25000)*1000);
 assert.equal(v.home[0].job.end,(snapshot+21000)*1000);
 assert.equal(v.home[0].job.progress>0,true);
 assert.equal(v.builder.length,2);
 assert.equal(v.helpers.length,4);
 assert.equal(v.home[0].next?.title.includes('Grand Warden'),true);
 const detail=renderCommandDetail(p,'worker:home:0');
 assert.match(detail,/Pet House 3 → 4/);
 assert.match(detail,/First observed:/);
 assert.match(detail,/actual start not supplied/);
 assert.match(detail,/Estimated completion:/);
 assert.match(detail,/Grand Warden 28 → 29/);
 assert.match(detail,/See other ranked upgrades/);
});

test('assistant cards show actual recorded cooldowns without claiming readiness or invented assignments',()=>{
 const p=makeProfile();
 const html=renderVisualCommand(p,commandOverview(p),snapshot*1000);
 assert.match(html,/Builder&#39;s Apprentice/);
 assert.match(html,/Lab Assistant/);
 assert.match(html,/Alchemist/);
 assert.match(html,/Prospector/);
 assert.match(html,/data-helper-cooldown-end="/);
 assert.match(html,/Repeat target: Freeze Spell/);
 assert.match(html,/Use today unconfirmed/);
 assert.match(html,/Current task not reported/);
 assert.match(html,/Next:<\/b> Gold, Elixir or Dark Elixir conversion/);
 const labDetail=renderVisualWorkerDetail(p,'worker:helper:93000001',commandOverview(p),snapshot*1000);
 assert.match(labDetail,/Freeze Spell/);
 assert.match(labDetail,/cooldown end:/i);
 assert.match(labDetail,/Recommended next use/);
});

test('time bars only track since first observation, and an elapsed ETA does not imply builder freed',()=>{
 const p=makeProfile(),v=visualWorkforce(p,commandOverview(p),(snapshot+250000)*1000);
 assert.equal(v.home.length,5);
 assert.ok(v.home.every(s=>s.job));
 assert.match(v.home[0].job.remaining,/ETA passed · refresh JSON/);
 const html=renderVisualCommand(p,commandOverview(p),(snapshot+250000)*1000);
 assert.match(html,/progress starts when an upgrade was first observed, NOT when construction actually began/i);
 assert.match(html,/expired ETA does not prove a builder is free/);
});
