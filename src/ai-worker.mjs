let generator=null;
const MODEL='onnx-community/Qwen2.5-0.5B-Instruct';
let active=false;
self.onmessage=async e=>{
 const {type,id,context}=e.data||{};
 if(type!=='explain'||!Number.isInteger(id)||active)return;
 active=true;
 try{
  if(!context||!Array.isArray(context.rows)||context.rows.length!==4||!Number.isSafeInteger(context.budget)||!Number.isSafeInteger(context.total)||!Number.isSafeInteger(context.reserve))throw Error('invalid');
  if(!generator){
   const {pipeline,env}=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1');
   env.allowLocalModels=false;
   env.backends.onnx.wasm.numThreads=1;
   generator=await pipeline('text-generation',MODEL,{dtype:'q4',device:'wasm',revision:'516c8d0',progress_callback:m=>{if(m.status==='progress')self.postMessage({type:'progress',message:`Descargando la explicación local… ${Math.min(100,Math.round(m.progress||0))}%`});}});
   self.postMessage({type:'ready'});
  }
  // The small local model selects a review focus; it never authors financial facts.
  const safe={cashLimited:!!context.limited,dataComplete:!!context.complete,expiryRisk:context.rows.some(r=>r.riskOfExpiry)};
  const messages=[{role:'system',content:'Classify the inventory warning. Reply only DATA, CASH, EXPIRY or READY. DATA for incomplete data. CASH for limited cash. EXPIRY for expiry risk. READY when no warning applies.'},
  {role:'user',content:'Cash is sufficient. Data is complete. No expiry risk.'},{role:'assistant',content:'READY'},
  {role:'user',content:'Cash is limited. Data is complete. No expiry risk.'},{role:'assistant',content:'CASH'},
  {role:'user',content:'Cash is sufficient. Data is incomplete. No expiry risk.'},{role:'assistant',content:'DATA'},
  {role:'user',content:'Cash is sufficient. Data is complete. There is expiry risk.'},{role:'assistant',content:'EXPIRY'},
  {role:'user',content:`Cash is ${safe.cashLimited?'limited':'sufficient'}. Data is ${safe.dataComplete?'complete':'incomplete'}. ${safe.expiryRisk?'There is expiry risk.':'No expiry risk.'}`}];
  const started=performance.now();
  const output=await generator(messages,{max_new_tokens:8,do_sample:false});
  const content=output?.[0]?.generated_text;
  const raw=typeof content==='string'?content:Array.isArray(content)?content.at(-1)?.content:'';
  const code=String(raw||'').trim().match(/^(DATA|CASH|EXPIRY|READY)\b/)?.[1];
  const valid=(code==='DATA'&&!safe.dataComplete)||(code==='CASH'&&safe.cashLimited)||(code==='EXPIRY'&&safe.expiryRisk)||(code==='READY'&&safe.dataComplete&&!safe.cashLimited&&!safe.expiryRisk);
  if(!valid){console.warn('Local model returned an unsupported review focus:',String(raw||'').slice(0,100));throw Error('output');}
  const reviewed={DATA:'Revisa primero los datos pendientes. Confirma el conteo y los costos antes de decidir el pedido.',CASH:'Revisa primero cómo repartes tu caja. La reserva está separada y puedes ajustar las cantidades sin rebasar el límite.',EXPIRY:'Revisa primero los productos por vencer. Confirma sus fechas y lo que puedes vender antes de reponer.',READY:'Revisa las cantidades contra lo que tienes en tienda. El pedido cabe en el límite calculado y puedes cambiarlo antes de decidir.'};
  self.postMessage({type:'result',id,text:reviewed[code],code,model:MODEL,engine:'Transformers.js 3.8.1 / WASM',elapsedMs:Math.round(performance.now()-started)});
 }catch(err){self.postMessage({type:'error',id,message:generator?'La explicación no estuvo disponible. Puedes revisar el cálculo por reglas.':'No se pudo descargar o iniciar el modelo en este equipo. El cálculo por reglas sigue disponible.'});}
 finally{active=false;}
};
