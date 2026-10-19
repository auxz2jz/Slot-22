import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
const chrome=spawn(process.env.CHROME_PATH||'/usr/bin/google-chrome',['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-port=9431','--user-data-dir=/tmp/clash-chrome-'+process.pid,'about:blank'],{stdio:'ignore'});
let ws,failures=[];
try{
 let target;
 for(let i=0;i<40;i++){
  try{const pages=await(await fetch('http://127.0.0.1:9431/json')).json();target=pages.find(x=>x.type==='page');if(target)break;}catch{}
  await delay(250);
 }
 if(!target)throw Error('Chrome debugger unavailable');
 ws=new WebSocket(target.webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
 let seq=0;const pending=new Map();
 ws.addEventListener('message',e=>{
  const m=JSON.parse(String(e.data));
  if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);}
  else if(['Runtime.exceptionThrown','Log.entryAdded','Network.loadingFailed'].includes(m.method)){
   const v=m.params.exceptionDetails||m.params.entry||m.params;
   failures.push(m.method+': '+JSON.stringify(v).slice(0,2300));
  }
 });
 const cmd=(method,params={})=>new Promise(resolve=>{let id=++seq;pending.set(id,resolve);ws.send(JSON.stringify({id,method,params}))});
 await cmd('Runtime.enable');await cmd('Log.enable');await cmd('Network.enable');await cmd('Page.enable');
 await cmd('Page.navigate',{url:'http://127.0.0.1:8765/index.html'});
 await delay(3500);
 const res=await cmd('Runtime.evaluate',{expression:'document.body.innerText.slice(0,2200)',returnByValue:true});
 const body=res.result?.result?.value||'';
 console.log('RENDERED TEXT:\n'+body.slice(0,1200));
 const artwork=await cmd('Runtime.evaluate',{expression:"({overview:document.querySelectorAll('img.item-art').length,loaded:[...document.querySelectorAll('img.item-art')].filter(i=>i.complete&&i.naturalWidth>0).length,first:[...document.querySelectorAll('img.item-art')].slice(0,3).map(i=>i.src)})",returnByValue:true});
 const counts=artwork.result?.result?.value||{};
 console.log('ARTWORK:',counts);
 const upgradeEstimate=await cmd('Runtime.evaluate',{expression:`(()=>{
   const tile=document.querySelector('.queue-tile'),label=tile?.querySelector('[data-timer-end]');
   const bar=tile?.querySelector('[data-timer-progress]'),percent=tile?.querySelector('[data-timer-percent]');
   const saved=JSON.parse(localStorage.getItem('clash-slot22-state-v2'));
   const ex=saved.profiles[saved.activeProfileId].export;
   const finishes=Object.values(ex).filter(Array.isArray).flatMap(rows=>rows.filter(row=>Number.isFinite(row.timer)).map(row=>(ex.timestamp+row.timer)*1000));
   return {tile:!!tile,finish:!!tile?.querySelector('.queue-finish'),bar:!!bar,percent:!!percent,match:finishes.includes(Number(label?.dataset.timerEnd))};
 })()`,returnByValue:true});
 const estimateResult=upgradeEstimate.result?.result?.value||{};
 console.log('UPGRADE ETA / PROGRESS UI:',estimateResult);

 const freeBuilderBanner=await cmd('Runtime.evaluate',{expression:`(()=>{
  const banner=document.querySelector('.builder-nudge');
  return {visible:!!banner,spell:banner?.textContent.includes('Spell Factory 6 → 7'),
   modal:!!document.getElementById('builder-dialog')};
 })()`,returnByValue:true});
 const bannerState=freeBuilderBanner.result?.result?.value||{};
 console.log('AVAILABLE HOME BUILDER / NEXT UPGRADE:',bannerState);
 if(!bannerState.visible||!bannerState.spell||!bannerState.modal)process.exitCode=1;
 // Simulate the same user's newer in-game export in isolated Chrome localStorage.
 const builderPopup=await cmd('Runtime.evaluate',{expression:`(async()=>{
  const bundle=JSON.parse(localStorage.getItem('clash-slot22-state-v2'));
  const player=bundle.profiles[bundle.activeProfileId];
  const newer=structuredClone(player.export);
  newer.timestamp+=60;
  const input=document.getElementById('game-file');
  const transfer=new DataTransfer();
  transfer.items.add(new File([JSON.stringify(newer)],'fresh-builder.json',{type:'application/json'}));
  input.files=transfer.files;
  input.dispatchEvent(new Event('change',{bubbles:true}));
  await new Promise(r=>setTimeout(r,120));
  const dialog=document.getElementById('builder-dialog');
  const shown=dialog.open&&dialog.textContent.includes('Spell Factory 6 → 7');
  const homeLab=dialog.textContent.includes('Freeze Spell 4 → 5');
  const starLab=dialog.textContent.includes('Hog Glider 15 → 16');
  const separateQueues=!!dialog.querySelector('[data-alert-queue="laboratory"]')&&!!dialog.querySelector('[data-alert-queue="starLaboratory"]');
  dialog.querySelector('[data-action="builder-dismiss"]')?.click();
  await new Promise(r=>setTimeout(r,60));
  const after=JSON.parse(localStorage.getItem('clash-slot22-state-v2'));
  const saved=after.profiles[after.activeProfileId];
  const acknowledged=saved.builderPromptDismissedAt===newer.timestamp;
  input.files=transfer.files;
  input.dispatchEvent(new Event('change',{bubbles:true}));
  await new Promise(r=>setTimeout(r,120));
  return {shown,homeLab,starLab,separateQueues,acknowledged,notRepeated:!dialog.open,untouchedResources:saved.resources.gold===player.resources.gold,
   freshSnapshot:saved.export.timestamp===newer.timestamp};
 })()`,awaitPromise:true,returnByValue:true});
 const popupResult=builderPopup.result?.result?.value||{};
 console.log('FRESH JSON BUILDER POPUP:',popupResult);
 if(!['shown','homeLab','starLab','separateQueues','acknowledged','notRepeated','untouchedResources','freshSnapshot'].every(k=>popupResult[k]===true))process.exitCode=1;

