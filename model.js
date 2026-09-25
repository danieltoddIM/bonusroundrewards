'use strict';
const defaults={"scrabbleEpisodes":50,"triviaEpisodes":50,"scrabbleViewers":422000,"triviaViewers":505000,"scanRate":0.5,"conversion":10,"posts":52,"reachRate":3,"ctr":1,"store":20,"overlap":10,"engaged":45,"churn":15,"gross":5.5,"low":2,"high":2.25};
function acquisition(v){const viewers=v.scrabbleEpisodes*v.scrabbleViewers+v.triviaEpisodes*v.triviaViewers;const scans=viewers*v.scanRate/100;const qr=scans*v.conversion/100;const reach=7808100*v.reachRate/100;const social=v.posts*reach*v.ctr/100*v.store/100;return {viewers,scans,reach,qr,social,net:(qr+social)*(1-v.overlap/100)};}
function projection(v,net){let mau=0;const add=net/12*v.engaged/100;const rows=Array.from({length:24},(_,i)=>{mau=mau*(1-v.churn/100)+add;return {month:i+1,mau,gross:mau*v.gross,low:mau*v.low,high:mau*v.high};});return {rows,steady:v.churn?add/(v.churn/100):(add?null:0)};}
const page=document.querySelector('main').dataset.modelPage;
const fields=[...document.querySelectorAll('[data-input]')];const message=document.querySelector('#model-message');
let values={...defaults};
try{const saved=JSON.parse(localStorage.getItem('bonusRoundModelV2')||'{}');for(const key of Object.keys(defaults)){if(typeof saved[key]==='number'&&Number.isFinite(saved[key])&&saved[key]>=0)values[key]=saved[key];}}catch{}
fields.forEach(input=>{input.value=values[input.id];if(!input.checkValidity()){input.value=defaults[input.id];values[input.id]=defaults[input.id];}});
let netOverride=null;
const param=new URLSearchParams(location.search).get('installs');
if(page==='economics'&&param!==null&&param.trim()!==''&&Number.isFinite(Number(param))&&Number(param)>=0&&Number(param)<=1e12)netOverride=Number(param);
const number=new Intl.NumberFormat('en-US',{maximumFractionDigits:0});const money=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
const range=(a,b)=>money.format(a)+'–'+money.format(b);const set=(id,text)=>document.getElementById(id).textContent=text;
let currentRows=[];
function recalc(){
 const exportButton=document.getElementById('export-model');const next=document.getElementById('to-economics');
 const valid=fields.every(input=>input.checkValidity()&&Number.isFinite(Number(input.value)));
 fields.forEach(input=>{if(input.value!=='')values[input.id]=Number(input.value);});
 if(!valid||(page==='economics'&&(values.low>values.high||values.high>values.gross))){message.textContent='Check the inputs. Values must be within their ranges; partner share must be ordered low to high and cannot exceed gross revenue. Results retain the last valid scenario.';if(exportButton)exportButton.disabled=true;if(next){next.removeAttribute('href');next.setAttribute('aria-disabled','true');}return;}
 fields.forEach(input=>{const output=document.getElementById(input.id+'Val');const unit=input.dataset.unit||'';if(output)output.textContent=(unit==='$'?'$':'')+new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(values[input.id])+(unit==='%'?'%':'');input.setAttribute('aria-valuetext',output?output.textContent:input.value);});
 message.textContent='';if(exportButton)exportButton.disabled=false;if(next)next.removeAttribute('aria-disabled');
 try{localStorage.setItem('bonusRoundModelV2',JSON.stringify(values));}catch{}
 const a=acquisition(values);
 if(page==='install'){set('viewer-result',number.format(a.viewers));set('scan-result',number.format(a.scans));set('reach-result',number.format(a.reach));set('posts-result',number.format(values.posts));set('qr-result',number.format(a.qr));set('social-result',number.format(a.social));set('net-result',number.format(a.net));next.href='economics-model.html?installs='+encodeURIComponent(a.net);return;}
 const net=netOverride===null?a.net:netOverride;const m=projection(values,net);currentRows=m.rows;
 set('acquisition-context',number.format(net)+' modeled net annual installs. '+(netOverride===null?'Uses the saved TV and CW social assumptions, or the planning defaults on first visit.':'Uses the acquisition scenario passed from the Install Model.'));
 const total=(key,start,end)=>m.rows.slice(start,end).reduce((sum,row)=>sum+row[key],0);
 set('y1-share',range(total('low',0,12),total('high',0,12)));set('y2-share',range(total('low',12,24),total('high',12,24)));set('m24',number.format(m.rows[23].mau));set('y2-gross',money.format(total('gross',12,24)));set('run-rate',range(m.rows[23].low*12,m.rows[23].high*12));set('steady',m.steady===null?'No finite steady state':number.format(m.steady));
 document.getElementById('monthly-results').replaceChildren(...m.rows.map(row=>{const tr=document.createElement('tr');[row.month,number.format(row.mau),money.format(row.gross),range(row.low,row.high)].forEach(value=>{const td=document.createElement('td');td.textContent=value;tr.append(td);});return tr;}));
 const svg=document.getElementById('mau-chart');svg.replaceChildren();const peak=Math.max(1,...m.rows.map(row=>row.mau));
 const shape=(tag,attrs,text)=>{const node=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([key,value])=>node.setAttribute(key,value));if(text)node.textContent=text;svg.append(node);};
 for(let i=0;i<5;i++){const y=20+i*55;shape('line',{x1:80,x2:790,y1:y,y2:y,stroke:'#d6e1eb'});shape('text',{x:70,y:y+4,'text-anchor':'end','font-size':13,fill:'#52667b'},number.format(peak*(1-i/4)));}
 m.rows.forEach((row,i)=>shape('rect',{x:83+i*710/24,y:240-row.mau/peak*220,width:20,height:row.mau/peak*220,rx:3,fill:i<12?'#0864cb':'#b18724'}));svg.setAttribute('aria-label','Active players grow from '+number.format(m.rows[0].mau)+' in month 1 to '+number.format(m.rows[23].mau)+' in month 24. Exact values appear in the table.');
}
document.querySelectorAll('[data-posts]').forEach(button=>button.addEventListener('click',()=>{document.getElementById('posts').value=button.dataset.posts;recalc();}));
fields.forEach(input=>input.addEventListener('input',recalc));document.getElementById('reset-model').addEventListener('click',()=>{fields.forEach(input=>{input.value=defaults[input.id];values[input.id]=defaults[input.id];});recalc();});
const exportButton=document.getElementById('export-model');if(exportButton)exportButton.addEventListener('click',()=>{const rows=[['Bonus Round — illustrative scenario'],['Net annual installs',netOverride===null?acquisition(values).net:netOverride],['CW combined followers (overlap not removed)',7808100],['Acquisition inputs apply to net total',netOverride===null?'Yes':'Net total transferred from Install Model; acquisition inputs below may differ if browser storage is unavailable'],...Object.keys(defaults).map(key=>[key,values[key]]),[],['Month','Active players','Gross revenue USD','Partner share low USD','Partner share high USD'],...currentRows.map(row=>[row.month,row.mau,row.gross,row.low,row.high])];const csv=rows.map(row=>row.map(value=>'"'+String(value).replace(/"/g,'""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'}));const a=document.createElement('a');a.href=url;a.download='Bonus-Round-Scenario.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
recalc();
