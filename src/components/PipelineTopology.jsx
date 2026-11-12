import StageNode from './topology/StageNode';
import StorageNode from './topology/StorageNode';
import ConnectorArrow from './topology/ConnectorArrow';
import { createPipelineLayout, STAGE_WIDTH, STAGE_HEIGHT, CENTER_Y } from './topology/pipelineLayout';
import { useStorageHealth } from './topology/useStorageHealth';

export default function PipelineTopology({
  context, stages, error, activeStage, selectedDb,
  onStageSelect, onStorageSelect, onStorageDeselect,
}) {
  const postgresHealth = useStorageHealth(context, 'postgres', 'Postgres', onStorageDeselect);
  const s3Health = useStorageHealth(context, 's3', 'MinIO S3', onStorageDeselect);
  const storageHealth = { Postgres: postgresHealth, 'MinIO S3': s3Health };

  if (error) return <div role="alert" style={{ flex: 1, textAlign: 'center', color: '#f87171' }}>{error}</div>;
  if (stages === null) return <div role="status" style={{ flex: 1, textAlign: 'center' }}>Загрузка стадий пайплайна…</div>;
  if (stages.length === 0) return <div role="status" style={{ flex: 1, textAlign: 'center' }}>В пайплайне нет стадий.</div>;

  const layout = createPipelineLayout(stages);

  return (
    <svg viewBox={layout.viewBox} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">

      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569" />
        </marker>
        <marker id="arrow-active" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#29b6f6" />
        </marker>
      </defs>

      {/* Входное хранилище выровнено по центру основной цепочки. */}
      <StorageNode
        name="MySQL"
        x={0}
        y={CENTER_Y - 20}
        isTargetActive={false}
        isSelected={selectedDb === 'MySQL'}
        onClick={() => onStorageSelect('MySQL')}
        onDeselect={() => onStorageDeselect('MySQL')}
      />

      {layout.connectors.map((connector) => (
        <ConnectorArrow
          key={connector.key}
          d={connector.d}
          isActive={activeStage === connector.stage}
        />
      ))}

      {layout.nodes.map((stage) => (
        <StageNode
          key={stage.id}
          name={stage.id}
          x={stage.x}
          y={stage.y}
          width={STAGE_WIDTH}
          height={STAGE_HEIGHT}
          isActive={activeStage === stage.id}
          onClick={() => onStageSelect(stage.id)}
        />
      ))}

      {layout.storages.map((storage) => (
        <StorageNode
          key={storage.stage}
          name={storage.name}
          x={storage.x}
          y={storage.y}
          isTargetActive={false}
          isSelected={selectedDb === storage.name}
          healthStatus={storageHealth[storage.name] ?? 'empty'}
          onClick={() => onStorageSelect(storage.name)}
          onDeselect={() => onStorageDeselect(storage.name)}
        />
      ))}
    </svg>
  );
}
