import test from 'node:test';
import assert from 'node:assert/strict';
import {CROP_PRESETS,normalizeCrop,draggedCrop,movedCrop,sizedCrop,cropPixels} from '../resource-crop.mjs';
test('preset and drag rectangle stay within screenshot',()=>{
 assert.deepEqual(normalizeCrop(CROP_PRESETS.full),[0,0,1,1]);
 assert.deepEqual(draggedCrop({x:.9,y:.7},{x:.6,y:.4}),[.6,.4,.30000000000000004,.29999999999999993]);
 const a=draggedCrop({x:.5,y:.4},{x:.5,y:.4});
 assert.ok(a[2]>0&&a[3]>0);
 assert.deepEqual(normalizeCrop([NaN,0,.1,.1]),CROP_PRESETS.hud);
});
test('touch move/resize clamp region, never crop outside image',()=>{
 assert.deepEqual(movedCrop([.7,.1,.2,.3],.5,-.7),[.8,0,.2,.3]);
 assert.deepEqual(sizedCrop([.7,.1,.2,.3],1,1),[.7,.1,.30000000000000004,.9]);
 assert.deepEqual(cropPixels(1200,600,[.5,0,.5,.5]),{sx:600,sy:0,sw:600,sh:300});
 const v=cropPixels(10,10,[.98,.98,.01,.01]);
 assert.ok(v.sx>=0&&v.sy>=0&&v.sx+v.sw<=10&&v.sy+v.sh<=10);
 assert.throws(()=>cropPixels(0,600,CROP_PRESETS.hud),/Invalid/);
});
