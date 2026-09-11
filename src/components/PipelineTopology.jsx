import { useState, useEffect } from 'react';
import StageNode from './topology/StageNode';
import StorageNode from './topology/StorageNode';
import ConnectorArrow from './topology/ConnectorArrow';
import { stageService } from '../services/api'

const STAGES = ["extracted", "normalized", "deduplicated", "checked", "joined"];

export default function PipelineTopology({ activeStage, onStageSelect }) {
  console.log('PipelineTopology');

  return (
    <svg viewBox="0 0 880 180" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">

      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569" />
        </marker>
        <marker id="arrow-active" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#29b6f6" />
        </marker>
      </defs>

      {/* --- ВХОД: MySQL (Используем твои оригинальные координаты, сдвинутые через translate) --- */}
      <StorageNode
        name="MySQL"
        x={0}
        y={60}
        isTargetActive={activeStage === 'source-db'}
        onClick={() => onStageSelect('source-db')}
      />

      {/* Стрелка от MySQL к первой стадии */}
      <ConnectorArrow x1={90} y1={75} x2={135} y2={75} isActive={activeStage === 'source-db'} />

      {/* --- СТАДИИ ПАЙПЛАЙНА --- */}
      {STAGES.map((stage, idx) => {
        // Выравниваем прямоугольники стадий по высоте (y=40), чтобы они шли вровень с цилиндрами
        const xPos = 100 + idx * 165;
        const isActive = activeStage === stage;
        const isArrowActive = activeStage === stage;

        return (
          <g key={stage}>
            <StageNode
              name={stage}
              x={xPos}
              y={60}
              isActive={isActive}
              onClick={() => onStageSelect(stage)}
            />

            {/* Стрелка к следующей стадии */}
            {idx < STAGES.length - 1 && (
              <ConnectorArrow
                x1={xPos + 125}
                y1={90}
                x2={xPos + 145}
                y2={90}
                isActive={isArrowActive}
              />
            )}
          </g>
        );
      })}

      {/* Разветвление после "joined" (Конец joined на X=740, Y=75) */}
      <ConnectorArrow d="M 880 90 L 910 90 L 910 40 L 925 40" isActive={activeStage === 'joined'} />
      <ConnectorArrow d="M 880 90 L 910 90 L 910 140 L 925 140" isActive={activeStage === 'joined'} />

      {/* --- ЛОАДЕРЫ --- */}
      <StageNode name="loading_db" x={930} y={15} isActive={activeStage === 'loading_db'} />
      <ConnectorArrow x1={1040} y1={40} x2={1075} y2={40} />

      <StageNode name="loading_s3" x={930} y={115} isActive={activeStage === 'loading_s3'} />
      <ConnectorArrow x1={1040} y1={140} x2={1075} y2={140} />

      {/* --- ФИНАЛЬНЫЕ ХРАНИЛИЩА (Цилиндры) --- */}
      <StorageNode
        name="Postgres"
        x={1100}
        y={25}
        isTargetActive={false}
      />

      <StorageNode
        name="MinIO S3"
        x={1100}
        y={125}
        isTargetActive={true}
      />

    </svg>
  );
}
