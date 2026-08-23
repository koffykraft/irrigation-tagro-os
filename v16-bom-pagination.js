(()=>{
function boot(){
  const panel=document.querySelector('#tagroBom'),cad=document.querySelector('.tagro-cad');
  if(!panel||!cad||!window.TAGRO_BOM)return setTimeout(boot,120);
  if(document.querySelector('#tagroBomPaginationCss'))return;
  const style=document.createElement('style');style.id='tagroBomPaginationCss';style.textContent=`
.tagro-cad.tagro-bom-active{visibility:hidden;pointer-events:none}.tagro-bom-pager{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:5px 0 1px;border-top:1px solid #edf0ed}.tagro-bom-page-info{font-size:9px;color:#687069;white-space:nowrap}.tagro-bom-page-btn{height:29px;min-width:48px;border:1px solid #cbd1cc;border-radius:7px;background:#fff;padding:0 7px;font-size:10px;font-weight:750}.tagro-bom-page-btn:disabled{opacity:.35}.tagro-bom-page-size{font-size:8px;color:#7a817b;text-align:center;margin-top:-2px}@media(max-width:699px){.tagro-bom-pager{position:sticky;bottom:-8px;background:#fff;padding:6px 0 5px}.tagro-bom-page-btn{height:32px;min-width:54px}}
`;document.head.appendChild(style);
  let page=0,lastSignature='';
  function isolate(){cad.classList.toggle('tagro-bom-active',panel.classList.contains('show'))}
  function pageCapacity(rows){
    if(!rows.length)return 1;
    const heights=rows.slice(0,Math.min(4,rows.length)).map(r=>r.getBoundingClientRect().height).filter(h=>h>0);
    const avg=heights.length?heights.reduce((a,b)=>a+b,0)/heights.length:42;
    const vh=window.innerHeight||700,isMobile=(window.innerWidth||800)<700;
    const budget=Math.max(isMobile?120:150,Math.min(isMobile?vh*.26:vh*.34,isMobile?230:330));
    return Math.max(3,Math.min(isMobile?6:10,Math.floor(budget/Math.max(30,avg))));
  }
  function paginate(){
    isolate();if(!panel.classList.contains('show'))return;
    const table=panel.querySelector('.tagro-bom-table'),body=panel.querySelector('#tagroBomBody');if(!table||!body)return;
    const rows=[...table.querySelectorAll('tbody tr')];if(!rows.length)return;
    body.querySelector('.tagro-bom-pager')?.remove();body.querySelector('.tagro-bom-page-size')?.remove();
    const size=pageCapacity(rows),pages=Math.max(1,Math.ceil(rows.length/size));page=Math.max(0,Math.min(page,pages-1));
    const sig=`${rows.length}:${size}`;if(sig!==lastSignature){page=0;lastSignature=sig}
    rows.forEach((r,i)=>{r.style.display=i>=page*size&&i<(page+1)*size?'':'none'});
    if(pages>1){
      const pager=document.createElement('div');pager.className='tagro-bom-pager';pager.innerHTML=`<button class="tagro-bom-page-btn" data-bom-prev ${page===0?'disabled':''}>‹ Prev</button><span class="tagro-bom-page-info">Page ${page+1} of ${pages}</span><button class="tagro-bom-page-btn" data-bom-next ${page>=pages-1?'disabled':''}>Next ›</button>`;
      const note=document.createElement('div');note.className='tagro-bom-page-size';note.textContent=`${size} rows per page · sized to this viewport`;
      table.insertAdjacentElement('afterend',pager);pager.insertAdjacentElement('afterend',note);
      pager.querySelector('[data-bom-prev]').onclick=()=>{page--;paginate();panel.scrollTop=Math.max(0,table.offsetTop-48)};
      pager.querySelector('[data-bom-next]').onclick=()=>{page++;paginate();panel.scrollTop=Math.max(0,table.offsetTop-48)};
    }
  }
  const observer=new MutationObserver(()=>requestAnimationFrame(paginate));observer.observe(panel,{attributes:true,attributeFilter:['class'],childList:true,subtree:true});
  let resizeTimer=null;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{lastSignature='';paginate()},120)});
  window.addEventListener('orientationchange',()=>setTimeout(()=>{lastSignature='';paginate()},180));
  window.addEventListener('tagro:cadchange',()=>setTimeout(paginate,20));window.addEventListener('tagro:identitychange',()=>setTimeout(paginate,20));
  isolate();window.TAGRO_BOM_PAGINATION={refresh:paginate,getPage:()=>page+1};
}
boot();
})();