import { useState, useEffect, useRef } from 'react';
import { stageService } from './services/api';
import ContextSelector from './components/ContextSelector';
import PipelineTopology from './components/PipelineTopology';
import ArtifactsSidebar from './components/ArtifactsSidebar';
import Toolbar from './components/Toolbar';
import DataTable from './components/DataTable';
import { Toaster } from 'react-hot-toast';
import './App.css';

export default function App() {
  const [activeStage, setActiveStage] = useState('extracted');
  const [currentArtifacts, setCurrentArtifacts] = useState([]);
  const [tableData, setTableData] = useState(null);
  const [compareData, setCompareData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [context, setContext] = useState('');

  const logsEndRef = useRef(null);

  useEffect(() => {
    // scrollIntoView плавно прокрутит контейнер к нашему невидимому элементу-якорю
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs])

  useEffect(() => {
    // Создаем подключение к бэкенду
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/logs");

    ws.onmessage = (event) => {
      const newLogLine = event.data;

      // Дописываем новую строку в массив логов
      setLogs((prevLogs) => [...prevLogs, newLogLine]);
    };

    ws.onerror = (error) => {
      console.error("[WS Error] Ошибка соединения с логами:", error);
    };

    ws.onclose = () => {
      console.log("[WS] Соединение с логами закрыто");
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleClearContextData = () => {
    setLogs([]);        // Сбрасываем логи в пустой массив
    setTableData(null);  // Очищаем активную таблицу
    setCompareData(null);// Очищаем таблицу сравнения
    setSelectedFile(null); // Сбрасываем выбранный файл в сайдбаре
  };

  const handleStageSelect = (stageName) => {
    setActiveStage(stageName);
    setCurrentArtifacts([])
    setTableData(null);
    setCompareData(null);
    setSelectedFile(null);
  };

  const handleCompareTables = async () => {
    console.log("handleCompareTables для файла:", selectedFile);

    if (!selectedFile) return;

    try {
      if (compareData) {
        setCompareData(null);
        return;
      }

      // Делаем запрос, используя чистую строку имени файла
      const res = await stageService.getArtifactContent(`${selectedFile}/previous`);
      setCompareData(res);
    } catch (error) {
      console.error("Ошибка сравнения:", error);
    }
  };

  useEffect(() => {
    if (!activeStage) return;

    // Открываем WebSocket к нашей конкретной стадии
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/artifacts/${activeStage}`);

    ws.onmessage = (event) => {
      try {
        const files = JSON.parse(event.data);
        console.log(`[WS Artifacts] Получены файлы для ${activeStage}:`, files);
        setCurrentArtifacts(files); // Обновляем список файлов в сайдбаре
      } catch (err) {
        console.error("[WS Artifacts] Ошибка парсинга JSON:", err);
      }
    };

    ws.onerror = (error) => {
      console.error(`[WS Artifacts Error] Стадия ${activeStage}:`, error);
    };

    // Очистка: при переключении стадии старый вебсокет закрывается автоматически,
    return () => {
      console.log(`[WS Artifacts Cleanup] Закрываем соединение для ${activeStage}`);
      ws.close();
    };
  }, [activeStage, context]);

  const handleRerunPipeline = async () => {
    if (!activeStage || !selectedFile) return;

    setLoadingStage(activeStage); // Используем ваш существующий стейт загрузки

    // Очищаем окно с таблицами, как вы просили
    setTableData(null);
    setCompareData(null);

    console.log(`🔄 Перезапуск пайплайна для стадии ${activeStage} с артефактом ${selectedFile}...`);

    try {
      // Предполагается, что в stageService добавлен метод runStageWithArtifact
      // Если его нет, можно вызвать напрямую: await axios.get(`/pipeline/run/${activeStage}/${selectedFile}`)
      await stageService.runStageWithArtifact(activeStage, selectedFile);
      console.log(`✅ Успешный перезапуск для ${selectedFile}`);
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message;
      console.log(`❌ Ошибка перезапуска: ${errorMsg}`);
    } finally {
      setLoadingStage(null);
    }
  };

  const [loadingStage, setLoadingStage] = useState(null);

  // Запуск пайплайна
  const handleRunPipeline = async (stageName) => {
    setLoadingStage(stageName);
    console.log(`Запуск пайплайна начиная со стадии: ${stageName}...`);
    try {
      const data = await stageService.runPipeline();
      console.log(`✅ Успех: ${data.message}`);
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message;
      console.log(`❌ Ошибка: ${errorMsg}`);
    } finally {
      setLoadingStage(null);
    }
  };

  // Удаление файлов
  const handleDeleteFiles = async (stageName) => {
    if (!confirm(`Удалить все сгенерированные файлы для стадии "${stageName}"?`)) return;
    try {
      await stageService.deleteFiles(stageName);
      // Очищаем локальный стейт для этой стадии
      setCurrentArtifacts(prev => ({ ...prev, [stageName]: [] }));
      setTableData(null);
      console.log(`[Delete] Артефакты стадии ${stageName} успешно удалены.`);
    } catch (error) {
      console.error("Ошибка при удалении файлов:", error);
    }
  };

  return (
    <div className="etl-dashboard-container">
      <Toaster position="top-right" />
      <div id="pipeline-container" style={{
        backgroundColor: '#0f172a',
        padding: '10px 20px',
        borderRadius: '8px',
        width: '100%',
        height: '140px',
        maxHeight: '140px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        overflow: 'hidden'
      }}>
        <ContextSelector context={context} setContext={setContext} onContextChanged={handleClearContextData}/>
        <PipelineTopology activeStage={activeStage} onStageSelect={handleStageSelect}/>
      </div>

      {/* Нижний ярус приложения: двухколоночная сетка */}
      <main id="main-content">

        <div id="sidebar">
          <ArtifactsSidebar
            activeStage={activeStage}
            currentArtifacts={currentArtifacts}
            setCurrentArtifacts={setCurrentArtifacts}
            onDeleteArtifacts={handleDeleteFiles}
            onFileSelected={(content, fileName) => {
              setTableData(content);
              setSelectedFile(fileName);
              setCompareData(null);
            }}
            selectedFile={selectedFile}
          />
        </div>

        <section id="content-area">
          <div id="toolbar">
            <Toolbar
              hasData={!!tableData}
              isComparing={!!compareData}
              onCompare={handleCompareTables}
              onRerun={handleRerunPipeline}
              isRunning={loadingStage === activeStage}
              onRunAll={handleRunPipeline}
              isPipelineRunning={loadingStage === 'all'}
            />
          </div>
          <div id="table-view">
            {compareData ? (
              <div style={{display: 'flex', flexDirection: 'column', gap: '24px', width: '100%'}}>

                {/* 1. Сначала выводим ВСЕ предыдущие стадии из массива в цикле */}
                {compareData.map((item, idx) => (
                  <div key={idx} style={{borderLeft: '4px solid #64748b', paddingLeft: '10px'}}>
                    <h4 style={{margin: '0 0 8px 0', color: '#94a3b8'}}>{item.artifact}</h4>
                    <DataTable data={item.data}/>
                  </div>
                ))}

                {/* 2. Текущую версию опускаем в самый низ и используем selectedFile для имени */}
                <div style={{borderLeft: '4px solid #3b82f6', paddingLeft: '10px'}}>
                  <h4 style={{margin: '0 0 8px 0', color: '#3b82f6'}}>{selectedFile}</h4>
                  <DataTable data={tableData}/>
                </div>

              </div>
            ) : (
              // Если режим сравнения выключен — просто показываем одну текущую таблицу
              <DataTable data={tableData}/>
            )}
          </div>
          <div id="logs">
            {logs.length === 0 ? (
              <p style={{color: '#64748b', margin: 0}}>Ожидание запуска стадий пайплайна...</p>
            ) : (
              // Выводим логи построчно
              logs.map((log, index) => (
                <div key={index} style={{
                  whiteSpace: 'pre-wrap',
                  marginBottom: '4px',
                  color: log.includes('❌') || log.includes('ERROR') ? '#f87171' :
                    log.includes('✅') || log.includes('Артефакт создан') ? '#4ade80' : '#e2e8f0'
                }}>
                  {log}
                </div>
              ))
            )}

            {/* Невидимый элемент-якорь, к которому будет скроллиться терминал */}
            <div ref={logsEndRef} />
          </div>
        </section>

      </main>
    </div>
  );
}
