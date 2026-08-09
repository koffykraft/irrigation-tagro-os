export const DEFAULT_LAYOUT={
 version:'0.2.0-iteration01',
 settings:{leftVisible:true,rightVisible:true,tileScale:1,leftWidth:230,rightWidth:300},
 pages:[
  {id:'capture',label:'Capture',eyebrow:'MOTHERSHIP',description:'Tell TAGRO what is known. Speak, type, locate and record without forcing a full form.',components:['quickCapture','jobIdentity','farmIntent','knownUnknowns']},
  {id:'field',label:'Field',eyebrow:'FIELD INTELLIGENCE',description:'Place, areas, crops, access and field geometry. Only add what is useful.',components:['location','fieldAreas','cropPatches','access','fieldSketch','evidence']},
  {id:'resources',label:'Resources',eyebrow:'CONNECTED PLANES',description:'Water, pump, power, labour and operating constraints that shape design.',components:['waterSource','pumpPower','operatingWindow']},
  {id:'design',label:'Design',eyebrow:'IRRIGATION DOCK',description:'Application and network choices remain provisional until accepted.',components:['application','networkInput','operatingGroups','hydraulics']},
  {id:'review',label:'Review',eyebrow:'PLANAR / FLUX',description:'Current evidence, dependencies, ripples and design state.',components:['designState','rippleLog','shadowMemory']}
 ]
};
