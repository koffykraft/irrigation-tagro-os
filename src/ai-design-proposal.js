(function (global) {
  'use strict';

  var STATUS = Object.freeze([
    'draft',
    'proposed',
    'compared',
    'accepted',
    'modified',
    'rejected',
    'superseded'
  ]);

  var PROPOSAL_TYPES = Object.freeze([
    'geometry',
    'product',
    'hydraulic',
    'agronomy',
    'human_engineering',
    'commercial',
    'review',
    'question',
    'assumption'
  ]);

  function asArray(value) {
    if (Array.isArray(value)) return value.slice();
    if (value == null) return [];
    return [value];
  }

  function asObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? Object.assign({}, value) : {};
  }

  function nonEmptyString(value, fallback) {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
  }

  function clampConfidence(value) {
    var n = Number(value);
    if (!Number.isFinite(n)) return null;
    return Math.max(0, Math.min(1, n));
  }

  function makeId(prefix) {
    var p = nonEmptyString(prefix, 'proposal');
    var stamp = Date.now().toString(36);
    var rand = Math.random().toString(36).slice(2, 8);
    return p + '-' + stamp + '-' + rand;
  }

  function createProposal(input) {
    var source = asObject(input);
    var proposalType = PROPOSAL_TYPES.indexOf(source.proposal_type) >= 0 ? source.proposal_type : 'review';
    var status = STATUS.indexOf(source.status) >= 0 ? source.status : 'draft';

    return {
      proposal_id: nonEmptyString(source.proposal_id, makeId(proposalType)),
      proposal_type: proposalType,
      target_entity_ids: asArray(source.target_entity_ids).filter(Boolean),
      summary: nonEmptyString(source.summary, 'Untitled proposal'),
      reasoning_summary: nonEmptyString(source.reasoning_summary, ''),
      evidence_refs: asArray(source.evidence_refs),
      assumptions: asArray(source.assumptions),
      engineering_effects: asObject(source.engineering_effects),
      material_effects: asObject(source.material_effects),
      commercial_effects: asObject(source.commercial_effects),
      human_effects: asObject(source.human_effects),
      future_effects: asObject(source.future_effects),
      confidence: clampConfidence(source.confidence),
      status: status,
      actions: asArray(source.actions),
      geometry: source.geometry ? asObject(source.geometry) : null,
      product_candidates: asArray(source.product_candidates),
      question: source.question ? asObject(source.question) : null,
      provenance: asObject(source.provenance),
      created_at: nonEmptyString(source.created_at, new Date().toISOString())
    };
  }

  function validateProposal(proposal) {
    var p = asObject(proposal);
    var errors = [];

    if (!nonEmptyString(p.proposal_id, '')) errors.push('proposal_id is required');
    if (PROPOSAL_TYPES.indexOf(p.proposal_type) < 0) errors.push('proposal_type is invalid');
    if (!nonEmptyString(p.summary, '')) errors.push('summary is required');
    if (STATUS.indexOf(p.status) < 0) errors.push('status is invalid');

    if (p.confidence != null) {
      var c = Number(p.confidence);
      if (!Number.isFinite(c) || c < 0 || c > 1) errors.push('confidence must be between 0 and 1');
    }

    if (p.proposal_type === 'geometry' && !p.geometry) {
      errors.push('geometry proposals require geometry');
    }

    return {
      ok: errors.length === 0,
      errors: errors
    };
  }

  function transitionProposal(proposal, nextStatus, note) {
    if (STATUS.indexOf(nextStatus) < 0) {
      throw new Error('Invalid proposal status: ' + nextStatus);
    }
    var next = Object.assign({}, proposal, { status: nextStatus });
    next.provenance = Object.assign({}, asObject(proposal && proposal.provenance), {
      last_transition_at: new Date().toISOString(),
      last_transition_note: nonEmptyString(note, '')
    });
    return next;
  }

  function geometryProposal(input) {
    var source = asObject(input);
    source.proposal_type = 'geometry';
    source.status = source.status || 'proposed';
    return createProposal(source);
  }

  global.TAGRO_AI_DESIGN_PROPOSAL = Object.freeze({
    STATUS: STATUS,
    PROPOSAL_TYPES: PROPOSAL_TYPES,
    create: createProposal,
    geometry: geometryProposal,
    validate: validateProposal,
    transition: transitionProposal
  });
})(typeof window !== 'undefined' ? window : globalThis);
