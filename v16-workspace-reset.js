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
    const box=document.createElement('div');box.className='tagro-workspace-tools';box.innerHTML='<div class="tagro-workspace-help"><b>Delete drawings</b><br>For one object: select it, open <b>Object</b>, then <b>Delete</b>. Or use the drawing toolbar eraser to tap objects.</div><button type="button" class="tagro-cad-btn danger" data-tagro-reset>Reset workspace</button><div class="tagro-workspace-help">Reset is the clean start. Ordinary browser Refresh keeps the saved workspace.</div>';
    pane.appendChild(box);box.querySelector('[data-tagro-reset]').onclick=reset;
  }
  const style=document.createElement('style');style.textContent='.tagro-workspace-tools{margin-top:9px;padding-top:8px;border-top:1px solid #e6e9e6;display:grid;gap:7px}.tagro-workspace-tools .tagro-cad-btn{width:100%;min-height:32px}.tagro-workspace-help{font-size:9.5px;line-height:1.4;color:#626a63}';document.head.appendChild(style);
  const mo=new MutationObserver(()=>setTimeout(inject,0));mo.observe(pane,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  window.addEventListener('tagro:cadchange',()=>setTimeout(inject,0));
  window.TAGRO_WORKSPACE={reset,clearKeys,sessionKeys:[...SESSION_KEYS]};setTimeout(inject,150);
}
boot();
})();
