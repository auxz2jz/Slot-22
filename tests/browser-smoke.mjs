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

 const commandCenter=await cmd('Runtime.evaluate',{expression:`(async()=>{
  const main=document.querySelector('.command-center');
  const cards=main?.querySelectorAll('[data-command-lane]')||[];
  const profile=JSON.parse(localStorage.getItem('clash-slot22-state-v2'));
  const original=profile.profiles[profile.activeProfileId].resources.elixir;
  const spell=main.querySelector('[data-command-structure="buildings:1000020"]');
  const drawerBefore=!!document.getElementById('command-dialog');
  spell?.click();
  const drawer=document.getElementById('command-dialog');
  const correct=drawer?.open&&drawer.textContent.includes('Spell Factory')&&drawer.textContent.includes('Freeze Spell');
  const form=drawer.querySelector('.command-quote');
  if(form){form.open=true;form.querySelector('[data-quote-field="price"]').value='5000000';
   form.querySelector('[data-quote-field="hours"]').value='120';
   form.querySelector('[data-quote-field="currency"]').value='elixir';
   form.querySelector('[data-quote-field="beforeBoost"]').checked=false;
   form.querySelector('[data-action="command-save-quote"]')?.click();
  }
  const next=JSON.parse(localStorage.getItem('clash-slot22-state-v2'));
  const saved=next.profiles[next.activeProfileId];
  const quote=saved.upgradeQuotes?.['buildings:1000020:7'];
  const safe=saved.resources.elixir===original;
  drawer.querySelector('[data-action="command-close"]')?.click();
  return {main:!!main,seven:cards.length===7,resource:main.textContent.includes('17,504,427'),
   finder:!!spell,drawerBefore,correct,quote:quote?.price===5000000&&quote?.hours===120,
   safe,closed:!drawer.open,discount:!!main.querySelector('[data-command-boost="builderBoost"]')};
 })()`,awaitPromise:true,returnByValue:true});
 const commandResult=commandCenter.result?.result?.value||{};
 console.log('COMPACT COMMAND CENTER:',commandResult);
 if(!['main','seven','resource','finder','drawerBefore','correct','quote','safe','closed','discount'].every(k=>commandResult[k]===true))process.exitCode=1;
 const strategic=await cmd('Runtime.evaluate',{expression:`(()=>{
  const root=document.querySelector('.command-center');
  const ids=['homeBuilders','builderBuilders','homeLab','starLab','pets','equipment','assistants'];
  const lanes=ids.every(id=>!!root?.querySelector('[data-command-lane="'+id+'"]'));
  const noDuplicate=!document.querySelector('.full-plan-panel');
  const advanced=!!document.getElementById('advanced-panels');
  const inventory=!!root?.querySelector('.command-structures');
  const heroHall=root?.textContent.includes('Hero Hall');
  const open=(id)=>{
    root?.querySelector('[data-command-lane="'+id+'"]')?.click();
    const dialog=document.getElementById('command-dialog');
    const content=dialog?.open?dialog.textContent:'';
    dialog?.querySelector('[data-action="command-close"]')?.click();
    return content;
  };
  const builders=open('homeBuilders');
  const lab=open('homeLab');
  const pets=open('pets');
  return {visible:!!root,lanes,noDuplicate,advanced,inventory,heroHall,
    hero:builders.includes('Grand Warden 28 → 29'),
    nextSpell:lab.includes('Freeze Spell 5 → 6'),
    pet:pets.includes('L.A.S.S.I 3 → 4'),
    ranked:builders.includes('My recommended next jobs, in order'),
    closed:!document.getElementById('command-dialog').open};
 })()`,returnByValue:true});
 const strategyResult=strategic.result?.result?.value||{};
 console.log('CONSOLIDATED COMMAND CENTER:',strategyResult);
 if(!['visible','lanes','noDuplicate','advanced','inventory','heroHall','hero','nextSpell','pet','ranked','closed'].every(k=>strategyResult[k]===true))process.exitCode=1;
 const audited=await cmd('Runtime.evaluate',{expression:`(async()=>{
  const f=document.querySelector('.factory-audit'),b=document.querySelector('.builder-nudge:not(.research-nudge)'),h=document.querySelector('.helper-next-actions');
  const {availableResearchQueues}=await import('./experience.mjs');
  const saved=JSON.parse(localStorage.getItem('clash-slot22-state-v2'));
  const profile=saved.profiles[saved.activeProfileId];
  const q=availableResearchQueues(profile);
  return {factory:!!f,helpers:!!h,helperCount:h?.querySelectorAll('[data-helper-advice]').length===4,darkSpell:f?.textContent.includes('Dark Spell Factory'),workshop:f?.textContent.includes('Workshop'),
    starLab:f?.textContent.includes('Star Laboratory'),petHouse:f?.textContent.includes('Pet House'),
    pet:q.some(z=>z.key==='petHouse'&&z.status==='busy'&&z.recommendations.length===0),
    star:q.some(z=>z.key==='starLaboratory'&&z.status==='idle'&&z.recommendations[0]?.title==='Raged Barbarian 13 → 14'),
    notHog:!q.some(z=>z.recommendations.some(t=>t.title.includes('Hog Glider 15 → 16'))),
    noFreeHomeBuilder:!b,modal:!!document.getElementById('builder-dialog')};
 })()`,awaitPromise:true,returnByValue:true});
 const auditedResult=audited.result?.result?.value||{};
 console.log('FACTORY AUDIT AND IDLE PET/STAR RESEARCH:',auditedResult);
 if(!['factory','helpers','helperCount','darkSpell','workshop','starLab','petHouse','pet','star','notHog','noFreeHomeBuilder','modal'].every(k=>auditedResult[k]===true))process.exitCode=1;
 const builderPopup=await cmd('Runtime.evaluate',{expression:`(async()=>{
  const bundle=JSON.parse(localStorage.getItem('clash-slot22-state-v2'));
  const player=bundle.profiles[bundle.activeProfileId],newer=structuredClone(player.export);
  newer.timestamp+=60;
  delete newer.buildings.find(r=>r.data===1000020).timer;
  delete newer.spells.find(r=>r.data===26000005).timer;
  const owl=newer.pets.find(r=>r.data===73000002);if(owl){delete owl.timer;owl.lvl=3;}
  const input=document.getElementById('game-file'),transfer=new DataTransfer();
  transfer.items.add(new File([JSON.stringify(newer)],'fresh-four-queues.json',{type:'application/json'}));
  input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));
  await new Promise(r=>setTimeout(r,220));
  const dialog=document.getElementById('builder-dialog');
  const shown=dialog.open&&dialog.textContent.includes('Grand Warden 28 → 29');
  const homeLab=dialog.textContent.includes('Freeze Spell 4 → 5');
  const star=!!dialog.querySelector('[data-alert-queue="starLaboratory"]');
  const pet=dialog.textContent.includes('Electro Owl 3 → 4');
  const notHog=!dialog.textContent.includes('Hog Glider 15 → 16');
  const helperAdvice=!!dialog.querySelector('[data-alert-queue="helpers"]')&&dialog.textContent.includes('Lab Assistant')&&dialog.textContent.includes('Alchemist')&&dialog.textContent.includes('Prospector');
  const separateQueues=['home-builders','laboratory','starLaboratory','petHouse'].every(k=>
    !!dialog.querySelector('[data-alert-queue="'+k+'"]'));
  const petButton=!!dialog.querySelector('[data-action="view-pets"]');
  dialog.querySelector('[data-action="builder-dismiss"]')?.click();
  await new Promise(r=>setTimeout(r,90));
  const after=JSON.parse(localStorage.getItem('clash-slot22-state-v2'));
  const saved=after.profiles[after.activeProfileId];
  const acknowledged=saved.builderPromptDismissedAt===newer.timestamp;
  input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));
  await new Promise(r=>setTimeout(r,180));
  return {shown,homeLab,star,pet,notHog,separateQueues,petButton,helperAdvice,
    acknowledged,notRepeated:!dialog.open,untouchedResources:saved.resources.gold===player.resources.gold,
    freshSnapshot:saved.export.timestamp===newer.timestamp};
 })()`,awaitPromise:true,returnByValue:true});
 const popupResult=builderPopup.result?.result?.value||{};
 console.log('FOUR-QUEUE POPUP AFTER FRESH JSON:',popupResult);
 if(!['shown','homeLab','star','pet','notHog','separateQueues','petButton','helperAdvice','acknowledged','notRepeated','untouchedResources','freshSnapshot'].every(k=>popupResult[k]===true))process.exitCode=1;
 const researchOnly=await cmd('Runtime.evaluate',{expression:`(async()=>{
  const saved=JSON.parse(localStorage.getItem('clash-slot22-state-v2'));
  const p=saved.profiles[saved.activeProfileId],newer=structuredClone(p.export);
  newer.timestamp+=90;
  newer.buildings.find(r=>r.data===1000020).timer=239000;
  newer.spells.find(r=>r.data===26000005).timer=86000;
  const input=document.getElementById('game-file'),transfer=new DataTransfer();
  transfer.items.add(new File([JSON.stringify(newer)],'research-only.json',{type:'application/json'}));
  input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));
  await new Promise(r=>setTimeout(r,220));
  const dialog=document.getElementById('builder-dialog');
  const result={open:dialog.open,
    noBuilder:!dialog.querySelector('[data-alert-queue="home-builders"]'),
    noHomeLab:!dialog.querySelector('[data-alert-queue="laboratory"]'),
    star:!!dialog.querySelector('[data-alert-queue="starLaboratory"]'),
    petHouse:!!dialog.querySelector('[data-alert-queue="petHouse"]'),
    noHog:!dialog.textContent.includes('Hog Glider 15 → 16')};
  dialog.querySelector('[data-action="builder-dismiss"]')?.click();
  return result;
 })()`,awaitPromise:true,returnByValue:true});
 const researchOnlyResult=researchOnly.result?.result?.value||{};
 console.log('PET/STAR-ONLY FREE QUEUE POPUP:',researchOnlyResult);
 if(!['open','noBuilder','noHomeLab','star','petHouse','noHog'].every(k=>researchOnlyResult[k]===true))process.exitCode=1;

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
    const startingProfiles=document.querySelector('#profile-select').options.length;
    const snapshot={tag:'#SECOND1',timestamp:1792374000,buildings:[{data:1000001,lvl:12}],buildings2:[{data:1000034,lvl:8}]};
    window.confirm=()=>true;
    const transfer=new DataTransfer();
    transfer.items.add(new File([JSON.stringify(snapshot)],'second.json',{type:'application/json'}));
    const file=document.getElementById('game-file');file.files=transfer.files;
    file.dispatchEvent(new Event('change',{bubbles:true}));
    await new Promise(done=>setTimeout(done,450));
    const added=document.querySelector('#profile-select').options.length===startingProfiles+1;
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
    const precedingProfiles=document.querySelector('#profile-select').options.length;
    const third={tag:'#THIRD33',timestamp:1792374100,buildings:[{data:1000001,lvl:11}],buildings2:[{data:1000034,lvl:7}]};
    document.getElementById('paste-export').value=JSON.stringify(third);
    document.querySelector('[data-action="import-pasted"]').click();
    const stored=JSON.parse(localStorage.getItem('clash-slot22-state-v2'));
    const count=document.getElementById('profile-select').options.length;
    const added=count===precedingProfiles+1;
    const selected=document.getElementById('profile-select').value;
    const zero=document.querySelector('[data-money="gold"]').value==='0';
    const oldGold=stored.profiles['#QVLP9RVV'].resources.gold===1200000;
    return {count,added,selected,zero,oldGold};
  })()`,
  returnByValue:true
 });
 const pasteResult=pasted.result?.result?.value||{};
 console.log('PASTE JSON:',pasteResult);
 if(!pasteResult.added||pasteResult.selected!=='#THIRD33'||!pasteResult.zero||!pasteResult.oldGold)process.exitCode=1;
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
 if(!body.toLowerCase().includes('village command center')||!body.toLowerCase().includes('builder gold')||body.toLowerCase().includes('loading village tracker'))process.exitCode=1;
}catch(e){console.error(e);process.exitCode=1;}finally{ws?.close();chrome.kill('SIGKILL');}
