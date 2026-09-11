import { useState, useEffect } from 'react';
import { stageService } from '../services/api'
import styles from './ArtifactsSidebar.module.css';

export default function ArtifactsSidebar(
  {
    activeStage,
    currentArtifacts,
    setCurrentArtifacts,
    onDeleteArtifacts,
    onFileSelected,
    selectedFile
  }
) {
  const [filterText, setFilterText] = useState('');

  const filteredFiles = currentArtifacts.filter(file => {
    const name = file.toLowerCase();
    return name.includes(filterText.toLowerCase());
  });

  // Обработка клика по файлу
  const handleFileClick = async (filePath) => {
    console.log("1 ==================");
    console.log(filePath);
    console.log("2 ==================");
    // 1. Сразу подсвечиваем файл в интерфейсе
    console.log(`[Sidebar] Клик по файлу. Отправляем GET /artifacts/${filePath}`);

    try {
      const content = await stageService.getArtifactContent(filePath);

      // 3. Выводим содержимое в консоль, как ты просил
      console.log(`[Sidebar] Содержимое файла ${filePath}:`, content);
      onFileSelected(content, filePath);

    } catch (error) {
      console.error(`[Sidebar] Ошибка при загрузке артефакта ${filePath}:`, error);
      onFileSelected(null, null);
    }
  };

  const handleDeleteSingleFile = async (filePath) => {
    if (!confirm(`Удалить артефакт "${filePath}"?`)) return;

    try {
      console.log(`[API] Отправка DELETE-запроса для файла: ${filePath}`);
      await stageService.deleteArtifact(filePath);

      onFileSelected(null);

      setCurrentArtifacts(prevFiles => prevFiles.filter(file => file !== filePath));
    } catch (error) {
      console.error("Ошибка при удалении файла:", error);
    }
  };

  // СЛУШАТЕЛЬ КЛАВИАТУРЫ ДЛЯ УДАЛЕНИЯ
  useEffect(() => {
    // Если ни один файл не выделен, слушать клавиатуру нет смысла
    if (!selectedFile) return;

    const handleKeyDown = (event) => {
      const key = event.key;

      if (key === 'd' || key === 'D' || key === 'Delete') {
        console.log(`[Hotkey] Сработало удаление для файла: ${selectedFile}`);
        handleDeleteSingleFile(selectedFile);
      }
    };

    // Вешаем глобальный слушатель на окно
    window.addEventListener('keydown', handleKeyDown);

    // Обязательно снимаем слушатель при изменении selectedFile или закрытии сайдбара
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedFile]);

  return (
    <section className={styles.sidebar}>
      <div className={styles.header}>
        {currentArtifacts.length > 0 && (
          <button
            onClick={() => onDeleteArtifacts(activeStage)}
            className={styles.cleanBtn}
          >
            🗑️ Очистить
          </button>
        )}
      </div>

      {currentArtifacts.length > 0 && (
        <div className={styles.filterContainer}>
          <input
            type="text"
            placeholder="🔍 Имя артефакта..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className={styles.filterInput}
          />
          {filterText && (
            <button onClick={() => setFilterText('')} className={styles.clearFilterBtn}>✕</button>
          )}
        </div>
      )}

      <div className={styles.filesContainer}>
        {currentArtifacts.length === 0 ? (
          <div className={styles.emptyFallback}>
            <p>📄 Нет сгенерированных файлов</p>
            <small>Запустите стадию пайплайна.</small>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className={styles.emptyFallback}>
            <p>🔍 Ничего не найдено</p>
            <small>Попробуйте изменить запрос фильтра.</small>
          </div>
        ) : (
          <ul className={styles.fileList}>
            {filteredFiles.map((file, index) => {
              const isParquet = file.endsWith('.parquet');

              // Если класс составной (динамический), склеиваем строки через шаблонную строку
              const isSelected = selectedFile === file;
              const itemClass = `${styles.fileItem} ${isParquet ? styles.parquet : styles.pkl} ${isSelected ? styles.active : ''}`;

              return (
                <li key={index} className={itemClass} onClick={() => handleFileClick(file)}>
                  <span className={styles.fileIcon}>{isParquet ? '📊' : '📦'}</span>
                  <span className={styles.fileName} title={file}>{file}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
