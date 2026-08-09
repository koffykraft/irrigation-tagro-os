export const QUERY_DEPTHS=['SUB_MINIMUM','MINIMUM','ADEQUATE','STRETCH','MAXIMUM'];

export const TASK_PROFILES_V1={
 version:'1.0.0',
 status:'ACCEPTED_LOGICAL_FRAMEWORK',
 defaultDepth:'SUB_MINIMUM',
 rules:{
  universalForm:false,
  askOnlyConsequential:true,
  reuseExistingEvidence:true,
  downgradeWhenHardGateMissing:true,
  aiCannotAcceptDesign:true,
  pageOrderDoesNotControlEngineeringOrder:true
 },
 tasks:{
  quickFeasibility:{
   label:'Quick feasibility',
   output:'INDICATION',
   subMinimum:['need.object','need.outcome','crop.orArea','water.exists','pump.exists'],
   minimum:['water.availability','pump.power','application.intent'],
   adequate:['field.geometry','elevation.context','operating.hours','access.constraints'],
   stretch:['soil.context','future.expansion','labour.context','cost.preference'],
   hardGates:[],
   surfaces:['start','field','resources','review']
  },
  permissibleLateralLength:{
   label:'Permissible lateral length',
   output:'PRELIMINARY',
   subMinimum:['application.device','application.discharge','lateral.diameter','outlet.spacing'],
   minimum:['terrain.lateralFallOrRise','hydraulics.targetHead'],
   adequate:['device.operatingPressure','pipe.actualInternalDiameter','accepted.geometry'],
   stretch:['temperature.context','field.installation.constraints'],
   hardGates:['application.device','lateral.diameter','outlet.spacing'],
   surfaces:['application','network','hydraulics']
  },
  pumpCompatibility:{
   label:'Pump compatibility',
   output:'PRELIMINARY',
   subMinimum:['pump.exists','pump.power','activeDemand.estimate','route.lengthEstimate'],
   minimum:['pump.headOrCurveEvidence','elevation.context','main.diameter'],
   adequate:['source.yield','network.acceptedObjects','operatingGroups'],
   stretch:['power.reliability','future.expansion','runtime.preference'],
   hardGates:['activeDemand.estimate','pump.headOrCurveEvidence'],
   surfaces:['resources','network','hydraulics','review']
  },
  applicationSelection:{
   label:'Application device selection',
   output:'PROPOSED',
   subMinimum:['crop.identity','plant.orAreaMode','water.constraint','farmer.priority'],
   minimum:['plant.spacing','rootZone.context','pressure.context'],
   adequate:['soil.context','crop.age','water.quality','maintenance.capacity'],
   stretch:['weather.context','fertigation.intent','future.cropChange','cost.preference'],
   hardGates:[],
   surfaces:['cropsoil','resources','application','review']
  },
  networkConcept:{
   label:'New network concept',
   output:'PRELIMINARY',
   subMinimum:['field.roughGeometry','water.location','application.demandEstimate','access.majorConstraints'],
   minimum:['pump.context','elevation.context','plantPattern','operating.intent'],
   adequate:['field.acceptedGeometry','obstacles','maintenance.access','operatingGroups'],
   stretch:['mechanisation.routes','future.expansion','labour.context','cost.preference'],
   hardGates:['field.roughGeometry','water.location','application.demandEstimate'],
   surfaces:['field','resources','application','network','review']
  },
  networkRedesign:{
   label:'Existing system redesign',
   output:'PROPOSED',
   subMinimum:['installedNetwork.whatExists','problem.symptom','affected.area'],
   minimum:['installedNetwork.sizes','installedNetwork.routes','pump.context','application.context'],
   adequate:['measured.pressureOrFlow','elevation.context','operatingGroups','failure.history'],
   stretch:['maintenance.history','future.expansion','replacement.budget'],
   hardGates:['installedNetwork.whatExists','problem.symptom'],
   surfaces:['field','resources','network','hydraulics','history','review']
  },
  pipeSizing:{
   label:'Main / submain sizing',
   output:'DESIGN-CHECKED',
   subMinimum:['activeDemand.estimate','route.length','pipe.role'],
   minimum:['elevation.context','pressure.allowance','candidate.diameter'],
   adequate:['accepted.operatingGroup','pipe.internalDiameter','fittings.context'],
   stretch:['future.expansion','energy.preference'],
   hardGates:['activeDemand.estimate','route.length','pressure.allowance'],
   surfaces:['network','hydraulics','review']
  },
  bomEstimate:{
   label:'Preliminary material estimate',
   output:'PRELIMINARY',
   subMinimum:['network.conceptObjects','approx.quantities'],
   minimum:['network.acceptedRoutes','connections.pattern'],
   adequate:['accepted.designVersion','accessories.rules'],
   stretch:['catalogue.products','pricing','spares.preference'],
   hardGates:['network.conceptObjects'],
   surfaces:['network','materials','review']
  },
  purchaseList:{
   label:'Purchase list from accepted design',
   output:'PROPOSED',
   subMinimum:['accepted.designVersion','materials.accepted'],
   minimum:['catalogue.availability'],
   adequate:['pricing.current','stock.context'],
   stretch:['spares.preference','delivery.preference'],
   hardGates:['accepted.designVersion','materials.accepted'],
   surfaces:['materials','review']
  }
 }
};
