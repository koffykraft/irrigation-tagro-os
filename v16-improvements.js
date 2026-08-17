(()=>{
/* v16 additive improvements: page shell intentionally untouched */
const nativeFetch=window.fetch.bind(window);
window.fetch=(input,init={})=>{const url=typeof input==='string'?input:input?.url||'';if(!url.includes('api.open-meteo.com/v1/elevation'))return nativeFetch(input,init);const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),9000),upstream=init.signal;if(upstream){if(upstream.aborted)ctrl.abort();else upstream.addEventListener('abort',()=>ctrl.abort(),{once:true})}return nativeFetch(input,{...init,signal:ctrl.signal}).catch(e=>{if(e?.name==='AbortError')throw new Error('Elevation request timed out. Tap Load map again.');throw e}).finally(()=>clearTimeout(timer))};
function boot(){if(typeof map==='undefined'||!window.TAGRO_CAD)return setTimeout(boot,80);
 const wrap=document.querySelector('.mapwrap'); if(!wrap)return;
 const roleColors={main:'#d32f2f',submain:'#1565c0',lateral:'#2e7d32'};
 function role(l){return l?.options?.tagroIdentityId||null}
 function applyRole(l){const r=role(l),c=roleColors[r];if(!c||!l?.setStyle)return;l.setStyle({color:c});l.options.color=c;l.options.tagroStyle={...(l.options.tagroStyle||{}),color:c};}
 function refreshIdentityTiles(){for(const [r,c] of Object.entries(roleColors)){const b=document.querySelector(`[data-tagro-id="${r}"]`);if(b){b.style.setProperty('--idc',c);b.classList.add('tagro-id-'+r)}}}
 refreshIdentityTiles();window.TAGRO_CAD.getLayers().forEach(applyRole);window.addEventListener('tagro:identitychange',e=>{refreshIdentityTiles();if(e.detail?.layer)applyRole(e.detail.layer)});
 const pts=L.layerGroup().addTo(map);
 function flat(v,out=[]){if(!Array.isArray(v))return out;for(const x of v){if(x&&typeof x.lat==='number')out.push(x);else if(Array.isArray(x))flat(x,out)}return out}
 function showVertices(l){pts.clearLayers();if(!l)return;let a=[];try{if(l.getLatLngs)a=flat(l.getLatLngs());else if(l.getLatLng)a=[l.getLatLng()]}catch(e){}const c=roleColors[role(l)]||'#111';a.forEach(p=>L.circleMarker(p,{radius:5,weight:3,color:c,fillColor:'#fff',fillOpacity:1,interactive:false,pmIgnore:true,className:'tagro-selected-vertex'}).addTo(pts))}
 window.addEventListener('tagro:cadselect',e=>showVertices(e.detail?.layer||null));window.addEventListener('tagro:cadchange',()=>showVertices(window.TAGRO_CAD.getSelected?.()));
 const dock=document.querySelector('.tagro-cad'),head=dock?.querySelector('.tagro-cad-head');
 if(dock&&head){let drag=null;const store='tagro.cad.position.v16';try{const p=JSON.parse(localStorage.getItem(store)||'null');if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y)){dock.style.left=p.x+'px';dock.style.top=p.y+'px';dock.style.right='auto';dock.style.bottom='auto';dock.style.transform='none'}}catch(e){}
 head.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;const r=dock.getBoundingClientRect(),wr=wrap.getBoundingClientRect();drag={id:e.pointerId,dx:e.clientX-r.left,dy:e.clientY-r.top,wr};head.setPointerCapture?.(e.pointerId);document.body.classList.add('tagro-cad-dragging')});
 head.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const w=dock.offsetWidth,h=dock.offsetHeight,x=Math.max(0,Math.min(drag.wr.width-w,e.clientX-drag.wr.left-drag.dx)),y=Math.max(0,Math.min(drag.wr.height-h,e.clientY-drag.wr.top-drag.dy));dock.style.left=x+'px';dock.style.top=y+'px';dock.style.right='auto';dock.style.bottom='auto';dock.style.transform='none'});
 const end=e=>{if(!drag||e.pointerId!==drag.id)return;const x=parseFloat(dock.style.left)||0,y=parseFloat(dock.style.top)||0;try{localStorage.setItem(store,JSON.stringify({x,y}))}catch(err){}drag=null;document.body.classList.remove('tagro-cad-dragging')};head.addEventListener('pointerup',end);head.addEventListener('pointercancel',end)}
 const btn=document.createElement('button');btn.className='tagro-tools-menu-btn';btn.textContent='Tools';btn.title='Drawing and page tools';wrap.appendChild(btn);
 const menu=document.createElement('div');menu.className='tagro-tools-menu';menu.innerHTML=`<div class="split"><button data-act="undo" title="Undo">↶</button><button data-act="redo" title="Redo">↷</button></div><button data-act="draw">Sketch / Draw</button><button data-act="cad">CAD / Design</button><button data-act="measure">Measure</button><a href="reference.html">Info / Reference</a><button disabled title="Material list page will be connected when its source is available">Material list</button><small>Tools stay compact so the map remains the workspace.</small>`;wrap.appendChild(menu);
 btn.onclick=()=>menu.classList.toggle('show');menu.addEventListener('click',e=>{const a=e.target.closest('[data-act]');if(!a)return;const k=a.dataset.act;if(k==='undo')window.TAGRO_CAD.undo?.();if(k==='redo')window.TAGRO_CAD.redo?.();if(k==='draw')document.querySelector('#drawBtn')?.click();if(k==='cad')document.querySelector('.tagro-cad-toggle')?.click();if(k==='measure')window.TAGRO_CAD.openMeasure?.();menu.classList.remove('show')});map.on('click',()=>menu.classList.remove('show'));
 const oldClear=window.TAGRO_CAD.clearSelection; if(oldClear)window.TAGRO_CAD.clearSelection=(...a)=>{pts.clearLayers();return oldClear(...a)};
}
boot();
})();