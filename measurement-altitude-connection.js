(()=>{
function boot(){
 if(typeof map==='undefined'||!window.TAGRO_CAD||!window.TAGRO_MEASURE)return setTimeout(boot,80);
 const pane=document.querySelector('#cadMeasure');if(!pane)return setTimeout(boot,80);
 let pending=false;
 function acceptedElevation(layer,m){
  const z=layer?.options?.tagroElevation||{},survey=Array.isArray(z.survey)?z.survey:[],terrain=Array.isArray(z.map)?z.map:[];
  if(z.accepted==='survey'){
   if(m.kind==='point'&&Number.isFinite(survey[0]))return{source:'Surveyed',values:[survey[0]]};
   if(m.kind==='line'&&Number.isFinite(survey[0])&&Number.isFinite(survey[1]))return{source:'Surveyed',values:[survey[0],survey[1]]};
  }
  const values=terrain.filter(Number.isFinite);
  return values.length?{source:'Map terrain',values}:null;
 }
 function metrics(layer){
  if(!layer)return null;const m=window.TAGRO_MEASURE.measure(layer);if(!m)return null;const e=acceptedElevation(layer,m);if(!e)return{measurement:m,elevation:null};
  if(m.kind==='line'&&e.values.length>=2&&Number.isFinite(m.length)&&m.length>0){
   const start=e.values[0],end=e.values[1],vertical=end-start,grade=vertical/m.length*100,angle=Math.atan2(vertical,m.length)*180/Math.PI,ratio=Math.abs(vertical)>1e-9?m.length/Math.abs(vertical):Infinity,direct3d=Math.hypot(m.length,vertical);
   return{measurement:m,elevation:e,startM:start,endM:end,verticalIntervalM:vertical,gradePct:grade,slopeAngleDeg:angle,slopeRatio:ratio,direct3dLengthM:direct3d};
  }
  if(m.kind==='boundary'&&e.values.length){const min=Math.min(...e.values),max=Math.max(...e.values),avg=e.values.reduce((a,b)=>a+b,0)/e.values.length;return{measurement:m,elevation:e,minM:min,maxM:max,rangeM:max-min,meanM:avg};}
  if(m.kind==='point'&&e.values.length)return{measurement:m,elevation:e,altitudeM:e.values[0]};
  return{measurement:m,elevation:e};
 }
 const f=n=>Number.isFinite(n)?n.toFixed(2):'—';
 function sectionFor(x){
  if(!x?.elevation)return'';
  if(x.measurement.kind==='line'&&Number.isFinite(x.verticalIntervalM)){
   const dir=x.verticalIntervalM>0?'Rise':x.verticalIntervalM<0?'Fall':'Level',ratio=Number.isFinite(x.slopeRatio)?`1:${x.slopeRatio.toFixed(1)}`:'Level';
   return `<div id="tagroAltitudeConnection" class="tagro-elev-box"><div class="tagro-elev-head"><b>Measurement + altitude</b><span style="font-size:9px;color:#687069">${x.elevation.source}</span></div><div class="tagro-measure-grid"><div class="tagro-measure-card"><span>Start elevation</span><b>${f(x.startM)} m</b></div><div class="tagro-measure-card"><span>End elevation</span><b>${f(x.endM)} m</b></div><div class="tagro-measure-card"><span>Vertical interval</span><b>${dir} ${f(Math.abs(x.verticalIntervalM))} m</b></div><div class="tagro-measure-card"><span>Average grade</span><b>${f(x.gradePct)}%</b></div><div class="tagro-measure-card"><span>Slope</span><b>${ratio}</b></div><div class="tagro-measure-card"><span>Slope angle</span><b>${f(Math.abs(x.slopeAngleDeg))}°</b></div><div class="tagro-measure-card wide"><span>3D direct length</span><b>${f(x.direct3dLengthM)} m</b></div></div><div class="tagro-elev-source">Length and altitude are now one measurement record. Changing the geometry or accepted elevation source recalculates these values.</div></div>`;
  }
  if(x.measurement.kind==='boundary'&&Number.isFinite(x.rangeM))return `<div id="tagroAltitudeConnection" class="tagro-elev-box"><div class="tagro-elev-head"><b>Measurement + altitude</b><span style="font-size:9px;color:#687069">${x.elevation.source}</span></div><div class="tagro-measure-grid"><div class="tagro-measure-card"><span>Lowest</span><b>${f(x.minM)} m</b></div><div class="tagro-measure-card"><span>Highest</span><b>${f(x.maxM)} m</b></div><div class="tagro-measure-card"><span>Vertical range</span><b>${f(x.rangeM)} m</b></div><div class="tagro-measure-card"><span>Mean altitude</span><b>${f(x.meanM)} m</b></div></div></div>`;
  if(x.measurement.kind==='point'&&Number.isFinite(x.altitudeM))return `<div id="tagroAltitudeConnection" class="tagro-elev-box"><div class="tagro-elev-head"><b>Measurement + altitude</b><span style="font-size:9px;color:#687069">${x.elevation.source}</span></div><div class="tagro-measure-grid"><div class="tagro-measure-card wide"><span>Accepted altitude</span><b>${f(x.altitudeM)} m</b></div></div></div>`;
  return'';
 }
 function enrich(){pending=false;const old=document.querySelector('#tagroAltitudeConnection');if(old)old.remove();const layer=window.TAGRO_CAD.getSelected?.();const x=metrics(layer),html=sectionFor(x);if(!html||!pane.classList.contains('on'))return;pane.insertAdjacentHTML('beforeend',html);window.dispatchEvent(new CustomEvent('tagro:altitudemeasurement',{detail:{layer,metrics:x}}));}
 function schedule(){if(pending)return;pending=true;setTimeout(enrich,0)}
 const observer=new MutationObserver(()=>{if(!document.querySelector('#tagroAltitudeConnection'))schedule()});observer.observe(pane,{childList:true,subtree:true});
 window.addEventListener('tagro:cadselect',schedule);window.addEventListener('tagro:cadchange',schedule);window.addEventListener('tagro:identitychange',schedule);pane.addEventListener('change',schedule);pane.addEventListener('click',e=>{if(e.target.closest('#measureLoadElev'))setTimeout(schedule,350)});
 document.querySelector('[data-cad-tab="measure"]')?.addEventListener('click',schedule);
 window.TAGRO_ALTITUDE_MEASURE={metrics,refresh:schedule};
}
boot();
})();