import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/ai-design-proposal.js', import.meta.url), 'utf8');
const context = { console, Date, Math, globalThis: {} };
context.window = context.globalThis;
vm.createContext(context);
vm.runInContext(source, context);

const api = context.globalThis.TAGRO_AI_DESIGN_PROPOSAL;
assert.ok(api, 'proposal API should be exposed');

const p = api.geometry({
  proposal_id: 'geo-1',
  summary: 'Add laterals from S1',
  target_entity_ids: ['S1'],
  confidence: 0.82,
  geometry: {
    operation: 'create_laterals',
    parent_id: 'S1',
    spacing_m: 10,
    side: 'both'
  },
  actions: ['accept', 'modify', 'reject']
});

assert.equal(p.proposal_type, 'geometry');
assert.equal(p.status, 'proposed');
assert.equal(p.geometry.parent_id, 'S1');
assert.deepEqual(Array.from(p.target_entity_ids), ['S1']);
assert.equal(api.validate(p).ok, true);

const rejected = api.transition(p, 'rejected', 'User prefers alternate direction');
assert.equal(rejected.status, 'rejected');
assert.equal(rejected.provenance.last_transition_note, 'User prefers alternate direction');
assert.equal(p.status, 'proposed', 'transition must not mutate the original proposal');

const invalid = api.create({ proposal_type: 'geometry', summary: 'Missing geometry' });
const result = api.validate(invalid);
assert.equal(result.ok, false);
assert.ok(Array.from(result.errors).some((e) => e.includes('geometry proposals require geometry')));

console.log('AI design proposal contract: PASS');
