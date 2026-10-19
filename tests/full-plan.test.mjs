import test from 'node:test';
import assert from 'node:assert/strict';
import {fullVillagePlan} from '../full-plan.mjs';
import {renderFullVillagePlan} from '../full-plan-view.mjs';
const ex=()=>({tag:'#EXAMPLE',timestamp:1792439555,
 buildings:[{data:1000001,lvl:14},{data:1000015,lvl:2,cnt:5},
 {data:1000014,lvl:9,timer:183009},{data:1000000,lvl:10,timer:96635},
 {data:1000020,lvl:6,timer:238442},{data:1000027,lvl:7,timer:139850},
 {data:1000068,lvl:3,timer:31772},{data:1000071,lvl:7},{data:1000070,lvl:6},
 {data:1000006,lvl:14},{data:1000007,lvl:12},{data:1000029,lvl:6}],
 heroes:[{data:28000000,lvl:44},{data:28000001,lvl:48},{data:28000002,lvl:28},
  {data:28000004,lvl:20},{data:28000006,lvl:50}],
 traps:[{data:12000001,lvl:4}],
 units:[{data:4000007,lvl:5},{data:4000008,lvl:9}],spells:[{data:26000005,lvl:4,timer:84755},
  {data:26000035,lvl:2}],siege_machines:[{data:4000087,lvl:1}],
 pets:[{data:73000000,lvl:3},{data:73000001,lvl:1},{data:73000002,lvl:2}],
 equipment:[{data:90000004,lvl:8},{data:90000005,lvl:7}],
 buildings2:[{data:1000034,lvl:9},{data:1000046,lvl:7,timer:125850},
 {data:1000044,lvl:7,timer:126255}],traps2:[{data:12000002,lvl:2}],
 heroes2:[{data:28000003,lvl:15},{data:28000005,lvl:15}],
 units2:[{data:4000031,lvl:13},{data:4000070,lvl:15}],
 helpers:[{data:93000000,lvl:7,helper_cooldown:46115},{data:93000001,lvl:8}]
});
const profile=x=>({export:x,resources:{gold:1000,elixir:1000,dark:1000},
 roadmap:[]});
const lane=(p,key)=>p.queues.find(q=>q.id===key);
test('complete plan sees occupied builders, Hero Hall idle, one Home Lab and available pet queue',()=>{
 const x=ex(),p=fullVillagePlan(profile(x));
 assert.equal(p.queues.length,6);
 assert.equal(lane(p,'homeBuilders').activeCount,5);
 assert.equal(lane(p,'homeBuilders').status,'busy');
 assert.equal(lane(p,'builderBuilders').activeCount,2);
 assert.equal(p.heroHall.level,7);assert.equal(p.heroHall.upgrading,false);
 assert.equal(p.heroHall.heroCurrent.length,5);
 assert.equal(p.heroHall.heroCurrent.filter(h=>h.upgrading).length,0);
 assert.equal(p.heroHall.nextHeroes[0].title,'Grand Warden 28 → 29');
 assert.equal(lane(p,'homeLab').status,'busy');
 assert.equal(lane(p,'homeLab').next[0].title,'Freeze Spell 5 → 6 (after current)');
 assert.ok(lane(p,'homeLab').alternatives.spells.some(q=>q.title.includes('Invisibility Spell')));
 assert.ok(lane(p,'homeLab').alternatives.troops.some(q=>q.title.includes('Healer')));
 assert.equal(lane(p,'starLab').status,'blocked');
 assert.equal(lane(p,'pets').status,'idle');
 assert.equal(lane(p,'pets').next[0].title,'Electro Owl 2 → 3');
 assert.equal(lane(p,'equipment').next[0].title,'Eternal Tome 8 → 9');
 assert.equal(p.inventory.length,4);assert.ok(p.inventory[0].entries.some(r=>r.name==='Spell Factory'&&r.ongoing));
 assert.equal(p.helperActions.length,2);
});
test('next JSON recomputes Hero, spell and pet upgrade recommendation without extra queue',()=>{
 const x=ex();x.timestamp+=90000;
 delete x.spells[0].timer;x.spells[0].lvl=5;
 const owl=x.pets.find(r=>r.data===73000002);owl.lvl=3;
 x.heroes.find(r=>r.data===28000002).lvl=29;
 const p=fullVillagePlan(profile(x));
 assert.equal(lane(p,'homeLab').status,'idle');
 assert.equal(lane(p,'homeLab').next[0].title,'Freeze Spell 5 → 6');
 assert.equal(lane(p,'pets').next[0].title,'Electro Owl 3 → 4');
 assert.equal(p.heroHall.nextHeroes[0].title,'Grand Warden 29 → 30');
});
test('after Pet House unlock Unicorn gets highest pet priority if confirmed in game JSON',()=>{
 const x=ex(),house=x.buildings.find(r=>r.data===1000068);
 house.lvl=4;delete house.timer;x.pets.push({data:73000003,lvl:1});
 const p=fullVillagePlan(profile(x));
 assert.equal(lane(p,'pets').next[0].title,'Unicorn 1 → 2');
});
test('does not claim Star Lab troop research while Star Lab building is upgrading',()=>{
 const x=ex(),p=fullVillagePlan(profile(x));
 assert.equal(lane(p,'starLab').status,'blocked');
 assert.ok(!lane(p,'starLab').next.some(t=>t.title.includes('Hog Glider 15 → 16')));
 const lab=x.buildings2.find(r=>r.data===1000046);delete lab.timer;lab.lvl=8;
 const next=fullVillagePlan(profile(x));
 assert.equal(lane(next,'starLab').status,'idle');
 assert.ok(!lane(next,'starLab').next.some(t=>t.title.includes('Hog Glider 15 → 16')));
});
test('overview plan renders all lanes and full audit without changing original export',()=>{
 const x=ex(),before=JSON.stringify(x);
 const html=renderFullVillagePlan(profile(x));
 for(const id of ['homeBuilders','builderBuilders','homeLab','starLab','pets','equipment'])
  assert.match(html,new RegExp('data-plan-lane="'+id+'"'));
 assert.match(html,/Hero Hall Lv 7/);assert.match(html,/Freeze Spell 5 → 6/);
 assert.match(html,/Electro Owl 2 → 3/);
 assert.match(html,/Review every Home and Builder Base building or trap/);
 assert.match(html,/No timer/);
 assert.equal(JSON.stringify(x),before);
});
test('unknown snapshot does not invent upgrade plan',()=>{
 assert.equal(fullVillagePlan({export:{}}),null);
 assert.equal(fullVillagePlan({export:null}),null);
 assert.match(renderFullVillagePlan({export:null}),/^$/);
});
