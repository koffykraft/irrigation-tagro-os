(()=>{
'use strict';
const hits=new Map();
function isLine(l){return l instanceof L.Polyline && !(l instanceof L.Polygon)}
function bindHit(l){if(!l||l.options?.pmIgnore||!isLine(l)||hits.has(l))return;const h=L.polyline(l.getLatLngs(),{color:'#000',weight:24,opacity:.001,interactive:true,pmIgnore:true,pane:l.options.pane}).addTo(map);h.on('click',e=>{L.DomEvent.stopPropagation(e.originalEvent);l.fire('click',{latlng:e.latlng,originalEvent:e.originalEvent})});hits.set(l,h);l.on('pm:edit',()=>h.setLatLngs(l.getLatLngs()));l.on('remove',()=>{map.removeLayer(h);hits.delete(l)})}
function symbolSize(z,type){if(type==='emitter')return z>=20?5:z>=18?4:z>=16?2.5:1.5;return z>=20?7:z>=18?6:z>=16?4:3}
function project(){const z=map.getZoom();map.eachLayer(l=>{if(l.options?.pmIgnore)return;bindHit(l);if(l.setRadius&&l.getLatLng){const t=l.options.tagroIdentityId||l.options.tagroType||'';if(t)l.setRadius(symbolSize(z,t));if(l._path)l._path.style.opacity=(t==='emitter'&&z<15)?'0':'1'}})}
map.on('zoomend',project);map.on('pm:create',e=>{bindHit(e.layer);project()});setTimeout(project,0);
window.TAGRO_SELECTION_BOOST={refresh:project};
})();