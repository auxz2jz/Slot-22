// Phone-friendly local screenshot scanner. Image bytes and OCR text are never
// saved in localStorage, GitHub, or sent to the planner's backend (there is none).
// Open-source Tesseract.js (Apache 2.0) is loaded on demand via an external CDN.
// OCR must always be reviewed and explicitly confirmed before balances change.
import {SCAN_FIELDS,numberText,extractCounterCandidates,suggestCounters,suggestOneCounter,validateResourceUpdates} from './resource-ocr.mjs';
import {CROP_PRESETS,normalizeCrop,draggedCrop,movedCrop,sizedCrop,cropPixels} from './resource-crop.mjs';

const SCRIPT_URL='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
const WORKER_URL='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/worker.min.js';
const LANGUAGE_URL='https://tessdata.projectnaptha.com/4.0.0';
const fmt=n=>numberText(Number.isFinite(n)?n:0);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const CROP_PREF_KEY='slot22-resource-crop-layout-v1';
// Only a normalized rectangle and image aspect ratio are remembered. No screenshots, OCR
// text, resource amounts, file names or image bytes are saved with this preference.
function readCropPrefs(){
 try{
  const p=JSON.parse(localStorage.getItem(CROP_PREF_KEY)||'{}');
  return p&&typeof p==='object'&&!Array.isArray(p)?p:{};
 }catch{return {};}
}
function rememberCrop(kind,rect,image){
 if(!image)return;
 try{
  const prefs=readCropPrefs();
  prefs[kind]={rect:normalizeCrop(rect).map(n=>+n.toFixed(5)),ratio:+(image.naturalWidth/image.naturalHeight).toFixed(3)};
  localStorage.setItem(CROP_PREF_KEY,JSON.stringify(prefs));
 }catch{/* Storage unavailable: the rectangle still works for this tab. */}
}
const areaOptions='<option value="hud">Top-right resource counters (recommended)</option>'+
 '<option value="right">Entire right side</option><option value="full">Whole screenshot</option>'+
 '<option value="custom" hidden>My drawn box</option>';
const filterOptions='<option value="normal">Normal screenshot</option>'+
 '<option value="contrast">High contrast (retry if text is missed)</option>';
const kinds=[['home','Home Village','Gold, Elixir, Dark Elixir and Gems'],
 ['builder','Builder Base','Builder Gold, Builder Elixir and Gems']];
