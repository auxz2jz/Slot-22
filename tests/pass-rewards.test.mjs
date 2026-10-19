import test from 'node:test';
import assert from 'node:assert/strict';
import {passSlots,getPassState,passSummary,updatePassState} from '../pass-rewards.mjs';
import {seedState,emptyProfile} from '../core.mjs';

test('catalog has exactly 30 Silver and 19 Gold slots with 22 choose-one pairs',()=>{
 assert.equal(passSlots.length,49);
 assert.equal(new Set(passSlots.map(x=>x.id)).size,49);
 assert.equal(passSlots.filter(x=>x.track==='Silver').length,30);
 assert.equal(passSlots.filter(x=>x.track==='Gold').length,19);
 assert.equal(passSlots.filter(x=>x.kind==='choice').length,22);
 assert.equal(passSlots.filter(x=>x.track==='Silver'&&x.options[0]==='Chest'&&x.kind==='fixed').length,9);
});
test('exact fixed Silver resources from user list, not double-counting alternating options',()=>{
 const silver=passSlots.filter(x=>x.track==='Silver'&&x.kind==='fixed');
 assert.equal(silver.filter(x=>x.options[0]==='450,000 Gold').length,4);
 assert.equal(silver.filter(x=>x.options[0]==='450,000 Elixir').length,4);
 assert.equal(silver.filter(x=>x.options[0]==='7,500 Dark Elixir').length,4);
 assert.equal(silver.filter(x=>x.options[0]==='Book of Heroes').length,1);
});
test('marking rewards claimed requires explicit choice and does not change item/resource inventory',()=>{
 const user=seedState();const before={resources:structuredClone(user.resources),items:structuredClone(user.items)};
 assert.throws(()=>updatePassState(user,'S08','toggle'),/Choose one/);
 let u=updatePassState(user,'S08','choose','1,000,000 Builder Gold');
 assert.equal(getPassState(u).claims.S08.claimed,false);
 u=updatePassState(u,'S08','toggle');
 assert.equal(getPassState(u).claims.S08.claimed,true);
 assert.equal(passSummary(u).claimed,1);
 assert.deepEqual(u.resources,before.resources);
 assert.deepEqual(u.items,before.items);
 assert.equal(user.seasonalPlan,undefined);
 assert.throws(()=>updatePassState(u,'S08','choose','1,000 Capital Gold'),/Undo claim/);
 u=updatePassState(u,'S08','toggle');
 assert.equal(passSummary(u).claimed,0);
});
test('wrong options and cross-profile reward changes rejected',()=>{
 const profile=emptyProfile('#ANOTHER1');
 assert.throws(()=>updatePassState(profile,'S08','choose','100 Gems'),/Invalid choice/);
 assert.throws(()=>updatePassState(profile,'NOPE','toggle'),/Unknown reward/);
 assert.equal(passSummary(profile).pending,0); // no account-specific event catalog until its rewards are entered
 const changed=updatePassState(seedState(),'G19','toggle');
 assert.equal(passSummary(changed).claimed,1);
});
