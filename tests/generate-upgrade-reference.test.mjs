import test from 'node:test';
import assert from 'node:assert/strict';
import {compileUpgradeRecord} from '../scripts/generate-upgrade-reference.mjs';
const d=(days=0,hours=0,minutes=0,seconds=0)=>({days,hours,minutes,seconds});
test('converts Home construction to price, resource, seconds and TH requirements',()=>{
 const r=compileUpgradeRecord({dataId:1000008,name:'Cannon',levels:[
  {level:7,buildCost:500000,buildCostResource:'Gold',buildTime:d(2),
   townHallRequired:6}
 ]},'data/home/defenses/cannon.json');
 assert.equal(r.key,'buildings:1000008');
 assert.deepEqual([r.levels[0].c,r.levels[0].r,r.levels[0].s,r.levels[0].th],
 [500000,'gold',172800,6]);
});
test('Home research and Builder research retain laboratory gating',()=>{
 const home=compileUpgradeRecord({dataId:4000000,name:'Barbarian',levels:[
  {level:13,researchCost:24000000,researchCostResource:'Elixir',
   laboratoryRequired:16,researchTime:d(12,12)}
 ]},'data/home/troops/barbarian.json');
 const builder=compileUpgradeRecord({dataId:4000031,name:'Raged Barbarian',levels:[
  {level:14,researchCost:500000,researchCostResource:'Builder Elixir',
   starLabRequired:8,researchTime:d(4,3)}
 ]},'data/builder/troops/raged-barbarian.json');
 assert.equal(home.key,'units:4000000');
 assert.equal(home.levels[0].lab,16);
 assert.equal(builder.key,'units2:4000031');
 assert.equal(builder.levels[0].sl,8);
 assert.equal(builder.levels[0].r,'builderElixir');
});
test('Hero Equipment ore requirements never become an invented Gold/Elixir price',()=>{
 const r=compileUpgradeRecord({dataId:90000004,name:'Eternal Tome',levels:[
  {level:9,blacksmithLevelRequired:1,
   upgradeShinyOre:1800,upgradeGlowingOre:200,upgradeStarryOre:0}
 ]},'data/home/hero-equipment/eternal-tome.json');
 assert.equal(r.key,'equipment:90000004');
 assert.deepEqual(r.levels[0].ore,[1800,200,0]);
 assert.equal(r.levels[0].c,null);
 assert.equal(r.levels[0].bs,1);
});
test('invalid, unfamiliar or ambiguous raw files do not enter the catalog',()=>{
 assert.equal(compileUpgradeRecord({dataId:1,levels:[{level:1}]},'data/clan/buildings/foo.json'),null);
 assert.equal(compileUpgradeRecord({dataId:'1000008',levels:[{level:1}]},'data/home/defenses/foo.json'),null);
 assert.equal(compileUpgradeRecord({dataId:11,levels:[{level:0}]},'data/home/defenses/foo.json'),null);
 assert.equal(compileUpgradeRecord({dataId:11,levels:[{level:1},{level:1}]},'data/home/defenses/foo.json'),null);
});

test('Supercharge costs and times remain separate from normal numbered building levels',()=>{
 const raw={dataId:1000013,name:'Mortar',levels:[
  {level:1,buildCost:5000,buildCostResource:'Gold',buildTime:d(0,0,30)},
  {level:2,buildCost:25000,buildCostResource:'Gold',buildTime:d(0,1)},
  {level:1,supercharge:true,buildCost:9000000,buildCostResource:'Gold',buildTime:d(4)},
  {level:2,supercharge:true,buildCost:7000000,buildCostResource:'Gold',buildTime:d(6)}]};
 const result=compileUpgradeRecord(raw,'data/home/defenses/mortar.json');
 assert.equal(result.levels.length,2);
 assert.equal(result.superchargeLevels.length,2);
 assert.equal(result.levels[0].c,5000);
 assert.equal(result.superchargeLevels[0].c,9000000);
 assert.equal(result.superchargeLevels[0].s,4*86400);
});
