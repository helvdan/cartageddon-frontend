// ConnectorArrow.jsx
export default function ConnectorArrow({ x1, y1, x2, y2, d, isActive }) {
  // Если передан готовый путь 'd' (для изгибов), рисуем наконечник на конце пути
  const strokeColor = isActive ? "#29b6f6" : "#475569";

  if (d) {
    return (
      <path
        d={d}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        markerEnd={isActive ? "url(#arrow-active)" : "url(#arrow)"} // Наконечник остается
      />
    );
  }

  // Для обычных соединений рисуем наконечник на конце невидимой линии
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="transparent" // Делаем линию невидимой
      strokeWidth="2"
      markerEnd={isActive ? "url(#arrow-active)" : "url(#arrow)"} // Наконечник остается
    />
  );
}
