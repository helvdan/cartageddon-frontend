import { useEffect, useRef } from 'react';
import { stageService } from '../../services/api';
import { STORAGE_WIDTH } from './pipelineLayout';

export default function StorageNode({ name, x, y, isTargetActive, isSelected, healthStatus = 'empty', onClick, onDeselect }) {
  const isUnavailable = healthStatus === 'disconnected';
  const isSelectionActive = isSelected && !isUnavailable;
  const clearingRef = useRef(false);

  let defaultFill = isTargetActive ? "#0f172a" : "#1e293b";
  let defaultStroke = isTargetActive ? "#00e5ff" : "#475569";
  let defaultText = isTargetActive ? "#00e5ff" : "#94a3b8";

  if (healthStatus === 'filled') {
    defaultFill = "#15803d";   // Спокойный зеленый для темной темы
    defaultStroke = "#22c55e"; // Яркий зеленый контур
    defaultText = "#ffffff";
  } else if (isUnavailable) {
    defaultFill = "#991b1b";   // Спокойный красный
    defaultStroke = "#ef4444"; // Яркий красный контур
    defaultText = "#ffffff";
  }

  const fillColor = isSelectionActive ? "#0284c7" : defaultFill;
  const strokeColor = isSelectionActive ? "#38bdf8" : defaultStroke;
  const textColor = isSelectionActive ? "#ffffff" : defaultText;

  const strokeWidth = isSelectionActive || isTargetActive || healthStatus !== 'empty' ? "3" : "2";
  const fontWeight = isSelectionActive || isTargetActive || healthStatus !== 'empty' ? "bold" : "normal";

  const handleNodeClick = (e) => {
    e.stopPropagation();
    if (isUnavailable) return;
    if (onClick) onClick();
  };

  useEffect(() => {
    const handleKeyDown = async (event) => {
      const isDKey = event.key.toLowerCase() === 'd' || event.key.toLowerCase() === 'в';

      if (isDKey && isSelectionActive && !event.repeat && !clearingRef.current) {
        const prompt = name === 'MinIO S3'
          ? 'Удалить все текущие объекты из бакета S3 выбранного конфига?'
          : `Вы уверены, что хотите полностью очистить ${name}?`;
        const confirmDelete = window.confirm(prompt);
        if (!confirmDelete) return;

        clearingRef.current = true;
        try {
          await stageService.clearStorage(name);
          if (onDeselect) onDeselect();
        } catch {
          // API service displays the failure; preserve selection for retry.
        } finally {
          clearingRef.current = false;
        }
      }
    };

    if (isSelectionActive) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSelectionActive, name, onDeselect]);

  // Изменено: слушатель для снятия выделения при клике по фону или пустой области экрана
  useEffect(() => {
    const handleOutsideClick = () => {
      if (isSelectionActive && onDeselect) onDeselect();
    };

    if (isSelectionActive) {
      document.addEventListener('click', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isSelectionActive, onDeselect]);

  return (
    // Сдвигаем весь цилиндр целиком в координаты x, y
    <g
      transform={`translate(${x}, ${y})`}
      onClick={handleNodeClick}
      aria-disabled={isUnavailable}
      style={{cursor: isUnavailable ? 'not-allowed' : onClick ? 'pointer' : 'default'}}
      className={`etl-node ${isTargetActive ? 'active' : ''} ${isSelectionActive ? 'selected' : ''}`}
    >
      {/* Тело цилиндра */}
      <path
        d={`M 0,0 L 0,40 A ${STORAGE_WIDTH / 2},12 0 0 0 ${STORAGE_WIDTH},40 L ${STORAGE_WIDTH},0`}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        style={{transition: 'all 0.2s ease'}}
      />
      {/* Верхняя крышка цилиндра */}
      <ellipse
        cx={STORAGE_WIDTH / 2}
        cy="0"
        rx={STORAGE_WIDTH / 2}
        ry="12"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        style={{transition: 'all 0.2s ease'}}
      />
      {/* Текст внутри цилиндра */}
      <text
        x={STORAGE_WIDTH / 2}
        y="20"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={textColor}
        fontSize="13"
        fontWeight={fontWeight}
        style={{userSelect: 'none', fontFamily: 'sans-serif', transition: 'all 0.2s ease'}}
      >
        {name}
      </text>
    </g>
  );
}
