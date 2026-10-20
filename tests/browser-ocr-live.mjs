// Optional connected smoke test of the REAL third-party OCR worker on GitHub
// runners, using a synthetic screenshot. No personal screenshot is uploaded.
import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';

const chrome=spawn(process.env.CHROME_PATH||'/usr/bin/google-chrome',[
 '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
 '--remote-debugging-port=9477','--user-data-dir=/tmp/clash-ocr-'+process.pid,
 '--window-size=420,900','about:blank'
],{stdio:['ignore','ignore','pipe']});
let log='';
chrome.stderr?.on('data',x=>{log=(log+String(x)).slice(-1800)});
let ws;
try{
 let target;
 for(let i=0;i<110;i++){
  try{const pages=await(await fetch('http://127.0.0.1:9477/json')).json();
    target=pages.find(p=>p.type==='page');if(target)break;}catch{}
  await delay(200);
 }
 if(!target)throw Error('Browser unavailable: '+log);
 ws=new WebSocket(target.webSocketDebuggerUrl);
 await new Promise((ok,fail)=>{ws.addEventListener('open',ok,{once:true});
   ws.addEventListener('error',fail,{once:true});});
 let seq=0;
 const waiting=new Map(),issues=[];
 ws.addEventListener('message',e=>{
  const m=JSON.parse(String(e.data));
  if(waiting.has(m.id)){waiting.get(m.id)(m);waiting.delete(m.id)}
  if(m.method==='Runtime.exceptionThrown'||m.method==='Log.entryAdded'){
   const details=JSON.stringify(m.params);
   if(/tesseract|webassembly|worker|script|network|refused|blocked|exception/i.test(details))
    issues.push(details.slice(0,700));
  }
 });
 const cmd=(method,params={})=>new Promise(resolve=>{
  const id=++seq;waiting.set(id,resolve);ws.send(JSON.stringify({id,method,params}));
 });
 await cmd('Runtime.enable');await cmd('Log.enable');await cmd('Page.enable');
 await cmd('Page.navigate',{url:'http://127.0.0.1:8765/index.html'});
 await delay(3500);
 const expr=`(async()=>{
   document.querySelector('[data-tab="scan"]').click();
   const panel=document.querySelector('.resource-scanner');
   if(!panel)throw Error('Scanner tab not rendered');
   const c=document.createElement('canvas');c.width=1200;c.height=680;
   const ctx=c.getContext('2d');ctx.fillStyle='#1b3045';ctx.fillRect(0,0,c.width,c.height);
   ctx.fillStyle='#ffffff';ctx.font='bold 54px Arial, sans-serif';
   ['19 000 000','17 504 427','408 530','4 049'].forEach((line,i)=>ctx.fillText(line,775,85+i*55));
   const blob=await new Promise(r=>c.toBlob(r,'image/png'));
   const dt=new DataTransfer();dt.items.add(new File([blob],'sample.png',{type:'image/png'}));
   const input=panel.querySelector('[data-scan-file="home"]');input.files=dt.files;
   input.dispatchEvent(new Event('change',{bubbles:true}));
   for(let i=0;i<40&&panel.querySelector('[data-scan-read="home"]').disabled;i++)
     await new Promise(r=>setTimeout(r,40));
   if(panel.querySelector('[data-scan-read="home"]').disabled)throw Error('Could not decode synthetic image');
   panel.querySelector('[data-scan-read="home"]').click();
   return {started:true,preview:panel.querySelector('[data-scan-crop="home"]').width};
 })()`;
 const started=await cmd('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true});
 if(started.result?.exceptionDetails)throw Error(JSON.stringify(started.result.exceptionDetails));
 console.log('LIVE OCR START:',started.result?.result?.value);
 let last;
 for(let i=0;i<140;i++){
  const v=await cmd('Runtime.evaluate',{
   expression:`(()=>{
    const panel=document.querySelector('[data-scan-village="home"]');
    const message=panel?.querySelector('[data-scan-message]')?.textContent||'';
    return {message,
      recognized:panel?.querySelector('[data-scan-raw]')?.textContent,
      numbers:[...panel?.querySelectorAll('[data-scan-value]')||[]].map(x=>x.value),
      selected:[...panel?.querySelectorAll('[data-scan-use]')||[]].filter(x=>x.checked).length,
      stored:!!document.querySelector('#notice')?.textContent?.includes('Saved')
     }
   })()`,returnByValue:true});
  last=v.result?.result?.value;
  if(/OCR failed|counter.* suggested|No numbers recognized/.test(last?.message||''))break;
  await delay(1000);
 }
 console.log('LIVE OCR RESULT:',last);
 if(!last||last?.message.startsWith('OCR failed')||!last?.recognized?.trim())
  throw Error('Live browser OCR failed: '+JSON.stringify(last));
 if(last.stored)throw Error('OCR changed resources without user confirmation.');
 console.log('LIVE OCR WARNINGS:',issues.slice(-7));
}catch(err){console.error(err);process.exitCode=1}finally{ws?.close();chrome.kill('SIGKILL');}
