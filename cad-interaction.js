(()=>{
if(typeof map==='undefined')return;
const mobile=matchMedia('(pointer:coarse)').matches;
const threshold=mobile?24:13;
let pulseTimer=null;
function pointSegDist(p,a,b){const vx=b.x-a.x,vy=b.y-a.y,wx=p.x-a.x,wy=p.y-a.y,c1=vx*wx+vy*wy;if(c1<=0)return p.distanceTo(a);const c2=vx*vx+vy*vy;if(c2<=c1)return p.distanceTo(b);const t=c1/c2,q=L.point(a.x+t*vx,a.y+t*vy);return p.distanceTo(q)}
function ring(v){if(!Array.isArray(v))return[];if(v.length&&v[0]&&typeof v[0].lat==='number')return v;for(const x of v){const r=ring(x);if(r.length)return r}return[]}
function screenPoints(l){try{if(l.getLatLngs)return ring(l.getLatLngs()).map(x=>map.latLngToContainerPoint(x));if(l.getLatLng)return[map.latLngToContainerPoint(l.getLatLng())]}catch(e){}return[]}
function isPolygon(l){const s=l?.options?.tagroShape;return s==='Polygon'||s==='Rectangle'}
function inside(pt,arr){let c=false;for(let i=0,j=arr.length-1;i<arr.length;j=i++){const a=arr[i],b=arr[j];if(((a.y>pt.y)!==(b.y>pt.y))&&(pt.x<(b.x-a.x)*(pt.y-a.y)/(b.y-a.y)+a.x))c=!c}return c}
function distanceTo(l,pt){const a=screenPoints(l);if(!a.length)return Infinity;if(a.length===1)return pt.distanceTo(a[0]);if(isPolygon(l)&&inside(pt,a))return 0;let d=Infinity;for(let i=1;i<a.length;i++)d=Math.min(d,pointSegDist(pt,a[i-1],a[i]));if(isPolygon(l))d=Math.min(d,pointSegDist(pt,a[a.length-1],a[0]));return d}
function selectable(){return (window.TAGRO_CAD?.getLayers?.()||[]).filter(l=>window.TAGRO_CAD?.isVisible?.(l)&&!window.TAGRO_CAD?.isLocked?.(l)&&map.hasLayer(l));}
function pulse(l){const els=[l?._path,l?._icon].filter(Boolean);els.forEach(x=>x.classList.add('tagro-activation-pulse'));clearTimeout(pulseTimer);pulseTimer=setTimeout(()=>els.forEach(x=>x.classList.remove('tagro-activation-pulse')),420)}
function busy(){return !!document.querySelector('#tagroIdPanel.show')||!!map.pm?.globalDrawModeEnabled?.()||!!map.pm?.globalEditModeEnabled?.()||!!map.pm?.globalDragModeEnabled?.()||!!map.pm?.globalRemovalModeEnabled?.()}
map.on('click',e=>{if(busy()||!window.TAGRO_CAD)return;const p=map.latLngToContainerPoint(e.latlng);let best=null,bd=Infinity;for(const l of selectable()){const d=distanceTo(l,p);if(d<bd){bd=d;best=l}}if(best&&bd<=threshold){setTimeout(()=>{window.TAGRO_CAD.selectLayer(best);pulse(best)},0)}});
window.TAGRO_HIT_TEST={threshold,distanceTo};
})();