(()=>{
function boot(){
  if(typeof map==='undefined'||!window.TAGRO_CAD||!window.TAGRO_MEASURE||!window.TAGRO_NETWORK)return setTimeout(boot,120);
  const cad=document.querySelector('.tagro-cad'),head=cad?.querySelector('.tagro-cad-head'),wrap=document.querySelector('.mapwrap');
  if(!cad||!head||!wrap||document.querySelector('#tagroBomBtn'))return;
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const round=(n,d=1)=>Number.isFinite(+n)?(+n).toFixed(d):'—';
  const pipeRoles=new Set(['main','submain','lateral']);
  const role=l=>String(l?.options?.tagroIdentityId||'').toLowerCase();
  const defaults=r=>r==='lateral'?{size:16,material:'LLDPE',sdr:13.6}:{size:r==='submain'?40:50,material:'PVC',sdr:13.6};
  const defaultEmitter={dischargeLph:8,spacingM:10,nominalHeadM:10,pressureExponent:.5};
  const keyOf=(...p)=>p.map(x=>String(x??'')).join('|');
  const idOf=l=>l?.options?.tagroObjectId||null;
  const validLayers=()=>window.TAGRO_CAD.getLayers().filter(l=>map.hasLayer(l)&&!l.options?.pmIgnore);
  function measureLength(l){try{const m=window.TAGRO_MEASURE.measure(l);return Number(m?.length)||0}catch{return 0}}
  function specOf(l,r){const x=l.options?.tagroEngineering;if(x&&Number(x.size)>0)return{size:+x.size,material:x.material||defaults(r).material,sdr:+x.sdr||13.6,provisional:false};return{...defaults(r),provisional:true}}
  function emitterOf(l){const x=l.options?.tagroEmitter;if(x&&Number(x.dischargeLph)>0&&Number(x.spacingM)>0)return{...defaultEmitter,...x,provisional:false};return{...defaultEmitter,provisional:true}}
  function emitterCount(length,cfg){return Math.max(1,Math.floor(Math.max(0,length)/Math.max(.1,+cfg.spacingM))+1)}
  function build(){
    const layers=validLayers(),pipes=layers.filter(l=>pipeRoles.has(role(l))),unidentifiedLines=layers.filter(l=>{const r=role(l);let s='';try{s=l.options?.tagroShape||l.pm?.getShape?.()||''}catch{}return s==='Line'&&(!r||r==='unidentified')});
    let network=null;try{network=window.TAGRO_NETWORK.buildRelationships()}catch{}
    const rows=new Map(),sources=[];let pipeM=0,emitters=0,provisional=0;
    function addRow(row,qty,source){
      const k=keyOf(row.kind,row.role,row.item,row.material,row.size,row.unit);
      const found=rows.get(k)||{...row,quantity:0,sources:[]};found.quantity+=qty;if(source)found.sources.push(source);rows.set(k,found);
    }
    for(const l of pipes){
      const r=role(l),length=measureLength(l),spec=specOf(l,r),source={id:idOf(l),role:r,lengthM:length};
      pipeM+=length;if(spec.provisional)provisional++;
      addRow({kind:'pipe',role:r,item:`${r[0].toUpperCase()+r.slice(1)} pipe`,material:spec.material,size:`${spec.size} mm`,unit:'m',provisional:spec.provisional},length,source);
      if(r==='lateral'){
        const em=emitterOf(l),n=emitterCount(length,em);emitters+=n;if(em.provisional)provisional++;
        addRow({kind:'emitter',role:r,item:`Emitter ${round(em.dischargeLph,1)} LPH`,material:'',size:`spacing ${round(em.spacingM,2)} m`,unit:'pcs',provisional:em.provisional},n,source);
      }
      sources.push({...source,spec,emitter:r==='lateral'?emitterOf(l):null});
    }
    const edges=network?.edges||[];
    const byKind=edges.reduce((a,e)=>(a[e.kind]=(a[e.kind]||0)+1,a),{});
    const orphans=(network?.orphans||[]).length;
    const settings=loadSettings();
    const allowance=Math.max(0,Math.min(25,+settings.pipeAllowancePct||0));
    const out=[...rows.values()].map(r=>({...r,designQuantity:r.quantity,procureQuantity:r.kind==='pipe'?r.quantity*(1+allowance/100):r.quantity}));
    out.sort((a,b)=>({pipe:0,emitter:1}[a.kind]??9)-({pipe:0,emitter:1}[b.kind]??9)||String(a.role).localeCompare(String(b.role))||String(a.item).localeCompare(String(b.item)));
    const status=unidentifiedLines.length||orphans||provisional?'DRAFT':'READY';
    return{status,generatedAt:new Date().toISOString(),rows:out,sources,summary:{pipeM,emitters,pipeObjects:pipes.length,mains:pipes.filter(l=>role(l)==='main').length,submains:pipes.filter(l=>role(l)==='submain').length,laterals:pipes.filter(l=>role(l)==='lateral').length,unidentifiedLines:unidentifiedLines.length,orphans,provisional,connections:edges.length},connections:{lateralToSubmain:byKind['lateral-submain']||0,lateralToMain:byKind['lateral-main']||0,submainToMain:byKind['submain-main']||0,all:edges.map(e=>({kind:e.kind,status:e.status,distanceM:e.distanceM,childId:idOf(e.child),parentId:idOf(e.parent)}))},allowancePct:allowance};
  }
  const SETTINGS_KEY='tagro.bom.settings.v1';
  function loadSettings(){try{return{pipeAllowancePct:3,...JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}')}}catch{return{pipeAllowancePct:3}}}
  function saveSettings(p){const s={...loadSettings(),...p};try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(s))}catch{}return s}
  function ensureCss(){if(document.querySelector('#tagroBomCss'))return;const s=document.createElement('style');s.id='tagroBomCss';s.textContent=`
.tagro-bom{position:absolute;right:8px;top:50%;transform:translateY(-50%);z-index:1105;width:min(390px,calc(100vw - 16px));max-height:78vh;display:none;overflow:auto;background:rgba(255,255,255,.99);border:1px solid #cbd1cc;border-radius:12px;box-shadow:0 7px 28px rgba(0,0,0,.22);color:#172019}.tagro-bom.show{display:block}.tagro-bom-head{position:sticky;top:0;z-index:3;display:flex;align-items:center;gap:6px;padding:7px 8px;background:#fff;border-bottom:1px solid #e2e6e2}.tagro-bom-head strong{font-size:12px;margin-right:auto}.tagro-bom-state{font-size:8px;font-weight:850;letter-spacing:.06em;padding:3px 6px;border-radius:999px;background:#fff1d6;color:#7a5317}.tagro-bom-state.ready{background:#eaf7ec;color:#2f6636}.tagro-bom-body{padding:8px;display:grid;gap:8px}.tagro-bom-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:5px}.tagro-bom-card{border:1px solid #e0e4e0;border-radius:8px;background:#fafbfa;padding:6px}.tagro-bom-card span{display:block;font-size:8px;color:#747b75}.tagro-bom-card b{display:block;font-size:11px;margin-top:2px}.tagro-bom-tools{display:grid;grid-template-columns:1fr 86px;gap:6px;align-items:center}.tagro-bom-tools label{font-size:9px;color:#5f675f}.tagro-bom-tools input{width:100%;height:28px;border:1px solid #cbd1cc;border-radius:7px;padding:0 6px;font-size:10px}.tagro-bom-actions{display:flex;gap:5px;flex-wrap:wrap}.tagro-bom-table{width:100%;border-collapse:collapse;font-size:9px}.tagro-bom-table th{position:sticky;top:43px;background:#f7f9f7;text-align:left;font-size:8px;color:#5d665f;padding:5px;border-bottom:1px solid #dfe4df}.tagro-bom-table td{padding:6px 5px;border-bottom:1px solid #edf0ed;vertical-align:top}.tagro-bom-table td.num{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}.tagro-bom-table small{display:block;color:#7a817b;margin-top:2px}.tagro-bom-warn{border:1px solid #ead0a0;background:#fff7e9;color:#71531e;border-radius:8px;padding:6px 7px;font-size:9px;line-height:1.4}.tagro-bom-ok{border:1px solid #bfd8c2;background:#f1f8f2;color:#2f6135;border-radius:8px;padding:6px 7px;font-size:9px;line-height:1.4}.tagro-bom-network{font-size:9px;color:#5e665f;line-height:1.45}.tagro-bom-empty{padding:14px 4px;text-align:center;color:#687069;font-size:10px}.tagro-bom-foot{font-size:8.5px;color:#777;line-height:1.4}.tagro-bom-btn{height:29px;border:1px solid #cbd1cc;border-radius:7px;background:#fff;padding:0 8px;font-size:10px;font-weight:750}.tagro-bom-btn.primary{background:#eef6ff;border-color:#8bb6d8;color:#075d9e}@media(max-width:699px){.tagro-bom{top:auto;bottom:8px;right:8px;transform:none;max-height:62vh}.tagro-bom-cards{grid-template-columns:repeat(2,1fr)}.tagro-bom-table th{top:43px}}`;
    document.head.appendChild(s);
  }
  const btn=document.createElement('button');btn.id='tagroBomBtn';btn.className='tagro-cad-btn';btn.textContent='BOM';btn.title='Build bill of materials from this drawing';head.insertBefore(btn,document.querySelector('#cadClose'));
  const panel=document.createElement('section');panel.id='tagroBom';panel.className='tagro-bom';panel.innerHTML='<div class="tagro-bom-head"><strong>Draw → BOM</strong><span id="tagroBomState" class="tagro-bom-state">DRAFT</span><button id="tagroBomClose" class="tagro-bom-btn">×</button></div><div id="tagroBomBody" class="tagro-bom-body"></div>';wrap.appendChild(panel);ensureCss();
  function qty(r){return r.kind==='pipe'?round(r.procureQuantity,1):Math.round(r.procureQuantity)}
  function csvValue(v){const s=String(v??'');return /[",\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s}
  function csv(){const b=build(),lines=[['Category','Role','Item','Material','Size / spacing','Design qty','Procure qty','Unit','Status']];b.rows.forEach(r=>lines.push([r.kind,r.role,r.item,r.material,r.size,round(r.designQuantity,r.kind==='pipe'?2:0),round(r.procureQuantity,r.kind==='pipe'?2:0),r.unit,r.provisional?'Provisional default':'Specified']));lines.push([]);lines.push(['Connections','Count']);lines.push(['Lateral → Submain',b.connections.lateralToSubmain]);lines.push(['Lateral → Main',b.connections.lateralToMain]);lines.push(['Submain → Main',b.connections.submainToMain]);return lines.map(x=>x.map(csvValue).join(',')).join('\n')}
  function exportCsv(){const blob=new Blob([csv()],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`TAGRO-BOM-${new Date().toISOString().slice(0,10)}.csv`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},100)}
  async function copyCsv(){try{await navigator.clipboard.writeText(csv());const b=document.querySelector('#tagroBomCopy');if(b){b.textContent='Copied';setTimeout(()=>b.textContent='Copy CSV',700)}}catch{}}
  function render(){if(!panel.classList.contains('show'))return;const b=build(),body=document.querySelector('#tagroBomBody'),state=document.querySelector('#tagroBomState');state.textContent=b.status;state.classList.toggle('ready',b.status==='READY');
    if(!b.summary.pipeObjects){body.innerHTML='<div class="tagro-bom-empty"><b>No irrigation pipes yet.</b><br>Draw lines, identify them as Main, Submain or Lateral, then return here.</div>';return}
    const issues=[];if(b.summary.unidentifiedLines)issues.push(`${b.summary.unidentifiedLines} drawn line${b.summary.unidentifiedLines===1?' needs':'s need'} Main/Submain/Lateral identity`);if(b.summary.orphans)issues.push(`${b.summary.orphans} pipe${b.summary.orphans===1?' is':'s are'} not connected within the current network tolerance`);if(b.summary.provisional)issues.push(`${b.summary.provisional} design input${b.summary.provisional===1?' is':'s are'} using provisional defaults`);
    body.innerHTML=`<div class="tagro-bom-cards"><div class="tagro-bom-card"><span>Pipe</span><b>${round(b.summary.pipeM,1)} m</b></div><div class="tagro-bom-card"><span>Emitters</span><b>${b.summary.emitters}</b></div><div class="tagro-bom-card"><span>Objects</span><b>${b.summary.pipeObjects}</b></div><div class="tagro-bom-card"><span>Connections</span><b>${b.summary.connections}</b></div></div><div class="tagro-bom-tools"><label>Pipe procurement allowance %<input id="tagroBomAllowance" type="number" min="0" max="25" step="0.5" value="${b.allowancePct}"></label><div class="tagro-bom-actions"><button id="tagroBomRefresh" class="tagro-bom-btn">Refresh</button></div></div><div class="tagro-bom-actions"><button id="tagroBomExport" class="tagro-bom-btn primary">Export CSV</button><button id="tagroBomCopy" class="tagro-bom-btn">Copy CSV</button></div>${issues.length?`<div class="tagro-bom-warn"><b>Draft BOM:</b> ${esc(issues.join(' · '))}. Quantities stay traceable to the drawing; nothing is silently promoted to confirmed.</div>`:`<div class="tagro-bom-ok"><b>BOM ready:</b> identified pipe geometry has explicit design inputs and all Submain/Lateral objects are connected in the current relationship model.</div>`}<table class="tagro-bom-table"><thead><tr><th>Item</th><th>Spec</th><th>Source</th><th style="text-align:right">Qty</th></tr></thead><tbody>${b.rows.map(r=>`<tr><td><b>${esc(r.item)}</b><small>${esc(r.role)}${r.provisional?' · provisional':''}</small></td><td>${esc([r.material,r.size].filter(Boolean).join(' · '))}</td><td>${r.sources.length} object${r.sources.length===1?'':'s'}</td><td class="num"><b>${qty(r)} ${esc(r.unit)}</b>${r.kind==='pipe'&&b.allowancePct?`<small>${round(r.designQuantity,1)} m drawn + ${round(b.allowancePct,1)}%</small>`:''}</td></tr>`).join('')}</tbody></table><div class="tagro-bom-network"><b>Relationship cues</b><br>Lateral → Submain: ${b.connections.lateralToSubmain}<br>Lateral → Main: ${b.connections.lateralToMain}<br>Submain → Main: ${b.connections.submainToMain}<br><small>These are connection points from the inferred network. They are not yet specific Jain/other fitting SKUs.</small></div><div class="tagro-bom-foot">Pipe quantity comes from the same measured geometry used by CAD Measure. Emitter quantity comes from each lateral's emitter spacing. Pricing and product-code mapping are deliberately not invented here; they can be joined to the Jain/TAGRO product catalogue next.</div>`;
    document.querySelector('#tagroBomAllowance').onchange=e=>{saveSettings({pipeAllowancePct:+e.target.value||0});render()};document.querySelector('#tagroBomRefresh').onclick=render;document.querySelector('#tagroBomExport').onclick=exportCsv;document.querySelector('#tagroBomCopy').onclick=copyCsv;
  }
  function open(){panel.classList.add('show');btn.classList.add('on');render()}
  function close(){panel.classList.remove('show');btn.classList.remove('on')}
  btn.onclick=()=>panel.classList.contains('show')?close():open();document.querySelector('#tagroBomClose').onclick=close;
  ['tagro:cadchange','tagro:identitychange','tagro:networkchange'].forEach(n=>window.addEventListener(n,()=>{if(panel.classList.contains('show'))setTimeout(render,0)}));
  map.on('pm:create pm:remove pm:edit pm:dragend',()=>{if(panel.classList.contains('show'))setTimeout(render,0)});
  window.TAGRO_BOM={build,open,close,render,csv,exportCsv};
}
boot();
})();
