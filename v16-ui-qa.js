(()=>{
function boot(){
  if(typeof map==='undefined')return setTimeout(boot,120);
  if(window.TAGRO_UI_QA)return;
  const selectors=['.tagro-cad.show','.tagro-bom.show','#tagroIdPanel.show','.v16-design','.tagro-bom-table','.tagro-bom-pager','.tagro-bom-tools','select','input','button'];
  const visible=el=>{if(!el||!el.isConnected)return false;const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&+s.opacity!==0&&r.width>0&&r.height>0};
  const rect=el=>el.getBoundingClientRect();
  const overlap=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
  const inside=(r,w,h,m=1)=>r.left>=-m&&r.top>=-m&&r.right<=w+m&&r.bottom<=h+m;
  const scoreClamp=n=>Math.max(0,Math.min(100,Math.round(n)));
  function audit(label='runtime'){
    const w=window.innerWidth||document.documentElement.clientWidth,h=window.innerHeight||document.documentElement.clientHeight;
    const panels=[...document.querySelectorAll('.tagro-cad.show,.tagro-bom.show,#tagroIdPanel.show')].filter(visible);
    const interactive=[...document.querySelectorAll('button,input,select,textarea')].filter(visible);
    const inspected=[...new Set(selectors.flatMap(s=>[...document.querySelectorAll(s)]))].filter(visible);
    const findings=[];let geometry=100,interaction=100,rendering=100;
    for(const el of inspected){const r=rect(el);if(!inside(r,w,h,2)){geometry-=8;findings.push({type:'viewport',severity:'high',element:el.id||el.className||el.tagName,message:'Visible element extends outside viewport'})}if(el.scrollWidth>el.clientWidth+2&&getComputedStyle(el).overflowX==='visible'){rendering-=4;findings.push({type:'overflow-x',severity:'medium',element:el.id||el.className||el.tagName,message:'Horizontal content may overflow'})}}
    for(let i=0;i<panels.length;i++)for(let j=i+1;j<panels.length;j++){const a=rect(panels[i]),b=rect(panels[j]),area=overlap(a,b);if(area>16){geometry-=18;interaction-=12;findings.push({type:'panel-overlap',severity:'high',element:`${panels[i].className} × ${panels[j].className}`,message:`Active panels overlap by ${Math.round(area)} px²`})}}
    for(const el of interactive){const r=rect(el),s=getComputedStyle(el);if(r.width<28||r.height<28){interaction-=2;findings.push({type:'target-size',severity:'low',element:el.id||el.className||el.tagName,message:`Interactive target is ${Math.round(r.width)}×${Math.round(r.height)} px`})}if(s.pointerEvents==='none'&&!el.disabled){interaction-=5;findings.push({type:'blocked-control',severity:'medium',element:el.id||el.className||el.tagName,message:'Visible enabled control cannot receive pointer events'})}}
    const bom=document.querySelector('.tagro-bom.show');if(bom&&visible(bom)){const table=bom.querySelector('.tagro-bom-table'),pager=bom.querySelector('.tagro-bom-pager');if(table){const visibleRows=[...table.querySelectorAll('tbody tr')].filter(visible);if(visibleRows.length>10){rendering-=8;findings.push({type:'pagination',severity:'medium',element:'BOM table',message:'More than 10 BOM rows visible on one page'})}if(table.scrollWidth>bom.clientWidth+4){geometry-=8;findings.push({type:'bom-width',severity:'high',element:'BOM table',message:'BOM table wider than its panel'})}if(table.querySelectorAll('tbody tr').length>visibleRows.length&&!pager){rendering-=8;findings.push({type:'pagination-missing',severity:'high',element:'BOM table',message:'Rows are hidden but pagination controls are absent'})}}}
    const checks={geometry:scoreClamp(geometry),interaction:scoreClamp(interaction),rendering:scoreClamp(rendering)};const confidence=scoreClamp((checks.geometry+checks.interaction+checks.rendering)/3);
    const report={label,at:new Date().toISOString(),viewport:{width:w,height:h},checks,confidence,grade:confidence>=95?'HIGH':confidence>=85?'GOOD':confidence>=70?'REVIEW':'FAIL',findings};
    window.TAGRO_UI_QA.last=report;if(findings.length)console.warn('TAGRO UI QA',report);else console.info('TAGRO UI QA',report);window.dispatchEvent(new CustomEvent('tagro:uiqa',{detail:report}));return report;
  }
  let timer=null;function schedule(label){clearTimeout(timer);timer=setTimeout(()=>audit(label),140)}
  const mo=new MutationObserver(()=>schedule('mutation'));mo.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','disabled']});
  window.addEventListener('resize',()=>schedule('resize'));window.addEventListener('orientationchange',()=>setTimeout(()=>audit('orientation'),220));
  ['tagro:cadselect','tagro:cadchange','tagro:identitychange','tagro:networkchange'].forEach(n=>window.addEventListener(n,()=>schedule(n)));
  window.TAGRO_UI_QA={audit,last:null,confidence:()=>window.TAGRO_UI_QA.last?.confidence??null};
  setTimeout(()=>audit('boot'),300);
}
boot();
})();