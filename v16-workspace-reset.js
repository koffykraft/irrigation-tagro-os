(()=>{
function boot(){
  if(!window.TAGRO_CAD)return setTimeout(boot,120);
  const pane=document.querySelector('#cadLayers');if(!pane)return;
  const SESSION_KEYS=['tagro.v16.trial.workspace.v1','tagro.network.settings.v1','tagro.bom.settings.v1','tagro.cad.layers.v1'];
  const SESSION_PREFIXES=['tagro.v16.','tagro.network.','tagro.bom.','tagro.cad.','tagro.design.','tagro.device.'];
  const PRESERVE_KEYS=new Set(['tagro.identityTiles.v1','tagro.assist.on','tagro.assist.consent']);
  function shouldClear(k){return !PRESERVE_KEYS.has(k)&&(SESSION_KEYS.includes(k)||SESSION_PREFIXES.some(p=>k.startsWith(p)))}
  function clearStore(store){const keys=[];try{for(let i=0;i<store.length;i++){const k=store.key(i);if(k&&shouldClear(k))keys.push(k)}}catch{}for(const k of keys){try{store.removeItem(k)}catch{}}return keys}
  function clearKeys(){const local=clearStore(localStorage),session=clearStore(sessionStorage);for(const k of SESSION_KEYS){try{localStorage.removeItem(k)}catch{}try{sessionStorage.removeItem(k)}catch{}}return{local,session}}
  function removeLiveDrawing(){let n=0;const layers=window.TAGRO_CAD?.getLayers?.()||[];for(const l of layers){if(!l||l.options?.pmIgnore||!map?.hasLayer?.(l))continue;try{map.removeLayer(l);n++}catch{try{l.remove?.();n++}catch{}}}return n}
  function verifyCleared(){const left=[];for(const store of [localStorage,sessionStorage]){try{for(let i=0;i<store.length;i++){const k=store.key(i);if(k&&shouldClear(k))left.push(k)}}catch{}}return[...new Set(left)]}
  function reset(){
    const ok=window.confirm('Reset this workspace?\n\nThis clears all current drawings, measurements/elevation attached to them, Design inputs, network/family state, device settings, BOM settings and CAD layer session state, then reloads a blank workspace.\n\nReusable Identity tile definitions are kept.');
    if(!ok)return false;
    window.TAGRO_RESETTING=true;
    try{window.TAGRO_V16_PERSISTENCE?.suspend?.()}catch{}
    const btn=pane.querySelector('[data-tagro-reset]');if(btn){btn.disabled=true;btn.textContent='Clearing…'}
    try{window.TAGRO_BOM?.close?.()}catch{}
    try{window.TAGRO_FAMILY_TREE?.close?.()}catch{}
    try{window.TAGRO_SPACING_TOOL?.deactivate?.()}catch{}
    try{window.TAGRO_FREE_LAYOUT?.clear?.()}catch{}
    try{window.TAGRO_LATERAL_TOOLS?.clearPreview?.()}catch{}
    removeLiveDrawing();
    try{window.TAGRO_V16_PERSISTENCE?.clear?.()}catch{}
    clearKeys();
    const left=verifyCleared();
    if(left.length){if(btn){btn.disabled=false;btn.textContent='Reset workspace'}window.alert('Reset could not clear all workspace state. Remaining keys:\n'+left.join('\n'));return false}
    setTimeout(()=>location.reload(),80);return true;
  }
  function inject(){
    if(!pane.classList.contains('on')||pane.querySelector('.tagro-workspace-tools'))return;
    const box=document.createElement('div');box.className='tagro-workspace-tools';box.innerHTML='<div class="tagro-workspace-row"><div><b>Workspace</b><span>Clean start for this field session</span></div><button type="button" class="tagro-cad-btn danger" data-tagro-reset>Reset workspace</button></div><div class="tagro-workspace-help"><b>Delete one drawing:</b> select it → <b>Object</b> → <b>Delete</b>, or use the drawing-toolbar eraser. Browser Refresh keeps the saved workspace.</div>';
    pane.insertBefore(box,pane.firstChild);box.querySelector('[data-tagro-reset]').onclick=reset;
  }
  const style=document.createElement('style');style.textContent='.tagro-workspace-tools{margin:0 0 8px;padding:7px;border:1px solid #e0e4e0;border-radius:8px;background:#fafbfa;display:grid;gap:6px}.tagro-workspace-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px;align-items:center}.tagro-workspace-row b{display:block;font-size:10px}.tagro-workspace-row span{display:block;margin-top:1px;font-size:8.5px;color:#747b75}.tagro-workspace-tools .tagro-cad-btn{min-height:30px;white-space:nowrap}.tagro-workspace-help{font-size:9px;line-height:1.35;color:#626a63}@media(max-width:699px){.tagro-workspace-row{grid-template-columns:1fr}.tagro-workspace-tools .tagro-cad-btn{width:100%;min-height:34px}}';document.head.appendChild(style);
  const mo=new MutationObserver(()=>setTimeout(inject,0));mo.observe(pane,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  window.addEventListener('tagro:cadchange',()=>setTimeout(inject,0));
  window.TAGRO_WORKSPACE={reset,clearKeys,verifyCleared,sessionKeys:[...SESSION_KEYS]};setTimeout(inject,150);
}
boot();
})();
