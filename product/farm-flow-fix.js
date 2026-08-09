import{all,byProject,put,remove,id}from'./db.js';

const SUPPORT_PATHS=['field.cropSupporting','field.cropPurposes'];
const now=()=>new Date().toISOString();

async function context(){
 const projects=await all('projects');
 const project=projects.sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')))[0];
 if(!project)return null;
 const facts=await byProject('facts',project.id);
 return{project,facts,map:Object.fromEntries(facts.map(f=>[f.path,f.value]))};
}
async function writeFact(project,facts,path,value){
 const old=facts.find(f=>f.path===path);
 await put('facts',{id:old?.id||id('fact'),projectId:project.id,path,value,status:'described',source:'farmer',captureMethod:'choice',confidence:1,updatedAt:now()});
 await put('events',{id:id('event'),projectId:project.id,type:'fact.changed',payload:{path,before:old?.value??null,after:value},at:now()});
 project.updatedAt=now();await put('projects',project);
}
async function deleteFact(facts,path){const f=facts.find(x=>x.path===path);if(f)await remove('facts',f.id);}
async function chooseOnlyCrop(){
 const c=await context();if(!c)return;
 for(const p of SUPPORT_PATHS)await deleteFact(c.facts,p);
 await writeFact(c.project,c.facts,'field.hasSupportingCrop',false);
 await writeFact(c.project,c.facts,'field.cropRole','sole');
 location.reload();
}
async function chooseMixedCrop(){
 const c=await context();if(!c)return;
 await writeFact(c.project,c.facts,'field.hasSupportingCrop',true);
 if(c.map['field.cropRole']==='sole')await deleteFact(c.facts,'field.cropRole');
 location.reload();
}
function cardByTitle(text){return[...document.querySelectorAll('.card')].find(c=>c.querySelector('h2')?.textContent.trim()===text);}
function addStructureChoice(main,c){
 if(main.querySelector('[data-crop-structure]'))return;
 const wrap=document.createElement('div');wrap.dataset.cropStructure='1';wrap.className='crop-structure';
 const only=c.map['field.hasSupportingCrop']===false||c.map['field.cropRole']==='sole';
 const mixed=c.map['field.hasSupportingCrop']===true||!!c.map['field.cropSupporting'];
 wrap.innerHTML=`<div class="field"><label>Crop structure</label><div class="choices"><button class="choice ${only?'selected':''}" data-only-crop><strong>Only crop here</strong><small>No second crop to describe</small></button><button class="choice ${mixed?'selected':''}" data-mixed-crop><strong>Other crops are here too</strong><small>Add only if relevant</small></button></div></div>`;
 main.appendChild(wrap);
 wrap.querySelector('[data-only-crop]').onclick=chooseOnlyCrop;
 wrap.querySelector('[data-mixed-crop]').onclick=chooseMixedCrop;
}
function addDismiss(additional,c){
 const h=additional.querySelector('h2');if(!h||additional.querySelector('[data-no-other-crop]'))return;
 const head=document.createElement('div');head.className='capture-card-head';h.parentNode.insertBefore(head,h);head.appendChild(h);
 const x=document.createElement('button');x.type='button';x.className='dismiss-crop';x.dataset.noOtherCrop='1';x.setAttribute('aria-label','No other crop');x.textContent='×';x.onclick=chooseOnlyCrop;head.appendChild(x);
 const sole=[...additional.querySelectorAll('.choice')].find(b=>b.textContent.includes('Main / sole crop'));if(sole)sole.remove();
 const input=additional.querySelector('[data-input="field.cropSupporting"]');if(input&&!input.dataset.supportBound){input.dataset.supportBound='1';input.addEventListener('change',async()=>{if(input.value.trim())await chooseMixedCrop();});}
}
async function enhance(){
 if(location.hash!=='#farm'&&location.hash!=='farm')return;
 const c=await context();if(!c)return;
 const main=cardByTitle('Main crop'),additional=cardByTitle('Another crop here?'),purpose=cardByTitle('What is that crop doing for you?');
 if(!main||!additional)return;
 addStructureChoice(main,c);addDismiss(additional,c);
 const only=c.map['field.hasSupportingCrop']===false||c.map['field.cropRole']==='sole';
 const hasOther=c.map['field.hasSupportingCrop']===true||!!c.map['field.cropSupporting'];
 if(only){
  additional.classList.add('crop-collapsed');
  additional.innerHTML=`<div class="capture-card-head"><h2>No other crop added</h2><button class="dismiss-crop" data-add-other aria-label="Add another crop">+</button></div><p class="muted">TAGRO will treat the main crop as the only crop here unless you add another.</p>`;
  additional.querySelector('[data-add-other]').onclick=chooseMixedCrop;
  if(purpose)purpose.classList.add('hidden');
 }else{
  additional.classList.remove('crop-collapsed');
  if(purpose)purpose.classList.toggle('hidden',!hasOther);
 }
}
let scheduled=false;const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(async()=>{scheduled=false;await enhance();});});
observer.observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('hashchange',()=>setTimeout(enhance,0));
setTimeout(enhance,250);
