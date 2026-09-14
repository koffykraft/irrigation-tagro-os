(()=>{
'use strict';
const TYPES=[['boundary','Boundary','#f6d32d','Polygon'],['water','Water','#1976d2','CircleMarker'],['pump','Pump','#7b2cbf','CircleMarker'],['filter','Filter','#111827','CircleMarker'],['main','Main','#0b63ce','Line'],['submain','Submain','#7b2cbf','Line'],['lateral','Lateral','#2f9e44','Line'],['emitter','Emitter','#16a34a','CircleMarker'],['valve','Valve','#dc2626','CircleMarker'],['plot','Plot','#84cc16','Polygon']];
let mode='free',armed=null,selected=null,seq=0;
const q=s=>document.querySelector(s), uid=()=>`obj-${Date.now()}-${++seq}`;
function meta(type){return TYPES.find(x=>x[0]===type)}
function ensureId(l){return l.options.tagroObjectId||(l.options.tagroObjectId=uid())}
function style(l,type){const m=meta(type);if(!m)return;if(l.setStyle)l.setStyle({color:m[2],fillColor:m[2],weight:['main','submain'].includes(type)?4:type==='lateral'?3:4,fillOpacity:.12});if(l.setRadius&&['emitter','valve','pump','filter','water'].includes(type))l.setRadius(type==='emitter'?5:7)}
function identify(l,type){ensureId(l);l.options.tagroIdentityId=type;l.options.tagroType=type;style(l,type);window.dispatchEvent(new CustomEvent('tagro:identitychange',{detail:{layer:l,id:type}}));window.XtraLogikSavant?.scan?.()}
function allLayers(){const a=[];map.eachLayer(l=>{if(l instanceof L.TileLayer||l.options?.pmIgnore)return;if(l.getLatLng||l.getLatLngs)a.push(l)});return a}
function setSelected(l){selected=l;allLayers().forEach(x=>{if(x._path)x._path.classList.toggle('tagro-selected-object',x===l);if(x._icon)x._icon.classList.toggle('tagro-selected-object',x===l)});q('#hybridStatus').textContent=l?`${l.options.tagroIdentityId||'Unidentified'} · ${ensureId(l)}`:'Nothing selected'}
function bind(l){if(!l||l._hybridBound)return;l._hybridBound=true;ensureId(l);l.on('click',e=>{if(e.originalEvent)L.DomEvent.stopPropagation(e.originalEvent);setSelected(l);if(mode==='identify'&&armed)identify(l,armed)})}
function arm(type,typedDraw=false){armed=type;document.querySelectorAll('[data-hybrid-type]').forEach(b=>b.classList.toggle('on',b.dataset.hybridType===type));q('#hybridStatus').textContent=type?`${meta(type)?.[1]||type} armed`:'Ready';if(typedDraw&&type){const shape=meta(type)?.[3];try{map.pm.enableDraw(shape,{continueDrawing:true,snappable:true,snapDistance:18})}catch(e){}}}
function stopDraw(){try{map.pm.disableDraw()}catch(e){}}
function setMode(m){mode=m;stopDraw();document.querySelectorAll('[data-hybrid-mode]').forEach(b=>b.classList.toggle('on',b.dataset.hybridMode===m));q('#hybridTypeStrip').classList.toggle('show',m==='identify'||m==='typed');if(m==='free'){armed=null;q('#hybridStatus').textContent='Draw freely, then identify later';if(typeof addTools==='function'&&!toolsVisible)addTools()}else if(typeof removeTools==='function'&&toolsVisible)removeTools()}
const shell=document.createElement('div');shell.id='hybridDock';shell.className='hybrid-dock';shell.innerHTML=`<div class="hybrid-modes"><button data-hybrid-mode="free">Draw</button><button data-hybrid-mode="identify">ID</button><button data-hybrid-mode="typed">Type→Draw</button><button id="hybridClose">×</button></div><div id="hybridTypeStrip" class="hybrid-types">${TYPES.map(x=>`<button data-hybrid-type="${x[0]}" style="--tc:${x[2]}">${x[1]}</button>`).join('')}</div><div class="hybrid-foot"><span id="hybridStatus">Draw freely, then identify later</span><button id="hybridScan">XL Scan</button></div>`;
document.querySelector('.mapwrap').appendChild(shell);
q('#hybridClose').onclick=()=>shell.classList.remove('show');
document.querySelectorAll('[data-hybrid-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.hybridMode));
document.querySelectorAll('[data-hybrid-type]').forEach(b=>b.onclick=()=>arm(b.dataset.hybridType,mode==='typed'));
q('#hybridScan').onclick=()=>{const s=window.XtraLogikSavant?.scan?.();if(s)q('#hybridStatus').textContent=`XL: ${s.world.objects.length} objects · ${s.possibilities.length} possibilities`};
map.on('pm:create',e=>{bind(e.layer);if(mode==='typed'&&armed)identify(e.layer,armed);setSelected(e.layer)});
map.on('click',()=>{if(mode!=='identify')setSelected(null)});
map.eachLayer(bind);
window.TAGRO_HYBRID={open:()=>shell.classList.add('show'),setMode,arm,identify,get selected(){return selected}};
})();