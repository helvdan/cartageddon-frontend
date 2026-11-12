import assert from 'node:assert/strict';
import test from 'node:test';
import { createPipelineLayout, STAGE_WIDTH, STAGE_HEIGHT, STORAGE_WIDTH } from './pipelineLayout.js';

test('uses API stage ids and order, including stages unknown to the frontend', () => {
  const layout = createPipelineLayout([[{ id: 'custom_first' }], [{ id: 'custom_second' }]]);
  assert.deepEqual(layout.nodes.map(node => node.id), ['custom_first', 'custom_second']);
  assert.equal(layout.connectors.length, 2);
  assert.ok(layout.nodes[1].x > layout.nodes[0].x + STAGE_WIDTH);
});

test('only renders storage targets present in the response', () => {
  const layout = createPipelineLayout([[{ id: 'custom' }], [{ id: 'loading_db', target: 'Postgres' }]]);
  assert.deepEqual(layout.storages.map(storage => storage.name), ['Postgres']);
  const loader = layout.nodes.at(-1);
  assert.ok(layout.storages[0].x > loader.x + STAGE_WIDTH);
  assert.equal(layout.storages[0].y + 20, loader.y + STAGE_HEIGHT / 2);
});

test('keeps parallel stages separate and connects both branches', () => {
  const layout = createPipelineLayout([
    [{ id: 'joined' }],
    [{ id: 'loading_db', target: 'Postgres' }, { id: 'loading_s3', target: 'MinIO S3' }],
  ]);
  const [joined, db, s3] = layout.nodes;
  assert.equal(db.x, s3.x);
  assert.ok(s3.y >= db.y + STAGE_HEIGHT);
  assert.ok(db.x > joined.x + STAGE_WIDTH);
  assert.ok(layout.connectors.some(connector => connector.key === 'joined-loading_db'));
  assert.ok(layout.connectors.some(connector => connector.key === 'joined-loading_s3'));
  for (const connector of layout.connectors.filter(connector => connector.stage === 'joined')) {
    const [startX, , bendX, , endX] = connector.d.match(/-?\d+(?:\.\d+)?/g).map(Number);
    assert.ok(bendX - startX >= 30, 'Horizontal segment before the bend must remain visible');
    assert.ok(endX - bendX >= 30, 'Horizontal segment before the arrowhead must remain visible');
  }
});

test('viewBox stays centered and includes every node for different pipeline sizes', () => {
  for (const size of [1, 4, 10]) {
    const groups = Array.from({ length: size }, (_, index) => [{ id: `step_${index}` }]);
    groups.push(Array.from({ length: size }, (_, index) => ({ id: `load_${index}`, target: `storage_${index}` })));
    const layout = createPipelineLayout(groups);
    const [left, top, width, height] = layout.viewBox.split(' ').map(Number);
    const right = Math.max(...layout.storages.map(storage => storage.x + STORAGE_WIDTH));
    assert.equal(-left, left + width - right);
    const minY = Math.min(...layout.nodes.map(node => node.y));
    const maxY = Math.max(...layout.nodes.map(node => node.y + STAGE_HEIGHT));
    assert.equal(minY - top, top + height - maxY);
    for (const node of layout.nodes) {
      assert.ok(node.x >= left && node.x + STAGE_WIDTH <= left + width);
      assert.ok(node.y >= top && node.y + STAGE_HEIGHT <= top + height);
    }
  }
});

test('empty pipeline has no invented nodes or connectors', () => {
  const layout = createPipelineLayout([]);
  assert.deepEqual(layout.nodes, []);
  assert.deepEqual(layout.storages, []);
  assert.deepEqual(layout.connectors, []);
});
