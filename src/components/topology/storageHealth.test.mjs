import assert from 'node:assert/strict';
import test from 'node:test';
import { subscribeToStorageHealth } from './storageHealth.js';
import { pipelineSelectionReducer as reduce } from './pipelineSelection.js';

function connection(onState) {
  let socket;
  class FakeSocket {
    constructor(url) { this.url = url; socket = this; }
    close() { this.closed = true; this.onclose(); }
  }
  const dispose = subscribeToStorageHealth('ws://test/infra/s3/ws/health', onState, FakeSocket);
  return { socket, dispose };
}

test('accepts empty, filled and disconnected S3 state updates', () => {
  const states = [];
  const { socket } = connection(state => states.push(state));
  for (const state of ['empty', 'filled', 'disconnected']) socket.onmessage({ data: JSON.stringify({ state }) });
  assert.deepEqual(states, ['empty', 'filled', 'disconnected']);
});

test('transport failure clears a filled state', () => {
  for (const event of ['onerror', 'onclose']) {
    const states = [];
    const { socket } = connection(state => states.push(state));
    socket.onmessage({ data: '{"state":"filled"}' });
    socket[event]();
    assert.deepEqual(states, ['filled', 'disconnected']);
  }
});

test('disposing on context change closes the socket and ignores stale events', () => {
  const states = [];
  const { socket, dispose } = connection(state => states.push(state));
  dispose();
  socket.onmessage({ data: '{"state":"filled"}' });
  socket.onerror();
  assert.equal(socket.closed, true);
  assert.deepEqual(states, []);
});

test('invalid health response is treated as unavailable', () => {
  for (const data of ['invalid json', '{"error":"failed"}', '{"state":"unknown"}']) {
    const states = [];
    const { socket } = connection(state => states.push(state));
    socket.onmessage({ data });
    assert.deepEqual(states, ['disconnected']);
  }
});

test('S3 selection replaces the stage and other storage selections', () => {
  let selection = reduce(null, { type: 'select-stage', id: 'loading_s3' });
  selection = reduce(selection, { type: 'toggle-storage', id: 'Postgres' });
  selection = reduce(selection, { type: 'toggle-storage', id: 'MinIO S3' });
  assert.deepEqual(selection, { type: 'storage', id: 'MinIO S3' });
  selection = reduce(selection, { type: 'select-stage', id: 'joined' });
  assert.deepEqual(selection, { type: 'stage', id: 'joined' });
});

test('S3 loss of connection clears only the S3 selection', () => {
  let selection = { type: 'storage', id: 'MinIO S3' };
  const { socket } = connection(state => {
    if (state === 'disconnected') selection = reduce(selection, { type: 'deselect-storage', id: 'MinIO S3' });
  });
  socket.onerror();
  assert.equal(selection, null);
  selection = { type: 'storage', id: 'Postgres' };
  socket.onclose();
  assert.deepEqual(selection, { type: 'storage', id: 'Postgres' });
});
