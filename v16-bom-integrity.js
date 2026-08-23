(()=>{
function boot(){
  if(typeof map==='undefined'||!window.TAGRO_CAD||!window.TAGRO_BOM)return setTimeout(boot,120);
  const panel=document.querySelector('#tagroBom');if(!panel)return;
  const pipeRoles=new Set(['main','submain','lateral']);
  const role=l=>String(l?.options?.tagroIdentityId||'').toLowerCase();
  const active=()=>window.TAGRO_CAD.getLayers().filter(l=>map.hasLayer(l)&&!l.options?.pmIgnore);
  function flat(v,out=[]){if(!Array.isArray(v))return out;if(v.length&&v[0]&&typeof v[0].lat==='number'){v.forEach(x=>out.push(x));return out}v.forEach(x=>flat(x,out));return out}
  function geomKey(l){
    if(!l?.getLatLngs)return'';const pts=flat(l.getLatLngs()).map(x=>`${(+x.lat).toFixed(6)},${(+x.lng).toFixed(6)}`);if(!pts.length)return'';
    const a=pts.join('|'),b=[...pts].reverse().join('|');return a<b?a:b;
  }
  function audit(){
    const pipes=active().filter(l=>pipeRoles.has(role(l))),counts={main:0,submain:0,lateral:0};pipes.forEach(l=>counts[role(l)]++);
    const groups=new Map(),duplicateIds=new Map();let provisional=0;
    for(const l of pipes){
      const r=role(l);const k=geomKey(l);if(k){const a=groups.get(k)||[];a.push(l);groups.set(k,a)}
      const id=l.options?.tagroObjectId;if(id){const a=duplicateIds.get(id)||[];a.push(l);duplicateIds.set(id,a)}
      const g=l.options?.tagroEngineering;if(g?.confirmed!==true)provisional++;
      if(r==='lateral'&&l.options?.tagroEmitter?.confirmed!==true)provisional++;
    }
    const duplicateGroups=[...groups.values()].filter(a=>a.length>1),duplicateObjectIds=[...duplicateIds.values()].filter(a=>a.length>1);
    return{pipes,counts,provisional,duplicateGroups,duplicateObjectIds};
  }
  function apply(){
    if(!panel.classList.contains('show'))return;const a=audit(),body=panel.querySelector('#tagroBomBody');if(!body)return;
    let counts=body.querySelector('.tagro-bom-source-audit');if(!counts){counts=document.createElement('div');counts.className='tagro-bom-source-audit';const cards=body.querySelector('.tagro-bom-cards');cards?.insertAdjacentElement('afterend',counts)}
    if(counts)counts.textContent=`Active pipe objects: Main ${a.counts.main} · Submain ${a.counts.submain} · Lateral ${a.counts.lateral}`;
    const issues=[];
    if(a.provisional)issues.push(`${a.provisional} pipe/emitter input${a.provisional===1?' is':'s are'} still software defaults, not accepted`);
    if(a.duplicateGroups.length)issues.push(`${a.duplicateGroups.length} coincident pipe geometr${a.duplicateGroups.length===1?'y group':'y groups'} detected`);
    if(a.duplicateObjectIds.length)issues.push(`${a.duplicateObjectIds.length} repeated object ID group${a.duplicateObjectIds.length===1?'':'s'} detected`);
    let integrity=body.querySelector('.tagro-bom-integrity');
    if(issues.length){
      const state=panel.querySelector('#tagroBomState');if(state){state.textContent='DRAFT';state.classList.remove('ready')}
      const ok=body.querySelector('.tagro-bom-ok');if(ok)ok.remove();
      if(!integrity){integrity=document.createElement('div');integrity.className='tagro-bom-warn tagro-bom-integrity';const table=body.querySelector('.tagro-bom-table');table?.insertAdjacentElement('beforebegin',integrity)}
      if(integrity)integrity.innerHTML=`<b>Integrity check:</b> ${issues.join(' · ')}. Review/delete extra objects and accept design inputs before treating quantities as final.`;
    }else integrity?.remove();
  }
  const style=document.createElement('style');style.textContent='.tagro-bom-source-audit{font-size:9px;color:#5f675f;padding:1px 1px 0;line-height:1.4}.tagro-bom-integrity{margin-top:0}';document.head.appendChild(style);
  const mo=new MutationObserver(()=>setTimeout(apply,0));mo.observe(panel,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  ['tagro:cadchange','tagro:identitychange','tagro:designprovenancechange','tagro:networkchange'].forEach(n=>window.addEventListener(n,()=>setTimeout(apply,0)));
  map.on('pm:create pm:remove pm:edit pm:dragend',()=>setTimeout(apply,0));
  window.TAGRO_BOM_INTEGRITY={audit,apply};setTimeout(apply,200);
}
boot();
})();
