// src/components/topology/StorageNode.jsx
export default function StorageNode({ name, x, y, isTargetActive, onClick }) {
  // Динамически меняем цвета в зависимости от того, активна ли нода
  const fillColor = isTargetActive ? "#0f172a" : "#334155";
  const strokeColor = isTargetActive ? "#00e5ff" : "#475569";
  const textColor = isTargetActive ? "#00e5ff" : "#e2e8f0";
  const strokeWidth = isTargetActive ? "3" : "2";

  return (
    // Сдвигаем весь цилиндр целиком в координаты x, y
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      className={`etl-node ${isTargetActive ? 'active' : ''}`}
    >
      {/* Тело цилиндра */}
      <path
        d="M 0,0 L 0,40 A 30,12 0 0 0 60,40 L 60,0"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        style={{ transition: 'all 0.2s ease' }}
      />
      {/* Верхняя крышка цилиндра */}
      <ellipse
        cx="30"
        cy="0"
        rx="30"
        ry="12"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        style={{ transition: 'all 0.2s ease' }}
      />
      {/* Текст внутри цилиндра */}
      <text
        x="30"
        y="30"
        textAnchor="middle"
        fill={textColor}
        fontSize="13"
        fontWeight="500"
        style={{ userSelect: 'none', fontFamily: 'sans-serif', transition: 'all 0.2s ease' }}
      >
        {name}
      </text>
    </g>
  );
}