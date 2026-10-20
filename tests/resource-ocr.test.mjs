import test from 'node:test';
import assert from 'node:assert/strict';
import {SCAN_FIELDS,parseCounterAmount,extractCounterCandidates,suggestCounters,suggestOneCounter,validateResourceUpdates} from '../resource-ocr.mjs';

test('read whole numbers with normal commas, spaces and periods',()=>{
 for(const variant of ['19,000,000','19.000.000','19 000 000','19000000']){
  assert.deepEqual(parseCounterAmount(variant)?.value,19000000);
  assert.equal(parseCounterAmount(variant)?.approximate,false);
 }
 assert.equal(parseCounterAmount('4,049')?.value,4049);
 assert.equal(parseCounterAmount('0')?.value,0);
});
test('abbreviations are flagged approximate, never silently treated as exact',()=>{
 for(const [v,n] of [['19M',19000000],['1.5M',1500000],['1,5M',1500000],['408.5K',408500],['2B',2000000000]]){
  assert.equal(parseCounterAmount(v)?.value,n);
  assert.equal(parseCounterAmount(v)?.approximate,true);
 }
 assert.equal(parseCounterAmount('19M')?.display,'19M');
 assert.equal(parseCounterAmount('1,234.7M'),null);
});
test('rejects unrelated UI numbers, malformed grouping and implausibly huge values',()=>{
 for(const s of ['4/5','Lvl 13','Shield 3h','12:34','4,20','12.34.56','12abc','-20','1000000000000000','3.000.00']){
  assert.equal(parseCounterAmount(s),null,s);
 }
});
test('OCR ignores max capacities and extracts home resource order only when complete',()=>{
 const text='Max: 22 000 000\n19 000 000\nMax: 22 000 000\n17 500 000\n408 530\n4 049\n';
 const found=extractCounterCandidates(text);
 assert.deepEqual(found.map(r=>r.value),[19000000,17500000,408530,4049]);
 const guess=suggestCounters(found,'home');
 assert.deepEqual(Object.fromEntries(Object.entries(guess.proposed).map(([k,v])=>[k,v.value])),
   {gold:19000000,elixir:17500000,dark:408530,gems:4049});
});
test('partial and extra OCR lines must not be guessed by position',()=>{
 const partial=suggestCounters(extractCounterCandidates('19,000,000\n408,530\n4,049'), 'home');
 assert.deepEqual(partial.proposed,{});
 assert.ok(partial.issues.length>0);
 const surplus=suggestCounters(extractCounterCandidates('7,000,000\n4,000,000\n200\n2,333\n444'),'home');
 assert.deepEqual(surplus.proposed,{});
});
test('label matching survives a missing line without shifting other resources',()=>{
 const v=suggestCounters(extractCounterCandidates('Gold: 9,999,999\nDark Elixir: 345,678'),'home');
 assert.equal(v.proposed.gold.value,9999999);
 assert.equal(v.proposed.dark.value,345678);
 assert.equal(v.proposed.elixir,undefined);
});
test('Builder screenshot proposes only expected resource keys',()=>{
 const rows=extractCounterCandidates('2 500 000\n1 765 000\n4,049');
 const r=suggestCounters(rows,'builder');
 assert.equal(r.proposed.builderGold.value,2500000);
 assert.equal(r.proposed.builderElixir.value,1765000);
 assert.equal(r.proposed.gems.value,4049);
 assert.equal(SCAN_FIELDS.builder.length,3);
});
test('confirm enforces checked valid fields and conflicting shared gems',()=>{
 const profile={playerTag:'#QVLP9RVV',resources:{gold:8888,gems:777}};
 assert.deepEqual(validateResourceUpdates(profile,[{key:'gold',value:'19,000,000'}]),{gold:19000000});
 assert.equal(profile.resources.gold,8888,'pure validation must never mutate');
 assert.throws(()=>validateResourceUpdates(profile,[]),/Select/);
 assert.throws(()=>validateResourceUpdates(profile,[{key:'dark',value:''}]),/Check/);
 assert.throws(()=>validateResourceUpdates(profile,[{key:'shiny',value:42}]),/Unrecognized/);
 assert.throws(()=>validateResourceUpdates(profile,[{key:'gold',value:'1.5M'}]),/approximate/);
 assert.deepEqual(validateResourceUpdates(profile,[{key:'gold',value:'1.5M',acceptApproximate:true}]),{gold:1500000});
 assert.throws(()=>validateResourceUpdates(profile,[{key:'gems',value:'1,000'},{key:'gems',value:'1,001'}]),/disagree/);
 assert.deepEqual(validateResourceUpdates(profile,[{key:'gems',value:'1,000'},{key:'gems',value:'1000'}]),{gems:1000});
});

test('one-counter selection assigns only its chosen resource with a single clean reading',()=>{
 const found=extractCounterCandidates('19,000,000');
 const r=suggestOneCounter(found,'home','gold');
 assert.equal(r.proposed.gold.value,19000000);
 assert.deepEqual(Object.keys(r.proposed),['gold']);
 assert.deepEqual(suggestOneCounter(found,'home','elixir').proposed.elixir.value,19000000);
 assert.deepEqual(suggestOneCounter(extractCounterCandidates('Gold 19,000,000'),'home','elixir').proposed,{});
 assert.deepEqual(suggestOneCounter(extractCounterCandidates('19,000,000\\n123'),'home','gold').proposed,{});
 assert.deepEqual(suggestOneCounter([],'home','gold').proposed,{});
 assert.throws(()=>suggestOneCounter(found,'builder','dark'),/Invalid/);
 const rounded=suggestOneCounter(extractCounterCandidates('19M'),'home','gold');
 assert.equal(rounded.proposed.gold.approximate,true);
 assert.ok(rounded.issues.some(x=>x.includes('rounded')));
});
