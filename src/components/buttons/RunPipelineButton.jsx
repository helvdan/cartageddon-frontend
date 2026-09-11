import { useEffect } from "react";
import BaseButton from './BaseButton';

export default function RunAllButton({ isPipelineRunning, isRunning, onRunAll }) {
  const disabled = isPipelineRunning || isRunning;

  useEffect(() => {
    // Если кнопка заблокирована (пайплайн уже идет), хоткей не должен срабатывать
    if (disabled) return;

    const handleKeyDown = (event) => {
      // Игнорируем нажатие, если пользователь сейчас пишет в инпуте фильтра сайдбара
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      if (event.key === 'r' || event.key === 'R') {
        console.log('[Hotkey R] Запуск всего пайплайна...');
        onRunAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [disabled, onRunAll])

  return (
    <BaseButton
      onClick={onRunAll}
      disabled={disabled}
      isActive={false}
      title={isPipelineRunning ? "Весь пайплайн выполняется..." : "Запустить весь пайплайн"}
    >
      {isPipelineRunning ? (
        '⏳'
      ) : (
        <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
          {/* Зеленый символ ▶ */}
          <span style={{color: '#10b981', fontSize: '14px'}}>▶</span>

          {/* Чистый, аккуратный текст подсказки */}
          <span style={{
            color: disabled ? '#475569' : '#94a3b8',
            fontSize: '12px',
            fontFamily: 'sans-serif',
            opacity: disabled ? 0.5 : 0.8,
            paddingTop: '3px'
          }}>
            [R]
          </span>
        </div>
      )}
    </BaseButton>
  );
}
