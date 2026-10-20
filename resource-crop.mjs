// Normalized, image-independent rectangle helpers for touch-friendly resource cropping.
export const CROP_PRESETS=Object.freeze({
 hud:Object.freeze([.52,0,.48,.54]),
 right:Object.freeze([.42,0,.58,1]),
 full:Object.freeze([0,0,1,1])
});
export const MIN_CROP=.025;
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
export function normalizeCrop(rect){
 if(!Array.isArray(rect)||rect.length!==4||!rect.every(Number.isFinite))return [...CROP_PRESETS.hud];
 let [x,y,w,h]=rect;
 x=clamp(x,0,1-MIN_CROP);y=clamp(y,0,1-MIN_CROP);
 w=clamp(w,MIN_CROP,1-x);h=clamp(h,MIN_CROP,1-y);
 return [x,y,w,h];
}
export function draggedCrop(a,b){
 return normalizeCrop([Math.min(a.x,b.x),Math.min(a.y,b.y),Math.abs(b.x-a.x),Math.abs(b.y-a.y)]);
}
export function movedCrop(rect,dx,dy){
 const [x,y,w,h]=normalizeCrop(rect);
 return [clamp(x+dx,0,1-w),clamp(y+dy,0,1-h),w,h];
}
export function sizedCrop(rect,dx,dy){
 const [x,y,w,h]=normalizeCrop(rect);
 return [x,y,clamp(w+dx,MIN_CROP,1-x),clamp(h+dy,MIN_CROP,1-y)];
}
export function cropPixels(imageWidth,imageHeight,region){
 const [x,y,w,h]=normalizeCrop(region);
 if(!Number.isInteger(imageWidth)||!Number.isInteger(imageHeight)||imageWidth<1||imageHeight<1)throw Error('Invalid screenshot size.');
 const left=Math.min(imageWidth-1,Math.floor(imageWidth*x));
 const top=Math.min(imageHeight-1,Math.floor(imageHeight*y));
 const right=Math.min(imageWidth,Math.max(left+1,Math.ceil(imageWidth*(x+w))));
 const bottom=Math.min(imageHeight,Math.max(top+1,Math.ceil(imageHeight*(y+h))));
 return {sx:left,sy:top,sw:right-left,sh:bottom-top};
}
