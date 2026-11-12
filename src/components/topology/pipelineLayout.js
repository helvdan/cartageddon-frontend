export const STAGE_WIDTH = 120;
export const STAGE_HEIGHT = 64;
export const CENTER_Y = 90;
export const STORAGE_WIDTH = 80;

const COLUMN_GAP = 45;
const PARALLEL_COLUMN_GAP = 90;
const ROW_GAP = 100;
const CONNECTOR_GAP = 8;

export function connectorPath(x1, y1, x2, y2) {
  if (y1 === y2) return `M ${x1} ${y1} L ${x2} ${y2}`;
  return `M ${x1} ${y1} H ${(x1 + x2) / 2} V ${y2} H ${x2}`;
}

export function createPipelineLayout(groups) {
  let x = STORAGE_WIDTH;
  let previous = [{ id: 'source-db', x: 0, y: CENTER_Y - STAGE_HEIGHT / 2, width: STORAGE_WIDTH }];
  const nodes = [];
  const storages = [];
  const connectors = [];

  function connect(from, toX, toY, key) {
    connectors.push({
      key,
      stage: from.id,
      d: connectorPath(from.x + from.width + CONNECTOR_GAP, from.y + STAGE_HEIGHT / 2, toX - CONNECTOR_GAP, toY),
    });
  }

  for (const group of groups) {
    x += group.length > 1 || previous.length > 1 ? PARALLEL_COLUMN_GAP : COLUMN_GAP;
    const column = group.map((stage, index) => ({
      ...stage,
      x,
      y: CENTER_Y + (index - (group.length - 1) / 2) * ROW_GAP - STAGE_HEIGHT / 2,
      width: STAGE_WIDTH,
    }));

    for (const node of column) {
      for (const from of previous) {
        connect(from, node.x, node.y + STAGE_HEIGHT / 2, `${from.id}-${node.id}`);
      }
      if (node.target) {
        const storageX = node.x + STAGE_WIDTH + COLUMN_GAP;
        storages.push({ name: node.target, stage: node.id, x: storageX, y: node.y + STAGE_HEIGHT / 2 - 20 });
        connect(node, storageX, node.y + STAGE_HEIGHT / 2, `${node.id}-storage`);
      }
    }
    nodes.push(...column);
    previous = column;
    x += STAGE_WIDTH + (group.some(stage => stage.target) ? STORAGE_WIDTH + COLUMN_GAP : 0);
  }

  const right = Math.max(STORAGE_WIDTH, ...nodes.map(node => node.x + STAGE_WIDTH), ...storages.map(storage => storage.x + STORAGE_WIDTH));
  const largestGroup = Math.max(1, ...groups.map(group => group.length));
  const halfHeight = Math.max(110, ((largestGroup - 1) * ROW_GAP + STAGE_HEIGHT) / 2 + 20);
  return { nodes, storages, connectors, viewBox: `-20 ${CENTER_Y - halfHeight} ${right + 40} ${halfHeight * 2}` };
}
