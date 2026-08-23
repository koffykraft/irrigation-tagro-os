(()=>{
const nativeFetch=window.fetch.bind(window);
window.fetch=(input,init={})=>{
 const url=typeof input==='string'?input:input?.url||'';
 if(!url.includes('api.open-meteo.com/v1/elevation'))return nativeFetch(input,init);
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),10000),upstream=init.signal;
 if(upstream){if(upstream.aborted)ctrl.abort();else upstream.addEventListener('abort',()=>ctrl.abort(),{once:true})}
 return nativeFetch(input,{...init,signal:ctrl.signal}).catch(e=>{if(e?.name==='AbortError')throw new Error('Elevation request timed out. Tap Load map again.');throw e}).finally(()=>clearTimeout(timer));
};
window.addEventListener('error',e=>{console.error('TAGRO v16 runtime error',e.error||e.message)});
window.addEventListener('unhandledrejection',e=>{console.error('TAGRO v16 promise error',e.reason)});
})();