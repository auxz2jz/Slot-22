// Pure, fail-closed parser for Clash resource counters. No images or state leave the browser.
export const SCAN_FIELDS={
  home:[['gold','Gold'],['elixir','Elixir'],['dark','Dark Elixir'],['gems','Gems']],
  builder:[['builderGold','Builder Gold'],['builderElixir','Builder Elixir'],['gems','Gems']]
};
const MAX_AMOUNT=1e12;
export const numberText=n=>new Intl.NumberFormat('en-US').format(n);
// Never treat an abbreviation (such as 19M) as an exact counter: retain a warning.
export function parseCounterAmount(raw){
 if(typeof raw!=='string'||raw.length>100)return null;
 const s=raw.trim().replace(/\u00a0/g,' ').replace(/[’']/g,'').toUpperCase();
 if(!s)return null;
 const suffix=s.match(/^([0-9]+(?:[.,][0-9]{1,3})?)\s*([KMB])$/);
 if(suffix){
  const v=Number(suffix[1].replace(',','.'))*({K:1e3,M:1e6,B:1e9})[suffix[2]];
  if(!Number.isFinite(v)||v<0||v>MAX_AMOUNT)return null;
  return {value:Math.round(v),approximate:true,display:s};
 }
 // Separators are accepted ONLY in valid three-digit groups.
 const full=s.match(/^\d{1,3}(?:[ ,. ]\d{3})+$/);
 const plain=s.match(/^\d{1,12}$/);
 if(!full&&!plain)return null;
 const digits=s.replace(/[ ,.]/g,'');
 const value=Number(digits);
 if(!Number.isSafeInteger(value)||value>MAX_AMOUNT)return null;
 return {value,approximate:false,display:numberText(value)};
}
const LABELS={
 gold:/\bgold\b/i, elixir:/\belixir\b/i,dark:/\bdark\s+elixir\b/i,
 builderGold:/\bbuilder\s+gold\b/i,builderElixir:/\bbuilder\s+elixir\b/i,
 gems:/\bgems?\b/i
};
const detectLabel=line=>{
 if(LABELS.builderGold.test(line))return 'builderGold';
 if(LABELS.builderElixir.test(line))return 'builderElixir';
 if(LABELS.dark.test(line))return 'dark';
 if(LABELS.gems.test(line))return 'gems';
 if(LABELS.elixir.test(line))return 'elixir';
 if(LABELS.gold.test(line))return 'gold';
 return null;
};
// Candidate rows preserve OCR's top-to-bottom order, used only if the whole
// counter stack is recognized. Skip max-capacity labels and unrelated game UI.
export function extractCounterCandidates(text){
 if(typeof text!=='string'||text.length>150000)return [];
 const results=[];
 for(const rawLine of text.split(/\r?\n/).slice(0,100)){
  const line=rawLine.trim();
  if(!line||/\bmax(?:imum)?\s*[:.]|\bcapacity\b|\bshield\b|\blevel\b|\b(?:lv|lvl)\s*\d+\b/i.test(line))continue;
  const label=detectLabel(line);
  const withoutLabel=line.replace(/\b(?:builder|dark)\s+(?=gold|elixir)\b/gi,'')
   .replace(/\b(?:gold|elixir|gems?)\b/gi,'').replace(/[:：=]/g,'').trim();
  const amount=parseCounterAmount(withoutLabel)||parseCounterAmount(line);
  if(!amount)continue;
  results.push({...amount,label,raw:line});
 }
 return results.slice(0,20);
}
export function suggestCounters(candidates,mode){
 const slots=SCAN_FIELDS[mode];
 if(!slots)throw Error('Unknown village screenshot type.');
 const proposed={};
 const rows=(candidates||[]).filter(c=>c&&Number.isSafeInteger(c.value)&&c.value>=0);
 const issues=[];
 // Strong label matching is safe even if a row is missing; infer the others by
 // position ONLY for a complete stack with no extras and no label conflicts.
 const labelled=rows.filter(r=>r.label&&slots.some(([key])=>key===r.label));
 for(const row of labelled){
  if(proposed[row.label]){
   delete proposed[row.label];issues.push('Duplicate '+row.label+' labels were detected.');
  }else if(!issues.some(s=>s.includes(row.label))){
   proposed[row.label]={...row,method:'label'};
  }
 }
 const usedKeys=new Set(Object.keys(proposed));
 if(rows.length===slots.length && !issues.length){
  const compatible=rows.every((r,i)=>!r.label||r.label===slots[i][0]);
  if(compatible){
   rows.forEach((row,i)=>{const key=slots[i][0];if(!usedKeys.has(key))proposed[key]={...row,method:'order'};});
  }else issues.push('Counter labels do not match expected order. Assign numbers manually.');
 }else if(!labelled.length){
  issues.push('The full resource stack was not clearly detected. Assign numbers manually.');
 }
 if(rows.some(r=>r.approximate))issues.push('K/M/B values are rounded displays, not guaranteed exact.');
 return {proposed,issues,candidates:rows};
}
// A tight crop has an explicit target chosen by the user. Never assign multiple
// candidates to a single field or allow an OCR label that contradicts that target.
export function suggestOneCounter(candidates,mode,key){
 const slots=SCAN_FIELDS[mode];
 if(!slots||!slots.some(([field])=>field===key))throw Error('Invalid selected counter.');
 const rows=(candidates||[]).filter(c=>c&&Number.isSafeInteger(c.value)&&c.value>=0);
 const proposed={},issues=[];
 if(rows.length!==1)issues.push('Expected one clear number in the selected box; adjust it or type the amount.');
 else if(rows[0].label&&rows[0].label!==key)
  issues.push('Recognized label does not match the counter selected; adjust the box.');
 else proposed[key]={...rows[0],method:'selected-crop'};
 if(rows.some(r=>r.approximate))issues.push('K/M/B values are rounded and must be explicitly accepted.');
 return {proposed,issues,candidates:rows};
}
// Validate all requested changes together, without mutating the user's data.
// A checked field with no valid value aborts, rather than being saved as zero.
export function validateResourceUpdates(profile,updates){
 if(!profile||typeof profile!=='object'||!Array.isArray(updates))throw Error('Missing account or scanned resources.');
 const allowed=new Set(Object.values(SCAN_FIELDS).flat().map(([key])=>key));
 const result={};
 for(const candidate of updates){
  if(!candidate||!allowed.has(candidate.key))throw Error('Unrecognized resource type.');
  const amount=parseCounterAmount(String(candidate.value??''));
  if(!amount)throw Error('Check '+candidate.key+': enter a valid whole resource amount.');
  if(amount.approximate&&!candidate.acceptApproximate)throw Error('Confirm that '+candidate.key+' is an approximate K/M/B amount before saving.');
  if(Object.hasOwn(result,candidate.key) && result[candidate.key]!==amount.value)
   throw Error('Two screenshots disagree about '+candidate.key+'. Uncheck one before saving.');
  result[candidate.key]=amount.value;
 }
 if(!Object.keys(result).length)throw Error('Select at least one resource amount to save.');
 return result;
}
