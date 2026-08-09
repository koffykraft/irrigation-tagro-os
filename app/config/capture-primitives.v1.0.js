export const CAPTURE_PRIMITIVES_V1={
 version:'1.0.0-working',
 status:'WORKING_DESIGN',
 rules:{
  taskFirst:true,
  defaultDepth:'SUB_MINIMUM',
  farmerMeaningPreserved:true,
  multiPurposeAllowed:true,
  reflectionIsProvisional:true,
  typingIsFallback:true,
  optionalIsNotIncomplete:true,
  askOnlyConsequential:true
 },
 primitives:{
  NeedCard:{role:'Identify the farmer outcome in familiar language',modes:['choose','speak','type']},
  ChoiceChips:{role:'Fast familiar single or multiple choice',modes:['tap']},
  RelationshipCard:{role:'Capture how objects/crops/resources relate',modes:['tap','speak','type']},
  PurposeStack:{role:'Capture several simultaneous purposes and importance',modes:['tap','rank','speak']},
  PriorityPair:{role:'Reveal trade-off when two needs conflict',modes:['tap']},
  ShowMeCard:{role:'Replace technical description with evidence',modes:['photograph','map','draw']},
  QuickMeasure:{role:'Ask one consequential measurement with reason',modes:['number','measure','photograph']},
  ReflectionCard:{role:'Mirror current understanding for correction',modes:['accept','correct','ignore']},
  UnknownCard:{role:'Show one unresolved fact that matters',modes:['answer','skip-if-allowed']},
  StretchOffer:{role:'Offer extra farmer effort only with visible benefit',modes:['yes-no']},
  CorrectionCard:{role:'Preserve farmer authority over interpretation',modes:['tap','speak','type']}
 },
 normalizedPurposes:{
  income:'Income / sale',
  supplemental_income:'Additional income',
  household_food:'Food for home',
  weed_suppression:'Keep weeds / undergrowth down',
  cultural_practice:'Custom / family practice',
  crop_establishment:'Support while main crop establishes',
  yield_priority:'Maximum production',
  water_saving:'Use less water',
  labour_saving:'Reduce daily labour',
  survival:'Keep crop alive through dry period',
  future_expansion:'Leave room to expand later',
  other:'Something else'
 },
 examples:{
  bananaIntercrop:{
   thing:{type:'cropPatch',label:'Banana'},
   relationship:{type:'intercropped_with',target:'Coconut'},
   purposes:['household_food','supplemental_income','weed_suppression'],
   role:'supporting',
   farmerWords:'We keep banana here for the house, some sale, and it keeps the place from becoming wild.',
   normalizedStatus:'inferred',
   reflection:'Banana is useful, but coconut remains the main crop. Avoid optimizing the whole irrigation system only for maximum banana yield.',
   possibleRipples:['crop.priority','application.optimization','schedule.waterAllocation','cost.allocation']
  }
 },
 questionPatterns:[
  {id:'purpose-main',primitive:'NeedCard',prompt:'What would make this irrigation worthwhile for you?',choices:['Keep crop alive in summer','Better yield','Save water','Reduce labour','Use the pump I already have','Spend as little as possible','Easy to expand later','Something else']},
  {id:'crop-role',primitive:'RelationshipCard',prompt:'Is {crop} the main crop here, or growing with another crop?',choices:['Main crop','Intercrop / growing with another crop','Temporary crop','Not sure']},
  {id:'crop-purpose',primitive:'PurposeStack',prompt:'What is {crop} doing for you here?',choices:['Income / sale','Food for home','Additional income','Keeps weeds / undergrowth down','Custom / family practice','Supporting another crop','Something else'],multi:true},
  {id:'priority-scarcity',primitive:'PriorityPair',prompt:'If water becomes short, which should get priority?',dynamic:true},
  {id:'show-water',primitive:'ShowMeCard',prompt:'Show where the water comes from.',modes:['photograph','map','draw']},
  {id:'pump-proof',primitive:'ShowMeCard',prompt:'Can you show the pump label? It will let TAGRO check the pump more closely.',modes:['photograph'],optional:true},
  {id:'stretch',primitive:'StretchOffer',prompt:'This is enough for a preliminary answer. Want to improve it with one more check?',dynamic:true}
 ]
};
