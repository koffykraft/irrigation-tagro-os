(()=>{
function boot(){
  if(!window.TAGRO_CAD||!window.TAGRO_V16_PERSISTENCE)return setTimeout(boot,120);
  const pane=document.querySelector('#cadMeasure');if(!pane)return;
  function selected(){return window.TAGRO_CAD.getSelected?.()||null}
  function markLegacy(l){
    if(!l)return;
    const g=l.options?.tagroEngineering;if(g&&g.confirmed!==true){g.confirmed=false;g.provenance=g.provenance||'default'}
    const e=l.options?.tagroEmitter;if(e&&e.confirmed!==true){e.confirmed=false;e.provenance=e.provenance||'default'}
  }
  function persist(){window.TAGRO_V16_PERSISTENCE?.save?.();window.dispatchEvent(new CustomEvent('tagro:designprovenancechange'))}
  function confirm(kind){
    const l=selected();if(!l)return;markLegacy(l);
    if((kind==='pipe'||kind==='all')&&l.options.tagroEngineering){l.options.tagroEngineering.confirmed=true;l.options.tagroEngineering.provenance='user'}
    if((kind==='emitter'||kind==='all')&&l.options.tagroEmitter){l.options.tagroEmitter.confirmed=true;l.options.tagroEmitter.provenance='user'}
    persist();inject();
  }
  pane.addEventListener('change',e=>{
    const k=e.target?.dataset?.v16;if(!k)return;const l=selected();if(!l)return;markLegacy(l);
    if(['size','material','sdr'].includes(k))confirm('pipe');
    else if(['q','spacing','head'].includes(k))confirm('emitter');
  },true);
  function inject(){
    const box=pane.querySelector('.v16-design'),l=selected();if(!box||!l)return;markLegacy(l);
    let row=box.querySelector('.v16-provenance');if(!row){row=document.createElement('div');row.className='v16-provenance';box.appendChild(row)}
    const g=l.options.tagroEngineering,e=l.options.tagroEmitter,pipeOk=g?.confirmed===true,emitNeeded=String(l.options.tagroIdentityId||'')==='lateral',emitOk=!emitNeeded||e?.confirmed===true;
    const sig=`${pipeOk?'1':'0'}:${emitNeeded?'1':'0'}:${emitOk?'1':'0'}`;if(row.dataset.sig===sig)return;row.dataset.sig=sig;
    row.innerHTML=`<div class="${pipeOk&&emitOk?'v16-design-ok':'v16-design-warn'}">${pipeOk?'Pipe specification accepted':'Pipe specification is a software default'}${emitNeeded?` · ${emitOk?'Emitter inputs accepted':'Emitter inputs are software defaults'}`:''}</div>${pipeOk&&emitOk?'':`<button type="button" class="tagro-cad-btn" data-v16-accept>Accept shown inputs</button>`}`;
    const b=row.querySelector('[data-v16-accept]');if(b)b.onclick=()=>confirm('all');
  }
  const style=document.createElement('style');style.textContent='.v16-provenance{display:grid;gap:6px}.v16-provenance .tagro-cad-btn{width:100%;min-height:30px}';document.head.appendChild(style);
  const mo=new MutationObserver(()=>setTimeout(inject,0));mo.observe(pane,{childList:true,subtree:true});
  ['tagro:cadselect','tagro:identitychange','tagro:cadchange'].forEach(n=>window.addEventListener(n,()=>setTimeout(inject,0)));
  window.TAGRO_DESIGN_PROVENANCE={confirm,refresh:inject};setTimeout(inject,150);
}
boot();
})();
