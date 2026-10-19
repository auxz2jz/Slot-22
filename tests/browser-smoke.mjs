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
 if((counts.overview||0)<10) {console.error('No artwork rendered on dashboard');process.exitCode=1;}
 await cmd('Runtime.evaluate',{expression:"document.querySelector('[data-tab=inventory]').click()"});
 const inventory=await cmd('Runtime.evaluate',{expression:"document.querySelectorAll('img.item-art').length",returnByValue:true});
 console.log('INVENTORY ARTWORK COUNT:',inventory.result?.result?.value);
 if((inventory.result?.result?.value||0)<5)process.exitCode=1;
 await cmd('Runtime.evaluate',{expression:"document.querySelector('[data-tab=items]').click()"});
 const magic=await cmd('Runtime.evaluate',{expression:"document.querySelectorAll('img.item-art').length",returnByValue:true});
 console.log('MAGIC ITEMS ARTWORK COUNT:',magic.result?.result?.value);
 if((magic.result?.result?.value||0)<20)process.exitCode=1;
 console.log('BROWSER ERRORS:',failures);
 if(!body.toLowerCase().includes('gold in storage')||body.toLowerCase().includes('loading village tracker'))process.exitCode=1;
}catch(e){console.error(e);process.exitCode=1;}finally{ws?.close();chrome.kill('SIGKILL');}
