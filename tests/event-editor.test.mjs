import test from 'node:test';
import assert from 'node:assert/strict';
import {seedState,emptyProfile} from '../core.mjs';
import {rewardSlots,saveRewardDefinition,removeCustomReward,updatePassState,passSummary,getPassState,renderPassRewards} from '../pass-rewards.mjs';

test('additional fixed and either/or rewards persist independently from original inventory',()=>{
 const p=seedState();
 p.resources.gold=123456;
 p.items['Rune of Builder Gold']=7;
 const first=saveRewardDefinition(p,{track:'Event',kind:'fixed',optionA:'750,000 Gold',note:'Special track'});
 const second=saveRewardDefinition(first,{track:'Event',kind:'choice',optionA:'Book of Heroes',optionB:'Rune of Elixir',note:'One of these'});
 assert.equal(passSummary(second).total,51);
 assert.equal(rewardSlots(second).filter(x=>x.track==='Event').length,2);
 const choice=rewardSlots(second).find(x=>x.track==='Event'&&x.kind==='choice');
 assert.equal(choice.options.length,2);
 assert.throws(()=>updatePassState(second,choice.id,'toggle'),/Choose one/);
 const selected=updatePassState(second,choice.id,'choose','Rune of Elixir');
 const claimed=updatePassState(selected,choice.id,'toggle');
 assert.equal(getPassState(claimed).claims[choice.id].claimed,true);
 assert.equal(claimed.items['Rune of Builder Gold'],7);
 assert.equal(claimed.resources.gold,123456);
 assert.equal(passSummary(p).total,49);
});
test('edits original choices and protects already claimed selection',()=>{
 const p=seedState();
 const modified=saveRewardDefinition(p,{id:'G04',track:'Gold',kind:'choice',optionA:'Rune of Gold',optionB:'Rune of Builder Gold',note:'Corrected from phone screenshot'});
 assert.deepEqual(rewardSlots(modified).find(x=>x.id==='G04').options,['Rune of Gold','Rune of Builder Gold']);
 const a=updatePassState(modified,'G04','choose','Rune of Builder Gold');
 const b=updatePassState(a,'G04','toggle');
 assert.throws(()=>saveRewardDefinition(b,{id:'G04',track:'Gold',kind:'choice',optionA:'Rune of Gold',optionB:'Rune of Elixir',note:''}),/Undo/);
 const original=rewardSlots(p).find(x=>x.id==='G04');
 assert.deepEqual(original.options,['Rune of Gold','Rune of Elixir']);
});
test('remove only user-created entries; separate profiles never share rewards',()=>{
 const alt=emptyProfile('#ALT999');
 const first=saveRewardDefinition(alt,{track:'Event',kind:'choice',optionA:'Research Potion',optionB:'Pet Potion'});
 const other=rewardSlots(first)[0].id;
 assert.equal(passSummary(first).total,1);
 assert.equal(passSummary(seedState()).total,49);
 assert.throws(()=>removeCustomReward(seedState(),'G04'),/Only extra/);
 const clean=removeCustomReward(first,other);
 assert.equal(passSummary(clean).total,0);
});
test('HTML rendering escapes user content in event prize name and notes',()=>{
 const p=saveRewardDefinition(seedState(),{track:'Event',kind:'fixed',optionA:'<script>alert(1)</script>',note:'<img onerror="danger">',});
 const html=renderPassRewards(p,'all');
 assert.ok(html.includes('&lt;script&gt;'));
 assert.ok(!html.includes('<script>'));
 assert.ok(!html.includes('<img onerror='));
});
