import { useState, useEffect, useRef } from 'react';
import { stageService } from '../services/api';

export default function ContextSelector({ context, setContext, onContextChanged }) {
  const [availableContexts, setAvailableContexts] = useState([]);
  const contextRef = useRef(context);

  useEffect(() => {
    contextRef.current = context;
  }, [context]);

  // Запрос стартового значения при загрузке
  useEffect(() => {
    const fetchCurrentContext = async () => {
      try {
        const data = await stageService.getContext();
        const contexts = data.contexts || {};

        // Собираем все ключи в верхнем регистре для отрисовки кнопок
        const keys = Object.keys(contexts).map(key => key.toUpperCase());
        setAvailableContexts(keys);

        // Ищем активный контекст через цикл
        const activeKey = Object.keys(contexts).find(key => contexts[key] === true);
        if (activeKey) {
          setContext(activeKey.toUpperCase());
        }
      } catch (error) {
        console.error('Ошибка при инициализации контекста:', error);
        setAvailableContexts(['SAMPLE', 'TEST']);
        setContext('SAMPLE');
      }
    };

    fetchCurrentContext();
  }, [setContext]);

  // Обработчик смены контекста
  const handleContextChange = async (value) => {
    const contextParam = value.toLowerCase();

    try {
      await stageService.changeContext(contextParam);
      console.log(`[API] Успешно переключено на ${value}`);

      setContext(value); // Обновляем глобальный стейт в App.js
      onContextChanged(); // Очищаем логи в App.js
    } catch (error) {
      console.error('Ошибка при сохранении контекста:', error);
    }
  };

  useEffect(() => {
    if (availableContexts.length === 0 || !context) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Tab') {
        event.preventDefault(); // Блокируем стандартный переход фокуса браузера

        const currentContext = contextRef.current;
        const currentIndex = availableContexts.indexOf(currentContext);

        const nextIndex = (currentIndex + 1) % availableContexts.length;
        const nextContext = availableContexts[nextIndex];

        console.log(`[Hotkey TAB] Переключение контекста на: ${nextContext}`);
        handleContextChange(nextContext);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [availableContexts]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      paddingRight: '20px',
      borderRight: '1px solid #1e293b',
      userSelect: 'none',
      minWidth: '150px'
    }}>
      {/* 3. НАДПИСЬ ВВЕРХУ СЕЛЕКТОРА */}
      <span style={{
        color: '#475569',
        fontSize: '14px',
        fontWeight: 'bold',
        fontFamily: 'sans-serif',
        letterSpacing: '0.5px',
        marginBottom: '2px'
      }}>
        КОНТЕКСТ [TAB]
      </span>

      {availableContexts.map((option) => {
        const isSelected = context === option;
        return (
          <label key={option} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: isSelected ? '#fff' : '#475569',
            fontSize: '12px',
            fontWeight: isSelected ? 'bold' : 'normal',
            cursor: 'pointer',
            fontFamily: 'sans-serif',
            transition: 'color 0.2s ease'
          }}>
            <input
              type="radio"
              name="pipeline-context"
              value={option}
              checked={isSelected}
              onChange={() => handleContextChange(option)}
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                width: '14px',
                height: '14px',
                flexShrink: 0,
                border: `2px solid ${isSelected ? '#10b981' : '#475569'}`,
                borderRadius: '50%',
                outline: 'none',
                backgroundColor: isSelected ? '#10b981' : 'transparent',
                boxShadow: isSelected ? 'inset 0 0 0 2px #0f172a' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            />
            {option}
          </label>
        );
      })}
    </div>
  );
}
