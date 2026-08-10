/* TAGRO Irrigation Science v1
   Hydraulic adapter only. Constants and equations are the previously approved TAGRO irrigation science.
   UI, map and design-engine logic must remain outside this module. */
(()=>{
'use strict';
const EXP_S=0.6494,EXP_D=1.7079,EXP_L=2.852,K_LAM=1.3936,NU=8.93e-7;
const HF_BASE={lateral:2.2,submain:1.8,main:1.8};
const A_ROLE={lateral:2.7791,submain:2.1764,main:2.1764};
const ID={12:10.0,16:13.5,20:17.2,25:22.2,32:28.4,40:36.0,50:46.7,63:59.0,75:71.0,90:86.0,110:105.1,140:133.9,160:153.0,180:171.0,200:191.4};
const ID_SRC={25:'IS 4985 6 kg (not in NTB chart)',32:'IS 4985 6 kg (not in NTB chart)'};
const K_FITTED={lateral:{16:236.8,20:358.2},submain:{50:1537.9,63:2312.5},main:{50:1537.9,63:2312.5}};
const DEFAULT_SIZES={lateral:[12,16,20,25,32],submain:[25,32,40,50,63,75,90,110],main:[32,40,50,63,75,90,110]};
function kOf(role,mm){const f=K_FITTED[role]&&K_FITTED[role][mm];if(f)return{k:f,source:'fitted'};if(ID[mm]===undefined||A_ROLE[role]===undefined)return null;return{k:A_ROLE[role]*Math.pow(ID[mm],EXP_D),source:'derived'}}
function effectiveHead(role,fallM){const b=HF_BASE[role];if(b===undefined)return null;return b+(Number(fallM)||0)}
function kForTerrain(role,mm,fallM){const b=kOf(role,mm);if(!b)return null;const hf=effectiveHead(role,fallM);if(!(hf>0))return{k:0,source:b.source,dead:true};return{k:b.k*Math.pow(hf/HF_BASE[role],1/EXP_L),source:b.source,dead:false}}
function reynolds(lph,idMm){if(!(lph>0)||!(idMm>0))return 0;return 4*(lph/3.6e6)/(Math.PI*(idMm/1000)*NU)}
function regime(re){return re<2000?'laminar':re<4000?'transition':'turbulent'}
function permissibleLaminar(mm,sdr,allowedHeadM){const id=ID[mm];if(!id||!(sdr>0)||!(allowedHeadM>0))return null;return K_LAM*id*id*Math.sqrt(allowedHeadM/sdr)}
function permissibleTurbulent(role,mm,sdr,fallM){if(!(sdr>0))return null;const k=kForTerrain(role,mm,fallM);if(!k)return null;if(k.dead)return 0;return k.k/Math.pow(sdr,EXP_S)}
function permissible(opts){const role=opts.role,mm=Number(opts.mm),sdr=Number(opts.sdr);if(opts.system==='vlp'&&role==='lateral'){const hf=(Number(opts.headM)||0)*(Number(opts.varPct)||0)/100;return permissibleLaminar(mm,sdr,hf)}return permissibleTurbulent(role,mm,sdr,Number(opts.fallM)||0)}
function headloss(opts){const role=opts.role,mm=Number(opts.mm),sdr=Number(opts.sdr),lengthM=Number(opts.lengthM);if(!(lengthM>0)||!(sdr>0))return null;if(opts.system==='vlp'&&role==='lateral'){const id=ID[mm];if(!id)return null;return sdr*lengthM*lengthM/(K_LAM*K_LAM*id*id*id*id)}const perm=permissibleTurbulent(role,mm,sdr,Number(opts.fallM)||0);if(!(perm>0))return perm===0?Infinity:null;const base=effectiveHead(role,Number(opts.fallM)||0);return base*Math.pow(lengthM/perm,EXP_L)}
function assess(opts){const role=opts.role,lengthM=Number(opts.lengthM),flowLph=Number(opts.flowLph),mm=Number(opts.mm);if(!(lengthM>0)||!(flowLph>=0)||!mm)return{valid:false};if(flowLph===0)return{valid:true,noLoad:true,role,mm,lengthM,flowLph};const sdr=flowLph/lengthM,perm=permissible({...opts,sdr}),hf=headloss({...opts,sdr}),id=ID[mm],re=reynolds(flowLph,id);return{valid:true,role,mm,lengthM,flowLph,sdr,permissibleM:perm,headlossM:hf,passes:perm!==null&&perm>=lengthM,source:(kOf(role,mm)||{}).source||'none',idMm:id,idSource:ID_SRC[mm]||null,reynolds:re,regime:regime(re)}}
function velocity(flowLph,mm){const id=ID[Number(mm)];if(!(flowLph>0)||!id)return null;const q=flowLph/3.6e6,a=Math.PI*Math.pow(id/1000,2)/4;return q/a}
window.TAGROScience=Object.freeze({version:'1.0.0',EXP_S,EXP_D,EXP_L,K_LAM,NU,HF_BASE,A_ROLE,ID,ID_SRC,K_FITTED,DEFAULT_SIZES,kOf,effectiveHead,kForTerrain,reynolds,regime,permissibleLaminar,permissibleTurbulent,permissible,headloss,assess,velocity});
})();