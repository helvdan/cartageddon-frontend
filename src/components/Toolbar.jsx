import CompareButton from './buttons/CompareButton';
import RerunButton from './buttons/RerunButton';
import RunAllButton from './buttons/RunPipelineButton.jsx';

export default function Toolbar({
  hasData,
  isComparing,
  onCompare,
  onRerun,
  isRunning,
  onRunAll,
  isPipelineRunning
}) {
  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
      <CompareButton
        hasData={hasData}
        isComparing={isComparing}
        onCompare={onCompare}
      />

      <RerunButton
        hasData={hasData}
        isRunning={isRunning}
        onRerun={onRerun}
      />

      <RunAllButton
        isPipelineRunning={isPipelineRunning}
        isRunning={isRunning}
        onRunAll={onRunAll}
      />
    </div>
  );
}