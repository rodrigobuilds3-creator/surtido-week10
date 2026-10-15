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
   generator=await pipeline('text-generation',MODEL,{dtype:'q4f16',device:'webgpu',revision:'516c8d0',progress_callback:m=>{if(m.status==='progress')self.postMessage({type:'progress',message:`Descargando la explicación local… ${Math.min(100,Math.round(m.progress||0))}%`});}});
   self.postMessage({type:'ready'});
  }
  const safe={limited:!!context.limited,complete:!!context.complete,reserveIsProtected:context.total<=context.budget,productCount:context.rows.length,hasExpiryRisk:context.rows.some(r=>r.riskOfExpiry)};
  const messages=[{role:'system',content:'Escribe SOLO una explicación breve en español para la dueña de una tiendita. Usa dos frases sencillas, sin cifras, sin listas, sin monedas, sin porcentajes y sin promesas de ventas o ahorro. Explica que se separa la reserva antes de comprar, que se revisa lo que ya está en tienda y que la dueña puede corregir el pedido. No hagas cuentas ni recomiendes productos nuevos. No digas que todo está confirmado si hay datos incompletos. No actúes sobre el pedido.'},{role:'user',content:`Resume por qué debemos revisar los datos y respetar la reserva antes del pedido. Estado calculado: ${JSON.stringify(safe)}. Devuelve solamente las dos frases.`}];
  const started=performance.now();
  const output=await generator(messages,{max_new_tokens:95,do_sample:false,repetition_penalty:1.1});
  const content=output?.[0]?.generated_text;
  const text=typeof content==='string'?content:Array.isArray(content)?content.at(-1)?.content:'';
  if(!text||text.length>1000)throw Error('output');
  self.postMessage({type:'result',id,text,model:MODEL,engine:'Transformers.js 3.8.1 / WebGPU',elapsedMs:Math.round(performance.now()-started)});
 }catch(err){self.postMessage({type:'error',id,message:generator?'La explicación no estuvo disponible. Puedes revisar el cálculo por reglas.':'No se pudo descargar o iniciar el modelo en este equipo. El cálculo por reglas sigue disponible.'});}
 finally{active=false;}
};
