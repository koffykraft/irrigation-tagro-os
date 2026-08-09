export const PAGE_STRUCTURE_V02={
 version:'0.2.0-primer',
 status:'WORKING',
 rules:{
  pageOwnsState:false,
  orderIsConfig:true,
  zonesAreReplaceable:true,
  docksAreReplaceable:true,
  mobileIsProjection:true,
  domainRippleByDependency:true
 },
 zones:['primary','secondary','context','sidebar-left','sidebar-right','drawer','overlay','footer'],
 pages:[
  {id:'start',label:'Start / Job',intent:'Open or define the working job without forcing irrigation decisions.',zones:{primary:['jobIdentity','farmIntent','knownUnknowns'],context:['designState']}},
  {id:'farm',label:'Farm Intelligence',intent:'Understand the farm as the mothership before the irrigation dock.',zones:{primary:['location','farmIntent','access'],secondary:['cropPatches','operatingWindow'],context:['evidence']}},
  {id:'field',label:'Field / Map',intent:'Represent places, plots, geometry, elevation, access, obstacles and evidence.',zones:{primary:['fieldMap','fieldAreas'],secondary:['access','evidence'],context:['boundarySummary']}},
  {id:'cropsoil',label:'Crop / Soil',intent:'Describe plant patches and soil/root-zone conditions independently of irrigation.',zones:{primary:['cropPatches','soilState'],context:['evidence']}},
  {id:'resources',label:'Water / Power',intent:'Record resource constraints before selecting network sizes.',zones:{primary:['waterSource','pumpPower'],secondary:['operatingWindow'],context:['resourceFlags']}},
  {id:'application',label:'Application',intent:'Define provisional application device and demand at plant or area level.',zones:{primary:['application','plantDemand'],context:['evidence']}},
  {id:'network',label:'Network Design',intent:'Compose the physical water path and operating groups.',zones:{primary:['networkCanvas','network'],secondary:['operatingGroups'],context:['networkSummary']}},
  {id:'hydraulics',label:'Hydraulics',intent:'Test the accepted/proposed physical network against hydraulic constraints.',zones:{primary:['hydraulics','permissibleLengths'],context:['resourceFlags','rippleLog']}},
  {id:'materials',label:'Materials / BOM',intent:'Keep calculated, accepted and purchase quantities distinct.',zones:{primary:['bomCalculated','bomAccepted','bomPurchase'],context:['catalogueContext']}},
  {id:'review',label:'Review / Decision',intent:'See evidence status, unknowns, ripples, shadows and current decision state.',zones:{primary:['designState','knownUnknowns'],secondary:['rippleLog','shadowMemory'],context:['evidence']}},
  {id:'history',label:'History / Events',intent:'Preserve event lineage, corrections, superseded states and project junctions.',zones:{primary:['eventHistory','junctionHistory'],context:['shadowMemory']}}
 ],
 dockContracts:{
  fieldMap:{reads:['location.*','field.*','access.*','evidence.*'],writes:['field.geometry','location.coordinates','evidence.map'],adapters:['map','drawing','geolocation','elevation'],fallback:'sketch'},
  networkCanvas:{reads:['field.*','water.*','application.*','network.*'],writes:['network.objects','network.relationships'],adapters:['drawing'],fallback:'structured-list'},
  soilState:{reads:['soil.*'],writes:['soil.*'],adapters:[],fallback:'form'},
  plantDemand:{reads:['crop.*','application.*'],writes:[],adapters:['calculation'],fallback:'summary'},
  permissibleLengths:{reads:['network.*','application.*','hydraulics.*'],writes:[],adapters:['calculation'],fallback:'unavailable'},
  bomCalculated:{reads:['network.*'],writes:[],adapters:['bom'],fallback:'summary'},
  bomAccepted:{reads:['network.*','materials.accepted.*'],writes:['materials.accepted.*'],adapters:['bom'],fallback:'form'},
  bomPurchase:{reads:['materials.accepted.*','materials.purchase.*'],writes:['materials.purchase.*'],adapters:['catalogue','pricing'],fallback:'form'},
  eventHistory:{reads:['events.*'],writes:[],adapters:['persistence'],fallback:'local-history'},
  junctionHistory:{reads:['project.junctions.*'],writes:[],adapters:['persistence'],fallback:'local-history'}
 }
};
