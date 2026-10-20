import test from 'node:test';
import assert from 'node:assert/strict';
import {homeHudRects,whiteTextPixels} from '../resource-hud.mjs';
import {cropPixels} from '../resource-crop.mjs';

test('2026 landscape screenshot maps number-only rows in correct vertical order',()=>{
 const rows=homeHudRects(1536,716);
 assert.deepEqual(rows.map(r=>r.key),['gold','elixir','dark','gems']);
 const rects=rows.map(r=>cropPixels(1536,716,r.rect));
 assert.deepEqual(rects.map(x=>x.sy),[23,75,123,174]);
 for(let i=0;i<rects.length;i++){
  const r=rects[i];
  assert.ok(r.sx>1250&&r.sx+r.sw<1460&&r.sw>55);
  assert.ok(r.sh>25&&r.sh<50);
 }
 assert.equal(rows[0].filter,'white');
 assert.ok(rows.slice(1).every(r=>r.filter==='normal'));
});
test('auto HUD requires game-shaped landscape screenshot',()=>{
 assert.throws(()=>homeHudRects(716,1536),/full landscape/);
 assert.throws(()=>homeHudRects(1536,300),/full landscape/);
 assert.throws(()=>homeHudRects(6000,716),/full landscape/);
});
test('bright glyph mask eliminates colored UI without retaining text values',()=>{
 const pixels=new Uint8ClampedArray([245,240,232,255,240,55,210,255,50,50,50,255,170,165,160,255]);
 assert.deepEqual([...whiteTextPixels(pixels)],
 [255,255,255,255,0,0,0,255,0,0,0,255,255,255,255]);
 assert.throws(()=>whiteTextPixels([1,2,3]),/Invalid/);
});
