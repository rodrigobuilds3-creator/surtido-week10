export const MODEL_VERSION='surtido-replenishment-v1';
export const currency=cents=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:cents%100?2:0}).format(cents/100);
export const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Mexico_City',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export const clone=v=>JSON.parse(JSON.stringify(v));
export function money(value){const s=String(value).trim();if(!/^\d{1,7}(?:\.\d{1,2})?$/.test(s))throw Error('Escribe un importe válido, con hasta dos decimales.');const n=Math.round(Number(s)*100);if(n>100000000)throw Error('El importe supera el límite del caso.');return n;}
export function integer(v,min=0,max=2000){if(!/^\d+$/.test(String(v))||!Number.isSafeInteger(Number(v))||Number(v)<min||Number(v)>max)throw Error(`Usa un número entero de ${min} a ${max}.`);return Number(v);}
export function seed(day=today()){
 const row=(id,name,kind,stock,history,cost,price,pack,capacity,soon,soonDays)=>({id,name,kind,stock,history,cost,price,pack,capacity,soon,soonDays,lifeDays:10,stockDate:day,priceDate:day,historyDate:day,stockConfirmed:true,priceConfirmed:true,source:'Datos del caso de práctica',unit:'pzas'});
 return {day,cash:280000,reserve:40000,horizon:7,buffer:10,products:[
  row('YOG-001','Yogur natural','yogurt',8,[70,72,71],1200,1600,6,80,2,1),
  row('LEC-002','Leche entera','milk',12,[46,48,50],1800,2400,6,84,4,1),
  row('PAN-003','Pan de caja','bread',6,[20,21,22],2200,3000,3,30,2,1),
  row('QUE-004','Queso fresco','cheese',4,[10,12,14],3000,4200,2,20,1,1)
 ],overrides:{},revision:0};
}
const age=(older,day)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(older))return Infinity;return Math.round((Date.parse(day+'T12:00:00Z')-Date.parse(older+'T12:00:00Z'))/86400000);};
export function validateState(s){
 if(!s||!Array.isArray(s.products)||s.products.length!==4)throw Error('El caso necesita cuatro productos.');
 for(const key of ['cash','reserve'])if(!Number.isSafeInteger(s[key])||s[key]<0||s[key]>100000000)throw Error('Revisa los importes de caja y reserva.');
 if(s.reserve>s.cash)throw Error('La reserva no puede superar tu caja disponible.');
 integer(s.horizon,1,28);integer(s.buffer,0,30);
 if(new Set(s.products.map(p=>p.id)).size!==4)throw Error('Hay productos repetidos.');
 for(const p of s.products){
  if(!/^(YOG-001|LEC-002|PAN-003|QUE-004)$/.test(p.id))throw Error('Producto ajeno al caso.');
  for(const k of ['stock','capacity','soon'])integer(p[k]);
  integer(p.pack,1,1000);integer(p.lifeDays,1,60);integer(p.soonDays,0,30);
  if(p.stock>p.capacity||p.soon>p.stock)throw Error('El conteo, la capacidad y las piezas por vencer no coinciden.');
  if(!Number.isSafeInteger(p.cost)||p.cost<1||p.cost>5000000)throw Error('Revisa el costo unitario.');
  if(!Number.isSafeInteger(p.price)||p.price<1||p.price>10000000)throw Error('Revisa el precio de venta.');
  if(!Array.isArray(p.history)||p.history.length!==3)throw Error('Registra las tres semanas del caso.');p.history.forEach(v=>integer(v,0,10000));
 }
 return s;
}
export function readiness(p,day){
 const reasons=[];
 if(!p.stockConfirmed||age(p.stockDate,day)!==0)reasons.push('Confirma el conteo de hoy');
 if(!p.priceConfirmed||age(p.priceDate,day)<0||age(p.priceDate,day)>30)reasons.push('Confirma el costo vigente');
 if(age(p.historyDate,day)<0||age(p.historyDate,day)>14)reasons.push('Actualiza las ventas registradas');
 return reasons;
}
export function fingerprint(s){let h=2166136261;for(const c of JSON.stringify(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return (h>>>0).toString(16);}
export function plan(state){
 const s=validateState(state),budget=s.cash-s.reserve;
 const rows=s.products.map(p=>{
  const daily=p.history.reduce((a,b)=>a+b,0)/21;
  const expiredSoon=Math.max(0,p.soon-Math.floor(daily*p.soonDays));
  const usable=Math.max(0,p.stock-expiredSoon);
  const reasons=readiness(p,s.day);
  const raw=Math.max(0,Math.ceil(daily*Math.min(s.horizon,p.lifeDays)*(1+s.buffer/100)-usable));
  const packs=Math.ceil(raw/p.pack)*p.pack;
  const storage=Math.floor(Math.max(0,p.capacity-p.stock)/p.pack)*p.pack;
  const life=Math.floor(Math.max(0,Math.floor(daily*p.lifeDays)-usable)/p.pack)*p.pack;
  const desired=reasons.length?0:Math.min(packs,storage,life);
  return {...p,daily,usable,expiredSoon,reasons,desired,qty:0,coverage:daily?usable/daily:Infinity};
 });
 let spent=0,steps=0;
 while(steps++<10000){
  const choices=rows.filter(r=>r.qty+r.pack<=r.desired&&spent+r.pack*r.cost<=budget).sort((a,b)=>(a.usable+a.qty)/a.daily-(b.usable+b.qty)/b.daily||a.id.localeCompare(b.id));
  if(!choices.length)break;
  const r=choices[0];r.qty+=r.pack;spent+=r.pack*r.cost;
 }
 const suggested=Object.fromEntries(rows.map(r=>[r.id,r.qty]));
 const errors=[],warnings=[];
 for(const r of rows){
  if(Object.hasOwn(s.overrides,r.id))r.qty=integer(s.overrides[r.id]);
  if(r.qty%r.pack)errors.push(`${r.name}: el proveedor entrega paquetes de ${r.pack}.`);
  if(r.qty+r.stock>r.capacity)errors.push(`${r.name}: supera la capacidad de ${r.capacity} piezas.`);
  if(r.reasons.length&&r.qty>0)errors.push(`${r.name}: confirma los datos antes de comprar.`);
  if(r.qty>r.desired&&!r.reasons.length)warnings.push(`${r.name}: estás comprando más que la referencia de ventas y vida del lote. Revisa el riesgo de merma.`);
 }
 const total=rows.reduce((sum,r)=>sum+r.qty*r.cost,0);
 if(total>budget)errors.push('El pedido usa parte de tu reserva. Reduce cantidades o cambia tus límites.');
 const need=rows.reduce((sum,r)=>sum+r.desired*r.cost,0);
 return {rows,total,budget,remaining:s.cash-total,headroom:budget-total,reserve:s.reserve,suggested,need,shortfall:Math.max(0,need-budget),errors,warnings,complete:rows.every(r=>!r.reasons.length),valid:errors.length===0,empty:rows.every(r=>r.qty===0),fingerprint:fingerprint(s)};
}
export function change(state,mutate){const s=clone(state);mutate(s);s.revision++;validateState(s);return s;}
export function orderCopy(state,acknowledged){const p=plan(state);if(!acknowledged)throw Error('Confirma que revisaste cantidades y límites.');if(!p.valid||p.empty)throw Error('Revisa el pedido antes de guardar.');return {type:'SURTIDO_PRACTICE_ORDER',notice:'Datos del caso de práctica. Copia local; no enviada a proveedor.',model:MODEL_VERSION,day:state.day,fingerprint:p.fingerprint,cash:state.cash,reserve:state.reserve,total:p.total,remaining:p.remaining,complete:p.complete,items:p.rows.filter(r=>r.qty).map(r=>({sku:r.id,product:r.name,quantity:r.qty,unitCost:r.cost,total:r.qty*r.cost,source:r.source,sourceDate:r.priceDate})),warnings:p.warnings};}
export function parseReceipt(text){
 if(typeof text!=='string'||text.length>12000)throw Error('El texto del ticket no es válido.');
 const t=text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
 const sku=t.match(/(?:CODIGO|SKU)\s*[:#]?\s*((?:YOG|LEC|PAN|QUE)[- ]?\d{3})/);
 const match=t.match(/COSTO\s+UNITARIO\s*[:$]?\s*\$?\s*(\d{1,5}(?:[.,]\d{1,2})?)/);
 return {sku:sku?sku[1].replace(/\s/,'-'):null,cost:match?money(match[1].replace(',','.')):null,raw:text};
}
export function explainRules(s,p=plan(s)){
 const a=[];
 if(!p.complete)a.push('Hay productos sin datos confirmados: quedaron fuera de la sugerencia.');
 if(!p.budget)a.push('Con tu reserva actual no queda presupuesto para comprar. Puedes dejar el pedido en cero o revisar tus límites.');
 else if(p.shortfall)a.push('La caja no alcanza para toda la referencia. Repartimos paquetes dando prioridad a lo que tiene menos días de cobertura, sin tocar tu reserva.');
 else a.push('El pedido cabe en tu límite después de separar la reserva. La referencia descuenta lo que todavía tienes y respeta los paquetes del proveedor.');
 if(p.rows.some(r=>r.expiredSoon>0))a.push('Revisa primero los lotes que pueden vencer antes de venderse. La venta futura no está garantizada.');
 a.push('Puedes corregir el conteo, cambiar cantidades o decidir no comprar.');
 return a.join(' ');
}
export function aiContext(s,p=plan(s)){return {budget:s.cash-s.reserve,reserve:s.reserve,total:p.total,limited:p.shortfall>0,complete:p.complete,rows:p.rows.map(r=>({product:r.name,count:r.stock,proposal:r.qty,confirmed:!r.reasons.length,riskOfExpiry:r.expiredSoon>0}))};}
export function validateExplanation(value){const t=String(value||'').trim();if(t.length<25||t.length>900||/\d|<|>|https?:|garantiz|sin riesgo|ahorro seguro/i.test(t))throw Error('La explicación necesita revisión. Usa el cálculo verificable.');return t;}
export function economics({demand=[70,75,82,65],oldOrder=100,newOrder=78,cost=1200,price=1600,fee=9900,minutesPerDay=3,onboardingMinutes=30,hourly=6000}={}){
 if(!Array.isArray(demand)||demand.length!==4)throw Error('Se necesitan cuatro semanas.');demand.forEach(v=>integer(v,0,10000));
 integer(oldOrder,0,2000);integer(newOrder,0,2000);integer(minutesPerDay,0,60);integer(onboardingMinutes,0,240);
 const sums=order=>demand.reduce((v,d)=>({waste:v.waste+Math.max(0,order-d),sales:v.sales+Math.min(d,order),missed:v.missed+Math.max(0,d-order)}),{waste:0,sales:0,missed:0});
 const before=sums(oldOrder),after=sums(newOrder),avoided=(before.waste-after.waste)*cost,lostMargin=(before.sales-after.sales)*(price-cost),benefit=avoided-lostMargin;
 const capture=Math.round(minutesPerDay*28/60*hourly),onboarding=Math.round(onboardingMinutes/60*hourly),totalCost=fee+capture+onboarding;
 return {before,after,avoided,lostMargin,benefit,capture,onboarding,totalCost,net:benefit-totalCost,ratio:totalCost?benefit/totalCost:null};
}
