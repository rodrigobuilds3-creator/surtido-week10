export async function readImage(file,onProgress=()=>{}){
 if(!(file instanceof Blob)||!['image/png','image/jpeg'].includes(file.type)||file.size>5*1024*1024)throw Error('Usa una imagen PNG o JPEG de hasta 5 MB.');
 let worker;
 try{
  onProgress('Cargando lectura local de tickets…');
  const {default:Tesseract}=await import('https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.esm.min.js');
  const {createWorker}=Tesseract;
  worker=await createWorker('eng',1,{logger:m=>{if(m.status==='recognizing text')onProgress(`Leyendo el ticket… ${Math.round(m.progress*100)}%`);},workerPath:'https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/worker.min.js'});
  const result=await worker.recognize(file);
  if(!result.data?.text?.trim())throw Error('empty');
  return {text:result.data.text.slice(0,12000),confidence:result.data.confidence,engine:'Tesseract.js 6.0.1'};
 }catch(err){console.error('OCR:',String(err?.message||err));throw Error('No pude leer esta imagen. Prueba el ticket de práctica o corrige los datos manualmente.');}
 finally{if(worker)await worker.terminate();}
}
