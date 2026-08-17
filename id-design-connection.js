(()=>{
'use strict';
if(typeof map==='undefined')return;
const PIPE_IDS=new Set(['main','submain','lateral']);
const q=s=>document.querySelector(s);
const clone=v=>{try{return JSON.parse(JSON.stringify(v))}catch(e){return null}};
function objectId(layer){if(!layer)return null;return layer.options.tagroObjectId||(layer.options.tagroObjectId=crypto.randomUUID())}
function identity(layer){const id=layer?.options?.tagroIdentityId||null;let name=id||'Unidentified';if(id){const el=q(`[data-tagro-id="${CSS.escape(id)}"]`);if(el)name=el.textContent.trim()||id}return{id,name,designRole:PIPE_IDS.has(id)?id:null}}
function firstRing(v){if(!Array.isArray(v))return[];if(v.length&&v[0]&&typeof v[0].lat==='number')return v;for(const x of v){const r=firstRing(x);if(r.length)return r}return[]}
function geometry(layer){const shape=layer?.options?.tagroShape||(layer?.pm?.getShape?.()||null);if(layer instanceof L.Circle){const c=layer.getLatLng();return{shape,type:'circle',center:{lat:c.lat,lng:c.lng},radiusM:layer.getRadius()}}
if(layer instanceof L.Marker||layer instanceof L.CircleMarker){const p=layer.getLatLng();return{shape,type:'point',point:{lat:p.lat,lng:p.lng}}}
if(layer?.getLatLngs){const pts=firstRing(layer.getLatLngs()).map(p=>({lat:p.lat,lng:p.lng}));return{shape,type:(shape==='Polygon'||shape==='Rectangle')?'area':'line',points:pts,start:pts[0]||null,end:pts[pts.length-1]||null}}
return{shape,type:'unknown'}}
function dimensions(layer){const m=window.TAGRO_MEASURE?.measure?.(layer);if(!m)return null;const out={kind:m.kind||null};if(Number.isFinite(m.length))out.lengthM=m.length;if(Number.isFinite(m.area))out.areaM2=m.area;if(Number.isFinite(m.perimeter))out.perimeterM=m.perimeter;if(Number.isFinite(m.radius))out.radiusM=m.radius;if(Number.isFinite(m.diameter))out.diameterM=m.diameter;if(Number.isFinite(m.circumference))out.circumferenceM=m.circumference;if(Number.isFinite(m.bearing))out.bearingDeg=m.bearing;if(m.point)out.point={lat:m.point.lat,lng:m.point.lng};return out}
function location(layer){const g=geometry(layer),bounds=layer?.getBounds?.();const out={geometry:g};if(bounds?.isValid?.()){const c=bounds.getCenter();out.bounds={north:bounds.getNorth(),south:bounds.getSouth(),east:bounds.getEast(),west:bounds.getWest()};out.center={lat:c.lat,lng:c.lng}}else if(g.point)out.center=g.point;else if(g.center)out.center=g.center;return out}
function elevation(layer){const e=clone(layer?.options?.tagroElevation||null);if(!e)return null;return{accepted:e.accepted||'map',provider:e.provider||null,map:Array.isArray(e.map)?e.map.slice():null,mapStale:!!e.mapStale,survey:Array.isArray(e.survey)?e.survey.slice():null}}
function engineering(layer){return clone(layer?.options?.tagroEngineering||null)}
function emitter(layer){return clone(layer?.options?.tagroEmitter||null)}
function make(layer){if(!layer||layer.options?.pmIgnore)return null;const id=identity(layer);return{version:1,object:{id:objectId(layer),shape:layer.options?.tagroShape||layer.pm?.getShape?.()||null},identity:id,dimension:dimensions(layer),location:location(layer),elevation:elevation(layer),engineering:engineering(layer),emitter:emitter(layer),designEligible:!!id.designRole,source:{object:'map geometry',identity:'user-confirmed ID state',dimension:'TAGRO Measure derived from same geometry',location:'same map object',provenance:'no duplicated design geometry'},updatedAt:new Date().toISOString()}}
function sync(layer,reason='sync'){const input=make(layer);if(!input)return null;layer.options.tagroDesignConnection=input;window.dispatchEvent(new CustomEvent('tagro:designinputchange',{detail:{layer,input,reason}}));return input}
function syncAll(reason='sync-all'){return (window.TAGRO_CAD?.getLayers?.()||[]).map(l=>sync(l,reason)).filter(Boolean)}
function get(layer){return layer?.options?.tagroDesignConnection||sync(layer,'read')}
function selected(){return get(window.TAGRO_CAD?.getSelected?.())}
function designObjects(){return (window.TAGRO_CAD?.getLayers?.()||[]).map(get).filter(x=>x?.designEligible)}
map.on('pm:create',e=>setTimeout(()=>sync(e.layer,'create'),0));
map.on('pm:edit',e=>sync(e.layer,'geometry-edit'));
map.on('pm:dragend',e=>sync(e.layer,'move'));
map.on('pm:remove',e=>window.dispatchEvent(new CustomEvent('tagro:designinputremove',{detail:{objectId:e.layer?.options?.tagroObjectId||null,layer:e.layer}})));
window.addEventListener('tagro:identitychange',e=>{if(e.detail?.layer)sync(e.detail.layer,'identity')});
window.addEventListener('tagro:cadchange',e=>{if(e.detail?.layer)sync(e.detail.layer,'cad-change')});
window.addEventListener('tagro:cadselect',e=>{if(e.detail?.layer)sync(e.detail.layer,'select')});
document.addEventListener('change',e=>{if(e.target.closest?.('#cadMeasure,.v16-design')){const l=window.TAGRO_CAD?.getSelected?.();if(l)setTimeout(()=>sync(l,'property-change'),0)}});
setTimeout(()=>syncAll('boot'),0);
window.TAGRO_ID_DESIGN_CONNECTION={make,get,selected,sync,syncAll,designObjects};
})();