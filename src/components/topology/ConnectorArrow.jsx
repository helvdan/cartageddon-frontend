export default function ConnectorArrow({ x1, y1, x2, y2, d, isActive }) {
  const strokeColor = isActive ? "#29b6f6" : "#475569";

  return (
    <path
      d={d ?? `M ${x1} ${y1} L ${x2} ${y2}`}
      fill="none"
      stroke={strokeColor}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      markerEnd={isActive ? "url(#arrow-active)" : "url(#arrow)"}
    />
  );
}
