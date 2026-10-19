import test from 'node:test';
import assert from 'node:assert/strict';
import {routineTasks,ensureHelperRoadmap} from '../helper-plan.mjs';

const original={
 playerTag:'#QVLP9RVV',export:{helpers:[{data:93000000,lvl:7},{data:93000001,lvl:8},{data:93000002,lvl:3}]},
 seasonalPlan:{goldPassPurchased:true,claims:{G04:{claimed:true,selected:'Rune of Elixir'}}},
 resources:{gold:19000000,gems:4023},items:{'Book of Building':2},
 roadmap:[{id:'H-01',status:'active',title:'Existing upgrade'}]
};
test('Helper Hut tasks are added exactly once and do not alter existing upgrades or items',()=>{
 const result=ensureHelperRoadmap(original);
 assert.equal(result.added,5);
 const p=result.profile;
 assert.equal(p.roadmap.length,6);
 assert.ok(p.roadmap.some(x=>x.id==='HP-01'&&x.recurring));
 assert.ok(p.roadmap.some(x=>x.id==='HP-04'&&x.note.includes('does not confirm')));
 assert.deepEqual(p.resources,original.resources);
 assert.deepEqual(p.items,original.items);
 assert.deepEqual(p.seasonalPlan,original.seasonalPlan);
 assert.equal(p.roadmap.find(x=>x.id==='H-01').status,'active');
 assert.equal(original.roadmap.length,1);
 const again=ensureHelperRoadmap(p);
 assert.equal(again.added,0);
 assert.equal(again.profile,p);
});
test('Prospector is not presumed from helpers alone and third helper remains conditional',()=>{
 const p={...original,export:{helpers:[{data:93000000,lvl:1}]},seasonalPlan:{goldPassPurchased:false}};
 const tasks=routineTasks(p);
 assert.deepEqual(tasks.map(x=>x.id),['HP-01','HP-05']);
 assert.ok(tasks.every(x=>x.cost===0));
});
test('without game helper evidence, other profiles are not assigned main account helpers',()=>{
 const p={playerTag:'#SECOND1',export:null,roadmap:[],resources:{},items:{}};
 assert.equal(ensureHelperRoadmap(p).added,0);
 assert.equal(ensureHelperRoadmap(p).profile,p);
});
