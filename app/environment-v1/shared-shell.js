(() => {
'use strict';

const $ = (s, root=document) => root.querySelector(s);
const pageFile = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
const pageType = pageFile === 'info.html' ? 'info' : pageFile === 'workbench.html' ? 'workbench' : 'index';
const PAGE = {
  information:{label:'Information',desc:'Project, crop, water and site details'},
  field:{label:'Field',desc:'Locate, measure and draw field objects'},
  drawing:{label:'Drawing',desc:'Edit the same field geometry as a drawing'},
  adviser:{label:'Adviser',desc:'Irrigation design questions'},
  design:{label:'Design',desc:'Measurements and engineering checks'},
  materials:{label:'Materials',desc:'Material quantities and product selection'}
};
const ORDER = ['information','field','drawing','adviser','design','materials'];

function currentSurface(){
  if(pageType==='info') return 'information';
  if(pageType==='workbench') return $('#drawingMode')?.classList.contains('on') ? 'drawing' : 'field';
  const s=$('#app')?.dataset?.surface;
  return PAGE[s] ? s : 'adviser';
}

function jobContext(){
  try{
    const api=window.TAGROJobInfo;
    if(!api) return {title:'New irrigation job',detail:'Current job'};
    const job=api.read(api.ensureJobId());
    const customer=String(job?.customer?.name||'').trim();
    const ref=String(job?.customer?.external_reference||'').trim();
    const location=String(job?.customer?.location||'').trim();
    const crops=[...new Set((job?.plots||[]).map(p=>String(p?.crop||'').trim()).filter(Boolean))];
    const title=customer || ref || (crops.length ? `${crops.slice(0,2).join(' / ')} irrigation` : 'New irrigation job');
    const detail=[location,crops.length && customer ? crops.slice(0,2).join(' / ') : ''].filter(Boolean).join(' · ') || 'Current job';
    return {title,detail};
  }catch{return {title:'New irrigation job',detail:'Current job'}}
}

const shell=document.createElement('header');
shell.className='tagro-appshell';
shell.setAttribute('role','banner');
shell.innerHTML=`
  <div class="tagro-shell-main">
    <div class="tagro-shell-identity"><div class="tagro-shell-brand">TAGRO IRRIGATION</div><div class="tagro-shell-job"><b id="tagroShellJob">New irrigation job</b><span id="tagroShellJobDetail">Current job</span></div></div>
    <nav id="tagroShellNav" class="tagro-shell-nav" aria-label="Irrigation pages"></nav>
    <div class="tagro-shell-state"><div id="tagroShellSave" class="tagro-shell-save">Job active</div></div>
  </div>
  <div id="tagroShellRibbon" class="tagro-shell-ribbon" aria-label="Page tools"></div>`;
document.body.prepend(shell);
document.body.classList.add('tagro-shell-active');
document.body.dataset.tagroShellPage=pageType;

const nav=$('#tagroShellNav');
ORDER.forEach(id=>{
  const b=document.createElement('button');
  b.type='button';b.className='tagro-shell-tab';b.dataset.shellPage=id;b.textContent=PAGE[id].label;
  b.addEventListener('click',()=>openPage(id));nav.append(b);
});

function openPage(id){
  if(id==='information'){
    if(pageType!=='info') location.href='./info.html';
    return;
  }
  if(id==='field'||id==='drawing'){
    if(pageType==='workbench'){
      document.getElementById(id==='field'?'fieldMode':'drawingMode')?.click();
      const u=new URL(location.href);u.searchParams.set('view',id);history.replaceState(null,'',u);
      syncAll();
    }else location.href=`./workbench.html?view=${id}`;
    return;
  }
  if(pageType==='index'){
    document.querySelector(`[data-open-surface="${id}"]`)?.click();
    history.replaceState(null,'',`#${id}`);syncAll();
  }else location.href=`./index.html#${id}`;
}

function button(label,fn,opts={}){
  const b=document.createElement('button');b.type='button';b.className=`tagro-ribbon-btn${opts.primary?' primary':''}${opts.danger?' danger':''}${opts.active?' active':''}`;b.textContent=label;if(opts.title)b.title=opts.title;b.addEventListener('click',fn);return b;
}
function group(labelText){const g=document.createElement('div');g.className='tagro-ribbon-group';if(labelText){const l=document.createElement('span');l.className='tagro-ribbon-group-label';l.textContent=labelText;g.append(l)}return g}
function proxy(id,label,opts={}){const src=document.getElementById(id);if(!src||src.classList.contains('hidden'))return null;const b=button(label,()=>src.click(),{...opts,active:opts.active??src.classList.contains('on')});return b}
function toolProxy(kind,label){const src=document.querySelector(`#toolDock [data-tool="${kind}"]`);if(!src)return null;return button(label,()=>src.click(),{active:src.classList.contains('on')})}
function appendAll(g,items){items.filter(Boolean).forEach(x=>g.append(x));return g}

function renderWorkbenchTools(ribbon,surface){
  if(surface==='field'){
    const view=group('MAP');
    const wrap=document.createElement('div');wrap.className='tagro-ribbon-search';
    const input=document.createElement('input');input.placeholder='Search place or lat,lng';input.value=$('#searchInput')?.value||'';
    const go=document.createElement('button');go.type='button';go.textContent='⌕';
    const run=()=>{const src=$('#searchInput');if(src)src.value=input.value;$('#searchButton')?.click()};
    go.addEventListener('click',run);input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();run()}});wrap.append(input,go);view.append(wrap,button('Locate',()=>$('#locateButton')?.click()));ribbon.append(view);
  }
  ribbon.append(appendAll(group('FIELD'),[toolProxy('select','Select'),toolProxy('boundary','Boundary'),toolProxy('plot','Plot')]));
  ribbon.append(appendAll(group('NETWORK'),[toolProxy('main','Main'),toolProxy('submain','Submain'),toolProxy('lateral','Lateral'),toolProxy('water_source','Water'),toolProxy('plant','Plant')]));
  ribbon.append(appendAll(group('MEASURE'),[button('Ruler',()=>$('#measureTool')?.click(),{active:$('#measurePanel')?.classList.contains('show')}),button('More tools',()=>$('#workButton')?.click(),{primary:true})]));

  if($('#inspector')?.classList.contains('show')){
    const s=group('SELECTION');s.classList.add('tagro-ribbon-selection');
    appendAll(s,[proxy('multiToggle','Multi-select'),proxy('selectSame','Same type'),proxy('moveSelected','Move',{primary:true}),proxy('editSelected','Edit shape'),proxy('rotateSelected','Rotate'),proxy('duplicateSelected','Duplicate'),proxy('connectSelected','Connect'),proxy('labelSelected','Details'),proxy('emitterSelected','Emitter'),proxy('layoutSelected','Layout'),proxy('deleteSelected','Delete',{danger:true}),proxy('closeInspector','Clear')]);
    ribbon.append(s);
  }
}