let scriptPromise=null;
async function ocrEngine(){
 if(globalThis.Tesseract?.createWorker)return globalThis.Tesseract;
 if(!scriptPromise){
  scriptPromise=new Promise((resolve,reject)=>{
   const script=document.createElement('script');
   script.src=SCRIPT_URL;script.async=true;script.crossOrigin='anonymous';
   script.onload=()=>globalThis.Tesseract?.createWorker?
     resolve(globalThis.Tesseract):reject(Error('OCR engine loaded without createWorker.'));
   script.onerror=()=>reject(Error('Could not load the OCR engine. Check your internet connection or browser privacy settings.'));
   document.head.append(script);
  }).catch(e=>{scriptPromise=null;throw e});
 }
 return scriptPromise;
}
function sourceCard(profile,kind,title,what){
 const values=SCAN_FIELDS[kind];
 const review=values.map(([key,label])=>
   '<div class="scan-field" data-scan-row="'+key+'">'+
   '<label class="scan-choice"><input type="checkbox" data-scan-use="'+key+'"> <span>'+esc(label)+'</span></label>'+
   '<input type="text" data-scan-value="'+key+'" inputmode="decimal" autocomplete="off" spellcheck="false" '+
    'aria-label="Recognized '+esc(label)+' amount" placeholder="Not detected — optional manual entry">'+
   '<small>Saved: '+fmt(profile?.resources?.[key])+'</small>'+
   '<label class="scan-approx" hidden><input type="checkbox" data-scan-approx="'+key+'"> Accept rounded K/M/B amount</label>'+
   '</div>').join('');
 return '<section class="card scan-village" data-scan-village="'+kind+'">'+
  '<h3>'+esc(title)+'</h3><p class="smallmuted">'+esc(what)+'.</p>'+
  '<label class="field"><span>Choose a screenshot from your phone</span>'+
   '<input type="file" data-scan-file="'+kind+'" accept="image/png,image/jpeg,image/webp,image/*" aria-label="'+esc(title)+' screenshot"></label>'+
  '<div class="scan-settings">'+
   '<label class="field">Crop area<select data-scan-area="'+kind+'">'+areaOptions+'</select></label>'+
   '<label class="field">Read which counter?<select data-scan-target="'+kind+'">'+
   '<option value="stack">All counters in selected box</option>'+
   values.map(([key,label])=>'<option value="'+key+'">Only '+esc(label)+'</option>').join('')+
   '</select></label>'+
   '<label class="field">Text appearance<select data-scan-filter="'+kind+'">'+filterOptions+'</select></label></div>'+
  '<div class="scan-images" hidden><div><small>Draw or move the box on the screenshot</small>'+
   '<div class="scan-editor-scroll"><div class="scan-crop-editor" data-scan-editor="'+kind+'">'+
   '<img data-scan-preview="'+kind+'" draggable="false" alt="Your screenshot with adjustable selection box">'+
   '<div class="scan-crop-layer" data-scan-layer="'+kind+'" aria-label="Drag to choose a resource area">'+
   '<div class="scan-crop-box" data-scan-selection="'+kind+'"><span class="scan-crop-handle" data-scan-handle aria-hidden="true"></span></div>'+
   '</div></div></div>'+
   '<p class="smallmuted scan-crop-help">Draw a box on the screenshot. Drag inside it to move; drag the bottom-right corner to resize. For just one number choose it above. A crop layout is remembered on this device.</p>'+
   '<button type="button" class="btn secondary scan-reset" data-scan-reset-box="'+kind+'">Reset box to upper right</button></div>'+
   '<div><small>Enlarged crop sent to OCR (not uploaded)</small><canvas data-scan-crop="'+kind+'" aria-label="Enlarged selected screenshot crop"></canvas></div></div>'+
  '<button type="button" class="btn secondary scan-read" data-scan-read="'+kind+'" disabled>Read '+esc(title)+' screenshot</button>'+
  '<p class="scan-message smallmuted" data-scan-message="'+kind+'" role="status" aria-live="polite">Select an image to begin.</p>'+
  '<details class="scan-recognized" hidden><summary>Recognized text and numbers</summary><pre data-scan-raw="'+kind+'"></pre>'+
  '<div data-scan-candidates="'+kind+'"></div></details>'+
  '<div class="scan-review"><h4>Review the amounts</h4>'+
   '<p class="smallmuted">Only checked rows will be saved. Verify each number against the screenshot. Missing or uncertain numbers stay unchanged.</p>'+
   '<div class="scan-fields">'+review+'</div></div></section>';
}
export function renderResourceScanner(profile){
 return '<div class="resource-scanner" data-scan-account="'+esc(profile?.playerTag||'')+'">'+
  '<section class="card scan-intro"><span class="kicker">SCREENSHOT RESOURCE SCANNER</span>'+
   '<h2>Read your Clash resource counters</h2>'+
   '<p>Take a screenshot in each village, then choose it here. The scanner reads the upper-right counters on your phone. '+
   'Draw a rectangle tightly around the numbers, move or resize it, or select a single resource line to scan.</p>'+
   '<p class="smallmuted">Your images are processed inside your browser, never saved in your planner or sent to GitHub. '+
   'The open-source OCR engine downloads on first use, so an internet connection is needed. '+
   'OCR can misread digits or rounded amounts. You always approve edits first.</p>'+
   '<p class="smallmuted">Current selected account: <strong>'+esc(profile?.displayName||profile?.playerTag||'Unknown')+
   ' ('+esc(profile?.playerTag||'')+')</strong>. Gems are shared between villages; if both screenshots differ, choose only one Gems entry.</p>'+
   '</section>'+
  '<div class="scan-villages">'+kinds.map(([key,title,what])=>sourceCard(profile,key,title,what)).join('')+'</div>'+
  '<section class="card scan-actions"><h3>Apply verified amounts</h3>'+
   '<p class="smallmuted">Your saved balances will change ONLY after you tap Save checked balances. '+
   'This never spends in-game resources or changes other player profiles. No automatic GitHub sync.</p>'+
   '<div class="row wrap"><button type="button" class="btn" data-scan-save>Save checked balances</button>'+
   '<button type="button" class="btn secondary" data-scan-clear>Clear screenshots and results</button></div>'+
   '<p data-scan-status class="smallmuted" role="status" aria-live="polite"></p>'+
   '</section></div>';
}
async function imageForFile(file){
 if(!file || !/^image\/(png|jpeg|webp)$/i.test(file.type) && !/\.(png|jpe?g|webp)$/i.test(file.name||''))
  throw Error('Choose a PNG, JPEG or WebP screenshot.');
 if(file.size<1||file.size>20*1024*1024)throw Error('Screenshot must be 20 MB or smaller.');
 const url=URL.createObjectURL(file);
 const image=new Image();
 try{
  image.src=url;await image.decode();
  if(!image.naturalWidth||!image.naturalHeight||image.naturalWidth*image.naturalHeight>36e6)
   throw Error('Screenshot is empty or too large to process on a phone.');
  return {image,url};
 }catch(e){URL.revokeObjectURL(url);throw Error('Could not open screenshot. Try a normal PNG or JPEG. '+(e?.message||''));}
}
function croppedCanvas(canvas,image,rect,filter){
 const {sx,sy,sw,sh}=cropPixels(image.naturalWidth,image.naturalHeight,rect);
 // Upscaling improves OCR input visibility; it cannot recreate blurry digits.
 const scale=Math.min(4,2400/sw,1700/sh);
 canvas.width=Math.max(1,Math.round(sw*scale));canvas.height=Math.max(1,Math.round(sh*scale));
 const ctx=canvas.getContext('2d',{willReadFrequently:filter==='contrast'});
 if(!ctx)throw Error('Image processing is unavailable in this browser.');
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.drawImage(image,sx,sy,sw,sh,0,0,canvas.width,canvas.height);
 if(filter==='contrast'){
  const data=ctx.getImageData(0,0,canvas.width,canvas.height),pixels=data.data;
  for(let i=0;i<pixels.length;i+=4){
   const bright=.299*pixels[i]+.587*pixels[i+1]+.114*pixels[i+2];
   const value=bright>150?0:255;
   pixels[i]=value;pixels[i+1]=value;pixels[i+2]=value;
  }
  ctx.putImageData(data,0,0);
 }
 return canvas;
}
function showProposals(section,guess,raw,onlyKey=null){
 const rows=section.querySelectorAll('[data-scan-row]');
 for(const row of rows){
  if(onlyKey&&row.dataset.scanRow!==onlyKey)continue;
  const field=row.querySelector('[data-scan-value]'),checkbox=row.querySelector('[data-scan-use]');
  const approx=row.querySelector('.scan-approx'),confirm=row.querySelector('[data-scan-approx]');
  const proposal=guess.proposed[row.dataset.scanRow];
  field.value=proposal?.display||'';
  checkbox.checked=!!proposal;
  approx.hidden=!proposal?.approximate;
  confirm.checked=false;
 }
 const details=section.querySelector('.scan-recognized');
 details.hidden=false;
 section.querySelector('[data-scan-raw]').textContent=raw||'(OCR did not recognize any text)';
 section.querySelector('[data-scan-candidates]').textContent=guess.candidates.length?
  'Found: '+guess.candidates.map(row=>row.display+(row.label?' ['+row.label+']':'')).join(' · '):
  'No clear number recognized. Draw a tighter box, try High contrast, or enter it manually.';
 const warning=guess.issues.join(' ');
 const proposed=Object.keys(guess.proposed).length;
 section.querySelector('[data-scan-message]').textContent=proposed+
  ' counter'+(proposed===1?'':'s')+' suggested. Review carefully; no amount has been saved. '+warning;
}
export function mountResourceScanner(panel,profile,onCommit){
 if(!panel)throw Error('Missing screenshot scanner panel.');
 const tag=profile.playerTag,loaded=new Map(),regions=new Map();
 let worker=null,busy=false,disposed=false,drag=null;
 const status=(text)=>{if(!disposed){const el=panel.querySelector('[data-scan-status]');if(el)el.textContent=text;}};
 const tell=(kind,text)=>{if(!disposed){const el=panel.querySelector('[data-scan-message="'+kind+'"]');if(el)el.textContent=text;}};
 const paintBox=(kind)=>{
  const box=panel.querySelector('[data-scan-selection="'+kind+'"]');
  if(!box)return;
  const [x,y,w,h]=regions.get(kind)||CROP_PRESETS.hud;
  box.style.left=(x*100)+'%';box.style.top=(y*100)+'%';
  box.style.width=(w*100)+'%';box.style.height=(h*100)+'%';
 };
 const updateCrop=(kind)=>{
  const v=loaded.get(kind);if(!v)return;
  const section=panel.querySelector('[data-scan-village="'+kind+'"]');
  paintBox(kind);
  croppedCanvas(section.querySelector('[data-scan-crop]'),v.image,
   regions.get(kind)||CROP_PRESETS.hud,section.querySelector('[data-scan-filter]').value);
 };
 const changeRegion=(kind,rect,finished=false)=>{
  regions.set(kind,normalizeCrop(rect));
  paintBox(kind);
  const section=panel.querySelector('[data-scan-village="'+kind+'"]');
  section.querySelector('[data-scan-area]').value='custom';
  if(finished){
   rememberCrop(kind,regions.get(kind),loaded.get(kind)?.image);
   updateCrop(kind);
   tell(kind,'Box updated. Choose which counter to read and tap Read screenshot. Previous results remain editable; verify every checked value.');
  }
 };
 const resetRegion=(kind)=>{
  regions.set(kind,[...CROP_PRESETS.hud]);
  panel.querySelector('[data-scan-area="'+kind+'"]').value='hud';
  rememberCrop(kind,regions.get(kind),loaded.get(kind)?.image);
  updateCrop(kind);
  tell(kind,'Selection reset to upper right. Tap Read screenshot to scan.');
 };
 const choose=async(kind,file)=>{
  const section=panel.querySelector('[data-scan-village="'+kind+'"]');
  const previous=loaded.get(kind);
  if(previous)URL.revokeObjectURL(previous.url);
  loaded.delete(kind);
  section.querySelector('[data-scan-read]').disabled=true;
  section.querySelector('.scan-images').hidden=true;
  section.querySelector('.scan-recognized').hidden=true;
  const blank={proposed:{},candidates:[],issues:[]};
  showProposals(section,blank,'');section.querySelector('.scan-recognized').hidden=true;
  if(!file){tell(kind,'Choose a screenshot to begin.');return;}
  try{
   const info=await imageForFile(file);
   if(disposed){URL.revokeObjectURL(info.url);return;}
   loaded.set(kind,info);
   const remembered=readCropPrefs()[kind],ratio=info.image.naturalWidth/info.image.naturalHeight;
   if(remembered?.rect&&Number.isFinite(remembered.ratio)&&
       Math.abs(Math.log(ratio/remembered.ratio))<.15){
    regions.set(kind,normalizeCrop(remembered.rect));
    section.querySelector('[data-scan-area]').value='custom';
   }else{
    const area=section.querySelector('[data-scan-area]').value;
    regions.set(kind,[...(CROP_PRESETS[area]||CROP_PRESETS.hud)]);
    if(area==='custom')section.querySelector('[data-scan-area]').value='hud';
   }
   section.querySelector('[data-scan-preview]').src=info.url;
   section.querySelector('.scan-images').hidden=false;
   updateCrop(kind);
   section.querySelector('[data-scan-read]').disabled=false;
   tell(kind,'Screenshot opened. Check the cropped resource counters, then tap Read screenshot.');
   status('No resource balances have been changed.');
  }catch(e){tell(kind,e.message);status(e.message);}
 };
 const begin=async(kind)=>{
  const section=panel.querySelector('[data-scan-village="'+kind+'"]');
  if(busy||!loaded.get(kind))return;
  const selectedImage=loaded.get(kind);
  busy=true;
  panel.querySelectorAll('[data-scan-read]').forEach(b=>b.disabled=true);
  tell(kind,'Preparing OCR. The first scan may take a minute while language data downloads…');
  try{
   const engine=await ocrEngine();
   if(disposed||loaded.get(kind)!==selectedImage)return;
   if(!worker)worker=await engine.createWorker('eng',1,{
    workerPath:WORKER_URL,langPath:LANGUAGE_URL,
    logger:e=>{if(e.status==='recognizing text')tell(kind,'Reading resource numbers: '+Math.round((e.progress||0)*100)+'%');}
   });
   if(disposed||loaded.get(kind)!==selectedImage)return;
   const target=section.querySelector('[data-scan-target]').value;
   await worker.setParameters({tessedit_pageseg_mode:target==='stack'?'11':'7'});
   const canvas=section.querySelector('[data-scan-crop]');
   updateCrop(kind);
   const result=await worker.recognize(canvas);
   if(disposed||loaded.get(kind)!==selectedImage)return;
   const raw=result?.data?.text||'';
   const found=extractCounterCandidates(raw);
   const guess=target==='stack'?suggestCounters(found,kind):
    suggestOneCounter(found,kind,target);
   showProposals(section,guess,raw,target==='stack'?null:target);
   status('OCR is finished. Check every proposed amount before saving.');
  }catch(e){
   if(!disposed){tell(kind,'OCR failed: '+(e?.message||'Unknown error')+'. Check the internet connection, try High contrast, or enter values manually.');status('Nothing was saved.');}
  }finally{
   busy=false;
   if(!disposed)panel.querySelectorAll('[data-scan-read]').forEach(b=>b.disabled=!loaded.has(b.dataset.scanRead));
  }
 };
 const save=()=>{
  if(disposed||busy){status('Wait for the current scan to finish.');return;}
  try{
   const changes=[...panel.querySelectorAll('[data-scan-use]:checked')].map(b=>{
    const row=b.closest('[data-scan-row]');
    return {key:b.dataset.scanUse,value:row.querySelector('[data-scan-value]').value,
     acceptApproximate:!!row.querySelector('[data-scan-approx]')?.checked};
   });
   const values=validateResourceUpdates(profile,changes);
   if(tag!==panel.dataset.scanAccount)throw Error('Selected player account changed. Try again.');
   onCommit(tag,values);
   // Prevent accidental repeat saves from a second scan or a stale checkbox.
   for(const input of panel.querySelectorAll('[data-scan-use]:checked'))input.checked=false;
   for(const [key,value] of Object.entries(values)){
    for(const row of panel.querySelectorAll('[data-scan-row="'+key+'"]')){
     const savedLabel=row.querySelector('small');
     if(savedLabel)savedLabel.textContent='Saved: '+fmt(value);
    }
   }
   const summary=Object.entries(values).map(([k,v])=>k+' '+fmt(v)).join(', ');
   status('Saved locally: '+summary+'. Your screenshots were not stored.');
  }catch(e){status('Not saved: '+(e?.message||'Unknown error'));}
 };
 // Pointer Events cover finger and mouse; no image content is stored by the editor.
 const pointerPoint=(layer,event)=>{
  const b=layer.getBoundingClientRect();
  return {x:Math.min(1,Math.max(0,(event.clientX-b.left)/Math.max(b.width,1))),
   y:Math.min(1,Math.max(0,(event.clientY-b.top)/Math.max(b.height,1)))};
 };
 panel.addEventListener('pointerdown',event=>{
  const layer=event.target.closest('[data-scan-layer]');
  if(!layer||busy||event.button!==0)return;
  const kind=layer.dataset.scanLayer;
  if(!loaded.has(kind))return;
  const start=pointerPoint(layer,event),origin=[...(regions.get(kind)||CROP_PRESETS.hud)];
  const type=event.target.closest('[data-scan-handle]')?'resize':
   event.target.closest('[data-scan-selection]')?'move':'draw';
  drag={kind,id:event.pointerId,type,start,origin,layer};
  layer.setPointerCapture(event.pointerId);event.preventDefault();
 });
 panel.addEventListener('pointermove',event=>{
  if(!drag||drag.id!==event.pointerId)return;
  const p=pointerPoint(drag.layer,event),dx=p.x-drag.start.x,dy=p.y-drag.start.y;
  const rect=drag.type==='move'?movedCrop(drag.origin,dx,dy):
   drag.type==='resize'?sizedCrop(drag.origin,dx,dy):draggedCrop(drag.start,p);
  changeRegion(drag.kind,rect);
 });
 const endDrag=(event,cancel=false)=>{
  if(!drag||drag.id!==event.pointerId)return;
  const prev=drag;drag=null;
  if(cancel){regions.set(prev.kind,prev.origin);paintBox(prev.kind);return;}
  const p=pointerPoint(prev.layer,event),dx=p.x-prev.start.x,dy=p.y-prev.start.y;
  const rect=prev.type==='move'?movedCrop(prev.origin,dx,dy):
   prev.type==='resize'?sizedCrop(prev.origin,dx,dy):draggedCrop(prev.start,p);
  changeRegion(prev.kind,rect,true);
 };
 panel.addEventListener('pointerup',event=>endDrag(event));
 panel.addEventListener('pointercancel',event=>endDrag(event,true));
 panel.addEventListener('change',event=>{
  const target=event.target;
  if(target.matches('[data-scan-file]'))void choose(target.dataset.scanFile,target.files?.[0]);
  else if(target.matches('[data-scan-area]')){
   const kind=target.dataset.scanArea;
   if(loaded.has(kind)&&CROP_PRESETS[target.value]){
    regions.set(kind,[...CROP_PRESETS[target.value]]);
    rememberCrop(kind,regions.get(kind),loaded.get(kind).image);
    updateCrop(kind);
    tell(kind,'Crop preset changed. Tap Read screenshot to scan the new area.');
   }
  }else if(target.matches('[data-scan-filter],[data-scan-target]')){
   const kind=target.dataset.scanFilter||target.dataset.scanTarget;
   if(loaded.has(kind)){
    if(target.matches('[data-scan-filter]'))updateCrop(kind);
    tell(kind,'Setting updated. Tap Read screenshot to read this selection.');
   }
  }
 });
 panel.addEventListener('input',event=>{
  const input=event.target;
  if(input.matches('[data-scan-value]')){
   const row=input.closest('[data-scan-row]');
   row.querySelector('[data-scan-use]').checked=!!input.value.trim();
  }
 });
 panel.addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(!button)return;
  if(button.dataset.scanRead)void begin(button.dataset.scanRead);
  if(button.dataset.scanResetBox&&loaded.has(button.dataset.scanResetBox))resetRegion(button.dataset.scanResetBox);
  if(button.hasAttribute('data-scan-save'))save();
  if(button.hasAttribute('data-scan-clear')){
   if(busy){status('Wait for OCR to finish before clearing screenshots.');return;}
   for(const v of loaded.values())URL.revokeObjectURL(v.url);
   loaded.clear();regions.clear();
   for(const section of panel.querySelectorAll('.scan-village')){
    section.querySelector('[data-scan-file]').value='';
    section.querySelector('.scan-images').hidden=true;
    section.querySelector('.scan-recognized').hidden=true;
    section.querySelector('[data-scan-read]').disabled=true;
    section.querySelector('[data-scan-message]').textContent='Select an image to begin.';
    showProposals(section,{proposed:{},candidates:[],issues:[]},'');
    section.querySelector('.scan-recognized').hidden=true;
   }
   status('Scans cleared. Existing saved balances have not changed.');
  }
 });
 return ()=>{disposed=true;for(const v of loaded.values())URL.revokeObjectURL(v.url);loaded.clear();regions.clear();if(worker)void worker.terminate().catch(()=>{});};
}
