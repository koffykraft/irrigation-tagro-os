export const DEFAULT_LAYOUT={
 version:'0.1.0',
 settings:{leftVisible:true,rightVisible:true,tileScale:1,leftWidth:240,rightWidth:300},
 pages:[
  {id:'farm',label:'Farm',eyebrow:'MOTHERSHIP',description:'Identity, intent, people and the farm context.',components:['jobIdentity','farmIntent','knownUnknowns']},
  {id:'field',label:'Field intelligence',eyebrow:'FIELD',description:'Place, land, crops, soil, access and observations before irrigation.',components:['location','fieldAreas','cropPatches','access','evidence']},
  {id:'water',label:'Water & power',eyebrow:'RESOURCE',description:'Source, pump, power, availability and constraints.',components:['waterSource','pumpPower','operatingWindow']},
  {id:'irrigation',label:'Irrigation',eyebrow:'DOMAIN',description:'Demand and physical network as one connected design.',components:['application','network','operatingGroups','hydraulics']},
  {id:'review',label:'Review',eyebrow:'PLANAR',description:'What is known, what changed, what is affected and what remains uncertain.',components:['designState','rippleLog','shadowMemory']}
 ]
};
