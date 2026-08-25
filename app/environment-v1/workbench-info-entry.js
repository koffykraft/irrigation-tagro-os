(() => {
'use strict';
const params=new URLSearchParams(location.search);if(params.get('measure')!=='all')return;
let tries=0;
function activate(){tries+=1;window.TAGROComposition?.setMeasurementDisplay?.('all');const ruler=document.getElementById('measureTool');if(ruler){ruler.click();return}if(tries<20)setTimeout(activate,150)}
setTimeout(activate,250);
})();