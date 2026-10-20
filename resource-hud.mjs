// Full-landscape Home Village HUD template, measured from the user's observed
// 2026 game layout. Rectangle coordinates depend on screenshot HEIGHT and are
// anchored to its right edge so varying phone aspect ratios still work.
// This is a visual hint only: recognized numbers are never applied automatically.
export const HOME_ROWS=Object.freeze([
 {key:'gold',left:.325,right:.131,top:.032,bottom:.077,filter:'white'},
 {key:'elixir',left:.302,right:.131,top:.105,bottom:.154,filter:'normal'},
 {key:'dark',left:.274,right:.130,top:.172,bottom:.218,filter:'normal'},
 {key:'gems',left:.232,right:.131,top:.243,bottom:.285,filter:'normal'}
]);
export function homeHudRects(width,height){
 if(!Number.isSafeInteger(width)||!Number.isSafeInteger(height)||
    height<350||width/height<1.7||width/height>2.65)
  throw Error('Automatic Home counter scanning needs a full landscape game screenshot. Use the crop box for other layouts.');
 return HOME_ROWS.map(row=>{
  const sx=Math.max(0,Math.round(width-row.left*height));
  const ex=Math.min(width,Math.round(width-row.right*height));
  const sy=Math.max(0,Math.round(row.top*height));
  const ey=Math.min(height,Math.round(row.bottom*height));
  if(ex-sx<12||ey-sy<12)throw Error('Screenshot is too small for automatic counter crops.');
  return {key:row.key,filter:row.filter,rect:[sx/width,sy/height,(ex-sx)/width,(ey-sy)/height]};
 });
}
// The bright white fill is retained, while colored resource-bar surfaces,
// glowing purple highlights and black outlines are suppressed. Used only
// on a tight NUMBER crop (not the full game screen).
export function whiteTextPixels(rgba){
 if(!rgba||rgba.length%4!==0)throw Error('Invalid screenshot pixels.');
 const out=new Uint8ClampedArray(rgba.length);
 for(let i=0;i<rgba.length;i+=4){
  const min=Math.min(rgba[i],rgba[i+1],rgba[i+2]);
  const max=Math.max(rgba[i],rgba[i+1],rgba[i+2]);
  const white=min>=155 && max-min<=75?255:0;
  out[i]=white;out[i+1]=white;out[i+2]=white;out[i+3]=255;
 }
 return out;
}
