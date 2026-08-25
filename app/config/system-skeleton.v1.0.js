export const SYSTEM_SKELETON_V1 = {
  version: '1.0.0-working',
  status: 'WORKING_ARCHITECTURE',
  purpose: 'One persistent irrigation job can be projected into different working surfaces and deliverables without duplicating truth.',

  invariants: {
    oneJobOneTruth: true,
    pagesOwnNoDomainTruth: true,
    fieldAndDrawingShareGeometry: true,
    measurementsDeriveFromCanonicalGeometry: true,
    relationshipsAreExplicit: true,
    proposalsAreNotAcceptedDesign: true,
    deterministicEngineeringOutranksAiGuessing: true,
    manufacturerEvidenceOutranksLearnedObservation: true,
    unknownIsNotZero: true,
    configurationMustNotRewriteDomainTruth: true,
    historyIsPreservedAcrossReconfiguration: true,
    localWorkRemainsUsableWithoutNetwork: true
  },

  layers: [
    {
      id: 'truth',
      role: 'Persistent reality and accepted/described project facts',
      owns: ['job', 'objects', 'relationships', 'evidence', 'events', 'maturity'],
      mayNotOwn: ['page layout', 'toolbar position', 'theme', 'temporary selection']
    },
    {
      id: 'decision',
      role: 'Alternatives, proposals, acceptance/rejection and unresolved questions',
      owns: ['proposals', 'decisions', 'unknowns', 'learning_evidence'],
      mayNotSilentlyMutate: ['truth']
    },
    {
      id: 'derived',
      role: 'Repeatable calculations and projections from truth',
      owns: ['measurements', 'hydraulic_results', 'bom_requirements', 'product_matches', 'cost_projections'],
      rule: 'Derived results carry engine/source/version and are recalculated from canonical inputs.'
    },
    {
      id: 'composition',
      role: 'Configurable picture presented for the current need',
      owns: ['surface_order', 'zones', 'docks', 'tools', 'visibility', 'measurement_display', 'renderer_choice'],
      rule: 'Composition may change without moving or copying truth.'
    },
    {
      id: 'session',
      role: 'Ephemeral interaction state',
      owns: ['selection', 'open_panel', 'active_tool', 'map_view', 'draft_preview'],
      rule: 'Session state is never mistaken for accepted job truth.'
    }
  ],

  stores: {
    canonicalSpatial: {
      contract: 'tagro-spatial-state-v1',
      currentAdapter: '../environment-v1/spatial-store.js',
      owns: ['objects', 'relationships', 'events', 'revision'],
      localPersistence: 'localStorage',
      cloudPersistence: '/api/jobs/:job_id/state',
      cloudStatus: 'adapter/API prepared; runtime binding must be verified'
    },
    jobEvidence: {
      owns: ['farmer_context', 'evidence', 'conversation', 'proposals', 'learning_evidence', 'maturity'],
      currentAdapters: ['../environment-v1/environment-learning.js', '../environment-v1/environment-learning-bridge.js'],
      cloudPersistence: ['/api/jobs/:job_id/state', '/api/jobs/:job_id/learning']
    },
    presentationConfig: {
      owns: ['deliverable_profile', 'surface_config', 'tool_config', 'view_config', 'device_projection'],
      persistence: 'job configuration with local device overrides',
      mustNotOwn: ['geometry', 'hydraulic truth', 'material truth']
    }
  },

  capabilities: {
    capture: {
      purpose: 'Capture only consequential information in farmer/field language',
      uses: ['NeedCard', 'ChoiceChips', 'RelationshipCard', 'ShowMeCard', 'QuickMeasure', 'ReflectionCard'],
      reads: ['active_task', 'existing_evidence'],
      writes: ['evidence', 'relationships', 'events']
    },
    fieldGeometry: {
      purpose: 'Create and edit real-coordinate field/network objects',
      reads: ['objects'],
      writes: ['objects.geometry', 'events'],
      currentRenderer: 'Leaflet + Geoman',
      replaceableAdapter: true
    },
    drawingProjection: {
      purpose: 'Edit the same canonical objects in a clean engineering projection',
      reads: ['objects'],
      writes: ['objects.geometry', 'events'],
      rule: 'No export/recreation copy is permitted between FIELD and DRAWING.'
    },
    selectionAndTransform: {
      purpose: 'Select one/many objects; move, rotate, duplicate, edit points and label',
      reads: ['objects'],
      writes: ['objects.geometry', 'objects.properties', 'events']
    },
    relationshipEditor: {
      purpose: 'Record explicit physical/logical parentage and other relationships',
      reads: ['objects', 'relationships'],
      writes: ['relationships', 'events'],
      transitionNote: 'Current Workbench also records network.parent_id in object properties; canonical relationship migration remains explicit work.'
    },
    measurement: {
      purpose: 'Derive visible lengths, areas, coordinates, spacing and distances from canonical geometry',
      reads: ['objects.geometry'],
      writes: ['derived.measurements only when persisted as evidence'],
      displayModes: ['selected', 'always-visible', 'ruler', 'family-spacing', 'print'],
      rule: 'Measurement display is configurable; measurement source is not.'
    },
    repeatedLayout: {
      purpose: 'Preview and create repeated laterals/other future families from explicit anchors',
      reads: ['objects.geometry', 'relationships', 'layout_parameters'],
      writes: ['proposal_preview', 'objects', 'relationships', 'events'],
      rule: 'Preview first; created geometry becomes ordinary editable canonical objects.'
    },
    applicationDevice: {
      purpose: 'Attach device intent/specification to network/application objects',
      reads: ['field_context', 'product_knowledge'],
      writes: ['object/device properties', 'evidence', 'events'],
      productSelectionIsOptional: true
    },
    adviser: {
      purpose: 'Understand, ask, compare and propose without silently accepting design',
      reads: ['truth', 'decision', 'derived', 'relevant_product_knowledge'],
      writes: ['conversation', 'proposals', 'learning_evidence'],
      directGeometryAuthority: false
    },
    engineering: {
      purpose: 'Deterministic hydraulic/permissible-length/section/runtime checks',
      reads: ['accepted_or_described_inputs'],
      writes: ['derived.hydraulic_results'],
      acceptanceGate: 'conformance pass plus required inputs present'
    },
    materials: {
      purpose: 'Project requirements, accepted quantities, procurement quantities, products and price editions',
      reads: ['accepted_design', 'derived_measurements', 'product_knowledge'],
      writes: ['materials_state', 'decisions', 'events'],
      quantityPlanes: ['design', 'accepted', 'procure']
    },
    persistence: {
      purpose: 'Keep the job recoverable across navigation, reload, device/network interruption and later identity changes',
      modes: ['local-first', 'anonymous-cloud-job'],
      conflictRule: 'Never silently overwrite a newer version.',
      identityRule: 'Job identity exists independently of user login.'
    },
    history: {
      purpose: 'Preserve changes, corrections, decisions, superseded states and project junctions',
      reads: ['events', 'proposals', 'learning_evidence', 'state_versions'],
      writes: []
    },
    export: {
      purpose: 'Render a deliverable from current accepted/provisional state without becoming a new source of truth',
      renderers: ['screen', 'print', 'pdf', 'bom', 'purchase-list', 'field-sheet'],
      writes: ['export_event']
    }
  },

  elements: {
    navigation: { capability: 'composition', configurable: ['order', 'visibility', 'labels', 'compact/mobile projection'] },
    surfaceSwitcher: { capability: 'composition', configurable: ['visible surfaces', 'order', 'default surface'] },
    workButton: { capability: 'fieldGeometry', configurable: ['position', 'visible tools', 'tool groups'] },
    toolDock: { capability: 'fieldGeometry', configurable: ['groups', 'order', 'visibility', 'compactness'] },
    inspector: { capability: 'selectionAndTransform', configurable: ['actions', 'measurement visibility', 'property fields'] },
    measurementLabels: { capability: 'measurement', configurable: ['off', 'selected', 'all', 'family', 'print'] },
    adviserPanel: { capability: 'adviser', configurable: ['inline', 'surface', 'drawer', 'disabled'] },
    designPanel: { capability: 'engineering', configurable: ['summary depth', 'checks shown', 'unknowns shown'] },
    materialsPanel: { capability: 'materials', configurable: ['requirement', 'accepted', 'procure', 'price', 'product detail'] },
    historyPanel: { capability: 'history', configurable: ['event depth', 'junctions', 'decisions', 'learning evidence'] },
    saveIndicator: { capability: 'persistence', configurable: ['local-only', 'cloud-synced', 'offline', 'conflict'] }
  },

  surfaces: {
    field: {
      purpose: 'Reality-facing spatial work',
      primaryCapabilities: ['fieldGeometry', 'selectionAndTransform', 'measurement', 'relationshipEditor'],
      optionalCapabilities: ['repeatedLayout', 'applicationDevice', 'adviser'],
      truthProjection: ['objects', 'relationships', 'measurements']
    },
    drawing: {
      purpose: 'Clean engineering projection of the same canonical geometry',
      primaryCapabilities: ['drawingProjection', 'selectionAndTransform', 'measurement', 'relationshipEditor'],
      optionalCapabilities: ['repeatedLayout', 'applicationDevice'],
      truthProjection: ['objects', 'relationships', 'measurements']
    },
    adviser: {
      purpose: 'Conversational understanding and proposal',
      primaryCapabilities: ['capture', 'adviser'],
      optionalCapabilities: ['engineering', 'materials'],
      truthProjection: ['relevant evidence', 'canonical geometry summary', 'derived results', 'proposals']
    },
    design: {
      purpose: 'Engineering checks, unknowns, operating logic and design maturity',
      primaryCapabilities: ['engineering', 'measurement'],
      optionalCapabilities: ['adviser', 'history'],
      truthProjection: ['network', 'measurements', 'hydraulic results', 'unknowns', 'proposals']
    },
    materials: {
      purpose: 'Requirements, product resolution and quantities',
      primaryCapabilities: ['materials'],
      optionalCapabilities: ['adviser', 'export'],
      truthProjection: ['accepted design', 'measurements', 'materials state', 'product evidence']
    },
    review: {
      purpose: 'Decision surface showing what is known, proposed, accepted, unresolved and changed',
      primaryCapabilities: ['history', 'engineering', 'materials'],
      optionalCapabilities: ['adviser', 'export']
    },
    history: {
      purpose: 'Recoverable project lineage',
      primaryCapabilities: ['history'],
      optionalCapabilities: ['export']
    }
  },

  deliverables: {
    fieldCapture: {
      purpose: 'Record enough real field information to support later work.',
      outputMaturity: 'indication',
      surfaces: ['field', 'adviser', 'review'],
      capabilities: ['capture', 'fieldGeometry', 'measurement', 'persistence', 'history'],
      exports: ['field-sheet']
    },
    quickFeasibility: {
      purpose: 'Give useful direction without pretending a full design exists.',
      outputMaturity: 'indication',
      surfaces: ['field', 'adviser', 'design', 'review'],
      capabilities: ['capture', 'measurement', 'adviser', 'engineering', 'persistence', 'history']
    },
    networkConcept: {
      purpose: 'Develop an editable physical network concept from real field evidence.',
      outputMaturity: 'preliminary',
      surfaces: ['field', 'drawing', 'adviser', 'design', 'review'],
      capabilities: ['fieldGeometry', 'drawingProjection', 'selectionAndTransform', 'relationshipEditor', 'measurement', 'repeatedLayout', 'adviser', 'engineering', 'persistence', 'history']
    },
    checkedDesign: {
      purpose: 'Produce a hydraulically checked design with explicit unknowns and acceptance state.',
      outputMaturity: 'design_checked',
      surfaces: ['field', 'drawing', 'design', 'materials', 'review', 'history'],
      capabilities: ['measurement', 'relationshipEditor', 'engineering', 'materials', 'persistence', 'history', 'export']
    },
    materialEstimate: {
      purpose: 'Produce a preliminary or accepted material requirement from the current design.',
      outputMaturity: 'preliminary',
      surfaces: ['drawing', 'design', 'materials', 'review'],
      capabilities: ['measurement', 'engineering', 'materials', 'persistence', 'export']
    },
    purchaseList: {
      purpose: 'Resolve accepted design quantities into procurement quantities/products without changing engineering truth.',
      outputMaturity: 'proposed',
      surfaces: ['materials', 'review', 'history'],
      capabilities: ['materials', 'persistence', 'history', 'export']
    },
    installedRecord: {
      purpose: 'Preserve what was actually installed, changed and later serviced.',
      outputMaturity: 'installed',
      surfaces: ['field', 'drawing', 'review', 'history'],
      capabilities: ['fieldGeometry', 'measurement', 'history', 'persistence', 'export']
    }
  },

  joins: [
    { from: 'need/task', to: 'deliverable profile', rule: 'The current purpose chooses the composition, not a universal page sequence.' },
    { from: 'deliverable profile', to: 'surfaces', rule: 'Only useful surfaces are shown; hidden surfaces do not lose data.' },
    { from: 'surface', to: 'capabilities', rule: 'A surface assembles capabilities; it does not own them.' },
    { from: 'capability', to: 'truth/decision/derived stores', rule: 'Every read/write boundary is explicit.' },
    { from: 'FIELD', to: 'DRAWING', rule: 'Same object IDs and canonical geometry; renderer changes only.' },
    { from: 'geometry', to: 'measurement', rule: 'Measurements are derived from canonical coordinates and update when geometry changes.' },
    { from: 'network relationship', to: 'engineering', rule: 'Flow hierarchy comes from explicit relationships, never screen position alone.' },
    { from: 'engineering', to: 'materials', rule: 'Materials consume requirements/results; product choice cannot rewrite engineering facts.' },
    { from: 'adviser', to: 'proposal', rule: 'AI may propose intent/options; acceptance is a separate human event.' },
    { from: 'proposal acceptance', to: 'truth', rule: 'Only explicit acceptance may promote proposed geometry/design into accepted state.' },
    { from: 'every mutation', to: 'persistence/history', rule: 'State revision and event lineage are preserved.' },
    { from: 'configuration', to: 'composition', rule: 'Configuration changes visibility/order/rendering, never domain meaning.' }
  ],

  configuration: {
    precedence: ['system-default', 'tagro-policy', 'job', 'deliverable', 'surface', 'device', 'session'],
    persistedLevels: ['tagro-policy', 'job', 'deliverable', 'surface', 'device'],
    ephemeralLevels: ['session'],
    configurableDimensions: [
      'available deliverables', 'surface order', 'surface visibility', 'default surface',
      'zone placement', 'dock membership', 'tool groups', 'tool order', 'tool visibility',
      'inspector actions', 'measurement display', 'labels', 'map renderer/provider',
      'drawing renderer', 'adviser placement', 'engineering detail depth',
      'material columns', 'product/pricing adapters', 'export templates', 'mobile projection'
    ],
    forbiddenOverrides: [
      'canonical object identity', 'event lineage', 'evidence provenance', 'accepted engineering result provenance',
      'manufacturer source evidence', 'proposal-vs-accepted distinction', 'unknown-as-unknown'
    ]
  },

  persistence: {
    localFirst: true,
    localCanonicalKey: 'tagro.irrigation.spatial.v1:<job_id>',
    cloudContract: 'anonymous job capability token + optimistic state version',
    remoteRoutes: {
      create: 'POST /api/jobs',
      read: 'GET /api/jobs/:job_id',
      save: 'PUT /api/jobs/:job_id/state',
      learning: 'POST /api/jobs/:job_id/learning'
    },
    conflictRule: 'On version conflict, preserve both versions and require reconciliation; never last-write-wins silently.',
    navigationRule: 'Every working surface resolves the same active job_id before rendering.',
    saveVisibility: ['local saved revision', 'cloud sync state', 'offline state', 'conflict state']
  },

  currentAssembly: {
    canonicalWorkbench: '../environment-v1/workbench.html',
    environmentHub: '../environment-v1/index.html',
    transitionalField: '../environment-v1/field-map.html',
    transitionalDrawing: '../environment-v1/spatial-drawing.html',
    legacyFunctionalReference: '../../location-map.html',
    historicalNotPrimary: ['../../app/index.html', '../../ui-vnext-prototype.html', '../../prototype/iteration-01-model.html', '../../prototype/reflective-capture.html'],
    referenceOnly: ['../../reference.html', '../../page-structure.html', '../../engine-framework.html']
  }
};
