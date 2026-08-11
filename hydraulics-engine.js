(()=>{
const EXP_S=.6494,EXP_D=1.7079,EXP_L=2.852,K_LAM=1.3936,NU=8.93e-7;
const HF_BASE={lateral:2.2,submain:1.8,main:1.8};
const A_ROLE={lateral:2.7791,submain:2.1764,main:2.1764};
const ID_MM={12:10.0,16:13.5,20:17.2,25:22.2,32:28.4,40:36.0,50:46.7,63:59.0,75:71.0,90:86.0,110:105.1,140:133.9,160:153.0,180:171.0,200:191.4};
const FIT={lateral:{16:236.8,20:358.2},submain:{50:1537.9,63:2312.5},main:{50:1537.9,63:2312.5}};
function role(r){r=String(r||'').toLowerCase();if(!HF_BASE[r])throw new Error('Unsupported hydraulic role');return r}
function idOf(mm){const id=ID_MM[+mm];if(!id)throw new Error('Unsupported nominal pipe size');return id}
function kOf(r,mm){r=role(r);mm=+mm;return FIT[r]?.[mm]??(A_ROLE[r]*Math.pow(idOf(mm),EXP_D))}
function effectiveHead(r,fallAlong=0){r=role(r);return HF_BASE[r]+Number(fallAlong||0)}
function terrainFactor(r,hf){r=role(r);hf=Number(hf);if(!(hf>0))return 0;return Math.pow(hf/HF_BASE[r],1/EXP_L)}
function terrainK(r,mm,hf){return kOf(r,mm)*terrainFactor(r,hf)}
function laminarPermissible(mm,hf,sdr){const id=idOf(mm);hf=Number(hf);sdr=Number(sdr);if(!(hf>0)||!(sdr>0))return NaN;return K_LAM*id*id*Math.sqrt(hf/sdr)}
function slopePct(length,deltaZ){length=Number(length);deltaZ=Number(deltaZ);return length>0?100*deltaZ/length:NaN}
function classifyGrade(p){p=Math.abs(Number(p));if(!Number.isFinite(p))return'unknown';if(p<2)return'gentle';if(p<5)return'moderate';if(p<10)return'steep';return'very-steep'}
function evaluatePipe({role:rr,nominalMm,lengthM,startElevationM,endElevationM,sdr=13.6}){const r=role(rr),length=Number(lengthM),dz=Number(endElevationM)-Number(startElevationM),fall=-dz,hf=effectiveHead(r,fall),grade=slopePct(length,dz),baseK=kOf(r,nominalMm),adjK=hf>0?terrainK(r,nominalMm,hf):0,lam=hf>0?laminarPermissible(nominalMm,hf,sdr):0;return{role:r,nominalMm:+nominalMm,idMm:idOf(nominalMm),lengthM:length,startElevationM:Number(startElevationM),endElevationM:Number(endElevationM),riseM:dz,fallAlongM:fall,gradePct:grade,gradeClass:classifyGrade(grade),baseHeadM:HF_BASE[r],effectiveHeadM:hf,baseK,terrainFactor:hf>0?terrainFactor(r,hf):0,terrainAdjustedK:adjK,laminarPermissibleM:lam,headStatus:hf>0?'positive':'non-positive'}}
window.TAGRO_HYDRAULICS={constants:{EXP_S,EXP_D,EXP_L,K_LAM,NU,HF_BASE,A_ROLE,ID_MM,FIT},kOf,effectiveHead,terrainFactor,terrainK,laminarPermissible,slopePct,evaluatePipe};
})();