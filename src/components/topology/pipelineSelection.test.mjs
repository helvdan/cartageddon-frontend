import assert from 'node:assert/strict';
import test from 'node:test';
import { pipelineSelectionReducer as reduce } from './pipelineSelection.js';

test('selecting storage replaces the selected stage', () => {
  const stage = reduce(null, { type: 'select-stage', id: 'extracted' });
  assert.deepEqual(reduce(stage, { type: 'toggle-storage', id: 'MySQL' }), { type: 'storage', id: 'MySQL' });
});

test('selecting a stage replaces the selected storage', () => {
  const storage = reduce(null, { type: 'toggle-storage', id: 'MySQL' });
  assert.deepEqual(reduce(storage, { type: 'select-stage', id: 'joined' }), { type: 'stage', id: 'joined' });
});

test('storage can be switched and toggled off without restoring a stage', () => {
  let selection = reduce(null, { type: 'toggle-storage', id: 'MySQL' });
  selection = reduce(selection, { type: 'toggle-storage', id: 'Postgres' });
  assert.deepEqual(selection, { type: 'storage', id: 'Postgres' });
  assert.equal(reduce(selection, { type: 'toggle-storage', id: 'Postgres' }), null);
});

test('late deselection of storage does not erase a newly selected stage or storage', () => {
  for (const selection of [{ type: 'stage', id: 'joined' }, { type: 'storage', id: 'MySQL' }]) {
    assert.equal(reduce(selection, { type: 'deselect-storage', id: 'Postgres' }), selection);
  }
});

test('outside click or loss of connection clears the matching storage selection', () => {
  assert.equal(reduce({ type: 'storage', id: 'Postgres' }, { type: 'deselect-storage', id: 'Postgres' }), null);
});

test('context change clears storage selection and preserves a selected stage', () => {
  assert.equal(reduce({ type: 'storage', id: 'MySQL' }, { type: 'context-changed' }), null);
  const stage = { type: 'stage', id: 'joined' };
  assert.equal(reduce(stage, { type: 'context-changed' }), stage);
});