function renderInfoTools(ribbon){
  const work=group('PROJECT');
  appendAll(work,[proxy('saveNow','Save',{primary:true}),proxy('addPlot','Add plot'),button('Measure on map',()=>{const m=document.querySelector('.map-measure');if(m)m.click();else location.href='./workbench.html?measure=all&from=info'}),button('Products',()=>{const b=$('#openProducts');if(b)b.click();else{location.hash='products';document.getElementById('jainProducts')?.scrollIntoView({behavior:'smooth'})}})]);
  ribbon.append(work);
}

function renderIndexTools(ribbon,surface){
  if(surface==='materials') ribbon.append(appendAll(group('MATERIALS'),[button('Products',()=>{location.href='./info.html#products'},{primary:true})]));
  if(surface==='adviser'){
    const status=$('#aiStatus')?.textContent?.trim();
    if(status){const g=group('STATUS');const span=document.createElement('span');span.style.cssText='font-size:9.5px;color:#687168;white-space:nowrap;padding:0 4px';span.textContent=status;g.append(span);ribbon.append(g)}
  }
}

function renderRibbon(){
  const ribbon=$('#tagroShellRibbon');if(!ribbon)return;ribbon.replaceChildren();const surface=currentSurface(),meta=PAGE[surface];
  const page=document.createElement('div');page.className='tagro-ribbon-page';page.innerHTML=`<b>${meta.label}</b><span>${meta.desc}</span>`;ribbon.append(page);
  if(pageType==='workbench')renderWorkbenchTools(ribbon,surface);else if(pageType==='info')renderInfoTools(ribbon);else renderIndexTools(ribbon,surface);
}

function syncNav(){const surface=currentSurface();document.querySelectorAll('.tagro-shell-tab').forEach(b=>b.classList.toggle('active',b.dataset.shellPage===surface));document.title=`TAGRO Irrigation · ${PAGE[surface].label}`}
function syncJob(){const j=jobContext();$('#tagroShellJob').textContent=j.title;$('#tagroShellJobDetail').textContent=j.detail}
function syncSave(){const out=$('#tagroShellSave');if(!out)return;let src=null,mode='neutral';if(pageType==='info')src=$('#saveState');else if(pageType==='workbench')src=$('#tagroSaveIndicator');if(src){out.textContent=src.textContent?.trim()||'Saved locally';mode=src.dataset?.mode||'local';out.title=src.title||out.textContent}else{out.textContent='Job active';out.title='Current job';mode='neutral'}out.dataset.mode=mode}
function syncAll(){syncNav();syncJob();syncSave();renderRibbon()}

function initialRoute(){
  if(pageType==='workbench'){
    const requested=new URLSearchParams(location.search).get('view');
    if(requested==='drawing')$('#drawingMode')?.click();else if(requested==='field')$('#fieldMode')?.click();
  }else if(pageType==='index'){
    const requested=(location.hash||'').replace('#','');
    const target=['adviser','design','materials'].includes(requested)?requested:'adviser';
    document.querySelector(`[data-open-surface="${target}"]`)?.click();
    if(!location.hash)history.replaceState(null,'',`#${target}`);
  }
}

initialRoute();syncAll();

if(pageType==='workbench'){
  ['fieldMode','drawingMode'].forEach(id=>document.getElementById(id)?.addEventListener('click',()=>setTimeout(syncAll,0)));
  const targets=[$('#inspector'),$('#toolDock'),$('#measurePanel')].filter(Boolean);targets.forEach(t=>new MutationObserver(()=>requestAnimationFrame(syncAll)).observe(t,{attributes:true,subtree:true,attributeFilter:['class']}));
}else if(pageType==='index'){
  const app=$('#app');if(app)new MutationObserver(()=>requestAnimationFrame(syncAll)).observe(app,{attributes:true,attributeFilter:['data-surface']});
}
window.addEventListener('tagro:job-info-change',()=>{syncJob();syncSave()});
setInterval(()=>{syncJob();syncSave()},1200);
})();
