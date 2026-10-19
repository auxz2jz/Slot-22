import {spawn} from 'node:child_process';
import {setTimeout as wait} from 'node:timers/promises';
const chrome=spawn('/usr/bin/google-chrome',['--headless=new','--no-sandbox','--disable-dev-shm-usage','--remote-debugging-port=9452','--user-data-dir=/tmp/clash-ui-'+process.pid,'about:blank'],{stdio:'ignore'});
let ws,id=0;const pending=new Map(),problems=[];
try{
 let page;
 for(let i=0;i<40;i++){
  try{page=(await(await fetch('http://127.0.0.1:9452/json')).json()).find(p=>p.type==='page');if(page)break}catch{}
  await wait(250);
 }
 if(!page)throw Error('Chrome debugger never appeared');
 ws=new WebSocket(page.webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true})});
 ws.addEventListener('message',e=>{
  const m=JSON.parse(String(e.data));
  if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id)}
  if(m.method==='Runtime.exceptionThrown')problems.push(m.params.exceptionDetails?.exception?.description||m.params.exceptionDetails?.text);
 });
 const cmd=(method,params={})=>new Promise(resolve=>{const n=++id;pending.set(n,resolve);ws.send(JSON.stringify({id:n,method,params}))});
 async function run(label,expression){
  const msg=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
  if(msg.result?.exceptionDetails)throw Error(label+': '+(msg.result.exceptionDetails.exception?.description||msg.result.exceptionDetails.text));
  const result=msg.result?.result?.value;
  console.log(label,JSON.stringify(result));
  return result;
 }
 await cmd('Runtime.enable');await cmd('Page.enable');
 await cmd('Page.navigate',{url:'http://127.0.0.1:8765/index.html'});
 await wait(2200);
 const dashboard=await run('dashboard',"({visible:!!document.querySelector('.royal-hero'),resources:!!document.querySelector('[data-money=gold]')})");
 if(!dashboard.visible||!dashboard.resources)throw Error('Dashboard failed to load');
 const start=await run('pass catalogue',"(()=>{document.querySelector('[data-tab=pass]').click();return {cards:document.querySelectorAll('.pass-reward').length,form:!!document.getElementById('pass-reward-form'),custom:JSON.parse(localStorage.getItem('clash-slot22-state-v2')).profiles['#QVLP9RVV'].seasonalPlan?.customRewards?.length||0}})()");
 if(start.cards<49||!start.form)throw Error('Missing original reward slots');
 const added=await run('add alternative prize',"(()=>{const form=document.getElementById('pass-reward-form');form.elements.namedItem('track').value='Event';form.elements.namedItem('kind').value='choice';form.elements.namedItem('optionA').value='Book of Heroes';form.elements.namedItem('optionB').value='Rune of Builder Elixir';form.elements.namedItem('note').value='Added from my game';form.requestSubmit();const data=JSON.parse(localStorage.getItem('clash-slot22-state-v2'));return {count:data.profiles['#QVLP9RVV'].seasonalPlan?.customRewards?.length||0,visible:document.querySelectorAll('[data-pass-choice]').length,valid:form.checkValidity(),notice:document.getElementById('notice')?.textContent,formFields:Object.fromEntries(new FormData(form))}})()");
 if(added.count!==start.custom+1)throw Error('New reward was not recorded');
 const claimed=await run('choose reward',"(()=>{const data=JSON.parse(localStorage.getItem('clash-slot22-state-v2'));const id=data.profiles['#QVLP9RVV'].seasonalPlan.customRewards.at(-1).id;const sel=document.querySelector('[data-pass-choice='+id+']');sel.value='Rune of Builder Elixir';sel.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('[data-pass-toggle='+id+']').click();const next=JSON.parse(localStorage.getItem('clash-slot22-state-v2'));return {claimed:next.profiles['#QVLP9RVV'].seasonalPlan.claims[id].claimed,unchanged:next.profiles['#QVLP9RVV'].items['Rune of Builder Elixir']===1}})()");
 if(!claimed.claimed||!claimed.unchanged)throw Error('Choose-one claim failed or changed item counts');
 const edited=await run('edit base reward',"(()=>{document.querySelector('[data-edit-reward=G04]').click();const f=document.getElementById('pass-reward-form');f.elements.namedItem('note').value='User corrected';f.requestSubmit();return JSON.parse(localStorage.getItem('clash-slot22-state-v2')).profiles['#QVLP9RVV'].seasonalPlan.rewardOverrides?.G04?.note})()");
 if(edited!=='User corrected')throw Error('Existing reward edit failed');
 const items=await run('manual inventory',"(()=>{document.querySelector('[data-action=go-items]').click();const r=document.querySelector('[data-item=\"Rune of Gold\"]');r.value='12';r.dispatchEvent(new Event('change',{bubbles:true}));const f=document.getElementById('extra-item-form');f.elements.namedItem('name').value='Other Game Item';f.elements.namedItem('quantity').value='8';f.requestSubmit();const p=JSON.parse(localStorage.getItem('clash-slot22-state-v2')).profiles['#QVLP9RVV'];return {rune:p.items['Rune of Gold'],extra:p.items['Other Game Item']}})()");
 if(items.rune!==12||items.extra!==8)throw Error('Magic Item input did not persist');
 if(problems.length)throw Error('Browser exceptions: '+problems.join(' | '));
 console.log('PASS: New reward editor and over-limit inventory both work');
}catch(e){console.error('FAIL:',e);process.exitCode=1}finally{ws?.close();chrome.kill('SIGKILL')}
