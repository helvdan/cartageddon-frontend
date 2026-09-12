import { useEffect } from 'react';
import { stageService } from '../../services/api';

export default function StorageNode({ name, x, y, isTargetActive, isSelected,  healthStatus = 'empty', onClick }) {

  let defaultFill = isTargetActive ? "#0f172a" : "#1e293b";
  let defaultStroke = isTargetActive ? "#00e5ff" : "#475569";
  let defaultText = isTargetActive ? "#00e5ff" : "#94a3b8";

  if (healthStatus === 'filled') {
    defaultFill = "#15803d";   // Спокойный зеленый для темной темы
    defaultStroke = "#22c55e"; // Яркий зеленый контур
    defaultText = "#ffffff";
  } else if (healthStatus === 'disconnected') {
    defaultFill = "#991b1b";   // Спокойный красный
    defaultStroke = "#ef4444"; // Яркий красный контур
    defaultText = "#ffffff";
  }

  const fillColor = isSelected ? "#0284c7" : defaultFill;
  const strokeColor = isSelected ? "#38bdf8" : defaultStroke;
  const textColor = isSelected ? "#ffffff" : defaultText;

  const strokeWidth = isSelected || isTargetActive || healthStatus !== 'empty' ? "3" : "2";
  const fontWeight = isSelected || isTargetActive || healthStatus !== 'empty' ? "bold" : "normal";

  // Изменено: обработчик клика по ноде для переключения фокуса
  const handleNodeClick = (e) => {
    e.stopPropagation();
    if (onClick) onClick();
  };

  useEffect(() => {
    const handleKeyDown = async (event) => {
      const isDKey = event.key.toLowerCase() === 'd' || event.key.toLowerCase() === 'в';

      if (isDKey && isSelected) {
        const confirmDelete = window.confirm(`Вы уверены, что хотите полностью очистить ${name}?`);
        if (!confirmDelete) return;

        await stageService.truncateDb(name);
        if (onClick) onClick(); // Сбрасываем выделение (вызывая метод повторно, переключаем в null)
      }
    };

    if (isSelected) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSelected, name, onClick]);

  // Изменено: слушатель для снятия выделения при клике по фону или пустой области экрана
  useEffect(() => {
    const handleOutsideClick = () => {
      if (isSelected && onClick) onClick();
    };

    if (isSelected) {
      document.addEventListener('click', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isSelected, onClick]);

  return (
    // Сдвигаем весь цилиндр целиком в координаты x, y
    // Изменено: привязали локальный handleNodeClick вместо внешнего onClick
    <g
      transform={`translate(${x}, ${y})`}
      onClick={handleNodeClick}
      style={{cursor: onClick ? 'pointer' : 'default'}}
      className={`etl-node ${isTargetActive ? 'active' : ''} ${isSelected ? 'selected' : ''}`}
    >
      {/* Тело цилиндра */}
      <path
        d="M 0,0 L 0,40 A 30,12 0 0 0 60,40 L 60,0"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        style={{transition: 'all 0.2s ease'}}
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
        style={{transition: 'all 0.2s ease'}}
      />
      {/* Текст внутри цилиндра */}
      <text
        x="30"
        y="30"
        textAnchor="middle"
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