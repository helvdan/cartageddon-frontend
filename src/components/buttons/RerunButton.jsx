import BaseButton from './BaseButton';

export default function RerunButton({ hasData, isRunning, onRerun }) {
  const iconColor = !hasData ? '#475569' : isRunning ? '#eab308' : '#10b981';

  return (
    <BaseButton
      onClick={onRerun}
      disabled={!hasData || isRunning}
      isActive={isRunning}
      activeColor="#eab308"
      title={isRunning ? "Пайплайн выполняется..." : hasData ? "Перезапустить стадию для этого артефакта" : "Выберите артефакт для перезапуска"}
    >
      <svg
        width="22px"
        height="22px"
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
        style={{display: 'block'}}
      >
        <path
          d="M288,193s12.18-6-32-6a80,80,0,1,0,80,80"
          style={{
            fill: 'none',
            stroke: iconColor,
            strokeLinecap: 'round',
            strokeMiterlimit: 10,
            strokeWidth: '28px'
          }}
        />
        <polyline
          points="256 149 296 189 256 229"
          style={{
            fill: 'none',
            stroke: iconColor,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: '28px'
          }}
        />
        <path
          d="M256,64C150,64,64,150,64,256s86,192,192,192,192-86,192-192S362,64,256,64Z"
          style={{
            fill: 'none',
            stroke: iconColor,
            strokeMiterlimit: 10,
            strokeWidth: '32px'
          }}
        />
      </svg>
    </BaseButton>
  );
}