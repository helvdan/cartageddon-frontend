export default function StageNode({
  name,
  x,
  y = 75,
  width = 120,  // Значение по умолчанию для стадий
  height = 64, // Значение по умолчанию для стадий
  isActive,
  onClick
}) {
  return (
    <g
      className={`stage-node ${isActive ? 'active' : ''}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="5"
        fill={isActive ? "#0284c7" : "#1e293b"}
        stroke={isActive ? "#38bdf8" : "#475569"}
        strokeWidth="2"
        style={{ transition: 'all 0.2s ease' }}
      />
      <text
        x={x + width / 2}
        y={y + height / 2 + 4} // Динамически центрируется по любой переданной высоте
        textAnchor="middle"
        fill={isActive ? "#ffffff" : "#94a3b8"}
        fontSize="16"
        fontWeight={isActive ? "bold" : "normal"}
        style={{ transition: 'all 0.2s ease', fontFamily: 'sans-serif' }}
      >
        {name}
      </text>
    </g>
  );
}