// A Laboratory can trigger on a newer JSON even when all construction builders are busy.
 const researchOnly=await cmd('Runtime.evaluate',{expression:`(async()=>{
  const saved=JSON.parse(localStorage.getItem('clash-slot22-state-v2'));
  const p=saved.profiles[saved.activeProfileId],newer=structuredClone(p.export);
  newer.timestamp+=90;
  newer.buildings.push({data:1000097,lvl:1,timer:90000});
  const input=document.getElementById('game-file'),transfer=new DataTransfer();
  transfer.items.add(new File([JSON.stringify(newer)],'research-only.json',{type:'application/json'}));
  input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));
  await new Promise(r=>setTimeout(r,160));
  const dialog=document.getElementById('builder-dialog');
  const result={open:dialog.open,
    noBuilder:!dialog.querySelector('[data-alert-queue="home-builders"]'),
    homeLab:!!dialog.querySelector('[data-alert-queue="laboratory"]'),
    starLab:!!dialog.querySelector('[data-alert-queue="starLaboratory"]'),
    freeze:dialog.textContent.includes('Freeze Spell 4 → 5')};
  dialog.querySelector('[data-action="builder-dismiss"]')?.click();
  return result;
 })()`,awaitPromise:true,returnByValue:true});
 const researchOnlyResult=researchOnly.result?.result?.value||{};
 console.log('RESEARCH-ONLY FREE-QUEUE POPUP:',researchOnlyResult);
 if(!['open','noBuilder','homeLab','starLab','freeze'].every(k=>researchOnlyResult[k]===true))process.exitCode=1;


 if(!['tile','finish','bar','percent','match'].every(k=>estimateResult[k]===true))process.exitCode=1;

 const helperWidget=await cmd('Runtime.evaluate',{expression:`(async()=>{
  const {renderHelperStrip,helperCountdown}=await import('./insights-view.mjs');
  const sample={timestamp:1792401610,helpers:[{data:93000000,lvl:7,helper_cooldown:82787}],
   heroes:[{data:28000001,lvl:47,timer:48152,helper_timer:3587,helper_recurrent:true}]};
  const holder=document.createElement('div');
  holder.innerHTML=renderHelperStrip({export:sample});
  const text=holder.innerText||holder.textContent;
  return {target:text.includes('Archer Queen'),repeat:text.includes('Repeat assignment: On'),
   session:!!holder.querySelector('[data-helper-session-end]'),
   cooldown:!!holder.querySelector('[data-helper-cooldown-end]'),
   expired:helperCountdown(1000,'work',1500).includes('refresh JSON')};
 })()`,awaitPromise:true,returnByValue:true});
 const helperResult=helperWidget.result?.result?.value||{};
 console.log('HELPER ASSIGNMENT WIDGET:',helperResult);
 if(!['target','repeat','session','cooldown','expired'].every(k=>helperResult[k]===true))process.exitCode=1;


 if((counts.overview||0)<10) {console.error('No artwork rendered on dashboard');process.exitCode=1;}
 await cmd('Runtime.evaluate',{expression:"document.querySelector('[data-tab=inventory]').click()"});
 const inventory=await cmd('Runtime.evaluate',{expression:"document.querySelectorAll('img.item-art').length",returnByValue:true});
 console.log('INVENTORY ARTWORK COUNT:',inventory.result?.result?.value);
 if((inventory.result?.result?.value||0)<5)process.exitCode=1;
 await cmd('Runtime.evaluate',{expression:"document.querySelector('[data-tab=items]').click()"});
 const magic=await cmd('Runtime.evaluate',{expression:"document.querySelectorAll('img.item-art').length",returnByValue:true});
 console.log('MAGIC ITEMS ARTWORK COUNT:',magic.result?.result?.value);
 if((magic.result?.result?.value||0)<20)process.exitCode=1;
 const interaction=await cmd('Runtime.evaluate',{
  expression:`(async()=>{
    document.querySelector('[data-tab="overview"]').click();
    const gold=document.querySelector('[data-money="gold"]');
    const initiallyGrouped=gold.value==='19,000,000'&&gold.type==='text';
    gold.value='1200000';
    gold.dispatchEvent(new Event('input',{bubbles:true}));
    const commaGrouped=gold.value==='1,200,000';
    gold.dispatchEvent(new Event('change',{bubbles:true}));
    const snapshot={tag:'#SECOND1',timestamp:1792374000,buildings:[{data:1000001,lvl:12}],buildings2:[{data:1000034,lvl:8}]};
    window.confirm=()=>true;
    const transfer=new DataTransfer();
    transfer.items.add(new File([JSON.stringify(snapshot)],'second.json',{type:'application/json'}));
    const file=document.getElementById('game-file');file.files=transfer.files;
    file.dispatchEvent(new Event('change',{bubbles:true}));
    await new Promise(done=>setTimeout(done,450));
    const added=document.querySelector('#profile-select').options.length===2;
    const altEmpty=document.querySelector('[data-money="gold"]').value==='0';
    const snapshotLocal=JSON.parse(localStorage.getItem('clash-slot22-state-v2'));
    const preserved=snapshotLocal.profiles['#QVLP9RVV'].resources.gold===1200000;
    document.getElementById('profile-select').value='#QVLP9RVV';
    document.getElementById('profile-select').dispatchEvent(new Event('change',{bubbles:true}));
    const switchedBack=document.querySelector('[data-money="gold"]').value==='1,200,000';
    return {initiallyGrouped,commaGrouped,added,altEmpty,preserved,switchedBack,selected:document.getElementById('profile-select').value};
  })()`,
  awaitPromise:true,returnByValue:true
 });
 const interactionResult=interaction.result?.result?.value||{};
 console.log('ACCOUNT & COMMA FORMATTING:',interactionResult);
 if(!['initiallyGrouped','commaGrouped','added','altEmpty','preserved','switchedBack'].every(k=>interactionResult[k]===true))process.exitCode=1;
 const pasted=await cmd('Runtime.evaluate',{
  expression:`(()=>{
    document.querySelector('[data-tab="sync"]').click();
    const third={tag:'#THIRD33',timestamp:1792374100,buildings:[{data:1000001,lvl:11}],buildings2:[{data:1000034,lvl:7}]};
    document.getElementById('paste-export').value=JSON.stringify(third);
    document.querySelector('[data-action="import-pasted"]').click();
    const stored=JSON.parse(localStorage.getItem('clash-slot22-state-v2'));
    const count=document.getElementById('profile-select').options.length;
    const selected=document.getElementById('profile-select').value;
    const zero=document.querySelector('[data-money="gold"]').value==='0';
    const oldGold=stored.profiles['#QVLP9RVV'].resources.gold===1200000;
    return {count,selected,zero,oldGold};
  })()`,
  returnByValue:true
 });
 const pasteResult=pasted.result?.result?.value||{};
 console.log('PASTE JSON:',pasteResult);
 if(pasteResult.count!==3||pasteResult.selected!=='#THIRD33'||!pasteResult.zero||!pasteResult.oldGold)process.exitCode=1;
 const spacing=await cmd('Runtime.evaluate',{expression:`(()=>{
   document.getElementById('profile-select').value='#QVLP9RVV';
   document.getElementById('profile-select').dispatchEvent(new Event('change',{bubbles:true}));
   const label=document.querySelector('.queue-name em');
   return Boolean(label)&&getComputedStyle(label).display==='block';
 })()`,returnByValue:true});
 console.log('UPGRADE LABEL SPACING:',spacing.result?.result?.value);
 if(spacing.result?.result?.value!==true)process.exitCode=1;
 const visual=await cmd('Runtime.evaluate',{expression:"(()=>{\n const visualPresent=Boolean(document.querySelector('.royal-hero'))&&Boolean(document.querySelector('.queue-board'))&&Boolean(document.querySelector('.quest-trail'));\n const before=JSON.parse(localStorage.getItem('clash-slot22-state-v2'));\n const oldElixir=before.profiles['#QVLP9RVV'].resources.elixir;\n document.querySelector('[data-tab=\"roadmap\"]').click();\n const task=document.querySelector('[data-open-task=\"L-02\"]');\n if(task)task.click();\n const detailOpened=document.querySelector('#item-dialog').open;\n const modalPreview=document.querySelector('#item-dialog-body')?.innerText.includes('Estimated cost');\n document.querySelector('#item-dialog [data-action=\"record-upgrade\"]')?.click();\n const after=JSON.parse(localStorage.getItem('clash-slot22-state-v2'));\n const costDeducted=oldElixir-after.profiles['#QVLP9RVV'].resources.elixir===2100000;\n const taskActive=after.profiles['#QVLP9RVV'].roadmap.find(t=>t.id==='L-02')?.status==='active';\n const altUnchanged=after.profiles['#SECOND1'].resources.elixir===0;\n document.querySelector('[data-tab=\"overview\"]').click();\n const cap=document.querySelector('[data-cap=\"gold\"]');\n cap.value='30000000';\n cap.dispatchEvent(new Event('change',{bubbles:true}));\n const updated=JSON.parse(localStorage.getItem('clash-slot22-state-v2'));\n const gaugeStored=updated.profiles['#QVLP9RVV'].storageCaps.gold===30000000;\n const gaugeFill=document.querySelector('.vault.gold .vault-track span')?.style.width==='4%';\n document.querySelector('[data-tab=\"inventory\"]').click();\n const first=document.querySelector('[data-open-inventory]');\n if(first)first.click();\n const inventoryModal=document.querySelector('#item-dialog').open;\n document.querySelector('#item-dialog [data-action=\"close-detail\"]')?.click();\n return {visualPresent,detailOpened,modalPreview,costDeducted,taskActive,altUnchanged,gaugeStored,gaugeFill,inventoryModal};\n})()",returnByValue:true});
 const vr=visual.result?.result?.value||{};
 console.log('COMMAND CENTER & INTERACTION:',vr);
 if(!['visualPresent','detailOpened','modalPreview','costDeducted','taskActive','altUnchanged','gaugeStored','gaugeFill','inventoryModal'].every(k=>vr[k]===true))process.exitCode=1;
 const pass=await cmd('Runtime.evaluate',{expression:"(()=>{\n document.querySelector('[data-tab=\"pass\"]').click();\n const slots=document.querySelectorAll('.pass-reward');\n const silver=document.querySelectorAll('.pass-section')[0].querySelectorAll('.pass-reward').length;\n const gold=document.querySelectorAll('.pass-section')[1].querySelectorAll('.pass-reward').length;\n const before=JSON.parse(localStorage.getItem('clash-slot22-state-v2'));\n const original=before.profiles['#QVLP9RVV'];\n const money=original.resources.builderGold;\n const nItems=JSON.stringify(original.items);\n document.querySelector('[data-pass-toggle=\"S08\"]').click();\n const refused= !JSON.parse(localStorage.getItem('clash-slot22-state-v2')).profiles['#QVLP9RVV'].seasonalPlan?.claims?.S08?.claimed;\n const sel=document.querySelector('[data-pass-choice=\"S08\"]');\n sel.value='1,000,000 Builder Gold';\n sel.dispatchEvent(new Event('change',{bubbles:true}));\n document.querySelector('[data-pass-toggle=\"S08\"]').click();\n const after=JSON.parse(localStorage.getItem('clash-slot22-state-v2'));\n const reward=after.profiles['#QVLP9RVV'].seasonalPlan.claims.S08;\n const claimed=reward.claimed===true&&reward.selected==='1,000,000 Builder Gold';\n const preserved=after.profiles['#QVLP9RVV'].resources.builderGold===money&&JSON.stringify(after.profiles['#QVLP9RVV'].items)===nItems;\n const accountSeparated=after.profiles['#SECOND1'].seasonalPlan===undefined;\n return {silver,gold,slotCount:slots.length,refused,claimed,preserved,accountSeparated};\n})()",returnByValue:true});
 const passResult=pass.result?.result?.value||{};
 console.log('SEASON PASS CHECKLIST:',passResult);
 if(passResult.silver<30||passResult.gold<19||!['refused','claimed','preserved','accountSeparated'].every(k=>passResult[k]===true))process.exitCode=1;
 const event=await cmd('Runtime.evaluate',{expression:"(()=>{\n document.querySelector('[data-tab=\"pass\"]').click();\n const form=document.getElementById('pass-reward-form');\n const a=form.elements;\n a.track.value='Event';\n a.kind.value='choice';\n a.optionA.value='Rune of Builder Gold';\n a.optionB.value='Book of Heroes';\n a.note.value='From new user event';\n form.requestSubmit();\n const saved=JSON.parse(localStorage.getItem('clash-slot22-state-v2'));\n const main=saved.profiles['#QVLP9RVV'],extra=main.seasonalPlan.customRewards.at(-1);\n const customSaved=extra?.track==='Event'&&extra?.options?.length===2&&extra?.note==='From new user event';\n const beforeItems=JSON.stringify(main.items);\n const beforeGold=main.resources.gold;\n document.querySelector('[data-pass-choice=\"'+extra.id+'\"]').value='Book of Heroes';\n document.querySelector('[data-pass-choice=\"'+extra.id+'\"]').dispatchEvent(new Event('change',{bubbles:true}));\n document.querySelector('[data-pass-toggle=\"'+extra.id+'\"]').click();\n const after=JSON.parse(localStorage.getItem('clash-slot22-state-v2'));\n const chosen=after.profiles['#QVLP9RVV'].seasonalPlan.claims[extra.id];\n const choiceClaimed=chosen?.claimed===true&&chosen?.selected==='Book of Heroes';\n const inventorySeparate=JSON.stringify(after.profiles['#QVLP9RVV'].items)===beforeItems&&after.profiles['#QVLP9RVV'].resources.gold===beforeGold;\n document.querySelector('[data-edit-reward=\"G04\"]').click();\n const edit=document.getElementById('pass-reward-form');\n edit.elements.note.value='User corrected reward';\n edit.requestSubmit();\n const edited=JSON.parse(localStorage.getItem('clash-slot22-state-v2')).profiles['#QVLP9RVV'].seasonalPlan.rewardOverrides.G04.note==='User corrected reward';\n document.querySelector('[data-action=\"go-items\"]').click();\n const rune=document.querySelector('[data-item=\"Rune of Gold\"]');\n rune.value='12';\n rune.dispatchEvent(new Event('change',{bubbles:true}));\n const overLimitSaved=JSON.parse(localStorage.getItem('clash-slot22-state-v2')).profiles['#QVLP9RVV'].items['Rune of Gold']===12;\n const inventoryForm=document.getElementById('extra-item-form');\n inventoryForm.elements.name.value='Limited Magic Item';\n inventoryForm.elements.quantity.value='6';\n inventoryForm.requestSubmit();\n const customItem=JSON.parse(localStorage.getItem('clash-slot22-state-v2')).profiles['#QVLP9RVV'].items['Limited Magic Item']===6;\n const other=JSON.parse(localStorage.getItem('clash-slot22-state-v2')).profiles['#SECOND1'];\n const otherUnaffected=other.items['Limited Magic Item']===undefined;\n return {customSaved,choiceClaimed,inventorySeparate,edited,overLimitSaved,customItem,otherUnaffected};\n})()",returnByValue:true});
 const eventResult=event.result?.result?.value||{};
 console.log('CUSTOM EVENT & MAGIC ITEMS:',eventResult);
 if(!['customSaved','choiceClaimed','inventorySeparate','edited','overLimitSaved','customItem','otherUnaffected'].every(k=>eventResult[k]===true))process.exitCode=1;
 console.log('BROWSER ERRORS:',failures);
 if(!body.toLowerCase().includes('your command center')||!body.toLowerCase().includes('resource vaults')||body.toLowerCase().includes('loading village tracker'))process.exitCode=1;
}catch(e){console.error(e);process.exitCode=1;}finally{ws?.close();chrome.kill('SIGKILL');}
