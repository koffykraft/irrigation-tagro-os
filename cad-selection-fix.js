(()=>{
if(typeof map==='undefined')return;
function selectable(){
 if(document.querySelector('#tagroIdPanel')?.classList.contains('show'))return false;
 try{if(map.pm?.globalDrawModeEnabled?.())return false}catch(e){}
 try{if(map.pm?.globalEditModeEnabled?.())return false}catch(e){}
 try{if(map.pm?.globalDragModeEnabled?.())return false}catch(e){}
 try{if(map.pm?.globalRemovalModeEnabled?.())return false}catch(e){}
 return true;
}
function bind(layer){
 if(!layer||layer.options?.pmIgnore||layer.__tagroSelectionFix)return;
 layer.__tagroSelectionFix=true;
 layer.on('click',e=>{
  if(!selectable())return;
  if(window.TAGRO_CAD?.isLocked?.(layer) || window.TAGRO_CAD?.isVisible?.(layer)===false)return;
  if(e.originalEvent){
   try{L.DomEvent.stopPropagation(e.originalEvent)}catch(err){}
   e.originalEvent._tagroObjectClick=true;
  }
  // Leaflet path clicks can still bubble to the map's own click handler.
  // Re-apply the object selection after that event cycle so Measure retains it.
  setTimeout(()=>{
   if(!selectable())return;
   window.TAGRO_CAD?.selectLayer?.(layer);
  },0);
 });
}
function bindAll(){window.TAGRO_CAD?.getLayers?.().forEach(bind)}
bindAll();
map.on('pm:create',e=>setTimeout(()=>bind(e.layer),0));
window.addEventListener('tagro:identitychange',e=>{if(e.detail?.layer)bind(e.detail.layer)});
})();