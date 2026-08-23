(()=>{
function boot(){
  if(!window.TAGRO_CAD)return setTimeout(boot,120);
  const pane=document.querySelector('#cadLayers');if(!pane)return;
  const SESSION_KEYS=['tagro.v16.trial.workspace.v1','tagro.network.settings.v1','tagro.bom.settings.v1','tagro.cad.layers.v1'];
  function clearKeys(){for(const k of SESSION_KEYS){try{localStorage.removeItem(k)}catch{}try{sessionStorage.removeItem(k)}catch{}}}
  function reset(){
    const ok=window.confirm('Reset this workspace?\n\nThis clears all current drawings, measurements/elevation attached to them, Design inputs, network settings, BOM settings and CAD layer session state, then reloads a blank workspace.\n\nReusable Identity tile definitions are kept.');
    if(!ok)return false;
    try{window.TAGRO_V16_PERSISTENCE?.clear?.()}catch{}
    clearKeys();location.reload();return true;
  }
  function inject(){
    if(!pane.classList.contains('on')||pane.querySelector('.tagro-workspace-tools'))return;
    const box=document.createElement('div');box.className='tagro-workspace-tools';box.innerHTML='<div class="tagro-workspace-row"><div><b>Workspace</b><span>Clean start for this field session</span></div><button type="button" class="tagro-cad-btn danger" data-tagro-reset>Reset workspace</button></div><div class="tagro-workspace-help"><b>Delete one drawing:</b> select it → <b>Object</b> → <b>Delete</b>, or use the drawing-toolbar eraser. Browser Refresh keeps the saved workspace.</div>';
    pane.insertBefore(box,pane.firstChild);box.querySelector('[data-tagro-reset]').onclick=reset;
  }
  const style=document.createElement('style');style.textContent='.tagro-workspace-tools{margin:0 0 8px;padding:7px;border:1px solid #e0e4e0;border-radius:8px;background:#fafbfa;display:grid;gap:6px}.tagro-workspace-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px;align-items:center}.tagro-workspace-row b{display:block;font-size:10px}.tagro-workspace-row span{display:block;margin-top:1px;font-size:8.5px;color:#747b75}.tagro-workspace-tools .tagro-cad-btn{min-height:30px;white-space:nowrap}.tagro-workspace-help{font-size:9px;line-height:1.35;color:#626a63}@media(max-width:699px){.tagro-workspace-row{grid-template-columns:1fr}.tagro-workspace-tools .tagro-cad-btn{width:100%;min-height:34px}}';document.head.appendChild(style);
  const mo=new MutationObserver(()=>setTimeout(inject,0));mo.observe(pane,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  window.addEventListener('tagro:cadchange',()=>setTimeout(inject,0));
  window.TAGRO_WORKSPACE={reset,clearKeys,sessionKeys:[...SESSION_KEYS]};setTimeout(inject,150);
}
boot();
})();
