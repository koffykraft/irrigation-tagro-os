(()=>{
function boot(){
  if(typeof map==='undefined'||!window.TAGRO_CAD||!window.TAGRO_V16_PERSISTENCE)return setTimeout(boot,120);
  if(window.TAGRO_DUPLICATE)return;
  const pane=document.querySelector('#cadObject');if(!pane)return;
  const uid=()=>crypto.randomUUID?crypto.randomUUID():'obj-'+Date.now()+'-'+Math.random().toString(36).slice(2);
  const role=l=>String(l?.options?.tagroIdentityId||'').toLowerCase();
  const isPipe=l=>['main','submain','lateral'].includes(role(l));
  const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch{return v}};
  function flattenLL(v){return Array.isArray(v)?v.map(flattenLL):v&&typeof v.lat==='number'?L.latLng(v.lat,v.lng):v}
  function offsetLatLng(ll,dx=18,dy=0){const z=map.getZoom(),p=map.project(ll,z);return map.unproject(L.point(p.x+dx,p.y+dy),z)}
  function offsetNested(v,dx=18,dy=0){if(Array.isArray(v))return v.map(x=>offsetNested(x,dx,dy));return v&&typeof v.lat==='number'?offsetLatLng(v,dx,dy):v}
  function nextCode(r){if(!window.TAGRO_NETWORK_FAMILY)return'';const prefix=r==='main'?'M':r==='submain'?'SM':'L',pipes=window.TAGRO_CAD.getLayers().filter(x=>map.hasLayer(x)&&role(x)===r);let n=0;for(const p of pipes){const c=p.options?.tagroNetwork?.code||'',m=c.match(new RegExp('^'+prefix+'(\\d+)$','i'));if(m)n=Math.max(n,+m[1]||0)}return prefix+(n+1)}
  function duplicate(src){
    if(!src||!map.hasLayer(src)||!isPipe(src))return null;
    const pts=src.getLatLngs?.();if(!pts)return null;
    const copyLayer=L.polyline(offsetNested(pts,18,0),{color:src.options.color||'#3ba5e8',weight:src.options.weight||3,opacity:src.options.opacity??1,dashArray:src.options.dashArray||null});
    copyLayer.options.tagroShape=src.options.tagroShape||'Line';
    copyLayer.options.tagroObjectId=uid();
    copyLayer.options.tagroIdentityId=src.options.tagroIdentityId||null;
    copyLayer.options.tagroStyle=clone(src.options.tagroStyle||null);
    copyLayer.options.tagroElevation=undefined;
    copyLayer.options.tagroEngineering=clone(src.options.tagroEngineering||null);
    copyLayer.options.tagroEmitter=clone(src.options.tagroEmitter||null);
    copyLayer.options.tagroNote='';
    const net=clone(src.options.tagroNetwork||{});net.code=nextCode(role(src));net.name='';copyLayer.options.tagroNetwork=net;
    copyLayer.addTo(map);map.fire('pm:create',{layer:copyLayer,shape:'Line'});
    if(copyLayer.setStyle&&src.options.tagroStyle)copyLayer.setStyle(src.options.tagroStyle);
    window.dispatchEvent(new CustomEvent('tagro:identitychange',{detail:{layer:copyLayer,id:copyLayer.options.tagroIdentityId}}));
    window.dispatchEvent(new CustomEvent('tagro:networkmetachange',{detail:{layer:copyLayer}}));
    window.dispatchEvent(new CustomEvent('tagro:networkchange'));
    window.dispatchEvent(new CustomEvent('tagro:designprovenancechange'));
    window.TAGRO_V16_PERSISTENCE.save();
    setTimeout(()=>window.TAGRO_CAD.selectLayer(copyLayer),30);
    return copyLayer;
  }
  function inject(){
    const old=pane.querySelector('.tagro-duplicate-tool'),s=window.TAGRO_CAD.getSelected?.();
    if(!pane.classList.contains('on')||!isPipe(s)){old?.remove();return}
    const id=s.options.tagroObjectId||'';if(old?.dataset.src===id)return;old?.remove();
    const box=document.createElement('section');box.className='tagro-duplicate-tool';box.dataset.src=id;box.innerHTML=`<div class="tagro-dup-copy"><div><b>Duplicate pipe</b><span>Copies geometry + family/tie + pipe/device settings. The copy gets a new code and is offset slightly to the screen-right so it can be moved immediately.</span></div><button type="button" class="tagro-cad-btn" data-duplicate>Duplicate</button></div><div class="tagro-dup-note">For many regularly spaced Laterals, use Measure → Layout Laterals from this Submain. Duplicate is intended for exceptions, scattered rows and one-off additions.</div>`;pane.appendChild(box);box.querySelector('[data-duplicate]').onclick=()=>duplicate(s)
  }
  const style=document.createElement('style');style.textContent='.tagro-duplicate-tool{margin-top:10px;padding-top:9px;border-top:1px solid #e6e9e6;display:grid;gap:6px}.tagro-dup-copy{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center}.tagro-dup-copy b{display:block;font-size:11px}.tagro-dup-copy span,.tagro-dup-note{display:block;margin-top:2px;font-size:8.8px;line-height:1.4;color:#657067}.tagro-dup-copy .tagro-cad-btn{min-height:34px}@media(max-width:699px){.tagro-dup-copy{grid-template-columns:1fr}.tagro-dup-copy .tagro-cad-btn{width:100%;min-height:44px}.tagro-dup-copy b{font-size:13px}.tagro-dup-copy span,.tagro-dup-note{font-size:10px}}';document.head.appendChild(style);
  const mo=new MutationObserver(()=>setTimeout(inject,20));mo.observe(pane,{childList:true,attributes:true,attributeFilter:['class']});['tagro:cadselect','tagro:cadchange','tagro:networkmetachange'].forEach(n=>window.addEventListener(n,()=>setTimeout(inject,20)));window.TAGRO_DUPLICATE={duplicate};setTimeout(inject,180)
}
boot();
})();