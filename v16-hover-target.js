(()=>{
function boot(){
  if(typeof map==='undefined'||!window.TAGRO_CAD)return setTimeout(boot,120);if(window.TAGRO_HOVER_TARGET)return;
  const wrap=document.querySelector('.mapwrap');if(!wrap)return;let hover=null,raf=0,lastEvent=null;
  const tip=document.createElement('div');tip.className='tagro-hover-tip';wrap.appendChild(tip);
  const role=l=>String(l?.options?.tagroIdentityId||'').toLowerCase()||'object';
  const meta=l=>l?.options?.tagroNetwork||{};
  function label(l){const m=meta(l),r=role(l),name=m.name?` · ${m.name}`:'',family=m.family?` · ${m.family}`:'';return `${m.code?m.code+' · ':''}${r[0]?.toUpperCase()+r.slice(1)}${name}${family}`}
  function doms(l){return[l?._path,l?._icon,l?._shadow].filter(Boolean)}
  function clear(){if(!hover)return;doms(hover).forEach(x=>x.classList.remove('tagro-hover-target'));hover=null;tip.classList.remove('show')}
  function selectable(l){return l&&map.hasLayer(l)&&!l.options?.pmIgnore&&(window.TAGRO_CAD.isVisible?.(l)??true)&&!window.TAGRO_CAD.isLocked?.(l)}
  function flatten(v,out=[]){if(!Array.isArray(v))return out;if(v.length&&v[0]&&typeof v[0].lat==='number'){out.push(v);return out}for(const x of v)flatten(x,out);return out}
  function segDist(p,a,b){const vx=b.x-a.x,vy=b.y-a.y,wx=p.x-a.x,wy=p.y-a.y,c2=vx*vx+vy*vy,t=c2?Math.max(0,Math.min(1,(vx*wx+vy*wy)/c2)):0,q=L.point(a.x+vx*t,a.y+vy*t);return p.distanceTo(q)}
  function distancePx(l,p){try{if(l.getLatLng&&!(l.getLatLngs)){return p.distanceTo(map.latLngToContainerPoint(l.getLatLng()))}if(l.getLatLngs){const rings=flatten(l.getLatLngs()),closed=(role(l)==='boundary'||String(l.options?.tagroShape||'').match(/Polygon|Rectangle/i));let best=Infinity;for(const ring of rings){const pts=ring.map(x=>map.latLngToContainerPoint(x));for(let i=1;i<pts.length;i++)best=Math.min(best,segDist(p,pts[i-1],pts[i]));if(closed&&pts.length>2)best=Math.min(best,segDist(p,pts[pts.length-1],pts[0]))}return best}}catch{}return Infinity}
  function modesBusy(){try{return document.querySelector('#tagroIdPanel')?.classList.contains('show')||map.pm.globalDrawModeEnabled?.()||map.pm.globalEditModeEnabled?.()||map.pm.globalDragModeEnabled?.()||map.pm.globalRemovalModeEnabled?.()}catch{return false}}
  function scan(e){raf=0;if(!e||modesBusy()){clear();return}const p=map.latLngToContainerPoint(e.latlng),layers=window.TAGRO_CAD.getLayers().filter(selectable);let best=null,dist=Infinity;for(const l of layers){const d=distancePx(l,p);if(d<dist){dist=d;best=l}}const threshold=12;if(!best||dist>threshold){clear();return}if(hover!==best){clear();hover=best;doms(best).forEach(x=>x.classList.add('tagro-hover-target'))}const cp=map.latLngToContainerPoint(e.latlng);tip.textContent=label(best);tip.style.left=Math.min(wrap.clientWidth-tip.offsetWidth-10,Math.max(8,cp.x+14))+'px';tip.style.top=Math.min(wrap.clientHeight-34,Math.max(8,cp.y-28))+'px';tip.classList.add('show')}
  map.on('mousemove',e=>{lastEvent=e;if(!raf)raf=requestAnimationFrame(()=>scan(lastEvent))});map.on('mouseout',clear);map.on('zoomstart',clear);map.on('movestart',clear);
  map.on('click',()=>{if(hover&&!modesBusy()&&selectable(hover)){const l=hover;setTimeout(()=>window.TAGRO_CAD.selectLayer?.(l),0)}});
  ['tagro:cadselect','tagro:cadchange','tagro:identitychange','tagro:networkmetachange'].forEach(n=>window.addEventListener(n,()=>{if(hover&&!selectable(hover))clear()}));
  const style=document.createElement('style');style.textContent='.tagro-hover-target{filter:drop-shadow(0 0 2px #fff) drop-shadow(0 0 5px #111)!important;cursor:pointer!important}.tagro-hover-tip{position:absolute;z-index:1120;display:none;pointer-events:none;max-width:220px;padding:4px 7px;border-radius:6px;background:rgba(17,24,19,.92);color:#fff;font-size:9px;font-weight:750;line-height:1.2;box-shadow:0 2px 8px rgba(0,0,0,.2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tagro-hover-tip.show{display:block}';document.head.appendChild(style);window.TAGRO_HOVER_TARGET={get:()=>hover,clear};
}
boot();
})();