// Pure display and planning calculations. These never start upgrades in Clash of Clans.
export const VERSION = '0.3.0';
export const RESOURCE_LABELS={gold:'Gold',elixir:'Elixir',dark:'Dark Elixir',builderGold:'Builder Gold',builderElixir:'Builder Elixir'};
export const RESOURCE_KIND=['gold','elixir','dark','builderGold','builderElixir'];
export function whole(x){const n=Number(String(x??0).replace(/,/g,''));return Number.isFinite(n)?Math.max(0,Math.floor(n)):0;}
export function gauge(balance,capacity){
  const amount=whole(balance), cap=whole(capacity);
  return {amount,capacity:cap,known:cap>0,percent:cap>0?Math.max(0,Math.min(100,100*amount/cap)):0,overflow:cap>0&&amount>cap};
}
export function remainingTime(finishesAt,now=Date.now()){
  if(!Number.isFinite(finishesAt))return {expired:false,text:'Unknown'};
  const left=Math.max(0,Math.ceil((finishesAt-now)/1000));
  if(left===0)return {expired:true,text:'Timer expired · refresh JSON'};
  const d=Math.floor(left/86400),h=Math.floor((left%86400)/3600),m=Math.floor((left%3600)/60);
  return {expired:false,text:d?d+'d '+h+'h left':h?h+'h '+m+'m left':m+'m left'};
}
// Actual construction start is not present in village exports. The optional
// trackedFirstSeenAt survives subsequent imports of the same observed upgrade.
export function snapshotCountdown(ex,record,now=Date.now(),trackedFirstSeenAt=null){
  const snapshotStart=Number(ex?.timestamp)*1000,remaining=Number(record?.timer);
  if(!Number.isFinite(snapshotStart)||!Number.isFinite(remaining)||remaining<0)return null;
  const seen=Number(trackedFirstSeenAt);
  const start=trackedFirstSeenAt!==null&&Number.isFinite(seen)&&seen>0&&seen<=snapshotStart?seen:snapshotStart;
  const end=snapshotStart+remaining*1000;
  const total=Math.max(1,end-start);
  const percent=Math.max(0,Math.min(100,((now-start)/total)*100));
  return {start,end,percent,remaining:remainingTime(end,now),basis:start<snapshotStart?'Since first tracked':'Since last game export'};
}
export function classifyQueue(category){
  if(category==='buildings'||category==='heroes')return 'Home builders';
  if(category==='buildings2'||category==='heroes2')return 'Builder Base builders';
  if(category==='units'||category==='spells'||category==='siege_machines')return 'Laboratory';
  if(category==='units2')return 'Star Laboratory';
  if(category==='pets')return 'Pets';
  return 'Other';
}
export function queueGroups(rows){
  const groups={'Home builders':[],'Builder Base builders':[],Laboratory:[], 'Star Laboratory':[],Pets:[],Other:[]};
  for(const r of rows)groups[classifyQueue(r.categoryId||r.category)]?.push(r);
  return groups;
}
export function planPreview(task,resources){
  if(!task)throw Error('Missing task');
  const key=task.costType;
  const amount=whole(resources?.[key]);
  const cost=whole(task.cost);
  const valid=cost>0&&Object.prototype.hasOwnProperty.call(resources||{},key);
  return {key,cost,amount,valid,affordable:valid&&amount>=cost,remaining:valid?amount-cost:null};
}
export function progressSummary(tasks){
  const total=tasks.length,done=tasks.filter(t=>t.status==='done').length,active=tasks.filter(t=>t.status==='active').length;
  return {total,done,active,percent:total?100*done/total:0};
}
export function getTaskForRecord(tasks,record){
  const name=(record?.name||'').toLowerCase();
  return tasks.find(t=>t.status!=='skipped'&&t.title.toLowerCase().includes(name)&&t.title.includes(String(record?.level)+' →'))||null;
}
