import test from 'node:test';
import assert from 'node:assert/strict';
import {helperActionRecommendations} from '../helper-advice.mjs';
import {renderHelperRecommendations,renderHelperStrip} from '../insights-view.mjs';
const exportState={timestamp:1792438344,
 helpers:[{data:93000000,lvl:7,helper_cooldown:46115},{data:93000001,lvl:8},
 {data:93000002,lvl:3},{data:93000003,lvl:1}],
 buildings:[{data:1000014,lvl:9,timer:184220},{data:1000020,lvl:6,timer:239653},
 {data:1000068,lvl:3,timer:32983}],
 heroes:[{data:28000001,lvl:48}],
 spells:[{data:26000005,lvl:4,timer:86096}],units:[],siege_machines:[]};
test('saved village generates four separate assistant actions and no false ready state',()=>{
 const a=helperActionRecommendations({export:exportState,resources:{shiny:940,glowy:222,starry:11}});
 assert.deepEqual(a.map(x=>x.id),[93000000,93000001,93000002,93000003]);
 assert.equal(a[0].availability,'cooldown-recorded');
 assert.equal(a[0].detail.id,1000020);
 assert.match(a[0].action,/Spell Factory/);
 assert.equal(a[0].cooldownEnd,(exportState.timestamp+46115)*1000);
 assert.match(a[1].action,/Freeze Spell/);
 assert.equal(a[1].availability,'verify');
 assert.match(a[1].note,/not Star Laboratory/);
 assert.match(a[2].action,/surplus resources/);
 assert.match(a[2].note,/no current resource balances/i);
 assert.match(a[3].action,/specific Hero Equipment/);
 assert.match(a[3].note,/940 Shiny/);
 assert.ok(a.every(h=>h.workdayNote.includes('23-hour workday')));
 assert.equal(new Set(a.map(h=>h.resetAt)).size,1);
});
test('assistant workday reset does not prove other assistant availability or use',()=>{
 const a=helperActionRecommendations({export:exportState});
 assert.equal(a[0].availability,'cooldown-recorded');
 for(const h of a.slice(1))assert.equal(h.availability,'verify');
});
test('Builder Apprentice suggestion selects longest running Home building, not a finished hero or Builder Base',()=>{
 const a=helperActionRecommendations({export:{...exportState,
 buildings:[{data:1000000,lvl:10,timer:120},{data:1000027,lvl:7,timer:200000}],
 buildings2:[{data:1000046,lvl:7,timer:900000}],
 heroes:[{data:28000001,lvl:48}]}})[0];
 assert.match(a.action,/Inferno Tower/);
});
test('missing helper rows or missing export never invent assistant availability',()=>{
 assert.deepEqual(helperActionRecommendations({export:{timestamp:1000,helpers:[]}}),[]);
 assert.deepEqual(helperActionRecommendations({export:null}),[]);
 assert.deepEqual(helperActionRecommendations({export:{helpers:[{data:93000001,lvl:8}]}}),[]);
});
test('recommendation panel renders all four helpers with cautious cooldown badge',()=>{
 const p={export:exportState,resources:{shiny:940,glowy:222,starry:11}};
 const html=renderHelperRecommendations(p);
 assert.match(html,/what your assistants should do next/i);
 for(const id of [93000000,93000001,93000002,93000003])assert.match(html,new RegExp('data-helper-advice="'+id+'"'));
 assert.match(html,/Spell Factory/);
 assert.match(html,/Freeze Spell/);
 assert.match(html,/Alchemist/);
 assert.match(html,/Prospector/);
 assert.match(html,/data-helper-cooldown-end/);
 assert.match(renderHelperStrip(p),/Helper action recommendations|What your assistants should do next/i);
});
