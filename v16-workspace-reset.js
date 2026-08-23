(()=>{
function boot(){
  if(!window.TAGRO_CAD)return setTimeout(boot,120);
  const pane=document.querySelector('#cadLayers'),wrap=document.querySelector('.mapwrap');if(!pane||!wrap)return;
  const SESSION_KEYS=['tagro.v16.trial.workspace.v1','tagro.network.settings.v1','tagro.bom.settings.v1','tagro.cad.layers.v1'];
  const SESSION_PREFIXES=['tagro.v16.','tagro.network.','tagro.bom.','tagro.cad.','tagro.design.','tagro.device.'];
  const PRESERVE_KEYS=new Set(['tagro.identityTiles.v1','tagro.assist.on','tagro.assist.consent']);
  function shouldClear(k){return !PRESERVE_KEYS.has(k)&&(SESSION_KEYS.includes(k)||SESSION_PREFIXES.some(p=>k.startsWith(p)))}
  function clearStore(store){const keys=[];try{for(let i=0;i<store.length;i++){const k=store.key(i);if(k&&shouldClear(k))keys.push(k)}}catch{}for(const k of keys){try{store.removeItem(k)}catch{}}return keys}
  function clearKeys(){const local=clearStore(localStorage),session=clearStore(sessionStorage);for(const k of SESSION_KEYS){try{localStorage.removeItem(k)}catch{}try{sessionStorage.removeItem(k)}catch{}}return{local,session}}
  function removeLiveDrawing(){let n=0;const layers=window.TAGRO_CAD?.getLayers?.()||[];for(const l of layers){if(!l||l.options?.pmIgnore||!map?.hasLayer?.(l))continue;try{map.removeLayer(l);n++}catch{try{l.remove?.();n++}catch{}}}return n}
  function verifyCleared(){const left=[];for(const store of [localStorage,sessionStorage]){try{for(let i=0;i<store.length;i++){const k=store.key(i);if(k&&shouldClear(k))left.push(k)}}catch{}}return[...new Set(left)]}
  let modal=null;
  function ensureModal(){if(modal)return modal;modal=document.createElement('div');modal.className='tagro-reset-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','tagroResetTitle');modal.innerHTML='<div class="tagro-reset-dialog"><div class="tagro-reset-icon">↺</div><h3 id="tagroResetTitle">Reset this workspace?</h3><p>This clears the current field drawing, attached measurements and elevation, Design inputs, network/family state, device settings, BOM settings and CAD layer session state.</p><p><b>Your reusable Identity tiles are kept.</b> Browser Refresh is not a reset.</p><div class="tagro-reset-actions"><button type="button" data-reset-cancel>Cancel</button><button type="button" class="danger" data-reset-confirm>Reset workspace</button></div></div>';wrap.appendChild(modal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});modal.querySelector('[data-reset-cancel]').onclick=closeModal;modal.querySelector('[data-reset-confirm]').onclick=performReset;return modal}
  function openModal(){const m=ensureModal();m.classList.add('show');setTimeout(()=>m.querySelector('[data-reset-cancel]')?.focus(),20)}
  function closeModal(){modal?.classList.remove('show')}
  function showFailure(left){const m=ensureModal(),dlg=m.querySelector('.tagro-reset-dialog');dlg.innerHTML='<div class="tagro-reset-icon">!</div><h3>Reset could not finish</h3><p>Some workspace state could not be cleared. Nothing will be reported as a clean reset until this is resolved.</p><p style="word-break:break-word">Remaining: '+left.join(', ')+'</p><div class="tagro-reset-actions"><button type="button" data-reset-cancel>Close</button></div>';dlg.querySelector('[data-reset-cancel]').onclick=closeModal;m.classList.add('show')}
  function performReset(){
    window.TAGRO_RESETTING=true;
    try{window.TAGRO_V16_PERSISTENCE?.suspend?.()}catch{}
    const confirmBtn=modal?.querySelector('[data-reset-confirm]');if(confirmBtn){confirmBtn.disabled=true;confirmBtn.textContent='Clearing…'}
    try{window.TAGRO_BOM?.close?.()}catch{}
    try{window.TAGRO_FAMILY_TREE?.close?.()}catch{}
    try{window.TAGRO_SPACING_TOOL?.deactivate?.()}catch{}
    try{window.TAGRO_FREE_LAYOUT?.clear?.()}catch{}
    try{window.TAGRO_LATERAL_TOOLS?.clearPreview?.()}catch{}
    removeLiveDrawing();
    try{window.TAGRO_V16_PERSISTENCE?.clear?.()}catch{}
    clearKeys();
    const left=verifyCleared();
    if(left.length){window.TAGRO_RESETTING=false;try{window.TAGRO_V16_PERSISTENCE?.resume?.()}catch{}showFailure(left);return false}
    if(modal){const dlg=modal.querySelector('.tagro-reset-dialog');dlg.innerHTML='<div class="tagro-reset-icon">✓</div><h3>Workspace cleared</h3><p>Reloading a clean field session…</p>'}
    setTimeout(()=>location.reload(),100);return true;
  }
  function reset(){openModal();return true}
  function inject(){
    if(!pane.classList.contains('on')||pane.querySelector('.tagro-workspace-tools'))return;
    const box=document.createElement('div');box.className='tagro-workspace-tools';box.innerHTML='<div class="tagro-workspace-row"><div><b>Workspace</b><span>Clean start for this field session</span></div><button type="button" class="tagro-cad-btn danger" data-tagro-reset>Reset workspace</button></div><div class="tagro-workspace-help"><b>Delete one drawing:</b> select it → <b>Object</b> → <b>Delete</b>, or use the drawing-toolbar eraser. Browser Refresh keeps the saved workspace.</div>';
    pane.insertBefore(box,pane.firstChild);box.querySelector('[data-tagro-reset]').onclick=reset;
  }
  const style=document.createElement('style');style.textContent='.tagro-workspace-tools{margin:0 0 8px;padding:8px;border:1px solid #e0e4e0;border-radius:10px;background:#fafbfa;display:grid;gap:7px}.tagro-workspace-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px;align-items:center}.tagro-workspace-row b{display:block;font-size:10px}.tagro-workspace-row span{display:block;margin-top:2px;font-size:8.5px;color:#747b75}.tagro-workspace-tools .tagro-cad-btn{min-height:32px;white-space:nowrap}.tagro-workspace-help{font-size:9px;line-height:1.4;color:#626a63}@media(max-width:699px){.tagro-workspace-row{grid-template-columns:1fr}.tagro-workspace-tools .tagro-cad-btn{width:100%;min-height:42px}}';document.head.appendChild(style);
  const mo=new MutationObserver(()=>setTimeout(inject,0));mo.observe(pane,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  window.addEventListener('tagro:cadchange',()=>setTimeout(inject,0));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal?.classList.contains('show')){e.preventDefault();closeModal()}});
  window.TAGRO_WORKSPACE={reset,performReset,clearKeys,verifyCleared,sessionKeys:[...SESSION_KEYS]};setTimeout(inject,150);
}
boot();
})();