(()=>{
if(!window.map||!map.pm)return;
map.pm.setGlobalOptions({finishOnEnter:true,exitModeOnEscape:true,continueDrawing:true});
const box=document.createElement('div');box.id='tagroDrawFinish';box.className='tagro-draw-finish';box.innerHTML='<span id="tagroDrawHint" class="tagro-draw-hint">Enter = finish · Esc = exit</span><button id="tagroFinishShape" class="ok">✓ Finish</button><button id="tagroExitDraw">Esc</button>';document.querySelector('.mapwrap').appendChild(box);
let activeShape=null;
function multiPoint(shape){return shape==='Line'||shape==='Polygon'}
function sync(){box.classList.toggle('show',multiPoint(activeShape)&&map.pm.globalDrawModeEnabled())}
map.on('pm:drawstart',e=>{activeShape=e.shape;sync()});
map.on('pm:drawend',()=>{activeShape=null;sync()});
map.on('pm:globaldrawmodetoggled',e=>{if(!e.enabled)activeShape=null;else if(e.shape)activeShape=e.shape;sync()});
function sendKey(key){document.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true,cancelable:true}));document.dispatchEvent(new KeyboardEvent('keyup',{key,bubbles:true,cancelable:true}))}
document.querySelector('#tagroFinishShape').onclick=e=>{e.preventDefault();e.stopPropagation();sendKey('Enter')};
document.querySelector('#tagroExitDraw').onclick=e=>{e.preventDefault();e.stopPropagation();sendKey('Escape')};
})();